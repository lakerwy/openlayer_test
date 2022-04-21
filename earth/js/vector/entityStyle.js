import BillboardGraphics from "cesium/Source/DataSources/BillboardGraphics";
import HorizontalOrigin from "cesium/Source/Scene/HorizontalOrigin";
import VerticalOrigin from "cesium/Source/Scene/VerticalOrigin";
import LabelGraphics from "cesium/Source/DataSources/LabelGraphics";
import PointGraphics from "cesium/Source/DataSources/PointGraphics";
import Color from "cesium/Source/Core/Color";
import Cartesian2 from "cesium/Source/Core/Cartesian2";

import Resource from "cesium/Source/Core/Resource";

import { getEntityPropertiesAndPosition } from "./entity";

/**
 * @typedef {Object} Fill
 * @property {String | Array<red,green,blue,alpha>} color
 */

/**
 * @typedef {Object} Stroke
 * @property {String | Array<red,green,blue,alpha>} color
 * @property {Number} width
 */

/**
 * @typedef {Object} Icon
 * @property {String} src 图片地址
 * @property {Number} [scale] = 1 图片缩放比
 */

/**
 * @typedef {Object} Text
 * @property {String} text 文本内容
 * @property {String} [font] = "normal 14px 微软雅黑" Font style as CSS
 * @property {Fill} fill
 * @property {Fill} backgroundFill
 * @property {Stroke} backgroundStroke
 * @property {Array.<number>} [padding] = [7,5]
 * @property {Number} [offsetX] = 0
 * @property {Number} [offsetY] = 0
 * @property {Number} [scale] = 1
 */

/**
 * @typedef {Object} Circle
 * @property {Number} radius
 * @property {Fill} fill
 * @property {Stroke} stroke
 */

/**
 * @typedef {Object} Style
 * @property {Icon} [icon]
 * @property {Circle} [circle]
 * @property {Fill} [fill]
 * @property {Stroke} [stroke]
 * @property {Text} [text]
 */

/**
 * @param  {Style} options
 */
export function getEntityStyle(entity, options) {
  if (!options) {
    return;
  }

  if (options.icon) {
    let billboard = new BillboardGraphics({
      image: options.icon.src,
      scale: options.icon.scale || 1,
      heightReference: 1, // HeightReference.CLAMP_TO_GROUND
      horizontalOrigin: HorizontalOrigin.CENTER,
      verticalOrigin: VerticalOrigin.CENTER,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    });
    entity.billboard = billboard;
  }

  if (options.circle) {
    let point = new PointGraphics({
      pixelSize: options.circle.radius,
      color: options.circle.fill
        ? Color.fromCssColorString(options.circle.fill.color)
        : null,
      outlineColor: options.circle.stroke
        ? Color.fromCssColorString(options.circle.stroke.color)
        : null,
      outlineWidth: options.circle.stroke ? options.circle.stroke.width : null,
      heightReference: 1 // HeightReference.CLAMP_TO_GROUND
    });
    entity.point = point;
  }

  if (options.text) {
    let label = new LabelGraphics({
      text: options.text.text,
      font: options.text.font || "normal 14px 微软雅黑",
      scale: options.text.scale || 1,
      showBackground: options.text.backgroundFill ? true : false,
      backgroundColor: options.text.backgroundFill
        ? Color.fromCssColorString(options.text.backgroundFill.color)
        : null,
      backgroundPadding: options.text.padding
        ? new Cartesian2(options.text.padding[0], options.text.padding[1])
        : null,
      fillColor: options.text.fill
        ? Color.fromCssColorString(options.text.fill.color)
        : null,
      pixelOffset: new Cartesian2(
        options.text.offsetX ? options.text.offsetX : 0,
        options.text.offsetY ? options.text.offsetY : 0
      ),
      outlineColor: options.text.backgroundStroke
        ? Color.fromCssColorString(options.text.backgroundStroke.color)
        : null,
      outlineWidth: options.text.backgroundStroke
        ? options.text.backgroundStroke.width
        : null,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      horizontalOrigin: HorizontalOrigin.CENTER,
      verticalOrigin: VerticalOrigin.CENTER,
      heightReference: 1
    });
    entity.label = label;
  }

  if (options.stroke && entity.polyline) {
    entity.polyline.width = options.stroke.width || 1.0;
    entity.polyline.material = options.stroke.color
      ? Color.fromCssColorString(options.stroke.color)
      : null;
  }

  if (options.stroke && entity.polygon) {
    entity.polygon.outline = true;
    entity.polygon.outlineWidth = options.stroke.width || 1.0;
    entity.polygon.outlineColor = options.stroke.color
      ? Color.fromCssColorString(options.stroke.color)
      : null;
  }

  if (options.fill && entity.polygon) {
    entity.polygon.fill = true;
    entity.polygon.material = options.fill.color
      ? Color.fromCssColorString(options.fill.color)
      : null;
  }

  // console.log(entity);
}

