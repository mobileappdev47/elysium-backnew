const express = require('express');
const { createQrcode, getAllQrcode, clearQrData, deleteQrcode, deleteQrCodesArray } = require('../controllers/qrcodeCtrl');
const { authMiddleware } = require('../middlerwares/authMiddleware')
const router = express.Router();


router.post('/create', authMiddleware, createQrcode);
router.get('/getall', authMiddleware, getAllQrcode);
router.delete('/clearqr', authMiddleware, clearQrData)
router.delete('/delete/:id', authMiddleware, deleteQrcode)
router.delete('/deletecode/', deleteQrCodesArray)


module.exports = router;    