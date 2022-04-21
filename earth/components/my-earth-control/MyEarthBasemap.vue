<template>
  <MyMapPlacement
    class="my-map-basemap"
    placement="right-bottom"
    v-bind="$attrs"
  >
    <div
      v-for="(x, i) in list"
      :key="i"
      class="my-map-basemap-item"
      :class="{ active: localIndex === i }"
      :title="x.name"
      @click="change(i)"
    >
      <img :src="x.icon" />
      <span class="my-map-basemap-item-title">{{ x.name }}</span>
    </div>
  </MyMapPlacement>
</template>

<script>
import MyMapPlacement from "./Placement";
import defaultEarth from "@earth/assets/img/defaultEarth.png";

export default {
  name: "MyEarthBasemap",
  inject: ["myEarth"],
  components: { MyMapPlacement },
  /**
   * @member props
   * @property {number} [index] = 0 默认的图层索引
   */
  props: {
    index: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      localIndex: this.index,
      layers: null,
    };
  },
  computed: {
    list: function () {
      let layers = [];
      if (this.layers) {
        for (let i = 0; i < this.layers.length; i++) {
          const item = this.layers[i];
          // 判断是对象结构
          if (item && typeof item === "object" && !Array.isArray(item)) {
            layers.push({
              name: item.iconName || "三维",
              icon: item.iconEarth || defaultEarth,
              data: item.data,
            });
          }
        }
      }
      return layers;
    },
  },
  methods: {
    init() {
      const viewer = this.myEarth.viewer;
      if (viewer) {
        this.layers = viewer.getBaseLayers();
      }
    },
    change(index) {
      this.localIndex = index;

      const viewer = this.myEarth.viewer;
      if (viewer) {
        viewer.changeBaseLayer(index);
      }
    },
  },
  mounted() {
    this.myEarth.earthReady(this.init);
  },
};
</script>

<style lang="less">
@import "../../style/basemap.less";
</style>