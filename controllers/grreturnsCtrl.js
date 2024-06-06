const asyncHandler = require("express-async-handler");
const Grreturns = require('../models/greturnsModel')

const createGrretuns = asyncHandler(async (req, res) => {
    const user = req.admin; // Assuming `req.admin` contains the user information
    try {
        // Add the user ID to the request body
        const newGrreturnData = {
            ...req.body,
            user: user._id // Assuming the user ID is stored in `req.admin._id`
        };

        // Create the new Grreturn with the modified request body
        const newGrreturn = await Grreturns.create(newGrreturnData);
        res.status(201).json({ success: true, code: 201, newGrreturn });
    } catch (err) {
        res.status(400).json({ success: false, code: 400, message: err.message });
    }
});

const getGrreturns = asyncHandler(async (req, res) => {
    try {
        // Populate the user field
        const grreturns = await Grreturns.find().populate({
            path: 'user',
            select: 'firstname _id'
        });

        res.status(200).json({ success: true, code: 200, grreturns });
    } catch (err) {
        res.status(500).json({ success: false, code: 500, message: err.message });
    }
});

const getAGrreturns = asyncHandler(async (req, res) => {
    try {
        const grreturn = await Grreturns.findById(req.params.id).populate({
            path: 'user',
            select: 'firstname _id'
        });
        if (grreturn === null) {
            return res.status(404).json({ success: false, code: 404, message: 'Document not found' });
        }
        res.json({ success: true, code: 200, grreturn });
    } catch (err) {
        res.status(500).json({ success: false, code: 500, message: err.message });
    }
})

module.exports = { createGrretuns, getGrreturns, getAGrreturns }