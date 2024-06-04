const express = require('express');
const { createSalesOrder, getSalesOrders, updateSalesOrder, deleteSalesOrder,
    getSingleSalesOrder, updateSalesOrderCrt, getLastSalesOrder, doneUpdateSalesOrder,
    getLastUpdatedCRTPendingOrder,
    getCustomerNamesAndIds, 
    deletePendingProduct} = require('../controllers/salesorderCtrl');
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
// router.put('/updateoldstock/:id', updateOldStockSalesOrder)


module.exports = router;    