
const path = require('path');

module.exports = {
    "configureWebpack": config => {
        config.target = "web";
        config.externals = {'vue': 'Vue'};
        config.output.filename = "tiles.js";
        config.entry.app = "./src/main/vue/main.js";
        config.resolve.alias["@"] = path.resolve(__dirname, "src/main/vue");
        config.resolve.alias["~"] = path.resolve(__dirname, "node_modules");
    },
    "chainWebpack": config => {
        config.optimization.delete('splitChunks');
        config.plugins.delete('html');
        config.plugins.delete('preload');
        config.plugins.delete('prefetch');
    },
    "filenameHashing": false,
    "css": {
        "extract": false
    },
    "outputDir": "src/main/resources/META-INF/resources/modules/common/common/layout/tiles/js/vue"
};

