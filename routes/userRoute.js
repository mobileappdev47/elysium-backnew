const express = require('express');
const { createUser, loginUser, createAdmin, getUser, checkActiveStatus, updateUserActive, getAllUser, updateUser, deleteUser } = require('../controllers/userCtrl');
const { isAdmin, authMiddleware } = require('../middlerwares/authMiddleware');

const router = express.Router();

router.post('/activestatus/:id', authMiddleware, isAdmin, updateUserActive)
router.post('/create',authMiddleware, isAdmin, createUser);
router.post('/create-admin', createAdmin)
router.post('/login',checkActiveStatus, loginUser)
router.get('/getuser/:id', getUser)
router.delete('/delete/:id', deleteUser)
router.get('/getalluser',authMiddleware, isAdmin, getAllUser)
router.put('/update/:id', authMiddleware, isAdmin, updateUser)




module.exports = router;    