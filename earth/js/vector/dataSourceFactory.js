import MyGeoJsonDataSource from "./geoJsonDataSource";

class MyDataSourceFactory {
  constructor(option) {
    this.option = option;
  }

  create(type, option) {
    this.option = option || this.option;

    switch (type) {
      case "json":
        return new MyGeoJsonDataSource(this.option);
      default:
        return;
    }
  }
}

export default MyDataSourceFactory;
