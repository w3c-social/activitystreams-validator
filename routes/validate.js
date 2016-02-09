// activitystreams-validator: https://github.com/w3c-social/activitystreams-validator
//
// Copyright © 2016 World Wide Web Consortium, (Massachusetts Institute of
// Technology, European Research Consortium for Informatics and Mathematics,
// Keio University, Beihang). All Rights Reserved. This work is distributed
// under the W3C® Software License [1] in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// [1] http://www.w3.org/Consortium/Legal/copyright-software

var express = require('express');
var upload = require('multer')({dest: process.env['UPLOADS'] || '/tmp/uploads'})
var router = express.Router();

router.get('/', function(req, res, next) {
  if (!req.query || !req.query.url) {
    next(new Error("No URL provided"));
  }
  res.send("Validation report for "+url);
});

/* Validate input, print some output */

router.post('/', function(req, res, next) {
  if (req.is('json')) {
    // Validate req.body
    // Output some kind of validation report
    res.json({status: "unimplemented"})
  } else if (req.is('urlencoded')) {
    if (!req.body || !req.body.data) {
      return next(new Error("No data"));
    }
    // Parse req.body.data
    // Validate req.body.data
    // Output HTML validation report
    res.send("Validation report for data");
  } else if (req.is('multipart')) {
    upload.single('file')(req, res, function(err) {
      if (err) {
        return next(err);
      }
      // Read the file
      // Parse the data
      // Validate
      // Output HTML validation report
      res.send("Validation report for file");
    });
  } else {
    next(new Error("Unexpected POST request type"));
  }
});

module.exports = router;
