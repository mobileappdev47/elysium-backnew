const asyncHandler = require('express-async-handler')
const PrintStock = require('../models/printStockModel')



const createPrintStock = asyncHandler(async (req, res) => {
    const printStocks = req.body;

    if (!Array.isArray(printStocks)) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: 'Input should be an array of print stocks'
        });
    }

    try {
        const newPrintStocks = await PrintStock.insertMany(printStocks);
        res.status(201).json({
            success: true,
            code: 201,
            message: 'Print stocks created successfully',
            data: newPrintStocks
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            code: 400,
            message: err.message
        });
    }
});

// Route to get all PrintStock documents
const getAllPrintStocks = asyncHandler(async (req, res) => {
    try {
        const printStocks = await PrintStock.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            code: 200,
            message: 'Print stocks fetched successfully',
            data: printStocks.length ? printStocks : []
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            code: 500,
            message: err.message
        });
    }
});

const getPrintStocksByChallanNumber = asyncHandler(async (req, res) => {
    try {
        const { challannumber } = req.query;

        if (!challannumber) {
            return res.status(400).json({ error: 'Challan number is required' });
        }

        const printStocks = await PrintStock.find({ challannumber: { $regex: new RegExp(`^${challannumber}$`, 'i') } }).sort({ createdAt: -1 });

        res.json({
            success: true,
            code: 200,
            message: `Print stocks fetched successfully for challan number ${challannumber}`,
            data: printStocks.length ? printStocks : []
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            code: 500,
            message: err.message
        });
    }
});


module.exports = { createPrintStock, getAllPrintStocks, getPrintStocksByChallanNumber }