const express = require('express');
const { createQrcode, getAllQrcode, clearQrData, deleteQrcode } = require('../controllers/qrcodeCtrl');

const router = express.Router();


router.post('/create', createQrcode);
router.get('/getall', getAllQrcode);
router.delete('/clearqr', clearQrData)
router.delete('/delete/:id', deleteQrcode)

module.exports = router;    