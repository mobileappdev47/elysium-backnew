const express = require('express');
const multer = require('multer')
const { createAddstock, getAddstocks, deleteAddstock, getOutofStocks, addDataFromExcel,
     updateAddstock, getInchSizeByProdAndDesc, getAllProductNames, generateExcelFile,
      getRollwiseAddstocks, getAvailableAddstocks, deleteAllAddstock, 
      getAggregatedStocks} = require('../controllers/addstockCtrl');

const router = express.Router();

const upload = multer({ dest: 'uploads/' });


router.post('/create', createAddstock);
router.post('/fromexcel', upload.single('file'), addDataFromExcel);
router.get('/getall', getAddstocks);
router.get('/getstocks', getAggregatedStocks)
router.put('/update', updateAddstock)
router.get('/getoutofstock', getOutofStocks);
router.get('/getinch-product', getInchSizeByProdAndDesc);
router.get('/productname', getAllProductNames)
router.post('/checkproduct', getAvailableAddstocks)
router.get('/getrollwisestock', getRollwiseAddstocks)
router.delete('/delete/:id', deleteAddstock);
router.delete('/deleteall', deleteAllAddstock);
router.get('/download', async (req, res) => {
    try {
        // Extract query parameters from the request URL
        const { palsanafactory, pandesraoffice, productName } = req.query;

        // Convert query parameters to boolean values
        const palsana = palsanafactory === 'true';
        const pandesra = pandesraoffice === 'true';

        // Generate Excel file with filtered data
        const excelBuffer = await generateExcelFile(palsana, pandesra, productName);

        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename="stock_data.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Length', excelBuffer.length); // Set content length for efficiency

        // Send the Excel buffer as response
        res.send(excelBuffer);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;    