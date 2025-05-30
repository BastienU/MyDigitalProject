const prisma = require('../prismaClient');
const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().positive().required(),
  description: Joi.string().allow('', null),
  composition: Joi.string().allow('', null),
  image: Joi.string().uri().allow('', null),
  code: Joi.string().pattern(/^\d{13}$/).required(),
});

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    console.error("Error retrieving products :", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getProductByCode = async (req, res) => {
  const { code } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { code },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Error retrieving product by code :", err);
    res.status(500).json({ error: "Server error" });
  }
};


const createProduct = async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const newProduct = await prisma.product.create({
      data: {
        ...value,
        price: parseFloat(value.price),
      },
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error creating product :", err);
    res.status(500).json({ error: "Server error during product creation" });
  }
};

const csv = require('csv-parser');

const importCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const results = [];
  const invalidRows = [];

  try {
    const bufferStream = require('streamifier').createReadStream(req.file.buffer);

    bufferStream
      .pipe(csv())
      .on('data', (data) => {
        const { error, value } = productSchema.validate(data);

        if (error) {
          invalidRows.push({ row: data, error: error.details[0].message });
        } else {
          results.push({
            ...value,
            price: parseFloat(value.price),
            description: value.description || null,
            composition: value.composition || null,
            image: value.image || null,
          });
        }
      })
      .on('end', async () => {
        try {
          if (results.length > 0) {
            await prisma.product.createMany({ data: results, skipDuplicates: true });
          }

          res.status(200).json({
            message: 'Import complete.',
            imported: results.length,
            skipped: invalidRows.length,
            errors: invalidRows,
          });
        } catch (err) {
          console.error('Prisma error :', err);
          res.status(500).json({ error: 'Error during base insertion.' });
        }
      });
  } catch (err) {
    console.error('CSV read error :', err);
    res.status(500).json({ error: 'Error when processing the file.' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductByCode,
  createProduct,
  importCSV,
};