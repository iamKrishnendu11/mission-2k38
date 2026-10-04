const express = require('express');
const router = express.Router();
const { Tournament, Application, Profile } = require('../models');

// AUTHENTICATION MIDDLEWARE
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required.' });

  const JWT_SECRET = process.env.JWT_SECRET || 'mission2k38_jwt_secret_key_998877_super_secure';
  require('jsonwebtoken').verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    req.userId = user?.userId || user?.id;
    next();
  });
};

// 1. GET ALL TOURNAMENTS
router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ startDate: 1 });
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. CREATE TOURNAMENT (Admin/Coach)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, startDate, endDate, location, lat, lng, maxTeams } = req.body;
    
    // Check if user is allowed (admin or coach)
    if (req.user.role !== 'admin' && req.user.role !== 'coach') {
      return res.status(403).json({ error: 'Only admins or coaches can organize tournaments.' });
    }

    const organizerProfile = await Profile.findOne({ user: req.user.userId });

    const tournament = new Tournament({
      name,
      description,
      organizer: organizerProfile ? organizerProfile.name : 'Mission 2K38 Coach',
      startDate,
      endDate,
      location,
      coordinates: {
        lat: Number(lat) || 28.6139, // Delhi defaults
        lng: Number(lng) || 77.2090
      },
      maxTeams: Number(maxTeams) || 16,
      status: 'upcoming'
    });

    await tournament.save();
    res.status(201).json({ message: 'Tournament created successfully!', tournament });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. JOIN TOURNAMENT
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found.' });

    // Check if user already applied
    const existingApp = await Application.findOne({
      tournament: tournament._id,
      user: req.user.userId
    });

    if (existingApp) {
      return res.status(400).json({ error: 'You have already registered for this tournament.' });
    }

    const application = new Application({
      tournament: tournament._id,
      user: req.user.userId,
      status: 'approved', // auto-approve for demo
      paymentStatus: 'paid' // mock-paid
    });

    await application.save();
    res.status(201).json({ message: 'Registered for tournament successfully!', application });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. FIND NEARBY TOURNAMENTS (Google Maps geo simulation)
router.get('/nearby', async (req, res) => {
  try {
    const playerLat = Number(req.query.lat) || 28.6139; // Delhi defaults
    const playerLng = Number(req.query.lng) || 77.2090;

    const tournaments = await Tournament.find({ status: 'upcoming' });

    // Distance calculation formula (Haversine approximation)
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    const sortedTournaments = tournaments.map((t) => {
      const distance = getDistance(
        playerLat,
        playerLng,
        t.coordinates.lat || 28.6139,
        t.coordinates.lng || 77.2090
      );
      return {
        ...t.toObject(),
        distanceKm: round(distance, 1)
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(sortedTournaments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

module.exports = router;
