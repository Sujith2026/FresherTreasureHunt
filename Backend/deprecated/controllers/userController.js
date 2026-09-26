// controllers/userController.js
const User = require('../models/User');

const scanQR = async (req, res) => {
  try {
    // req.user.userId comes from the authMiddleware
    const userId = req.user.userId;

    // $inc increments the field by the given value
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { points: 50 } },
      { new: true } // This returns the updated document
    ).select('-password'); // Don't send the password back

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({ msg: 'Points added!', user });

  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .sort({ points: -1 }) // Sort by points, highest first
      .select('name points') // Only send name and points
      .limit(10); // Send top 10 users

    res.status(200).json({ leaderboard });
    
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
};

module.exports = { scanQR, getLeaderboard };