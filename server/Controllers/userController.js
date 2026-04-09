import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import rateLimit from 'express-rate-limit';
import supabase from '../Config/supabase.js';

const SUPABASE_URL = 'https://ahebqfxpxiucsxlqwjtd.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEMAPHORE_API_KEY    = process.env.SEMAPHORE_API_KEY;
const SEMAPHORE_SENDER     = process.env.SEMAPHORE_SENDER_NAME || 'Upahan';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const phoneToEmail = (phone) => `${phone.replace('+63', '')}@upahan.ph`;

/** Cryptographically secure 6-digit OTP (Math.random is NOT secure) */
const generateOTP = () => {
  const buf = crypto.randomInt(100000, 999999);
  return String(buf);
};

/** Constant-time string comparison to prevent timing attacks on OTP checks */
const safeCompare = (a, b) => {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

// ─── Rate Limiters (export so router can apply them) ─────────────────────────

/** 3 OTP sends per phone per 10 min */
export const otpPhoneLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body?.phone ?? req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP requests for this number. Please wait 10 minutes.' },
});

/** 5 OTP sends per IP per 10 min (stops 1 IP bombing many numbers) */
export const otpIpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP requests from your device. Please wait 10 minutes.' },
});

/** 10 verify attempts per IP per 10 min */
// export const otpVerifyLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 10,
//   keyGenerator: (req) => req.ip,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { message: 'Too many verification attempts. Please wait 10 minutes.' },
// });

// /** 5 signups per IP per hour */
// export const signupLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000,
//   max: 5,
//   keyGenerator: (req) => req.ip,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { message: 'Too many sign-up attempts. Please try again in an hour.' },
// });

/** 20 login attempts per IP per 15 min (stacks on top of per-phone lockout) */
export const loginIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts from your device. Please slow down.' },
});

// ─── GET /api/users/me ────────────────────────────────────────────────────────
export const getUserById = async (req, res) => {
  // req.user is already attached by authMiddleware — no need to re-verify token here
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized.' });

  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, full_name, phone, role, is_verified, created_at')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('getUserById error:', error);
    return res.status(500).json({ message: 'Failed to fetch user.' });
  }

  return res.json(data);
};

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
// Apply: otpIpLimiter, otpPhoneLimiter  (in router)
export const sendOTP = async (req, res) => {
  const { phone } = req.body;

  if (!phone || !phone.startsWith('+63') || phone.length !== 13) {
    return res.status(400).json({ message: 'Invalid phone number. Use +63XXXXXXXXXX format.' });
  }

  const otp       = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const hashedOtp = await bcrypt.hash(otp, 10); // store hash, not plaintext

  try {
    // ── Persist OTP in DB (replaces in-memory Map which dies on restart) ────
    const { error: upsertError } = await supabase
      .from('otp_store')
      .upsert({ phone, otp_hash: hashedOtp, expires_at: expiresAt, attempts: 0 }, { onConflict: 'phone' });

    if (upsertError) {
      console.error('OTP upsert error:', upsertError);
      return res.status(500).json({ message: 'Failed to store OTP.' });
    }

    // ── Send via Semaphore ───────────────────────────────────────────────────
    const smsRes = await fetch('https://api.semaphore.co/api/v4/otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apikey:     SEMAPHORE_API_KEY,
    number:     phone,
    message:    `Your Upahan verification code is: {otp}. Valid for 5 minutes. Do not share this code.`,
    sendername: SEMAPHORE_SENDER,
    code:       otp,   // Semaphore replaces {otp} in the message automatically
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
// Apply: otpVerifyLimiter  (in router)
const OTP_MAX_ATTEMPTS = 3;
const OTP_LOCKOUT_MS   = 5 * 60 * 1000; // 5 minutes

export const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required.' });
  }
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: 'OTP must be a 6-digit number.' });
  }

  try {
    const { data: stored, error: fetchError } = await supabase
      .from('otp_store')
      .select('*')
      .eq('phone', phone)
      .single();

    if (fetchError || !stored) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }

    // ── Check per-phone OTP lockout ──────────────────────────────────────────
    if (stored.locked_until && new Date(stored.locked_until) > new Date()) {
      const secondsLeft = Math.ceil((new Date(stored.locked_until) - Date.now()) / 1000);
      return res.status(429).json({
        locked: true,
        seconds_remaining: secondsLeft,
        message: 'Too many failed attempts. Please request a new OTP.',
      });
    }

    // ── Check expiry ─────────────────────────────────────────────────────────
    if (new Date() > new Date(stored.expires_at)) {
      await supabase.from('otp_store').delete().eq('phone', phone);
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // ── Verify hash (bcrypt compare, not plain equality) ─────────────────────
    const isMatch = await bcrypt.compare(otp, stored.otp_hash);

    if (!isMatch) {
      const nextAttempts = stored.attempts + 1;
      const willLock     = nextAttempts >= OTP_MAX_ATTEMPTS;
      const lockedUntil  = willLock
        ? new Date(Date.now() + OTP_LOCKOUT_MS).toISOString()
        : null;

      await supabase
        .from('otp_store')
        .update({ attempts: nextAttempts, locked_until: lockedUntil })
        .eq('phone', phone);

      if (willLock) {
        return res.status(429).json({
          locked: true,
          seconds_remaining: OTP_LOCKOUT_MS / 1000,
          message: `Too many wrong codes. Please wait ${OTP_LOCKOUT_MS / 60000} minutes or request a new OTP.`,
        });
      }

      const attemptsLeft = OTP_MAX_ATTEMPTS - nextAttempts;
      return res.status(400).json({
        locked: false,
        attempts_remaining: attemptsLeft,
        message: `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`,
      });
    }

    // ── OTP correct → delete record immediately (one-time use) ───────────────
    await supabase.from('otp_store').delete().eq('phone', phone);
    return res.json({ message: 'OTP verified.' });

  } catch (err) {
    console.error('verifyOTP error:', err);
    return res.status(500).json({ message: 'Server error during OTP verification.' });
  }
};

