const express = require('express');
const { createGrretuns, getGrreturns, getAGrreturns, getLastGrnumber } = require('../controllers/grreturnsCtrl');
const { authMiddleware } = require('../middlerwares/authMiddleware');

const router = express.Router();


router.post('/create', authMiddleware, createGrretuns);
router.get('/getall', authMiddleware, getGrreturns);
router.get('/get/:id', authMiddleware, getAGrreturns);
router.get('/last', authMiddleware, getLastGrnumber)



module.exports = router;    