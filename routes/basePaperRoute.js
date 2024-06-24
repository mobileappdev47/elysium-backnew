const express = require('express');
const { getAllBasePaper, createBasePaper, getLastBasePaper, generateBasePaperExcelFile } = require('../controllers/basepaperCtrl');
const { authMiddleware, isAdmin } = require('../middlerwares/authMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, isAdmin, createBasePaper);
router.get('/getall', authMiddleware, isAdmin, getAllBasePaper)
router.get('/getlast', authMiddleware, isAdmin, getLastBasePaper)
router.get('/download', async (req, res) => {
    try {
        const excelBuffer = await generateBasePaperExcelFile();

        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename="basepaper-data.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Length', excelBuffer.length); // Set content length for efficiency

        // Send the Excel buffer as response
        res.send(excelBuffer);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


module.exports = router;    