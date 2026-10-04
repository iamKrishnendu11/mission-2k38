const User = require('../models/User');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require('../utils/jwt');

function buildAuthPayload(user) {
  return {
    accessToken: signAccessToken({ id: user._id, userId: user._id, role: user.role, email: user.email }),
    refreshToken: signRefreshToken({ id: user._id, userId: user._id, role: user.role, email: user.email }),
    user: user.toSafeObject ? user.toSafeObject() : user,
    profile: user.profile || {}
  };
}

async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      role = 'player',
      profilePhoto,
      ...profile
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      role,
      avatar: profilePhoto || '',
      profile
    });

    const payload = buildAuthPayload(user);

    return res.status(201).json(payload);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = buildAuthPayload(user);

    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const payload = buildAuthPayload(user);
    return res.json(payload);
  } catch (error) {
    const userId = error?.id || error?.userId;
    return res.status(500).json({ error: error.message || 'Token refresh failed' });
  }
}

async function me(req, res) {
  try {
    return res.json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to load profile' });
  }
}

function logout(req, res) {
  return res.json({ message: 'Logged out successfully' });
}

module.exports = {
  register,
  login,
  refresh,
  me,
  logout
};
