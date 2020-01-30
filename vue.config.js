//const path = require('path');

module.exports = {
  "configureWebpack": config => {
    config.output.filename = "vue-grid-layout.js";
    config.externals = {'vue': 'Vue'};
    config.entry.app = "./src/index.js";
    config.output.libraryExport = "default";
    config.mode = "production";
    config.devtool = false;
  },
  "chainWebpack": config => {
    config.optimization.delete('splitChunks');
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
  },

  "css": {
    "extract": false
  },
};

