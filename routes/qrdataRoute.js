const express = require('express');
const multer = require('multer');
const { createQrData, getAllQrData, getQrData, updateQrData, deleteQrData,
    deleteQrDataByQrCodeId, incrementCount, generateExcelFile, createAddstockQrData,
    getSpecificProductData, addQrDataFromExcel, updateQrDataByUniqueId,
    getAllQrProductNames,
    getLastQrData,
    deleteAllQrdata,
    getAggregatedQrData, 
    generateExcelFileWithLocation,
    getQrDataByUniqueIds,
    deleteArrayQrData,
    deleteByUniqueId} = require('../controllers/qrdataCtrl');
const { authMiddleware } = require('../middlerwares/authMiddleware');
const { createNewQrDataFromExisting } = require('../controllers/qrdataCtrl');

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.get('/download', async (req, res) => {
    try {
        const excelBuffer = await generateExcelFile();

        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename="qr_data.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Length', excelBuffer.length); // Set content length for efficiency

        // Send the Excel buffer as response
        res.send(excelBuffer);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.get('/locationchange', async (req, res) => {
    try {
        const excelBuffer = await generateExcelFileWithLocation();

        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename="location_change.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Length', excelBuffer.length); // Set content length for efficiency

        // Send the Excel buffer as response
        res.send(excelBuffer);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})
router.post('/create', authMiddleware, createQrData);
router.post('/createcutroll/:uniqueid/:id', authMiddleware, createNewQrDataFromExisting);
router.post('/fromexcel', authMiddleware, upload.single('file'), addQrDataFromExcel);
router.post('/createaddstock', authMiddleware, createAddstockQrData)
router.get('/getall', authMiddleware, getAllQrData);
router.get('/getstockall', authMiddleware, getAggregatedQrData);
router.get('/getlast', authMiddleware, getLastQrData);
router.get('/getproduct', authMiddleware, getSpecificProductData);
router.get('/productname', authMiddleware, getAllQrProductNames)
router.get('/getqr/:id', authMiddleware, getQrData)
router.put('/update/:id', authMiddleware, updateQrData)
router.put('/updatelocation', authMiddleware, updateQrDataByUniqueId)
router.post('/getfromuniqueid', getQrDataByUniqueIds)
router.delete('/delete/:id', authMiddleware, deleteQrData)
router.delete('/deleteqrdata', authMiddleware, deleteQrDataByQrCodeId)
router.delete('/alldelete', authMiddleware, deleteAllQrdata)
router.post('/count', authMiddleware, incrementCount)
router.delete('/qrdelete', deleteArrayQrData)
router.delete('/qrdata-delete', deleteByUniqueId)


module.exports = router;    