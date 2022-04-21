import Cartesian2 from "cesium/Source/Core/Cartesian2";
import Cartographic from "cesium/Source/Core/Cartographic";
import CesiumMath from "cesium/Source/Core/Math";

/**
 * 根据像素坐标获取经纬度坐标
 * @param {import("cesium/Source/Widgets/Viewer/Viewer")} viewer
 * @param {Number} x x坐标
 * @param {Number} y y坐标
 * @returns {[lon,lat,height]}
 */
export function getCoordinatesByPixel(viewer, x, y) {
  if (!viewer || !x || !y) {
    return;
  }
  let scene = viewer.scene;
  let windowPostion = new Cartesian2(x, y);
  let cartesian = scene.globe.pick(
    viewer.camera.getPickRay(windowPostion),
    scene
  );

  if (!cartesian) {
    return;
  }
  let cartographic = Cartographic.fromCartesian(cartesian);
  let lon = CesiumMath.toDegrees(cartographic.longitude);
  let lat = CesiumMath.toDegrees(cartographic.latitude);
  let height = viewer.camera.positionCartographic.height;
  return [lon, lat, height];
}
