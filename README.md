# hbdx-map

## 示例
port:8080
二维：http://localhost:8080/#/test/
三维：http://localhost:8080/#/test/earth

## 程序开发

第一步：安装

```
npm install
```

第二步：根据目的，执行不同的命令

- development

```
npm run serve
```

- production

```
npm run build
```

- test map 组件测试

```
npm run test

```

## 文件说明

- map 地图库
  - components 组件
  - js 脚本
  - style 样式
  - test 测试
  - config.js 地图库中的全局配置
- public
  - config.js 项目中的全局配置
- src
- package.json

## map 地图库的第三方使用

1. 导入项目或者 map 文件夹
2. 安装 ol、proj4, 如需应用 js/analysis 方法，需安装 turf;应用 components 组件，需安装 vue2、element-ui、less、less-loader,
3. 修改 map/config.js 文件的配置
4. 使用组件

   1. 在 vue.config.js 或 webpack.js 下增加别名

   ```
    alias: {
      "@map": path.resolve(__dirname, "map")
    }
   ```

   1. 组件引用，可参看 map/test/components 文件夹

### 配置说明

### 视图配置

```
  // 默认配置
  view: {
    zoom: 0,
    center: [0，0],  // 经纬度坐标
    extent: [-180，-85，180，85],
    projection:"EPSG:4326",
    minZoom:0,
    maxZoom:22
  }
```

### 图层配置

1、一个底图

```
layers: [
  [
    {
    type: "xyz",
    url:
      "http://t{0-7}.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=d9160cdd3e165f779df0909d33be966d",
    projection: "EPSG:3857"
    }
  ]
]
```

2、多个图层切换

```
layers: [
    {
      name: "底图",
      icon: "",
      data: [
        {
          type: "xyz",
          url:
            "http://t{0-7}.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=d9160cdd3e165f779df0909d33be966d",
          projection: "EPSG:3857"
        }

      ]
    }
  ]
```

3、不同类型的图层基本配置参数
3.1 xyz

```
{
  type: "xyz",
  url:
    "http://t{0-7}.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=d9160cdd3e165f779df0909d33be966d",
  projection: "EPSG:3857"
}
```

```
{
  // 加载离线本地数据
  type: "xyz",
  projection: "EPSG:3857",
  xyzOptions: {
    tileUrlFunction: tileCoord => {
      let z = "L" + tileCoord[0].toString().padStart(2, "0");
      let x = "C" + tileCoord[1].toString(16).padStart(8, "0");
      let y = "R" + tileCoord[2].toString(16).padStart(8, "0");
      return `tiles/wuhan/${z}/${y}/${x}.png`;
    }
  }
},
```

3.2 ArcGIS

```
{
  type: "ArcGIS",
  url:
    "http://192.168.99.56:6080/arcgis/rest/services/SNJ/sat_and_ano_map/MapServer"
}
```

3.3 GeoServer
3.3.1 WMS

```
{
  type: "GeoServer",
  url: "http://localhost:8588/geoserver/cite/wms",
  layers: "cite:wuhan_14"
}
```

3.3.2 WMTS

```
{
  type: "GeoServer",
  url: "http://localhost:8588/geoserver/gwc/service/wmts",
  layers: "cite:wuhan_14",
  matrixSet: "EPSG:900913" //
}
```

3.4 自定义的切片方法配置,针对 xyz 和 GeoServer 类型的服务

```
{
  // ……
  tileGrid:{
    origin:[-20037508.342789244, 20037508.342789244],
    tileSize:[256,256]
    resolutions:[ 156543.03392804097,78271.51696402048,39135.75848201024,19567.87924100512,9783.93962050256,4891.96981025128,2445.98490512564,1222.99245256282,611.49622628141,305.748113140705,152.8740565703525,76.43702828517625,38.21851414258813,19.109257071294063,9.554628535647032,4.777314267823516,2.388657133911758,1.194328566955879,0.5971642834779395]
    matrixIds:[ 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
  }
}
```
## earth 三维库的使用

1、安装cesium

```js
npm install cesium
```
2、安装辅助类库

proj4: 坐标转换
xml2js:xml 转 json
cesium-navigation-es6:导航控件

```js
npm install proj4 xml2js cesium-navigation-es6
```


2、修改vue.config.js/webpack.config.js的配置

```js
// npm install copy-webpack-plugin@6 --save-dev // 版本过高，可能报错
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

plugins: [
  new CopyWebpackPlugin({
    patterns: [
      { from: "node_modules/cesium/Build/Cesium/Workers", to: "Cesium/Workers" },
      {
        from: "node_modules/cesium/Build/Cesium/ThirdParty",
        to: "Cesium/ThirdParty"
      },
      { from: "node_modules/cesium/Build/Cesium/Assets", to: "Cesium/Assets" },
      { from: "node_modules/cesium/Build/Cesium/Widgets", to: "Cesium/Widgets" }
    ]
  }),
  new webpack.DefinePlugin({
    // Define relative base path in cesium for loading assets
    CESIUM_BASE_URL: JSON.stringify("")
  })
],
module: {
  unknownContextCritical: false,
  unknownContextRegExp: /^.\/.*$/,
}
```