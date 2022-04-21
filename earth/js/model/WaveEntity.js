/**
 * 波浪圆实体
 */

import Entity from "cesium/Source/DataSources/Entity";
import Cartesian3 from "cesium/Source/Core/Cartesian3";
import EllipseGraphics from "cesium/Source/DataSources/EllipseGraphics";
import Color from "cesium/Source/Core/Color";

import CircleWaveMaterialProperty from "./../MaterialProperty/CircleWaveMaterialProperty";

/**
 *
 * @param {Object} param
 * @param {Number} param.lon
 * @param {Number} param.lat
 * @param {Number} [param.radius] = 30
 * @param {Number} [param.height] = 0
 * @param {Object} [param.entityOptions]
 * @returns entity
 */
export function getWaveEntity({
  lon,
  lat,
  radius = 30,
  height = 0,
  count = 3,
  color = "rgba(255,0,0,1)",
  entityOptions
}) {
  entityOptions = entityOptions || {};

  let entity = new Entity({
    ...entityOptions,
    position: Cartesian3.fromDegrees(lon, lat),
    ellipse: new EllipseGraphics({
      semiMinorAxis: radius,
      semiMajorAxis: radius,
      height: height,
      material: new CircleWaveMaterialProperty({
        duration: 2e3,
        gradient: 0.8,
        color: Color.fromCssColorString(color),
        count: count
      })
    })
  });
  return entity;
}
