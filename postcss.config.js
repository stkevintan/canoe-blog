const c = require('./package').config;
module.exports = {
  plugins: [
    require('autoprefixer')({ browsers: c.browserslist }),
    require('cssnano')()
  ]
};
