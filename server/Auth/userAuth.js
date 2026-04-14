import { createClient } from '@supabase/supabase-js';
import supabase from '../Config/supabase.js';

// Get environment variables with validation
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SEMAPHORE_API_KEY = process.env.SEMAPHORE_API_KEY;
const SEMAPHORE_SENDER = process.env.SEMAPHORE_SENDER_NAME || 'Upahan';

// Validate required environment variables
if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL is not defined in environment variables');
  throw new Error('SUPABASE_URL is required');
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY is not defined in environment variables');
  throw new Error('SUPABASE_SERVICE_KEY is required for admin operations');
}

if (!SEMAPHORE_API_KEY) {
  console.warn('⚠️ SEMAPHORE_API_KEY is not defined - SMS sending will fail');
}

// ✅ Admin client — only used server-side, never exposed to app
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log('✅ Supabase Admin client initialized');

// ─── In-memory OTP store (replace with DB table in production) ────────────────
// Structure: { '+639XXXXXXXXX': { otp: '123456', expiresAt: Date } }
const otpStore = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

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
    secure: process.env.NODE_ENV === 'production', // true in production
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000,
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.ALLOWED_ORIGIN || 'http://localhost:3000'}/api/auth/callback`,
    },
  });

  if (error) {
    console.error('Google OAuth error:', error);
    return res.status(500).json({ error: error.message });
  }
  
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

  if (!access_token) {
    return res.status(400).json({ error: 'Missing access_token' });
  }
  
  if (!redirectUrl) {
    return res.status(400).json({ error: 'Missing redirectUrl' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(access_token);
    
    if (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Check if user exists in your users table
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!existing) {
      // Create new user record
      const { error: insertError } = await supabase.from('users').insert([{
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        first_name: user.user_metadata?.given_name || '',
        last_name: user.user_metadata?.family_name || '',
        is_verified: true,
        role: 'rentee',
      }]);

      if (insertError) {
        console.error('Insert user error:', insertError);
        return res.status(500).json({ error: insertError.message });
      }
    }

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Logged in successfully!',
      redirectUrl: `${redirectUrl}?access_token=${access_token}&refresh_token=${refresh_token}`,
    });
    
  } catch (err) {
    console.error('Save user error:', err);
    return res.status(500).json({ error: err.message });
  }
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

  // Clean up old OTPs periodically (optional)
  setTimeout(() => {
    if (otpStore.get(phone)?.otp === otp) {
      otpStore.delete(phone);
    }
  }, 5 * 60 * 1000);

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
    
    if (!smsRes.ok) {
      console.error('Semaphore error:', smsData);
      return res.status(500).json({ message: 'Failed to send SMS via Semaphore.' });
    }

    // For development: log OTP if SMS fails or in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 OTP for ${phone}: ${otp}`);
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

  // Check if user exists
  const email = phoneToEmail(phone);
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email, phone, first_name, last_name, role')
    .eq('phone', phone)
    .maybeSingle();

  if (!existingUser) {
    // User doesn't exist - they need to complete registration
    return res.json({ 
      verified: true,
      requiresSignup: true,
      message: 'OTP verified. Please complete registration.',
      phone: phone
    });
  }

  // User exists - they can login
  return res.json({ 
    verified: true,
    requiresSignup: false,
    message: 'OTP verified successfully.',
    user: existingUser
  });
};

// ─── Complete signup after OTP verification ──────────────────────────────────
export const completeSignup = async (req, res) => {
  const { phone, first_name, last_name, password } = req.body;

  if (!phone || !first_name || !last_name || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const email = phoneToEmail(phone);

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists. Please login.' });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
        phone
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(500).json({ message: `Failed to create account: ${authError.message}` });
    }

    // Create user record
    const { data: userData, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        phone,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        full_name: `${first_name.trim()} ${last_name.trim()}`,
        role: 'rentee',
        is_verified: true
      }])
      .select()
      .single();

    if (insertError) {
      console.error('User insert error:', insertError);
      return res.status(500).json({ message: `Failed to save user: ${insertError.message}` });
    }

    // Sign them in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return res.status(500).json({ message: 'Account created but login failed. Please try logging in.' });
    }

    return res.status(201).json({
      message: 'Account created successfully',
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      user: userData
    });

  } catch (err) {
    console.error('Complete signup error:', err);
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
};