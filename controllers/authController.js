const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const Joi = require('joi');


// Schémas de validation
const signupSchema = Joi.object({
  genre: Joi.string().valid('H', 'F', 'Autre').required(),
  name: Joi.string().min(2).required(),
  firstname: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('user', 'retailer').required(),
  termsAccepted: Joi.boolean().valid(true).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

// Signup
const signup = async (req, res) => {
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: `Invalid format : ${error.details[0].message}` });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email: value.email } });
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already used.' });
    }

    const hashedPassword = await bcrypt.hash(value.password, saltRounds);

    const newUser = await prisma.user.create({
      data: { ...value, password: hashedPassword },
    });

    res.status(201).json({ message: "Inscription succeeded", user: newUser });

  } catch (err) {
    console.error("Error during user's inscription :", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Login
const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: `Invalid format : ${error.details[0].message}` });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: value.email } });
    if (!user) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    const isMatch = await bcrypt.compare(value.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Connection succeeded', token });

  } catch (err) {
    console.error('Connection error :', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  signup,
  login,
};