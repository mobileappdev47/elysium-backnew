const express = require('express');
const { createPrintStock, getAllPrintStocks, getPrintStocksByChallanNumber } = require('../controllers/printstockCtrl');
const { authMiddleware } = require('../middlerwares/authMiddleware');

const router = express.Router();



router.post('/create', authMiddleware, createPrintStock);
router.get('/getall', authMiddleware, getAllPrintStocks);
router.get('/getfromchallan', authMiddleware, getPrintStocksByChallanNumber)

module.exports = router;    