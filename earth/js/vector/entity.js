import Ellipsoid from "cesium/Source/Core/Ellipsoid";

/**
 * 根据entity 返回其position和properties
 * @param {import("cesium/Source/DataSources/Entity")} entity
 * @returns { position, properties}
 */
export function getEntityPropertiesAndPosition(entity) {
  if (!entity) {
    return;
  }

  let position = entity.position // 点
    ? entity.position._value
    : entity.polyline // 线
    ? entity.polyline.positions
    : null;
  let properties = entity.properties;
  let info = null;
  if (properties) {
    info = {};
    properties.propertyNames.forEach(key => {
      info[key] = properties[key] ? properties[key]._value : undefined;
    });
  }
  return { position, properties: info };
}
