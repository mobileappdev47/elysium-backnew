const express = require('express');
const { createGrretuns, getGrreturns, getAGrreturns } = require('../controllers/grreturnsCtrl');
const { authMiddleware } = require('../middlerwares/authMiddleware');

const router = express.Router();


router.post('/create', authMiddleware, createGrretuns);
router.get('/getall', authMiddleware, getGrreturns);
router.get('/get/:id', authMiddleware, getAGrreturns);



module.exports = router;    