const asyncHandler = require("express-async-handler");
const Qrcode = require('../models/qrcodeModel')



const createQrcode = asyncHandler(async (req, res) => {
    try {
        // Assuming req.admin contains the ID of the admin
        const user = req.admin;

        // Create the QR code with admin ID
        const qrCode = await Qrcode.create({ ...req.body, user: user._id });

        // Respond with success and the created QR code
        res.status(201).json({ success: true, code: 201, qrCode });
    } catch (err) {
        // Handle any errors
        res.status(400).json({ success: false, code: 400, message: err.message });
    }
});


const getAllQrcode = asyncHandler(async(req, res) => {
    try {
        const qrCodes = await Qrcode.find().populate({
            path: 'user',
            select: 'firstname _id'
        });
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

const deleteQrCodesArray = asyncHandler(async (req, res) => {
    try {
        // Extract the array of QR code IDs from the request body
        const { qrCodeIds } = req.body;

        // Check if qrCodeIds is an array
        if (!Array.isArray(qrCodeIds)) {
            return res.status(400).json({ success: false, message: 'qrCodeIds must be an array' });
        }

        // Use the deleteMany method to remove documents with matching IDs from the collection
        const result = await Qrcode.deleteMany({ _id: { $in: qrCodeIds } });

        // Check if any documents were deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'No matching QR codes found' });
        }

        res.json({ success: true, message: `${result.deletedCount} QR code(s) deleted successfully` });
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

module.exports = {createQrcode, getAllQrcode, clearQrData, deleteQrCodesArray, deleteQrcode}