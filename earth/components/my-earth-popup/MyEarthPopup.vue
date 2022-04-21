<template>
  <div class="my-earth-overlay">
    <slot></slot>
  </div>
</template>

<script>
import MyCesiumPopup from "../../js/popup/popup.js";

export default {
  name: "MyEarthPopup",
  inject: ["myEarth"],
  props: {
    options: {
      type: Object,
      default: () => {
        return null;
      }
    }
  },
  data() {
    return {
      overlay: null
    };
  },
  watch: {
    options() {
      if (this.options && this.overlay) {
        let offset = this.options.offset;
        offset && this.overlay.setOffset(offset);
        let positioning = this.options.positioning;
        positioning && this.overlay.setPositioning(positioning);
        let position = this.options.position;
        position && this.overlay.setPosition(position);
      }
    }
  },
  methods: {
    init() {
      const opts = {
        viewer: this.myEarth.viewer,
        element: this.$el,
        ...this.options
      };
      this.overlay = new MyCesiumPopup(opts);
    },
    setPosition(position) {
      if (!this.overlay) {
        this.init();
      }

      if (!this.overlay.getViewer()) {
        // 防止viewer 丢失
        this.overlay.setViewer(this.myMap.map);
      }

      this.overlay.setPosition(position || undefined);
    },
    dispose() {
      if (this.overlay && this.myEarth && this.myEarth.viewer) {
        this.overlay.remove();
        this.overlay = null;
      }
    }
  },
  mounted() {
    this.myEarth.earthReady(this.init);
  },
  beforeDestroy() {
    this.dispose();
  }
};
</script>
