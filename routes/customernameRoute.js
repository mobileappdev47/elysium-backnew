const express = require('express');
const { createCustomername, getCustomernameById, getCustomernames, updateCustomername, deleteCustomername } = require('../controllers/customernameCtrl');

const router = express.Router();


router.post('/create', createCustomername);
router.get('/getall', getCustomernames);
router.get('/get/:id', getCustomernameById);
router.put('/update/:id', updateCustomername);
router.delete('/delete/:id', deleteCustomername);



module.exports = router;    