const express = require('express');
const { createGrretuns, getGrreturns, getAGrreturns } = require('../controllers/grreturnsCtrl');

const router = express.Router();


router.post('/create', createGrretuns);
router.get('/getall', getGrreturns);
router.get('/get/:id', getAGrreturns);



module.exports = router;    