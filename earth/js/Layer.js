import ImageryLayer from "cesium/Source/Scene/ImageryLayer";
import MyXYZImageryProvider from "./layer/XYZLayer";
import MyArcGISImageryProvider, {
  getLayerInfo as getArcGISLayerInfo
} from "./layer/ArcGISLayer";
import MyWmtsImageryProvider, {
  getLayerInfo as getWMTSLayerInfo
} from "./layer/WMTSLayer";
import MyWmsImageryProvider, {
  getLayerInfo as getWMSLayerInfo
} from "./layer/WMSLayer";
import Rectangle from "cesium/Source/Core/Rectangle";
import { getStamenImageryProvider  } from "./layer/OSMLayer";

/**
 * 生成栅格图层
 * @param {Object} params
 * @param {string} params.type - "arcgis" | "arcgisserver" | "geoserver" | "xyz" | "wms" | "stamen"
 * @param {string} params.url - 地图服务
 * @param {...*} params.options - 其他参数，不同的类型对应不同的参数
 * @return layer
 */
export async function getImageLayer({ type, url, ...options }) {
  let imageryProvider = null;

  if (!type) {
    return;
  }

  let rectangle = null;

  if (Array.isArray(options.extent) && options.extent.length > 4) {
    let xmin = options.extent[0];
    let ymin = options.extent[1];
    let xmax = options.extent[2];
    let ymax = options.extent[3];
    rectangle = new Rectangle.fromDegrees(xmin, ymin, xmax, ymax);
  }

  type = type.toLowerCase();

  if (type === "stamen") {
    imageryProvider = getStamenImageryProvider(options);
    let layer = new ImageryLayer(imageryProvider, { rectangle });
    return layer;
  }

  if (!url) {
    return;
  }

  options = { url, ...options };

  let info = null;
  switch (type) {
    case "arcgis":
    case "arcgisserver":
      info = await getArcGISLayerInfo(options.url);
      rectangle = info ? info.rectangle : null;
      imageryProvider = new MyArcGISImageryProvider(options);
      break;
    case "geoserver":
      if (options.matrixSet) {
        info = await getWMTSLayerInfo(options);
        rectangle = info ? info.rectangle : null;
        imageryProvider = new MyWmtsImageryProvider(options);
      } else {
        info = await getWMSLayerInfo(options);
        rectangle = info ? info.rectangle : null;
        imageryProvider = new MyWmsImageryProvider(options);
      }
      break;
    case "xyz":
      imageryProvider = new MyXYZImageryProvider(options);
      break;
    case "wms":
      info = await getWMSLayerInfo(options);
      rectangle = info ? info.rectangle : null;
      imageryProvider = new MyWmsImageryProvider(options);
      break;
    case "hgt":
      imageryProvider = new MyWmsImageryProvider(options);
      break;
    default:
      break;
  }
  let layer = new ImageryLayer(imageryProvider, { rectangle });
  return layer;
}
