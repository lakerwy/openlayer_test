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
    this.addXYZServer();
  },
  methods: {
    async addXYZServer() {
      let viewer = this.$refs.earthCom.viewer;
      let params = {
        type: "xyz",
        url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        projection: "EPSG:3857", // 默认为墨卡托，只支持墨卡托和WGS84
      };
      let layer = await viewer.addImageLayer(params, true);
      console.log(layer);
    },
  },
};
</script>