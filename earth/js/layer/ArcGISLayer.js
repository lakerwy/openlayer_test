import ArcGisMapServerImageryProvider from "cesium/Source/Scene/ArcGisMapServerImageryProvider";
import { appendParams } from "./urlFunction";
import Rectangle from "cesium/Source/Core/Rectangle";
import proj4 from "proj4";

class MyArcGISImageryProvider extends ArcGisMapServerImageryProvider {
  constructor(options) {
    options = { ...options };

    let url = options.url;

    let layers = options.layers;

    let rectangle = options.rectangle;

    let params = {
      url: url,
      layers: layers,
      rectangle: rectangle,
      enablePickFeatures: false
    };

    super(params);
  }
}

export default MyArcGISImageryProvider;

export async function getLayerInfo(url) {
  const jsonUrl = appendParams(url, {
    f: "pjson"
  });

  try {
    const response = await fetch(jsonUrl);
    const data = await response.json();
    if (!data || data.error) {
      return null;
    }

    // 判断是否是arcgis 返回的数据结构
    if (!data.spatialReference) {
      throw new Error(JSON.stringify(data));
      // return;
    }

    let projection = null;
    if (data.spatialReference.latestWkid) {
      projection = `EPSG:${data.spatialReference.latestWkid ||
        data.spatialReference.wkid}`;
    } else if (data.spatialReference.wkt) {
      projection = data.spatialReference.wkt;
    }

    // 坐标转换
    let [xmin, ymin] = proj4(projection, "EPSG:4326", [
      data.fullExtent.xmin,
      data.fullExtent.ymin
    ]);
    let [xmax, ymax] = proj4(projection, "EPSG:4326", [
      data.fullExtent.xmax,
      data.fullExtent.ymax
    ]);

    let rectangle = new Rectangle.fromDegrees(xmin, ymin, xmax, ymax);

    return { rectangle };
  } catch (error) {
    return null;
  }
}
