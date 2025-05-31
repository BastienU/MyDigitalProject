const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

// Signup
const signup = async (req, res) => {
  const { genre, name, firstname, email, password, role, termsAccepted } = req.body;
  const allowedRoles = ['user', 'retailer'];

  try {
    // Try if the email is already used
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already used' });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Role must be 'user' or 'retailer'." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        genre,
        name,
        firstname,
        email,
        password: hashedPassword,
        role,
        termsAccepted,
      },
    });

    res.status(201).json({ message: "User's inscription succeeded", user: newUser });

  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect password' });

    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Connexion succeed', token });
  } catch (err) {
    console.error('Login error :', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  signup,
  login,
};