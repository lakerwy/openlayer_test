<template>
  <div>
    <MyEarth ref="earth" style="width: 1500px; height: 800px"></MyEarth>
  </div>
</template>

<script>
import MyEarth from "@earth/components/my-earth/MyEarth";
import { getTerrain } from "@earth/js/Terrain";
import { setCameraHeightAndPitch } from "@earth/js/Camera";
import Rectangle from "cesium/Source/Core/Rectangle";
import Color from "cesium/Source/Core/Color";

export default {
  components: {
    MyEarth,
  },
  mounted() {
    this.initTerrain();
  },
  methods: {
    initTerrain() {
      let viewer = this.$refs.earth.getViewer();
      if (viewer) {
        viewer.terrainProvider = getTerrain({
          url: "dem/hubei_terrain",
        });
        setCameraHeightAndPitch(viewer.camera, 7000, -10);
        // 参考矩形
        viewer.entities.add({
          rectangle: {
            coordinates: Rectangle.fromDegrees(
              109.98501586914062,
              31.305341796875,
              111.01498413085938,
              31.854658203125
            ),
            outline: true,
            outlineColor: Color.WHITE,
            outlineWidth: 4,
            material: new Color(1, 0, 0, 0.2),
          },
        });
      }
    },
  },
};
</script>