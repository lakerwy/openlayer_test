/**
 * 带旋转的圆锥实体
 */

import Entity from "cesium/Source/DataSources/Entity";
import ModelGraphics from "cesium/Source/DataSources/ModelGraphics";
import CesiumMath from "cesium/Source/Core/Math";
import HeadingPitchRoll from "cesium/Source/Core/HeadingPitchRoll";
import Transforms from "cesium/Source/Core/Transforms";
import CallbackProperty from "cesium/Source/DataSources/CallbackProperty";
import Cartesian3 from "cesium/Source/Core/Cartesian3";

/**
 *
 * @param {Object} param
 * @param {Number} param.lon
 * @param {Number} param.lat
 * @param {Number} param.height
 * @param {String} param.url model的url
 * @param {Boolean} param.isRotate 是否垂线自旋转
 * @param {Object} param.entityOptions
 * @param {Object} param.modelOptions
 * @returns entity
 */
export function getModelEntity({
  lon,
  lat,
  height,
  url,
  isRotate,
  entityOptions,
  modelOptions
}) {
  entityOptions = entityOptions || {};
  modelOptions = modelOptions || {};

  let heading = 0; //偏航角（Y轴）
  let pitch = 0; //俯仰角（X轴）
  let roll = 0; //翻滚角（Z轴）

  // 椎体位置
  let position = Cartesian3.fromDegrees(lon, lat, height);

  isRotate = isRotate !== undefined ? isRotate : true;

  let entity = new Entity({
    ...entityOptions,
    position: position,
    //通过CallbackProperty延迟回调函数一直调用封装的偏航角方法
    //false，返回的值如果改变则一直调用自身，diaoyong()返回的值是orientation，而orientation会根据每次heading 的不同而发生改变
    orientation: isRotate
      ? new CallbackProperty(() => {
          heading = heading + CesiumMath.toRadians(10);
          var hpr = new HeadingPitchRoll(heading, pitch, roll);
          var orientation = Transforms.headingPitchRollQuaternion(
            position,
            hpr
          );
          return orientation;
        }, false)
      : undefined,
    model: new ModelGraphics({
      show: true,
      uri: url,
      ...modelOptions
    })
  });
  return entity;
}
