const asyncHandler = require("express-async-handler");
const Salesperson = require('../models/salesPersonModel')

const createSalesperson = asyncHandler(async (req, res) => {
    try {
        const { salesname } = req.body;
        const salesperson = new Salesperson({ salesname });
        await salesperson.save();
        res.status(201).json({ success: true, code: 201, salesperson });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});


const getSalespersons = asyncHandler(async (req, res) => {
    try {
        const salespersons = await Salesperson.find({});
        res.status(200).json({ success: true, code: 200, salespersons });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const getSalespersonById = asyncHandler(async (req, res) => {
    try {
        const salesperson = await Salesperson.findById(req.params.id);

        if (salesperson) {
            res.status(200).json({ success: true, code: 200, data: salesperson });
        } else {
            res.status(404).json({ success: false, code: 404, message: 'Salesperson not found' });
        }
    } catch (error) {
        // Handle other errors
        res.status(500).json({ success: false, code: 500, error: error.message });
    }
});


const updateSalesperson = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { salesname } = req.body;
        const salesperson = await Salesperson.findByIdAndUpdate(id, { salesname }, { new: true });
        if (!salesperson) {
            return res.status(404).json({ success: false, code: 404, message: "Salesperson not found" });
        }
        res.status(200).json({ success: true, code: 200, salesperson });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const deleteSalesperson = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const salesperson = await Salesperson.findByIdAndDelete(id);
        if (!salesperson) {
            return res.status(404).json({ success: false, code: 404, message: "Salesperson not found" });
        }
        res.status(200).json({ success: true, code: 200, message: "Salesperson deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});


module.exports = {createSalesperson, getSalespersons, getSalespersonById, updateSalesperson, deleteSalesperson}