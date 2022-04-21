const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

module.exports = {
  parallel: false,
  assetsDir: "assets",
  productionSourceMap: process.env.NODE_ENV === "production" ? false : true,
  configureWebpack: {
    resolve: {
      alias: {
        "@map": path.resolve(__dirname, "map"),
        "@earth": path.resolve(__dirname, "earth")
      }
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "node_modules/cesium/Build/Cesium/Workers",
            to: "Cesium/Workers"
          },
          {
            from: "node_modules/cesium/Build/Cesium/ThirdParty",
            to: "Cesium/ThirdParty"
          },
          {
            from: "node_modules/cesium/Build/Cesium/Assets",
            to: "Cesium/Assets"
          },
          {
            from: "node_modules/cesium/Build/Cesium/Widgets",
            to: "Cesium/Widgets"
          }
        ]
      }),
      new webpack.DefinePlugin({
        // Define relative base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify("")
      })
    ],
    module: {
      unknownContextCritical: false,
      unknownContextRegExp: /\/cesium\/cesium\/Source\/Core\/buildModuleUrl\.js/,
      // unknownContextRegExp: /^.\/.*$/
      rules: [
        {
          test: /\.js$/,
          loader: require.resolve("@open-wc/webpack-import-meta-loader")
        },
        {
          test: /\.(glb|gltf)$/,
          use: [
            {
              loader: "file-loader",
              options: {
                outputPath: "assets/models/"
              }
            }
          ]
        }
      ]
    }
  },
  chainWebpack: config => {
    config.module
      .rule("worker")
      .test(/\.worker\.js$/)
      .use("worker-loader")
      .loader("worker-loader")
      .options({
        inline: "fallback"
      })
      .end();
    config.module.rule("js").exclude.add(/\.worker\.js$/);
  },
  devServer: {
    proxy: {
      "/geoserver": {
        target: "http://localhost:8588", // 目标代理接口地址
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          "^/geoserver/": "/geoserver/"
        }
      },
      "/arcgis": {
        target: "http://223.75.53.178:8399", // 目标代理接口地址
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          "^/arcgis/": "/arcgis/"
        }
      },
      dem: {
        target: "http://localhost:8590", // 目标代理接口地址
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          "^/dem/": "/"
        }
      }
    }
  }
};
