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
    this.addArcGISServer();
  },
  methods: {
    async addArcGISServer() {
      let viewer = this.$refs.earthCom.viewer;
      let params = {
        type: "arcgis",
        url: "http://192.168.99.56:6080/arcgis/rest/services/SNJ/river/MapServer",
      };
      let layer = await viewer.addImageLayer(params,true);
      console.log(layer);
    },
  },
};
</script>