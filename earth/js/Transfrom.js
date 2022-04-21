import Cartesian3 from "cesium/Source/Core/Cartesian3";
import Cartographic from "cesium/Source/Core/Cartographic";
import CesiumMath from "cesium/Source/Core/Math";

export function transformCartesian3ToCartographic(cartesian3) {
  let cartographic = Cartographic.fromCartesian(cartesian3);
  let latitude = CesiumMath.toDegrees(cartographic.latitude);
  let longitude = CesiumMath.toDegrees(cartographic.longitude);
  let height = cartographic.height;
  return { latitude, longitude, height };
}

export function transformCartographicToCartesian3(lon, lat, height) {
  return Cartesian3.fromDegrees(lon, lat, height);
}
