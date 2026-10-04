require('dotenv').config();
const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Profile } = require('../models');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require(path.resolve(__dirname, '../../utils/jwt'));

const JWT_SECRET = process.env.JWT_SECRET || 'mission2k38_jwt_secret_key_998877_super_secure';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'mission2k38_jwt_refresh_secret_key_112233_super_secure';

function buildAuthResponse(user) {
  return {
    accessToken: signAccessToken({ id: user._id, userId: user._id, role: user.role, email: user.email }),
    refreshToken: signRefreshToken({ id: user._id, userId: user._id, role: user.role, email: user.email }),
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    }
  };
}


// 1. REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, phone, dob, gender, state, district, city, pin, bio, ...roleFields } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      role,
      isVerified: true // Auto-verify for hackathon ease, can be token-based
    });

    const savedUser = await user.save();

    // Calculate age from dob
    let calculatedAge = 0;
    if (dob) {
      const birthDate = new Date(dob);
      const difference = Date.now() - birthDate.getTime();
      calculatedAge = Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25));
    }

    // Base profile fields
    const profileData = {
      user: savedUser._id,
      name,
      phone,
      dob,
      age: calculatedAge,
      ageCategory: req.body.ageCategory || 'Senior',
      gender,
      state,
      district,
      city,
      pin,
      bio,
      profilePhoto: req.body.profilePhoto || '',
      verifiedBadge: role === 'admin'
    };

    // Role-specific fields injection
    if (role === 'player') {
      profileData.height = Number(roleFields.height) || 0;
      profileData.weight = Number(roleFields.weight) || 0;
      profileData.dominantFoot = roleFields.dominantFoot || 'right';
      profileData.preferredPosition = roleFields.preferredPosition || 'ST';
      profileData.currentClub = roleFields.currentClub || '';
      profileData.previousClub = roleFields.previousClub || '';
      profileData.matchesPlayed = Number(roleFields.matchesPlayed) || 0;
      profileData.goals = Number(roleFields.goals) || 0;
      profileData.assists = Number(roleFields.assists) || 0;
      profileData.cleanSheets = Number(roleFields.cleanSheets) || 0;
      profileData.preferredLeague = roleFields.preferredLeague || '';
      profileData.emergencyContact = {
        name: roleFields.emergencyContactName || '',
        phone: roleFields.emergencyContactPhone || '',
        relation: roleFields.emergencyContactRelation || ''
      };
      profileData.socials = {
        instagram: roleFields.instagram || '',
        facebook: roleFields.facebook || '',
        youtube: roleFields.youtube || ''
      };
      profileData.fitnessLevel = roleFields.fitnessLevel || 'good';
      profileData.availability = roleFields.availability || 'available';
      profileData.highlightVideo = roleFields.highlightVideo || '';
      profileData.skills = {
        speed: Number(roleFields.speed) || 60,
        passing: Number(roleFields.passing) || 60,
        dribbling: Number(roleFields.dribbling) || 60,
        finishing: Number(roleFields.finishing) || 60,
        defending: Number(roleFields.defending) || 60,
        vision: Number(roleFields.vision) || 60,
        stamina: Number(roleFields.stamina) || 60,
        potential: Number(roleFields.potential) || 70,
        aiScore: 60
      };
      
      // Seed initial career timeline
      profileData.careerTimeline = [];
      if (roleFields.currentClub) {
        profileData.careerTimeline.push({
          year: new Date().getFullYear(),
          club: roleFields.currentClub,
          description: 'Current Squad Player'
        });
      }
    } else if (role === 'scout') {
      profileData.organization = roleFields.organization || '';
      profileData.clubRepresenting = roleFields.clubRepresenting || '';
      profileData.designation = roleFields.designation || '';
      profileData.license = roleFields.license || '';
      profileData.areasOfInterest = roleFields.areasOfInterest || [];
      profileData.ageGroupsCovered = roleFields.ageGroupsCovered || [];
      profileData.positionsInterested = roleFields.positionsInterested || [];
    } else if (role === 'coach') {
      profileData.license = roleFields.license || '';
      profileData.teamsManaged = roleFields.teamsManaged || [];
      profileData.specializations = roleFields.specializations || [];
      profileData.experience = Number(roleFields.experienceYears) || 0;
    }

    const profile = new Profile(profileData);
    await profile.save();

    const authPayload = buildAuthResponse(savedUser);

    savedUser.refreshToken = authPayload.refreshToken;
    await savedUser.save();

    res.status(201).json({
      ...authPayload,
      message: 'User registered successfully!',
      profile
    });
  } catch (err) {
    console.error('Registration error:', err);
    let errorMessage = 'Server error during registration: ' + err.message;
    if (err.message.includes('buffering timed out')) {
      errorMessage = 'Database connection failed. Please ensure your IP is whitelisted in MongoDB Atlas.';
    }
    res.status(500).json({ error: errorMessage });
  }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const profile = await Profile.findOne({ user: user._id });

    // Generate tokens
    const authPayload = buildAuthResponse(user);

    // Save refresh token
    user.refreshToken = authPayload.refreshToken;
    await user.save();

    res.json({
      ...authPayload,
      message: 'Logged in successfully',
      profile
    });
  } catch (err) {
    console.error('Login error:', err);
    let errorMessage = 'Server error during login: ' + err.message;
    if (err.message.includes('buffering timed out')) {
      errorMessage = 'Database connection failed. Please ensure your IP is whitelisted in MongoDB Atlas.';
    }
    res.status(500).json({ error: errorMessage });
  }
});

// 3. REFRESH TOKEN
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required.' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const authPayload = buildAuthResponse(user);
    user.refreshToken = authPayload.refreshToken;
    await user.save();

    res.json({
      accessToken: authPayload.accessToken,
      refreshToken: authPayload.refreshToken
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
});

// 4. FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist.' });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Mock-send reset link (In production, send email)
    const resetLink = `http://localhost:3000/login?resetToken=${resetToken}`;
    console.log(`Password reset link generated: ${resetLink}`);

    res.json({
      message: 'Password reset link generated. Check logs or verify link.',
      resetLink // Returned directly for the demo
    });
  } catch (err) {
    res.status(500).json({ error: 'Error generating reset link: ' + err.message });
  }
});

// 5. RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error resetting password: ' + err.message });
  }
});

// 6. GOOGLE LOGIN (Mock authentication for demo flow)
router.post('/google-login', async (req, res) => {
  try {
    const { token, email, name, profilePhoto } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email from Google auth is required.' });
    }

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        email,
        password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10), // random pass
        role: 'player', // default role
        isVerified: true
      });
      await user.save();

      const profile = new Profile({
        user: user._id,
        name: name || email.split('@')[0],
        profilePhoto: profilePhoto || '',
        verifiedBadge: false,
        skills: {
          speed: 60,
          passing: 60,
          dribbling: 60,
          finishing: 60,
          defending: 60,
          vision: 60,
          stamina: 60,
          potential: 70,
          aiScore: 60
        }
      });
      await profile.save();
    }

    const profile = await Profile.findOne({ user: user._id });
    const authPayload = buildAuthResponse(user);

    user.refreshToken = authPayload.refreshToken;
    await user.save();

    res.json({
      message: 'Google login successful',
      accessToken: authPayload.accessToken,
      refreshToken: authPayload.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      profile,
      isNewUser
    });
  } catch (err) {
    res.status(500).json({ error: 'Google login failed: ' + err.message });
  }
});

module.exports = router;
