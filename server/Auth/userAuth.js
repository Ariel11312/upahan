import { createClient } from '@supabase/supabase-js';
import supabase from '../Config/supabase.js';

const SUPABASE_URL = 'https://ahebqfxpxiucsxlqwjtd.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEMAPHORE_API_KEY = process.env.SEMAPHORE_API_KEY;
const SEMAPHORE_SENDER = process.env.SEMAPHORE_SENDER_NAME || 'Upahan';

// ✅ Admin client — only used server-side, never exposed to app
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── In-memory OTP store (replace with DB table in production) ────────────────
// Structure: { '+639XXXXXXXXX': { otp: '123456', expiresAt: Date } }
const otpStore = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const phoneToEmail = (phone) => {
  const digits = phone.replace('+63', '');
  return `${digits}@upahan.ph`;
};

// ─── Google OAuth: Step 1 — redirect to Google ────────────────────────────────
export const googleLogin = async (req, res) => {
  const appRedirectUri = req.query.redirect_uri;

  if (!appRedirectUri) {
    return res.status(400).json({ error: 'Missing redirect_uri query parameter' });
  }

  res.cookie('app_redirect_uri', appRedirectUri, {
    httpOnly: true,
    secure: false, // set true in production
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000,
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://192.168.100.37:3000/api/auth/callback',
    },
  });

  if (error) return res.status(500).json({ error });
  res.redirect(data.url);
};

// ─── Google OAuth: Step 2 — handle callback ───────────────────────────────────
export const authCallback = async (req, res) => {
  const appRedirectUri = req.cookies?.app_redirect_uri || 'upahan://auth';
  res.clearCookie('app_redirect_uri');

  res.send(`
    <html>
      <body>
        <p id="status">Logging you in...</p>
        <a id="openApp" style="display:none; font-size:20px; padding:12px; background:#D5642B; color:white; text-decoration:none; border-radius:8px;">
          Tap here to open the app
        </a>
        <script>
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (!access_token) {
            document.getElementById('status').innerText = 'Error: No token found. Hash: ' + window.location.hash;
            return;
          }

          fetch('/api/auth/save-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token,
              refresh_token,
              redirectUrl: '${appRedirectUri}'
            })
          })
          .then(res => res.json())
          .then(data => {
            if (data.redirectUrl) {
              document.getElementById('status').innerText = 'Redirecting to app...';
              const link = document.getElementById('openApp');
              link.href = data.redirectUrl;
              link.style.display = 'block';
              window.location.replace(data.redirectUrl);
              setTimeout(() => { window.location.href = data.redirectUrl; }, 500);
            } else {
              document.getElementById('status').innerText = 'Error: ' + JSON.stringify(data);
            }
          })
          .catch(err => {
            document.getElementById('status').innerText = 'Fetch error: ' + err.message;
          });
        </script>
      </body>
    </html>
  `);
};

// ─── Google OAuth: Step 3 — save user to DB ───────────────────────────────────
export const saveUser = async (req, res) => {
  const { access_token, refresh_token, redirectUrl } = req.body;

  if (!access_token) return res.status(400).json({ error: 'Missing access_token' });
  if (!redirectUrl) return res.status(400).json({ error: 'Missing redirectUrl' });

  const { data: { user }, error } = await supabase.auth.getUser(access_token);
  if (error) return res.status(500).json({ error });

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', user.email)
    .single();

  if (!existing) {
    const { error: insertError } = await supabase.from('users').insert([{
      email: user.email,
      full_name: user.user_metadata.full_name,
      first_name: user.user_metadata.given_name,
      last_name: user.user_metadata.family_name,
      is_verified: true,
      role: 'rentee',
    }]);

    if (insertError) return res.status(500).json({ error: insertError });
  }

  res.cookie('access_token', access_token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    message: 'Logged in successfully!',
    redirectUrl: `${redirectUrl}?access_token=${access_token}&refresh_token=${refresh_token}`,
  });
};

// ─── OTP: Send via Semaphore ──────────────────────────────────────────────────
export const sendOTP = async (req, res) => {
  const { phone } = req.body; // expects +63XXXXXXXXXX

  if (!phone || !phone.startsWith('+63') || phone.length !== 13) {
    return res.status(400).json({ message: 'Invalid phone number. Use +63XXXXXXXXXX format.' });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  otpStore.set(phone, { otp, expiresAt });

  try {
    const smsRes = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: SEMAPHORE_API_KEY,
        number: phone,
        message: `Your Upahan OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`,
        sendername: SEMAPHORE_SENDER,
      }),
    });
    const smsData = await smsRes.json();
console.log(otp)
    if (!smsRes.ok) {
      console.error('Semaphore error:', smsData);
      return res.status(500).json({ message: 'Failed to send SMS via Semaphore.' });
    }

    return res.json({ message: 'OTP sent successfully.' });

  } catch (err) {
    console.error('sendOTP error:', err);
    return res.status(500).json({ message: 'Server error while sending OTP.' });
  }
};

// ─── OTP: Verify and return session ──────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required.' });
  }

  const stored = otpStore.get(phone);

  if (!stored) {
    return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
  }

  if (new Date() > stored.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
  }

  // ✅ Verified — delete so it can't be reused
  otpStore.delete(phone);

  const email = phoneToEmail(phone);
  const password = `otp_${phone}_upahan_secure`;

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId;

    if (!existingUser) {
      // First time — create the user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone },
      });

      if (createError) {
        console.error('Create user error:', createError);
        return res.status(500).json({ message: 'Failed to create user.' });
      }

      userId = newUser.user.id;

      // Save to users table
      await supabaseAdmin.from('users').upsert({
        id: userId,
        phone,
        email,
        role: 'rentee',
      });
    } else {
      userId = existingUser.id;
    }

    // Ensure password is always in sync before signing in
    await supabaseAdmin.auth.admin.updateUserById(userId, { password });

    // Sign in with regular client (not admin) to get session tokens
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInErr) {
      console.error('Sign in error:', signInErr);
      return res.status(500).json({ message: 'Sign in failed after OTP verification.' });
    }

    return res.json({
      message: 'OTP verified successfully.',
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
    });

  } catch (err) {
    console.error('verifyOTP error:', err);
    return res.status(500).json({ message: 'Server error during OTP verification.' });
  }
};