const express = require('express');
const { getAllBasePaper, createBasePaper, deleteBasePaperData, deleteAllBasePaperData, getLastBasePaperData, deleteBasePapersByIds } = require('../controllers/basepaperdataCtrl');
const { authMiddleware, isAdmin } = require('../middlerwares/authMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, createBasePaper);
router.get('/getall', authMiddleware,  getAllBasePaper)
router.get('/getlast', authMiddleware,  getLastBasePaperData)
router.delete('/delete/:id', authMiddleware,  deleteBasePaperData)
router.delete('/deleteall', authMiddleware,  deleteAllBasePaperData)
router.delete('/deletebyid', deleteBasePapersByIds)


module.exports = router;    