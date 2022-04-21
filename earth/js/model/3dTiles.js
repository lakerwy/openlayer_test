import Cesium3DTileset from "cesium/Source/Scene/Cesium3DTileset";
import CesiumTransforms from "cesium/Source/Core/Transforms";
import Matrix4 from "cesium/Source/Core/Matrix4";
import Matrix3 from "cesium/Source/Core/Matrix3";
import CesiumMath from "cesium/Source/Core/Math";
import Cartesian3 from "cesium/Source/Core/Cartesian3";

import TilesetCollection from "./3dTilesManager";

class MyCesium3DTileset extends Cesium3DTileset {
  /**
   *
   * @param { Object } options
   * @param { string } options.url
   * @param { Number } [options.maximumMemoryUsage] = 512 单位为MB
   * @param { Boolean } [options.skipLevelOfDetail] = true 优化项
   * @param { Boolean } [options.skipLevels] = 1 优化项
   * @param { Matrix4 } [options.modelMatrix] 矩阵
   */
  constructor(options) {
    options = options || {};

    if (!options.url) {
      throw new Error("3dtiles 地址为空!");
    }

    options.skipLevelOfDetail = options.skipLevelOfDetail || true;

    let params = { ...options };
    super(params);
  }
}

export default MyCesium3DTileset;

/**
 *
 * @param {import("cesium/Source/Widgets/Viewer/Viewer")} viewer
 * @param {String | Object | Array} tilesetOpt
 * tilesetOpt 为 string 时, 代表tilesset的url; tilesetOpt 为 object 时，代表单个tilesset对象的参数，另可选择增加 tx, ty, tz, rx, ry, rz 六个参数，构建模型矩阵,tilesetOpt 为 Array 时，代表构建多个，依次加载
 * @param {Function(Array<tileset>)} callback tileset加载完后的回调函数
 * @returns
 */
export function load3dTileset(viewer, tilesetOpt, callback) {
  if (!viewer || !tilesetOpt) {
    return;
  }

  let params = [];
  if (tilesetOpt instanceof String) {
    params.push({
      url: tilesetOpt
    });
  } else if (tilesetOpt instanceof Object) {
    if (Array.isArray(tilesetOpt)) {
      params = tilesetOpt;
    } else {
      params.push(tilesetOpt);
    }
  }

  let tilesets = [];
  params.forEach((x, i) => {
    // 加载
    let tileset = new MyCesium3DTileset(x);
    viewer.scene.primitives.add(tileset);

    // 加入到全局3dTileset中
    if (x.id) {
      new TilesetCollection().setTileSet(x.id, tileset);
    }

    tileset.readyPromise.then(function() {
      // 位置校验
      if (x.tx && x.ty) {
        let param = {
          tx: x.tx,
          ty: x.ty,
          tz: x.tz || 0,
          rx: x.rx || 0,
          ry: x.ry || 0,
          rz: x.rz || 0
        };
        update3dtilesMaxtrix(tileset, param);
      }

      tilesets.push(tileset);

      //  最后一个
      if (i === params.length - 1) {
        //  viewer.zoomTo(tileset); // 定位
        if (callback) {
          callback(tilesets);
        }
      }
    });
  });
}

/**
 *
 * @param { Cesium3DTileset } tileset
 * @param { Object } params 检验参数
 * @param { Number } params.tx 经度（单位：十进制度）
 * @param { Number } params.ty 纬度（单位：十进制度）
 * @param { Number } params.tz 高程 （单位：米）
 * @param { Number } params.rx X轴（经度）方向旋转角度（单位：度）
 * @param { Number } params.ry Y轴（纬度）方向旋转角度（单位：度）
 * @param { Number } [params.rz] = 0 Z轴（高程）方向旋转角度（单位：度）
 */
function update3dtilesMaxtrix(tileset, params) {
  //旋转
  let mx = Matrix3.fromRotationX(CesiumMath.toRadians(params.rx || 0));
  let my = Matrix3.fromRotationY(CesiumMath.toRadians(params.ry || 0));
  let mz = Matrix3.fromRotationZ(CesiumMath.toRadians(params.rz || 0));
  let rotationX = Matrix4.fromRotationTranslation(mx);
  let rotationY = Matrix4.fromRotationTranslation(my);
  let rotationZ = Matrix4.fromRotationTranslation(mz || 0);
  //平移
  let position = Cartesian3.fromDegrees(params.tx, params.ty, params.tz);
  let m = CesiumTransforms.eastNorthUpToFixedFrame(position);
  //旋转、平移矩阵相乘
  Matrix4.multiply(m, rotationX, m);
  Matrix4.multiply(m, rotationY, m);
  Matrix4.multiply(m, rotationZ, m);
  //赋值给tileset
  tileset._root.transform = m;
}
