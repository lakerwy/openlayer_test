import OpenStreetMapImageryProvider from "cesium/Source/Scene/OpenStreetMapImageryProvider";
import WebMercatorTilingScheme from "cesium/Source/Core/WebMercatorTilingScheme";
import GeographicTilingScheme from "cesium/Source/Core/GeographicTilingScheme";
import { expandUrl } from "./urlFunction";

class MyOSMImageryProvider extends OpenStreetMapImageryProvider {
  constructor(options) {
    options = { ...options };

    let url = options.url;

    let projection = options.projection || "EPSG:3857";

    let { templateUrl, subdomains } = expandUrl(url);

    let params = {
      url: templateUrl,
      subdomains: subdomains || null,
      tilingScheme:
        projection === "EPSG:3857"
          ? new WebMercatorTilingScheme()
          : new GeographicTilingScheme(),
      enablePickFeatures: false
    };

    super(params);
  }
}

export default MyOSMImageryProvider;

export function getStamenImageryProvider(options) {
  let stamenUrl = "https://stamen-tiles.a.ssl.fastly.net";
  let url = stamenUrl + "/" + (options.layers ? options.layers : "toner");
  return new MyOSMImageryProvider({ url });
}
