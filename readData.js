const fs = require('fs');
const readline = require('readline');
const mysql = require('mysql');
const config = require('./config.json');

const readStream = fs.createReadStream('data/locationData.csv');

const lineReader = readline.createInterface({
  input: readStream
});

const pool = mysql.createPool(config.DB);


let lineCount = 0;
let linesWritten = 0;
lineReader.on('line', (line) => {
  if (lineCount < 2) {
    lineCount++;
  } else {
    lineCount++;
    let row = line.split(',');
    row[1] = new Date(row[1]);
    for (let cell = 0; cell < row.length; cell++) {
      if (row[cell] === 'NaN') {
        row[cell] = null;
      }
    }
    // add last 4 values to row in case duplicate key update is needed
    for (let index = 0; index < 4; index++) {
      row.push(row[2 + index]);
    }
    pool.query('INSERT INTO locationdata (locationID, time, AtmosphericPressure, WindDirection, WindSpeed, Gust)' +
      'VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE ' +
      'AtmosphericPressure = ?, WindDirection = ?, WindSpeed = ?, Gust = ?', row, (err) => {
      if (err) throw err;
      linesWritten++;
      if (linesWritten === 606157) {
        pool.end();
      }
    });
  }
});

