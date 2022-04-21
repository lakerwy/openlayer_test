<template>
  <div class="my-earth-contextmenu">
    <slot></slot>
  </div>
</template>

<script>
import { getCoordinatesByPixel } from "../../js/Coordinates.js";

export default {
  name: "MyEarthContextmenu",
  inject: ["myEarth"],
  provide: function() {
    return {
      myEarth: this.myEarth
    };
  },
  props: {
    isDefault: {
      type: Boolean,
      default: true
    }
  },
  mounted() {
    if (this.isDefault) {
      this.myEarth.earthReady(this.init);
    }
  },
  methods: {
    async init() {
      let viewer = this.myEarth.viewer;
      viewer.container.addEventListener("contextmenu", this.showContextmenu);
      viewer.container.addEventListener("click", this.hideContextmenu);
    },
    showContextmenu(e) {
      e.preventDefault();

      this.$el.style.display = "unset";
      this.$el.style.left = e.offsetX + "px";
      this.$el.style.top = e.offsetY + "px";

      let viewer = this.myEarth.viewer;
      let coordinate = getCoordinatesByPixel(viewer, e.offsetX, e.offsetY);
      this.$emit("callback", coordinate);
    },
    hideContextmenu() {
      this.$el.style.display = "none";
    },
    disposed() {
      let viewer = this.myEarth.viewer;
      if (viewer) {
        viewer.container.removeEventListener(
          "contextmenu",
          this.showContextmenu
        );
        viewer.container.removeEventListener("click", this.hideContextmenu);
      }
    }
  },
  beforeDestroy() {
    this.disposed();
  }
};
</script>

<style lang="less" scoped>
.my-earth-contextmenu {
  position: absolute;
  z-index: 99999999;
  display: none;
}
</style>
