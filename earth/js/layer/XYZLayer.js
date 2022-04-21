import UrlTemplateImageryProvider from "cesium/Source/Scene/UrlTemplateImageryProvider";
import WebMercatorTilingScheme from "cesium/Source/Core/WebMercatorTilingScheme";
import GeographicTilingScheme from "cesium/Source/Core/GeographicTilingScheme";
import { expandUrl } from "./urlFunction";

class MyXYZImageryProvider extends UrlTemplateImageryProvider {
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

export default MyXYZImageryProvider;
