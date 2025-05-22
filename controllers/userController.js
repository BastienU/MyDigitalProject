const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// GET all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    console.error("Erreur serveur :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// CREATE a user
const createUser = async (req, res) => {
  try {
    const { username, genre, email, password, role, termsAccepted } = req.body;

    // Hash du mot de passe avant sauvegarde
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        username,
        genre,
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
  const { username, genre, email, password, role, termsAccepted } = req.body;

  try {
    // Préparer l'objet data à mettre à jour
    let dataToUpdate = {
      username,
      genre,
      email,
      role,
      termsAccepted,
    };

    // Si password est fourni, le hasher
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
    console.error('Erreur mise à jour utilisateur :', err);
    res.status(500).json({ error: 'Erreur mise à jour utilisateur' });
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
    console.error("Erreur suppression utilisateur :", err);
    res.status(500).json({ error: 'Erreur suppression utilisateur' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};