const asyncHandler = require("express-async-handler");
const BasePaper = require('../models/basePaperModel');
const xlsx = require('xlsx')

const createBasePaper = asyncHandler(async (req, res) => {
    const basePapers = req.body;

    if (!Array.isArray(basePapers)) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: 'Input should be an array of base papers'
        });
    }

    // Add user from req.admin and uniqueid from body
    const modifiedBasePapers = basePapers.map(paper => ({
        ...paper,
        user: req.admin._id, // Assuming req.admin contains the admin user object
        uniqueid: paper.uniqueid
    }));

    try {
        const newBasePapers = await BasePaper.insertMany(modifiedBasePapers);
        res.status(201).json({
            success: true,
            code: 201,
            message: 'Base papers created successfully',
            data: newBasePapers
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            code: 400,
            message: err.message
        });
    }
})

const getAllBasePaper = asyncHandler(async (req, res) => {
    const { gsm, qualityname, millname, uniqueid } = req.query;

    let query = {};

    if (gsm) {
        query.gsm = gsm;
    }
    if (qualityname) {
        query.qualityname = qualityname;
    }
    if (millname) {
        query.millname = millname;
    }
    if (uniqueid) {
        query.uniqueid = uniqueid;
    }

    try {
        const basePapers = await BasePaper.find(query).populate({
            path: 'user', // Specify the field to populate
            select: 'firstname _id' // Specify the fields to include
        });
        res.json({
            success: true,
            code: 200,
            message: 'Base papers fetched successfully',
            data: basePapers.length ? basePapers : []
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            code: 500,
            message: err.message
        });
    }
})

const getLastBasePaper = asyncHandler(async (req, res) => {
    try {
        const lastBasePaper = await BasePaper.findOne().sort({ createdAt: -1 }).populate({
            path: 'user', // Specify the field to populate
            select: 'firstname _id' // Specify the fields to include
        });

        if (!lastBasePaper) {
            return res.json({
                success: true,
                code: 200,
                message: 'No base papers found',
                data: null
            });
        }

        res.json({
            success: true,
            code: 200,
            message: 'Last base paper fetched successfully',
            data: lastBasePaper
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            code: 500,
            message: err.message
        });
    }
});

const generateBasePaperExcelFile = async () => {
    try {
        // Fetch data from BasePaper model
        const basePaperData = await BasePaper.find().sort({ updatedAt: -1 }).populate({
            path: 'user', // Specify the field to populate
            select: 'firstname _id' // Specify the fields to include
        });

        // If no data found, throw an error
        if (!basePaperData || basePaperData.length === 0) {
            throw new Error('No data found');
        }

        // Prepare the data for the worksheet
        const jsonData = basePaperData.map(data => ({
            'Inward Date': data.inwarddate,
            'Place': data.place,
            'Reel Number': data.reelnum,
            'Weight': data.weight,
            'Mill Name': data.millname,
            'Quality Name': data.qualityname,
            'ID Number': data.idnumber,
            'Base Paper ID': data.basepaperid,
            'GSM': data.gsm,
            'Unique ID': data.uniqueid,
            'User ': data.user.firstname
        }));

        // Create a new workbook and add the data
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(jsonData);

        // Set column headers
        ws['!cols'] = [
            { wch: 20 }, // Inward Date
            { wch: 20 }, // Place
            { wch: 20 }, // Reel Number
            { wch: 10 }, // Weight
            { wch: 20 }, // Mill Name
            { wch: 20 }, // Quality Name
            { wch: 20 }, // ID Number
            { wch: 20 }, // Base Paper ID
            { wch: 10 }, // GSM
            { wch: 20 }, // Unique ID
            { wch: 30 }  // User ID
        ];

        // Add the worksheet to the workbook
        xlsx.utils.book_append_sheet(wb, ws, 'Base Paper Data');

        // Write the workbook to a buffer
        const excelBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        return excelBuffer;
    } catch (error) {
        // Log the error for debugging
        console.error(error);
        throw new Error('Failed to generate Excel file');
    }
};


module.exports = { createBasePaper, getAllBasePaper, getLastBasePaper, generateBasePaperExcelFile }