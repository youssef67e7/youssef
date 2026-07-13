const path = require('path');
const vercelHandler = require(path.join(__dirname, '..', 'dist', 'vercel.js'));
module.exports = vercelHandler.default;
