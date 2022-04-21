import GeoJsonDataSource from "cesium/Source/DataSources/GeoJsonDataSource";

/**
 * geojson 数据源类型
 */
export const GEOJSON_SOURCE_TYPE = {
  List: "1",
  Feature: "2",
  FeatureCollect: "3",
  Url: "4"
};

class MyGeoJsonDataSource extends GeoJsonDataSource {
  constructor(options) {
    super(options);
  }

  /**
   *
   * @param {Object} param
   * @param {string} param.type - "1" | "2" | "3" | "4" 参考 GEOJSON_SOURCE_TYPE
   * @param {Object} param.data -  数据，需配合type的值
   * @param {string} param.geometryKey = "type" -  几何类型对应的key值
   * @param  {string} [param.idKey] = "id" - 要素id的键值
   */
  addSourceData({ type, data, geometryKey, idKey }) {
    if (!type || !data) {
      return;
    }

    switch (type) {
      case GEOJSON_SOURCE_TYPE.List:
        this.addByList(data, geometryKey, idKey);
        break;
      case GEOJSON_SOURCE_TYPE.Feature:
        this.addByFeature(data);
        break;
      case GEOJSON_SOURCE_TYPE.FeatureCollect:
        this.addByFeatureCollection(data);
        break;
      case GEOJSON_SOURCE_TYPE.Url:
        this.setSourceByUrl(data);
        break;
      default:
        break;
    }
  }

  /**
   * 通过geojson url设置数据源,会清空原有数据
   * @param {string} url
   */
  setSourceByUrl(url) {
    this.addByFeatureCollection(url);
  }

  /**
   * geojson 标准的要素集对象
   * @param {Object} object
   * {
   *   type: "FeatureCollection",
   *   features: [{
   *      type: "Feature",
   *      geometry: {
   *      type: "Point",
   *      coordinates: [0,0]
   *    },
   *    properties: {}
   *   }]
   * }
   */
  async addByFeatureCollection(object) {
    let source = await GeoJsonDataSource.load(object);
    source.entities.values.forEach(v => {
      this.entities.add(v);
    })
  }

  /**
   * geojson 标准的要素对象
   * @param {Object} object
   * {
   *   type: "Feature",
   *   geometry: {
   *     type: "Point",
   *     coordinates: [0,0]
   *   },
   *  properties: {}
   * }
   */
  addByFeature(object) {
    let FeatureCollection = {
      type: "FeatureCollection",
      features: [object],
    };
    this.addByFeatureCollection(FeatureCollection);
  }

  /**
   * 将包含type 和 coordinates属性的数组转化为FeatureCollection，添家到source中
   * @param  {Array<Object>} list
   * @param  {string} key="type" - 几何类型的键值
   * @param  {string} [idKey] ="id" - 要素id的键值
   */
  addByList(list, key = "type", idKey = "id") {
    if (!Array.isArray(list)) {
      return;
    }

    let FeatureCollection = {
      type: "FeatureCollection",
      features: []
    };
    let features = [];
    list.forEach(x => {
      if (x[key] && x.coordinates) {
        let prop = { ...x };
        delete prop.geometry;
        let feature = {
          type: "Feature",
          geometry: {
            type: x[key],
            coordinates: x.coordinates
          },
          properties: prop,
          id: x[idKey]
        };
        features.push(feature);
      }
    });
    FeatureCollection.features = features;
    this.addByFeatureCollection(FeatureCollection);
  }
}

export default MyGeoJsonDataSource;
