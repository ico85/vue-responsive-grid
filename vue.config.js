
//const path = require('path');

module.exports = {
    "configureWebpack": config => {
        config.output.filename = "vue-grid-layout.js";
        config.entry.app = "./src/index.js";
    },
  "chainWebpack": config => {
    config.optimization.delete('splitChunks');
    //config.plugins.delete('html');
    //config.plugins.delete('preload');
    //config.plugins.delete('prefetch');
  },

    "css": {
        "extract": false
    },
    "outputDir": "dist"
};

