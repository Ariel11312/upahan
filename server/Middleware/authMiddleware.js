import supabase from '../Config/supabase.js'

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.access_token ||
                req.headers.authorization?.split(' ')[1]

  if (!token) return res.status(401).json({ message: 'No token provided' })

  const { data, error } = await supabase.auth.getUser(token)
  if (error) return res.status(401).json({ message: 'Invalid token' })

  // ✅ Rotate token on every request
  const refresh_token = req.cookies.refresh_token
  if (refresh_token) {
    const { data: refreshed } = await supabase.auth.refreshSession({ refresh_token })

    if (refreshed?.session) {
      // ✅ Set new access_token cookie
      res.cookie('access_token', refreshed.session.access_token, {
        httpOnly: true,
        secure: false,    // true in production
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000  // 15 minutes
      })

      // ✅ Set new refresh_token cookie
      res.cookie('refresh_token', refreshed.session.refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
      })
    }
  }

  req.user = data.user
  next()
}

export default authMiddleware
