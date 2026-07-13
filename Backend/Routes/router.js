const express = require('express');
const router = express.Router();
const products = require('../Models/Products');
const { productOperationsTotal } = require('../metrics');

// Inserting (Creating) Data
router.post("/insertproduct", async (req, res) => {
    const { ProductName, ProductPrice, ProductBarcode } = req.body;

    try {
        const pre = await products.findOne({ ProductBarcode: ProductBarcode })

        if (pre) {
            res.status(422).json("Product is already added.")
        } else {
            const addProduct = new products({ ProductName, ProductPrice, ProductBarcode })
            await addProduct.save();
            productOperationsTotal.inc({ operation: 'create' });
            res.status(201).json(addProduct)
        }
    } catch (err) {
        console.log(err)
    }
})

// Getting (Reading) all products
router.get('/products', async (req, res) => {
    try {
        const getProducts = await products.find({})
        productOperationsTotal.inc({ operation: 'read' });
        res.status(201).json(getProducts);
    } catch (err) {
        console.log(err);
    }
})

// Getting (Reading) individual product
router.get('/products/:id', async (req, res) => {
    try {
        const getProduct = await products.findById(req.params.id);
        productOperationsTotal.inc({ operation: 'read' });
        res.status(201).json(getProduct);
    } catch (err) {
        console.log(err);
    }
})

// Editing (Updating) Data
router.put('/updateproduct/:id', async (req, res) => {
    const { ProductName, ProductPrice, ProductBarcode } = req.body;

    try {
        const updateProducts = await products.findByIdAndUpdate(
            req.params.id,
            { ProductName, ProductPrice, ProductBarcode },
            { new: true }
        );
        productOperationsTotal.inc({ operation: 'update' });
        res.status(201).json(updateProducts);
    } catch (err) {
        console.log(err);
    }
})

// Deleting Data
router.delete('/deleteproduct/:id', async (req, res) => {
    try {
        const deleteProduct = await products.findByIdAndDelete(req.params.id);
        productOperationsTotal.inc({ operation: 'delete' });
        res.status(201).json(deleteProduct);
    } catch (err) {
        console.log(err);
    }
})

module.exports = router;
