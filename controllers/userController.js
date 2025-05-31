const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

// CREATE a user
const createUser = async (req, res) => {
  try {
    const { genre, name, firstname, email, password, role, termsAccepted } = req.body;

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

    console.log("User created:", newUser);
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: 'Error creating user' });
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