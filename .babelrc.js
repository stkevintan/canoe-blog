const c = require('./package').config;
module.exports = {
  presets: [
    [
      'env',
      {
        targets: {
          browsers: c.browserslist
        }
      }
    ]
  ],
  plugins: []
};
