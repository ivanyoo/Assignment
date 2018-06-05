const mysql = require('mysql');
const express = require('express');
const config = require('../../config.json');
const router = express.Router();

router.post('/day', function(req, res, next) {
  console.log(req.body.date);

  let dateStart = req.body.date + ' 00:00:00';
  let dateEnd = req.body.date + ' 23:59:59';

  console.log(req.body.location);
  const connection = mysql.createConnection(config.DB);
  connection.connect();
  connection.query('SELECT * FROM locationdata as ld JOIN locationmap as lm ON ld.locationID = lm.locationID ' +
    'WHERE lm.locationName = ? AND time BETWEEN ? AND ? ', [req.body.location, dateStart, dateEnd],
    (err, results, cols) => {
      connection.end();
      if (err) throw err;
      console.log(results);
      res.json(results);
  });



});

module.exports = router;