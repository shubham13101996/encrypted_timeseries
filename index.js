const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
const Influx = require('influx');
const dotenv = require("dotenv");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Simulated secret key (replace with your actual key)
const secretKey = process.env.SECRET_KEY;
const iv = crypto.randomBytes(16);

// Initialize InfluxDB
const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST,  // Your InfluxDB host
  database: process.env.INFLUX_DB,   // Your database name
  schema: [
    {
      measurement: 'data',
      fields: { value: Influx.FieldType.FLOAT },
      tags: ['source']
    }
  ]
});

io.on('connection', socket => {
  console.log('Client connected');

  // Simulate data generation
  setInterval(() => {
    const value = Math.random() * 100;
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    const encryptedValue = Buffer.concat([cipher.update(value.toString()), cipher.final()]);

    socket.emit('data', encryptedValue.toString('hex'));
  }, 1000);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});