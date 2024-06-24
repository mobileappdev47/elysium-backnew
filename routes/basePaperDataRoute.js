const express = require('express');
const { getAllBasePaper, createBasePaper, deleteBasePaperData, deleteAllBasePaperData, getLastBasePaperData, deleteBasePapersByIds } = require('../controllers/basepaperdataCtrl');
const { authMiddleware, isAdmin } = require('../middlerwares/authMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, isAdmin, createBasePaper);
router.get('/getall', authMiddleware, isAdmin, getAllBasePaper)
router.get('/getlast', authMiddleware, isAdmin, getLastBasePaperData)
router.delete('/delete/:id', authMiddleware, isAdmin, deleteBasePaperData)
router.delete('/deleteall', authMiddleware, isAdmin, deleteAllBasePaperData)
router.delete('/deletebyid', deleteBasePapersByIds)


module.exports = router;    