const express = require('express');
const { createSalesperson, getSalespersons, updateSalesperson, deleteSalesperson, getSalespersonById } = require('../controllers/salespersonCtrl');

const router = express.Router();


router.post('/create', createSalesperson);
router.get('/getall', getSalespersons);
router.get('/get/:id', getSalespersonById);
router.put('/update/:id', updateSalesperson);
router.delete('/delete/:id', deleteSalesperson);



module.exports = router;    