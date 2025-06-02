const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Joi = require('joi');

const userSchema = Joi.object({
  genre: Joi.string().valid('H', 'F', 'Autre').required(),
  name: Joi.string().min(2).required(),
  firstname: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('user', 'retailer').required(),
  termsAccepted: Joi.boolean().required(),
});

// CREATE a user with validation
const createUser = async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: `Invalid input: ${error.details[0].message}` });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: value.email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(value.password, saltRounds);

    const newUser = await prisma.user.create({
      data: { ...value, password: hashedPassword },
    });

    res.status(201).json({ message: "Inscription réussie", user: newUser });

  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    console.error("Server error :", err);
    res.status(500).json({ error: 'Server error' });
  }
};

// UPDATE a user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { genre, name, firstname, email, password, role, termsAccepted } = req.body;

  try {
    let dataToUpdate = {
      genre,
      name,
      firstname,
      email,
      role,
      termsAccepted,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      dataToUpdate.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Error during user update' });
  }
};

// DELETE a user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
    console.log("User ", id, " successfully deleted");
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};