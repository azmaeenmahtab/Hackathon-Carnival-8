const app = require("../dist/app.js");

const handler = app.default || app;

module.exports = handler;