// ─── POST /api/users/signup ───────────────────────────────────────────────────
// Apply: signupLimiter  (in router)
export const createUser = async (req, res) => {
  const { first_name, last_name, phone, password } = req.body;

  console.log('[createUser] Called with:', { first_name, last_name, phone });

  if (!first_name || !last_name || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const email = phoneToEmail(phone);
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // ── Check phone already registered in public.users ────────────────────
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    console.log('[createUser] Existing user check:', existingUser);

    if (existingUser) {
      return res.status(409).json({ message: 'This phone number is already registered. Please login.' });
    }

    // ── Create or reuse auth user ─────────────────────────────────────────
    let authUserId;

    const { data: newAuthUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name, last_name, full_name: `${first_name} ${last_name}`, phone },
      });

    if (authError) {
      if (authError.code === 'email_exists') {
        // Auth user exists but public.users row never saved — find and reuse
        console.log('[createUser] email_exists — finding existing auth user...');

        const { data: listData, error: listError } =
          await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

        if (listError) {
          console.error('[createUser] listUsers error:', listError);
          return res.status(500).json({ message: 'Server error.' });
        }

        const existing = listData.users.find(u => u.email === email);
        if (!existing) {
          return res.status(500).json({ message: 'Account conflict. Please contact support.' });
        }

        authUserId = existing.id;
        console.log('[createUser] Reusing auth user:', authUserId);
        await supabaseAdmin.auth.admin.updateUserById(authUserId, { password });

      } else {
        console.error('[createUser] Auth error:', authError);
        return res.status(500).json({ message: `Auth error: ${authError.message}` });
      }
    } else {
      authUserId = newAuthUser.user.id;
      console.log('[createUser] New auth user created:', authUserId);
    }

    // ── Insert into public.users using supabaseAdmin to bypass RLS ────────
    console.log('[createUser] Inserting into public.users...');
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .upsert([{
        id:          authUserId,
        first_name:  first_name.trim(),
        last_name:   last_name.trim(),
        full_name:   `${first_name.trim()} ${last_name.trim()}`,
        email,
        phone,
        password:    hashedPassword,
        role:        'rentee',
        is_verified: true,
      }], { onConflict: 'id' })
      .select('id, first_name, last_name, phone, role, created_at')
      .single();

    console.log('[createUser] Insert result:', { newUser, insertError });

    if (insertError) {
      console.error('[createUser] Insert error:', insertError.message, insertError.code);
      return res.status(500).json({ message: `Profile save failed: ${insertError.message}` });
    }

    console.log('[createUser] ✅ Success:', newUser.id);
    return res.status(201).json({ message: 'Account created successfully.', user: newUser });

  } catch (err) {
    console.error('[createUser] Unexpected error:', err.message);
    return res.status(500).json({ message: `Unexpected error: ${err.message}` });
  }
};

// ─── POST /api/users/login ────────────────────────────────────────────────────
// Apply: loginIpLimiter  (in router)
const LOCK_THRESHOLD = 3;

const getAttemptRecord = async (phone) => {
  const { data } = await supabase
    .from('login_attempts')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();

  return data ?? { phone, attempts: 0, locked_until: null, lock_duration_minutes: 15 };
};

export const loginUser = async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ message: 'Phone and password are required.' });
  }

  const email = phoneToEmail(phone);

  try {
    // ── 1. Check per-phone lockout ────────────────────────────────────────────
    const record = await getAttemptRecord(phone);

    if (record.locked_until && new Date(record.locked_until) > new Date()) {
      const secondsLeft = Math.ceil((new Date(record.locked_until) - Date.now()) / 1000);
      return res.status(429).json({
        locked:            true,
        seconds_remaining: secondsLeft,
        message:           'Account temporarily locked. Too many failed attempts.',
      });
    }

    // ── 2. Attempt sign-in ────────────────────────────────────────────────────
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      console.error('Sign in error:', signInError.message);

      const attempts     = record.attempts + 1;
      const duration     = record.lock_duration_minutes;
      const willLock     = attempts % LOCK_THRESHOLD === 0;
      const lockedUntil  = willLock
        ? new Date(Date.now() + duration * 60 * 1000).toISOString()
        : null;
      const nextDuration = willLock ? duration * 2 : duration;
      const remaining    = LOCK_THRESHOLD - (attempts % LOCK_THRESHOLD);

      await supabase.from('login_attempts').upsert(
        { phone, attempts, locked_until: lockedUntil, lock_duration_minutes: nextDuration },
        { onConflict: 'phone' }
      );

      if (willLock) {
        return res.status(429).json({
          locked:                true,
          seconds_remaining:     duration * 60,
          lock_duration_minutes: duration,
          message:               `Account locked for ${duration} minute${duration > 1 ? 's' : ''}.`,
        });
      }

      return res.status(401).json({
        locked:                false,
        attempts_remaining:    remaining,
        lock_duration_minutes: duration,
        message:               'Incorrect phone number or password.',
      });
    }

    // ── 3. Success → clear lockout record ─────────────────────────────────────
    await supabase.from('login_attempts').delete().eq('phone', phone);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, full_name, phone, role, is_verified, created_at')
      .eq('phone', phone)
      .single();

    if (userError) {
      console.error('loginUser fetch user error:', userError);
      return res.status(500).json({ message: 'Login succeeded but failed to load profile.' });
    }

    return res.json({
      message:       'Login successful.',
      access_token:  signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      user:          userData,
    });

  } catch (err) {
    console.error('loginUser error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};