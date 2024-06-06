const express = require('express');
const { createSalesOrder, getSalesOrders, updateSalesOrder, deleteSalesOrder,
    getSingleSalesOrder, updateSalesOrderCrt, getLastSalesOrder, doneUpdateSalesOrder,
    getLastUpdatedCRTPendingOrder,
    getCustomerNamesAndIds, 
    deletePendingProduct,
    generateExcelFile,
    getSalesFromUniquid} = require('../controllers/salesorderCtrl');
const { authMiddleware } = require('../middlerwares/authMiddleware');

const router = express.Router();


router.post('/create', authMiddleware, createSalesOrder);
router.get('/getall', authMiddleware, getSalesOrders);
router.get('/customers', authMiddleware, getCustomerNamesAndIds);
router.get('/sales-order/:id', authMiddleware, getSingleSalesOrder);
router.get('/last-order', authMiddleware, getLastSalesOrder);
router.get('/last-challan', authMiddleware, getLastUpdatedCRTPendingOrder);
router.put('/update/:id', authMiddleware, updateSalesOrder);
router.put('/dispatch/:id', authMiddleware, doneUpdateSalesOrder);
router.put('/updatecrt/:id', authMiddleware, updateSalesOrderCrt);
router.delete('/del-pending/:orderId/:qualityId', authMiddleware, deletePendingProduct);
router.delete('/delete/:id', authMiddleware, deleteSalesOrder);
router.get('/getgr/:uniqueid', authMiddleware, getSalesFromUniquid)
// router.put('/updateoldstock/:id', updateOldStockSalesOrder)
router.get('/download', async (req, res) => {
    try {
        const excelBuffer = await generateExcelFile();

        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename="sales_order.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Length', excelBuffer.length); // Set content length for efficiency

        // Send the Excel buffer as response
        res.send(excelBuffer);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;    