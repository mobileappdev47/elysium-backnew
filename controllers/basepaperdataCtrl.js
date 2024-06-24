const asyncHandler = require("express-async-handler");
const BasePaperData = require('../models/basePaperDataModel')

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
        const newBasePapers = await BasePaperData.insertMany(modifiedBasePapers);
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
        const basePapers = await BasePaperData.find(query).populate({
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
});

const getLastBasePaperData = asyncHandler(async (req, res) => {
    try {
        const lastBasePaper = await BasePaperData.findOne().sort({ createdAt: -1 }).populate({
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

const deleteBasePaperData = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBasePaper = await BasePaperData.findByIdAndDelete(id);

        if (!deletedBasePaper) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: 'BasePaper not found'
            });
        }

        res.status(200).json({
            success: true,
            code: 200,
            message: 'BasePaper deleted successfully',
            data: deletedBasePaper
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            code: 500,
            message: err.message
        });
    }
})

const deleteAllBasePaperData = asyncHandler(async (req, res) => {
    try {
        const deleteResult = await BasePaperData.deleteMany({});

        if (!deleteResult.deletedCount) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: 'No base papers found to delete'
            });
        }

        res.status(200).json({
            success: true,
            code: 200,
            message: 'All base papers deleted successfully',
            data: deleteResult
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            code: 500,
            message: err.message
        });
    }
});

const deleteBasePapersByIds = asyncHandler(async (req, res) => {
    try {
        const { basePaperIds } = req.body;

        // Validate request body
        if (!Array.isArray(basePaperIds) || basePaperIds.length === 0) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: 'Invalid request. Provide an array of basePaperIds.'
            });
        }

        // Perform the delete operation
        const deleteResult = await BasePaperData.deleteMany({
            _id: { $in: basePaperIds }
        });

        if (!deleteResult.deletedCount) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: 'No base papers found to delete'
            });
        }

        res.status(200).json({
            success: true,
            code: 200,
            message: `${deleteResult.deletedCount} base papers deleted successfully`,
            data: deleteResult
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            code: 500,
            message: err.message
        });
    }
});



module.exports = { createBasePaper, getAllBasePaper, getLastBasePaperData, deleteBasePaperData, deleteAllBasePaperData, deleteBasePapersByIds }