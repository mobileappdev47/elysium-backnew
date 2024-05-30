const express = require('express');
const { createSalesOrder, getSalesOrders, updateSalesOrder, deleteSalesOrder,
    getSingleSalesOrder, updateSalesOrderCrt, getLastSalesOrder, doneUpdateSalesOrder, 
    getLastUpdatedCRTPendingOrder} = require('../controllers/salesorderCtrl');

const router = express.Router();


router.post('/create', createSalesOrder);
router.get('/getall', getSalesOrders);
router.get('/sales-order/:id', getSingleSalesOrder);
router.get('/last-order', getLastSalesOrder);
router.get('/last-challan', getLastUpdatedCRTPendingOrder);
router.put('/update/:id', updateSalesOrder);
router.put('/dispatch/:id', doneUpdateSalesOrder);
router.put('/updatecrt/:id', updateSalesOrderCrt);
router.delete('/delete/:id', deleteSalesOrder);
// router.put('/updateoldstock/:id', updateOldStockSalesOrder)


module.exports = router;    