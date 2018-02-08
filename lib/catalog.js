const fs = require('fs'),
      path = require('path');

module.exports = (_path) => {
    const css = fs.readFileSync(__dirname + '/ssr.css')
}