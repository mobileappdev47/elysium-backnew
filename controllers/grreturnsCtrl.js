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
        let newGrreturn = await Grreturns.create(newGrreturnData);

        // Populate the user and partyname fields
        newGrreturn = await Grreturns.findById(newGrreturn._id).populate('user', 'firstname _id').populate('partyname', 'customername _id');

        res.status(201).json({ success: true, code: 201, newGrreturn });
    } catch (err) {
        res.status(400).json({ success: false, code: 400, message: err.message });
    }
});

const getGrreturns = asyncHandler(async (req, res) => {
    try {
        // Populate both the user and partyname fields
        const grreturns = await Grreturns.find().sort({ createdAt: -1 }).populate({
            path: 'user',
            select: 'firstname _id'
        }).populate('partyname', 'customername _id');

        res.status(200).json({ success: true, code: 200, grreturns });
    } catch (err) {
        res.status(500).json({ success: false, code: 500, message: err.message });
    }
});

const getLastGrnumber = asyncHandler(async (req, res) => {
    try {
        // Find the last created Grreturns document
        const lastGrreturn = await Grreturns.findOne().sort({ createdAt: -1 });

        if (!lastGrreturn) {
            return res.status(404).json({ success: false, code: 404, message: "No Grreturns found" });
        }

        res.status(200).json({ success: true, code: 200, grnumber: lastGrreturn });
    } catch (err) {
        res.status(500).json({ success: false, code: 500, message: err.message });
    }
});

const getAGrreturns = asyncHandler(async (req, res) => {
    try {
        const grreturn = await Grreturns.findById(req.params.id).populate({
            path: 'user',
            select: 'firstname _id'
        }).populate('partyname', 'customername _id');
        if (grreturn === null) {
            return res.status(404).json({ success: false, code: 404, message: 'Document not found' });
        }
        res.json({ success: true, code: 200, grreturn });
    } catch (err) {
        res.status(500).json({ success: false, code: 500, message: err.message });
    }
})

module.exports = { createGrretuns, getGrreturns, getLastGrnumber, getAGrreturns }