const express = require('express');
const router = express.Router();
// import Controllers
const legalarioFillDocumentController = require('../controllers/legalarioFillDocumentController.js');
const legalarioSignDocumentController = require('../controllers/legalarioSignDocumentController.js');

router.post('/postLegalarioFillDocument', legalarioFillDocumentController.post_filldocument);

router.post('/postLegalarioSignDocument', legalarioSignDocumentController.post_signdocument);

module.exports = router;