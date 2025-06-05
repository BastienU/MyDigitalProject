const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const authMiddleware = async (req, res, next) => {

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Token manquant ou invalide" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) { 
      return res.status(401).json({ error: "Token invalide ou ID utilisateur manquant" });
    }


    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide" });
  }
};

module.exports = authMiddleware;