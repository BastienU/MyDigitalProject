const prisma = require('../prismaClient');
const Joi = require('joi');

// Validate request body
const wishlistSchema = Joi.object({
  name: Joi.string().min(2).required(),
  user_id: Joi.number().integer().required()
});

// Get all the wishlists
const getAllWishlists = async (req, res) => {
  try {
    const wishlists = await prisma.wishlist.findMany({
      include: {
        user: true
      }
    });
    res.status(200).json(wishlists);
  } catch (err) {
    console.error('Error fetching wishlists:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all the products from a wishlist
const getAllProductsFromWishlist = async (req, res) => {
  const { wishlistId } = req.params;

  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { id: parseInt(wishlistId) },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    });

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    const products = wishlist.products.map(entry => entry.product);

    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products from wishlist:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


// CREATE a wishlist
const createWishlist = async (req, res) => {
  try {
    const { error, value } = wishlistSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: `Invalid input: ${error.details[0].message}` });
    }

    const user = await prisma.user.findUnique({
      where: { id: value.user_id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        name: value.name,
        user: {
          connect: { id: value.user_id }
        }
      }
    });

    res.status(201).json(wishlist);

  } catch (err) {
    console.error("Error during wishlist creation:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// rename a wishlist
const updateWishlist = async (req, res) => {
  const { wishlistId } = req.params;
  const { name } = req.body;

  const { error } = Joi.object({
    name: Joi.string().min(2).required(),
  }).validate({ name });

  if (error) {
    return res.status(400).json({ error: `Invalid input: ${error.details[0].message}` });
  }

  try {
    const existingWishlist = await prisma.wishlist.findUnique({
      where: { id: parseInt(wishlistId) }
    });

    if (!existingWishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    const updatedWishlist = await prisma.wishlist.update({
      where: { id: parseInt(wishlistId) },
      data: { name }
    });

    res.status(200).json({ message: 'Wishlist updated successfully', updatedWishlist });

  } catch (err) {
    console.error("Error updating wishlist:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE a wishlist
const deleteWishlist = async (req, res) => {
  const { wishlistId } = req.params;

  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { id: parseInt(wishlistId) }
    });

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    await prisma.wishlistProduct.deleteMany({
      where: { wishlistId: parseInt(wishlistId) }
    });

    await prisma.wishlist.delete({
      where: { id: parseInt(wishlistId) }
    });

    res.status(200).json({ message: `Wishlist deleted with success` });

  } catch (err) {
    console.error("Error deleting wishlist:", err);
    res.status(500).json({ error: 'Server error' });
  }
};


// Add a product to a wishlist
const addProductToWishlist = async (req, res) => {
  const { wishlistId, productId } = req.params;

  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { id: parseInt(wishlistId) }
    });

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingEntry = await prisma.wishlistProduct.findUnique({
        where: {
            wishlistId_productId: {
            wishlistId: parseInt(wishlistId),
            productId: parseInt(productId)
            }
        }
        });

    if (existingEntry) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    const wishlistProduct = await prisma.wishlistProduct.create({
        data: {
            wishlistId: parseInt(wishlistId),
            productId: parseInt(productId)
        }
        });

    res.status(201).json({ message: 'Product added to wishlist', wishlistProduct });

  } catch (err) {
    console.error("Error adding product to wishlist:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove a product from a wishlist
const removeProductFromWishlist = async (req, res) => {
  const { wishlistId, productId } = req.params;

  try {
    const existingEntry = await prisma.wishlistProduct.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: parseInt(wishlistId),
          productId: parseInt(productId),
        },
      },
    });

    if (!existingEntry) {
      return res.status(404).json({ error: 'Product not found in this wishlist' });
    }

    await prisma.wishlistProduct.delete({
      where: {
        wishlistId_productId: {
          wishlistId: parseInt(wishlistId),
          productId: parseInt(productId),
        },
      },
    });

    res.status(200).json({ message: 'Product removed from wishlist' });
  } catch (err) {
    console.error('Error removing product from wishlist:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  getAllWishlists,
  getAllProductsFromWishlist,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  addProductToWishlist,
  removeProductFromWishlist
};