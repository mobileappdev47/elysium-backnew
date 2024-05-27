const asyncHandler = require('express-async-handler');
const Customername = require('../models/customerNameModel');


const createCustomername = asyncHandler(async (req, res) => {
    try {
        const { customername } = req.body;
        const newCustomername = await Customername.create({ customername });
        res.status(201).json({ success: true, code: 201, data: newCustomername });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const getCustomernames = asyncHandler(async (req, res) => {
    try {
        const customernames = await Customername.find();
        res.status(200).json({ success: true, code: 200, data: customernames });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const getCustomernameById = asyncHandler(async (req, res) => {
    try {
        const customername = await Customername.findById(req.params.id);
        if (customername) {
            res.status(200).json({ success: true, code: 200, data: customername });
        } else {
            res.status(404).json({ success: false, code: 404, message: 'Customername not found' });
        }
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const updateCustomername = asyncHandler(async (req, res) => {
    try {
        const { customername } = req.body;
        const updatedCustomername = await Customername.findByIdAndUpdate(req.params.id, { customername }, { new: true });
        if (updatedCustomername) {
            res.status(200).json({ success: true, code: 200, data: updatedCustomername });
        } else {
            res.status(404).json({ success: false, code: 404, message: 'Customername not found' });
        }
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const deleteCustomername = asyncHandler(async (req, res) => {
    try {
        const customername = await Customername.findOneAndDelete({ _id: req.params.id });
        if (customername) {
            res.status(200).json({ success: true, code: 200, message: 'Customername removed' });
        } else {
            res.status(404).json({ success: false, code: 404, message: 'Customername not found' });
        }
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

module.exports = {
    createCustomername,
    getCustomernames,
    getCustomernameById,
    updateCustomername,
    deleteCustomername
};
