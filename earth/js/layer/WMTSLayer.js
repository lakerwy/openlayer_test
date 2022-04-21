import WebMapTileServiceImageryProvider from "cesium/Source/Scene/WebMapTileServiceImageryProvider";
import WebMercatorTilingScheme from "cesium/Source/Core/WebMercatorTilingScheme";
import GeographicTilingScheme from "cesium/Source/Core/GeographicTilingScheme";
import { expandUrl, appendParams } from "./urlFunction";
import xml2js from "xml2js";
import Rectangle from "cesium/Source/Core/Rectangle";

class MyWmtsImageryProvider extends WebMapTileServiceImageryProvider {
  /**
   *
   * @param {Object} options
   * @param { String } options.url
   * @param { String } options.layers
   * @param { String } [options.projection] = "EPSG:3857"
   * @param { String } [options.style] = ""
   * @param { String } [options.format] = "image/png"
   * @param { String } options.matrixSet
   * @param { Array } [options.tileMatrixLabels] = [1,2,3,……,18]
   * @param { import("cesium/Source/Core/Rectangle")} [options.rectangle]
   */
  constructor(options) {
    options = { ...options };

    let url = options.url;
    let { templateUrl, subdomains } = expandUrl(url);

    let layer = options.layers;

    let style = options.style || "";

    let format = options.format || "image/png";

    let tileMatrixSetID = options.matrixSet;

    let tileMatrixLabels = options.tileMatrixLabels;

    let projection = options.projection || "EPSG:3857";

    let tilingScheme =
      projection === "EPSG:3857"
        ? new WebMercatorTilingScheme()
        : new GeographicTilingScheme();

    let rectangle = options.rectangle;

    let params = {
      url: templateUrl,
      layer: layer,
      format: format,
      style: style,
      tileMatrixSetID: tileMatrixSetID,
      tileMatrixLabels: tileMatrixLabels,
      tilingScheme: tilingScheme,
      rectangle: rectangle,
      enablePickFeatures: false,
      subdomains: subdomains
    };

    super(params);
  }
}

export default MyWmtsImageryProvider;

export async function getLayerInfo(options) {
  options = { ...options };

  let url = options.url;

  let layers = options.layers;

  let metaXmlUrl = appendParams(url, {
    Service: "WMTS",
    request: "GetCapabilities"
  });

  try {
    const response = await fetch(metaXmlUrl);
    let text = await response.text();
    let parser = new xml2js.Parser();
    let data = await parser.parseStringPromise(text);

    let rectangle = null;

    if (!data.Capabilities) {
      return;
    }

    let layerList = data.Capabilities.Contents[0].Layer;
    layerList.forEach(l => {
      if (l["ows:Identifier"][0] === layers) {
        let box = l["ows:WGS84BoundingBox"][0];
        let [xmin, ymin] = box["ows:LowerCorner"][0].split(" ").map(parseFloat);
        let [xmax, ymax] = box["ows:UpperCorner"][0].split(" ").map(parseFloat);
        rectangle = new Rectangle.fromDegrees(xmin, ymin, xmax, ymax);
      }
    });

    return { rectangle };
  } catch (error) {
    return null;
  }
}
