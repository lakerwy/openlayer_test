/**
 * 雷达实体
 */

import Entity from "cesium/Source/DataSources/Entity";
import Cartesian3 from "cesium/Source/Core/Cartesian3";
import EllipseGraphics from "cesium/Source/DataSources/EllipseGraphics";
import Rectangle from "cesium/Source/Core/Rectangle";
import ImageMaterialProperty from "cesium/Source/DataSources/ImageMaterialProperty";
import CesiumMath from "cesium/Source/Core/Math";
import CallbackProperty from "cesium/Source/DataSources/CallbackProperty";
import Color from "cesium/Source/Core/Color";
import PointGraphics from "cesium/Source/DataSources/PointGraphics";
import PolylineGraphics from "cesium/Source/DataSources/PolylineGraphics";

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
export function getRadarEntity({
  lon,
  lat,
  radius = 30,
  height = 0,
  color = "rgba(255,0,0,1)",
  entityOptions
}) {
  entityOptions = entityOptions || {};

  let rotation = CesiumMath.toRadians(90);

  function getRotationValue() {
    rotation += 0.02;
    return rotation;
  }

  let rgba = Color.fromCssColorString(color);
  let r = Math.round(rgba.red * 255);
  let g = Math.round(rgba.green * 255);
  let b = Math.round(rgba.blue * 255);

  let entity = new Entity({
    ...entityOptions,
    position: Cartesian3.fromDegrees(lon, lat),
    ellipse: new EllipseGraphics({
      semiMajorAxis: radius,
      semiMinorAxis: radius,
      height: height,
      material: new ImageMaterialProperty({
        image: getRaderCanvas(r, g, b),
        transparent: true
      }),
      rotation: new CallbackProperty(getRotationValue, false),
      stRotation: new CallbackProperty(getRotationValue, false)
    })
  });
  return entity;
}

function getRaderCanvas(r, g, b) {
  let canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 300;
  let context = canvas.getContext("2d");
  let grd = context.createLinearGradient(175, 100, canvas.width, 150);
  grd.addColorStop(0, `rgba(${r},${g},${b},0)`);
  grd.addColorStop(1, `rgba(${r},${g},${b},1)`);
  context.fillStyle = grd;
  context.beginPath();
  context.moveTo(150, 150);
  context.arc(150, 150, 150, (-90 / 180) * Math.PI, (0 / 180) * Math.PI);
  context.fill();

  context.strokeStyle = `rgba(${r},${g},${b},1)`;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(300, 150);
  context.arc(150, 150, 150, 0, 2 * Math.PI);
  context.stroke();

  return canvas;
}
