import {
  Viewer,
  viewerCesiumInspectorMixin,
  viewerCesium3DTilesInspectorMixin
} from "cesium/Source/Cesium";
import SingleTileImageryProvider from "cesium/Source/Scene/SingleTileImageryProvider";
import Rectangle from "cesium/Source/Core/Rectangle";
import Camera from "cesium/Source/Scene/Camera";
import ScreenSpaceEventType from "cesium/Source/Core/ScreenSpaceEventType";

import { getImageLayer } from "./Layer";
import CesiumNavigation from "cesium-navigation-es6";
import PositionLabel from "./widgets/PositionLabel";
import { getTerrain } from "./Terrain";
import { setCameraHeightAndPitch } from "./Camera";
import { load3dTileset } from "./model/3dTiles";

import "cesium/Build/Cesium/Widgets/widgets.css";
import "../style/base.css";

class MyViewer extends Viewer {
  constructor({ container, layers, ...options }) {
    options = options || {};

    let defaultRectangle = null;
    if (options.center && options.zoom) {
      defaultRectangle = calcRectangleByZoom(
        container,
        options.center,
        options.zoom
      );
      if (defaultRectangle) {
        Camera.DEFAULT_VIEW_RECTANGLE = defaultRectangle;
        Camera.DEFAULT_VIEW_FACTOR = 0;
      }
    }

    // cesium 默认组件设置
    let opts = {
      animation: false, // 动画小组件
      baseLayerPicker: false, // 底图组件，选择三维数字地球的底图（imagery and terrain）。
      fullscreenButton: false, // 全屏组件
      vrButton: false, // VR模式
      geocoder: false, // 地理编码（搜索）组件
      homeButton: false, // 首页，点击之后将视图跳转到默认视角
      infoBox: false, // 信息框
      sceneModePicker: false, // 场景模式，切换2D、3D 和 Columbus View (CV) 模式。
      selectionIndicator: true, //是否显示选取指示器组件
      timeline: false, // 时间轴
      navigationHelpButton: false, // 帮助提示，如何操作数字地球。
      // 如果最初应该看到导航说明，则为true；如果直到用户明确单击该按钮，则该提示不显示，否则为false。
      navigationInstructionsInitiallyVisible: false,
      imageryProvider: new SingleTileImageryProvider({
        url: require("../assets/Earth.jpg")
      }),
      terrainProvider: options.terrain ? getTerrain(options.terrain) : null
    };

    super(container, {
      ...opts,
      ...options
    });

    // 隐藏logo
    this._cesiumWidget._creditContainer.style.display = "none";

    // 取消双击定位
    this.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );

    // 底图图层
    if (Array.isArray(layers)) {
      this.baseLayers = layers.filter(x => {
        if (Array.isArray(x)) {
          // 如果是数组,默认是三维
          return true;
        } else {
          // 如果是对象，判断属性isEarth
          return x.isEarth;
        }
      });
    }

    this.baseLayerCount = 1; // viewer 对象中底图图层数，默认为1
    if (this.baseLayers.length) {
      this.baseLayerIndex = 0;
      this.addBaseLayer();
    }

    // 监听地图容器的大小，改变时触发地图的更新
    if ("undefined" !== typeof ResizeObserver) {
      let element = this.container;
      if (element) {
        const resizeObserver = new ResizeObserver(() => {
          this.resize();
        });

        resizeObserver.observe(element);
      }
    }

    // 性能调试组件
    if (
      process.env.NODE_ENV === "development" &&
      process.env.VUE_APP_DEBUG == "true"
    ) {
      this.extend(viewerCesiumInspectorMixin);
      this.extend(viewerCesium3DTilesInspectorMixin);
    }

    // 三方
    // 导航控件
    CesiumNavigation(this, {});

    // 自定义
    // 经纬度标签
    new PositionLabel(this.container, this);

    // 如加载了地形，调整角度
    if (options.terrain) {
      setCameraHeightAndPitch(this.camera, 7000, -10, defaultRectangle);
    }

    // 加载模型
    if (options.tileset) {
      load3dTileset(this, options.tileset);
    }
  }

  //#region 底图操作

  /**
   * 获取底图图层json数据
   * @returns layers
   */
  getBaseLayers() {
    return this.baseLayers;
  }

  /**
   * 设置底图图层数据
   * @param {Array} layers
   * @param {number} index
   */
  setBaseLayers(layers, index) {
    this.baseLayers = layers;
    this.baseLayerIndex = index || 0;
    // 更新图层
    this.addBaseLayer();
  }

  /**
   * 切换底图
   * @param {number} index
   */
  changeBaseLayer(index) {
    this.baseLayerIndex = index || 0;
    // 更新图层
    this.addBaseLayer();
  }

  /**
   * 以LayerGroup的方式添加底图，
   * @param {Array<Array<Object> | Object>} options
   * @param {number} [index] = 0 图层集合索引值
   */
  async addBaseLayer(options, index) {
    this.clearBaseLayer();

    this.baseLayers = options ? options : this.baseLayers;
    this.baseLayerIndex = index || this.baseLayerIndex;
    let len = this.baseLayers.length;
    if (len === 0 || this.baseLayerIndex > len) {
      return;
    }

    const item = this.baseLayers[this.baseLayerIndex];

    let data = Array.isArray(item) ? item : item.data;
    if (Array.isArray(data)) {
      this.baseLayerCount = data.length;
      for (let i = 0; i < data.length; i++) {
        let layer = await this.getImageLayer_(data[i]);
        if (layer) {
          this.imageryLayers.add(layer, i);
        }
      }
    }
  }

  clearBaseLayer() {
    for (let i = this.baseLayerCount - 1; i >= 0; i--) {
      const imageLayer = this.imageryLayers.get(i);
      this.imageryLayers.remove(imageLayer);
    }
    this.baseLayerCount = 0;
  }
  //#endregion 底图操作

  //#region 地图服务类型的图层加载

  /**
   * 添加图层
   * @param {*} param
   */
  async addImageLayer(param, isFit) {
    let layer = await this.getImageLayer_(param);
    if (layer) {
      this.imageryLayers.add(layer);

      if (isFit) {
        let rectangle = layer.rectangle;
        this.camera.flyTo({ destination: rectangle });
      }
    }
    return layer;
  }

  /**
   * 生成地图服务图层
   * @param {*} param
   */
  async getImageLayer_(param) {
    let layer = await getImageLayer(param);
    return layer;
  }

  clearImageryLayer() {
    this.imageryLayers.removeAll();
  }

  // 清除指定图层
  removeImageryLayer(layer) {
    this.imageryLayers.remove(layer);
  }

  //#endregion 地图服务类型的图层加载
}

export default MyViewer;

function calcRectangleByZoom(container, center, zoom) {
  let element = container.offsetWidth
    ? container
    : container.parentNode.offsetWidth
    ? container.parentNode
    : container.parentNode.parentNode;
  let width = element.offsetWidth;
  let height = element.offsetHeight;
  if (width == 0 || height == 0) {
    return null;
  }
  let resolution_0 = 1.40625;
  let resolution = resolution_0 / Math.pow(2, zoom);
  let dx = (width / 2) * resolution;
  let dy = (height / 2) * resolution;
  let east = center[0] + dx;
  let west = center[0] - dx;
  let north = center[1] + dy;
  let south = center[1] - dy;
  return Rectangle.fromDegrees(west, south, east, north);
}
