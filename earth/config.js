const config = window.global;

const view = config ? config.view : null;
const layers = config ? config.layers : null;
const terrain = config ? config.terrain : null;
const tileset = config ? config.tileset : null;

// 视图配置
export const CONFIG_VIEW = {
  ...view
};

// 底图配置
export const CONFIG_LAYERS = layers;
// 地形配置
export const CONFIG_TERRAIN = terrain;
// 3dtileset 模型配置
export const CONFIG_TILESET = tileset;

import buildModuleUrl from "cesium/Source/Core/buildModuleUrl";
buildModuleUrl.setBaseUrl("Cesium/");
