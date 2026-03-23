import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import supabase from '../Config/supabase.js';

const SUPABASE_URL = 'https://ahebqfxpxiucsxlqwjtd.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEMAPHORE_API_KEY = process.env.SEMAPHORE_API_KEY;
const SEMAPHORE_SENDER = process.env.SEMAPHORE_SENDER_NAME || 'Upahan';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const otpStore = new Map();
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));
const phoneToEmail = (phone) => `${phone.replace('+63', '')}@upahan.ph`;

// ─── GET /api/users/me ────────────────────────────────────────────────────────
export const getUserById = async (req, res) => {
  const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);
  if (tokenError) return res.status(401).json({ message: 'Invalid token' });

  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, full_name, phone, role, is_verified, created_at')
    .eq('email', user.email)
    .single();

  if (error) return res.status(500).json({ error });
  res.json(data);
};

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
export const sendOTP = async (req, res) => {
  const { phone } = req.body;

  if (!phone || !phone.startsWith('+63') || phone.length !== 13) {
    return res.status(400).json({ message: 'Invalid phone number. Use +63XXXXXXXXXX format.' });
  }

  const otp = generateOTP();
  otpStore.set(phone, { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

  try {
    const smsRes = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: SEMAPHORE_API_KEY,
        number: phone,
        message: `Your Upahan verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`,
        sendername: SEMAPHORE_SENDER,
      }),
    });

    if (!smsRes.ok) {
      const err = await smsRes.json();
      console.error('Semaphore error:', err);
      return res.status(500).json({ message: 'Failed to send SMS.' });
    }

    return res.json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('sendOTP error:', err);
    return res.status(500).json({ message: 'Server error while sending OTP.' });
  }
};

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required.' });

  const stored = otpStore.get(phone);
  if (!stored) return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
  if (new Date() > stored.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
  }
  if (stored.otp !== otp) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

  otpStore.delete(phone);
  return res.json({ message: 'OTP verified.' });
};

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
export const createUser = async (req, res) => {
  const { first_name, last_name, phone, password } = req.body;

  if (!first_name || !last_name || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const email = phoneToEmail(phone);
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // ✅ Step 1: Check if phone already exists in your users table
    const { data: existingInTable } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingInTable) {
      return res.status(409).json({ message: 'This phone number is already registered. Please login.' });
    }

    // ✅ Step 2: Check if the fake email already exists in Supabase Auth
    // (handles cases where user was created before but not saved to users table)
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const existingAuthUser = authList?.users?.find(u => u.email === email);

    let authUserId;

    if (existingAuthUser) {
      // ✅ Auth user already exists — reuse it instead of creating again
      // This happens when signup failed halfway (auth created but table insert failed)
      authUserId = existingAuthUser.id;

      // Update the password in case it changed
      await supabaseAdmin.auth.admin.updateUserById(authUserId, { password });
    } else {
      // ✅ Fresh signup — create new auth user
      const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name,
          last_name,
          full_name: `${first_name} ${last_name}`,
          phone,
        },
      });

      if (authError) {
        console.error('Auth create error:', authError);
        return res.status(500).json({ message: authError.message });
      }

      authUserId = newAuthUser.user.id;
    }

    // ✅ Step 3: Save to public.users table (upsert in case of retry)
    const { data, error } = await supabase
      .from('users')
      .upsert([{
        id: authUserId,
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
        email,
        phone,
        password: hashedPassword,
        role: 'rentee',
        is_verified: true,
      }], { onConflict: 'id' })
      .select('id, first_name, last_name, phone, role, created_at')
      .single();

    if (error) return res.status(500).json({ error });

    return res.status(201).json({ message: 'Account created successfully.', user: data });
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const loginUser = async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ message: 'Phone and password are required.' });

  const email = phoneToEmail(phone);

  try {
    // ✅ supabase (anon key) — not supabaseAdmin
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      console.error('Sign in error:', signInError.message); // check terminal for real error
      return res.status(401).json({ message: 'Incorrect phone number or password.' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, full_name, phone, role, is_verified, created_at')
      .eq('phone', phone)
      .single();

    if (userError) return res.status(500).json({ error: userError });

    return res.json({
      message: 'Login successful.',
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      user: userData,
    });
  } catch (err) {
    console.error('loginUser error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};