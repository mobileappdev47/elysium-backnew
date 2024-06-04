const asyncHandler = require("express-async-handler");
const Grreturns = require('../models/greturnsModel')

const createGrretuns = asyncHandler (async (req, res) => {
    try {
        const newGrreturn = await Grreturns.create(req.body);
        res.json(newGrreturn);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

const getGrreturns = asyncHandler ( async( req, res) => {
    try {
        const grreturns = await Grreturns.find();
        res.json({success: true, code: 200, grreturns });
    } catch (err) {
        res.status(500).json({success: false, code: 500, message: err.message });
    }
})

const getAGrreturns = asyncHandler(async (req, res) => {
    try {
        const grreturn = await Grreturns.findById(req.params.id);
        if (grreturn === null) {
            return res.status(404).json({success: false, code: 404, message: 'Document not found' });
        }
        res.json({success: true, code: 200, grreturn});
    } catch (err) {
        res.status(500).json({success: false, code: 500, message: err.message });
    }
})

module.exports = {createGrretuns, getGrreturns, getAGrreturns}