const asyncHandler = require("express-async-handler");
const Qrcode = require('../models/qrcodeModel')



const createQrcode = asyncHandler(async (req, res) => {
    try {
        const qrCode = await Qrcode.create(req.body);
        res.status(201).json({success:true, code: 201, qrCode});
    } catch (err) {
        res.status(400).json({success: true, code: 400, message: err.message });
    }
})


const getAllQrcode = asyncHandler(async(req, res) => {
    try {
        const qrCodes = await Qrcode.find();
        res.json({success: true, code: 200, qrCodes});
    } catch (err) {
        res.status(500).json({success: true, code: 500, message: err.message });
    }
})

const clearQrData = asyncHandler(async (req, res) => {
    try {
        // Use the deleteMany method to remove all documents from the collection
        await Qrcode.deleteMany({});
        res.json({ success: true, message: 'All data cleared from the database' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const deleteQrcode = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params; // Assuming the ID is passed as a URL parameter
        const deletedQrCode = await Qrcode.findByIdAndDelete(id);
        if (!deletedQrCode) {
            return res.status(404).json({ success: false, message: 'QR code not found' });
        }
        res.json({ success: true, message: 'QR code deleted successfully', deletedQrCode });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = {createQrcode, getAllQrcode, clearQrData, deleteQrcode}