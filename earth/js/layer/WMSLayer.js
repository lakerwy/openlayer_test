import WebMapServiceImageryProvider from "cesium/Source/Scene/WebMapServiceImageryProvider";
import WebMercatorTilingScheme from "cesium/Source/Core/WebMercatorTilingScheme";
import GeographicTilingScheme from "cesium/Source/Core/GeographicTilingScheme";
import { expandUrl, appendParams } from "./urlFunction";
import xml2js from "xml2js";
import Rectangle from "cesium/Source/Core/Rectangle";

class MyWmsImageryProvider extends WebMapServiceImageryProvider {
  /**
   *
   * @param {Object} options
   * @param { String } options.url
   * @param { String } options.layers
   * @param { String } [options.projection] = "EPSG:3857"
   * @param { Object } [options.restOption]
   * @param { String } [options.format] = "image/png"
   * @param { import("cesium/Source/Core/Rectangle")} [options.rectangle]
   */
  constructor(options) {
    options = { ...options };

    let url = options.url;
    let { templateUrl, subdomains } = expandUrl(url);

    let layers =
      options.layers || (options.restOption ? options.restOption.layers : null);

    let format = options.format || "image/png";

    let parameters = { ...options.restOption, format };

    let projection = options.projection || "EPSG:3857";

    let tilingScheme =
      projection === "EPSG:3857"
        ? new WebMercatorTilingScheme()
        : new GeographicTilingScheme();

    let rectangle = options.rectangle;

    let params = {
      url: templateUrl,
      layers: layers,
      srs: projection,
      parameters: parameters,
      tilingScheme: tilingScheme,
      rectangle: rectangle,
      enablePickFeatures: false,
      subdomains: subdomains
    };

    super(params);
  }
}

export default MyWmsImageryProvider;

export async function getLayerInfo(options) {
  options = { ...options };

  let url = options.url;

  let layers = options.layers;

  let metaXmlUrl = appendParams(url, {
    Service: "WMS",
    request: "GetCapabilities"
  });

  try {
    const response = await fetch(metaXmlUrl);
    let text = await response.text();
    let parser = new xml2js.Parser();
    let data = await parser.parseStringPromise(text);

    let rectangle = null;

    if (!data.WMS_Capabilities) {
      return;
    }

    let layerList = data.WMS_Capabilities.Capability[0].Layer[0].Layer;
    layerList.forEach(l => {
      if (l["Name"][0] === layers) {
        let box = l["EX_GeographicBoundingBox"][0];
        let xmin = parseFloat(box["westBoundLongitude"][0]);
        let ymin = parseFloat(box["southBoundLatitude"][0]);
        let xmax = parseFloat(box["eastBoundLongitude"][0]);
        let ymax = parseFloat(box["northBoundLatitude"][0]);
        rectangle = new Rectangle.fromDegrees(xmin, ymin, xmax, ymax);
      }
    });

    return { rectangle };
  } catch (error) {
    return null;
  }
}
