import * as Cesium from "cesium";

import PolylineTrailMaterial from "../MaterialProperty/PolylineTrailMaterial";

export function addFlyLine(
  entities,
  start,
  end,
  color = "rgba(255,249,0,0.5)"
) {
  let points = generateCurve(start, end);

  let lineEntity = new Cesium.Entity({
    description: "飞行背景线",
    polyline: new Cesium.PolylineGraphics({
      width: 3,
      positions: points,
      // material: Color.RED
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.fromCssColorString(color)
      })
    })
  });

  let animateLineEntity = new Cesium.Entity({
    description: "飞行尾迹线",
    polyline: {
      width: 5,
      positions: points,
      material: new PolylineTrailMaterial()
      // 尾迹线材质
    }
  });
  entities.add(lineEntity);
  entities.add(animateLineEntity);

  return lineEntity;
}

/**
 * 生成流动曲线
 * @param startPoint 起点
 * @param endPoint 终点
 * @returns {Array}
 */
function generateCurve(start, end, height = 1000) {
  let startPoint = Cesium.Cartesian3.fromDegrees(start[0], start[1], height);
  let endPoint = Cesium.Cartesian3.fromDegrees(end[0], end[1], height);

  let addPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian);

  let midPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian);

  let midPointCartographic = Cesium.Cartographic.fromCartesian(
    midPointCartesian
  );
  midPointCartographic.height =
    Cesium.Cartesian3.distance(startPoint, endPoint) / 10 + height;

  let midPoint = new Cesium.Cartesian3();
  Cesium.Ellipsoid.WGS84.cartographicToCartesian(
    midPointCartographic,
    midPoint
  );

  let spline = new Cesium.CatmullRomSpline({
    times: [0.0, 0.5, 1.0],
    points: [startPoint, midPoint, endPoint]
  });

  let curvePoints = [];

  for (let i = 0, len = 300; i < len; i++) {
    curvePoints.push(spline.evaluate(i / len));
  }

  return curvePoints;
}
