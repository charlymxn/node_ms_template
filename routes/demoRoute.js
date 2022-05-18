const express = require('express');
const router = express.Router();
// import Controllers
const demoController = require('../controllers/demoController.js');

router.get('/', demoController.get_demo);
router.post('/', demoController.add_demo);
router.delete('/', demoController.delete_demo);
router.put('/', demoController.generate_demo);

module.exports = router;