/**
 * 根据对象、数组或函数获取样式
 * eg:
 * function = (entity, properties) => {
 *   let name = properties.name.toString();
 *   return {
 *     text : {
 *        text:name
 *     },
 *   }
 * }
 * @param {Style| Array<Style> | function} options
 */
export function setEntityStyles(entity, options) {
  if (typeof options === "function") {
    let result = getEntityPropertiesAndPosition(entity);
    let properties = result ? result.properties : null;
    let styles = options(entity, properties);
    return setEntityStyles_(entity, styles);
  }
  return setEntityStyles_(entity, options);
}

/**
 *
 *
 * @export
 * @param {Array<Style>} options
 */
function setEntityStyles_(entity, options) {
  if (Array.isArray(options)) {
    // 数组合并
    let obj = null;
    options.forEach(x => {
      obj = { ...obj, ...x };
    });
    return getEntityStyle(entity, obj);
  }

  return getEntityStyle(entity, options);
}

let styleCache = new Map();

/**
 * 聚合图层样式
 * eg:
 * function = (entity, properties,len) => {
 *   let img = len > 10 ? image1 : image2;
 *   return {
 *     icon : {
 *        src:img
 *     },
 *   }
 * }
 * @param {Style| Array<Style> | function} options
 * @returns Function()
 */
export function clusterStylesListenerEvent(options) {
  let fn = (clusteredEntities, cluster) => {};
  if (typeof options === "function") {
    fn = async (clusteredEntities, cluster) => {
      let style = options(clusteredEntities.length);
      let image = styleCache.get(clusteredEntities.length);
      if (!image) {
        image = await getCanvasByImageAndText(style);
        styleCache.set(clusteredEntities.length, image);
      }

      if (image) {
        cluster.billboard.show = true;
        cluster.billboard.image = image; // style.icon.src;
        cluster.billboard.verticalOrigin = VerticalOrigin.CENTER;

        cluster.label.show = false;
      }
    };
  } else {
    fn = (clusteredEntities, cluster) => {
      if (options.icon) {
        cluster.billboard.show = true;
        cluster.billboard.image = options.icon.src;
        cluster.billboard.verticalOrigin = VerticalOrigin.CENTER;

        cluster.label.show = false;
      }
    };
  }
  return fn;
}

export async function getCanvasByImageAndText(style) {
  if (!style.icon) {
    return;
  }

  if (!style.text || !style.text.text) {
    return style.icon.src;
  }

  let img = await Resource.fetchImage(style.icon.src);
  let canvas = document.createElement("CANVAS");
  canvas.setAttribute("width", img.width);
  canvas.setAttribute("height", img.height);

  let ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  ctx.fillStyle = style.text.color || "#fff";
  ctx.font = style.text.font || "normal 20px 微软雅黑";
  ctx.textBaseline = "middle"; //设置文本的垂直对齐方式
  ctx.textAlign = "center"; //设置文本的水平对齐方式
  ctx.fillText(style.text.text, img.width / 2, img.height / 2);

  return canvas.toDataURL();
}
