var express = require('express');
var router = express.Router();
var obfuscate = require('../obfuscate');
let sendResponse = function(res, words) {
  res.setHeader('content-type', 'application/json');

  obfuscate(res,words);
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',
      { title: 'Sleep Talker',
        message: 'Hold Shift and press Enter to quickly convert'
      });
});
router.get('/:words', (req, res) => {
  sendResponse(res, req.params.words);
});

router.post('/', (req, res) => {
    var words = req && req.body && req.body.words;
    console.log(`req.body.words: ${words}`);
    sendResponse(res,words);
});
module.exports = router;
