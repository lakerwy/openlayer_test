<template>
  <div>
    <MyEarth ref="earthCom" style="width: 1500px; height: 800px"></MyEarth>
    <div>
      <button @click="addStamenLayer('toner')">toner</button>
      <button @click="addStamenLayer('toner-hybrid')">toner-hybrid</button>
      <button @click="addStamenLayer('toner-labels')">toner-labels</button>
      <button @click="addStamenLayer('toner-lines')">toner-lines</button>
      <button @click="addStamenLayer('toner-background')">
        toner-background
      </button>
      <button @click="addStamenLayer('toner-lite')">toner-background</button>
    </div>
    <div>
      <button @click="addStamenLayer('terrain')">terrain</button>
      <button @click="addStamenLayer('terrain-labels')">terrain-labels</button>
      <button @click="addStamenLayer('terrain-lines')">terrain-lines</button>
      <button @click="addStamenLayer('terrain-background')">
        terrain-background
      </button>
    </div>
    <div>
      <button @click="addStamenLayer('watercolor')">watercolor</button>
    </div>
  </div>
</template>

<script>
import MyEarth from "@earth/components/my-earth/MyEarth";

export default {
  components: {
    MyEarth,
  },
  mounted() {
  },
  methods: {
    async addStamenLayer(value) {
      let viewer = this.$refs.earthCom.viewer;
      viewer.clearImageryLayer();
      let params = {
        type: "stamen",
        layers: value,
      };
      let layer = await viewer.addImageLayer(params, true);
      console.log(layer);
    },
  },
};
</script>