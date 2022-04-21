<template>
  <div>
    <MyEarth ref="earthCom" style="width: 1500px; height: 800px"></MyEarth>
  </div>
</template>

<script>
import MyEarth from "@earth/components/my-earth/MyEarth";

export default {
  components: {
    MyEarth,
  },
  mounted() {
    this.addGeoServerWMTSServer();
    this.addGeoServerWMSServer();
  },
  methods: {
    async addGeoServerWMTSServer() {
      let viewer = this.$refs.earthCom.viewer;
      let params = {
        type: "geoserver",
        url: "geoserver/gwc/service/wmts",
        layers: "topp:states",
        projection: "EPSG:4326",
        matrixSet: "WGS84",
      };
      let layer = await viewer.addImageLayer(params, true);
      console.log(layer);
    },
    async addGeoServerWMSServer() {
      let viewer = this.$refs.earthCom.viewer;
      let params = {
        type: "geoserver",
        url: "geoserver/wms",
        layers: "tiger-ny",
        projection: "EPSG:4326",
      };
      let layer = await viewer.addImageLayer(params, true);
      console.log(layer);
    },
  },
};
</script>