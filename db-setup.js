const mongoose = require('mongoose');

const db = mongoose.connect(process.env.DB_URI);

module.exports = db;