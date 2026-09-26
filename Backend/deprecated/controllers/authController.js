// controllers/authController.js
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please provide all values' });
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ msg: 'Email already in use' });
    }

    const user = await User.create({ name, email, password });
    const token = user.createJWT();
    
    res.status(201).json({ 
      token, 
      user: { name: user.name, email: user.email, points: user.points } 
    });

  } catch (error) {
    res.status(500).json({ msg: 'Server error, please try again', error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide all values' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const token = user.createJWT();
    res.status(200).json({ 
      token, 
      user: { name: user.name, email: user.email, points: user.points } 
    });

  } catch (error) {
    res.status(500).json({ msg: 'Server error, please try again', error });
  }
};

module.exports = { register, login };