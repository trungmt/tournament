'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
var express_1 = __importDefault(require('express'));
var http = require('http');
var app = express_1.default();
var server = http.createServer(app);
var port = process.env.PORT || 8080;
app.use(express_1.default.json);
app.get('/', function (req, res) {
  res.send('Welcome to Euro 2020 portal');
});
server.listen(port, function () {
  console.log('Server is running at port ' + port + '...');
});
