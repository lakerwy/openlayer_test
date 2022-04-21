<template>
  <div>
    <MyEarth ref="earth" style="width: 1500px; height: 800px"></MyEarth>
    <div>
      <el-button type="" @click="showCircleScan">添加扩散圆</el-button>
      <el-button type="" @click="remove">移除扩散圆</el-button>
      <el-button type="" @click="clear">移除所有</el-button>
    </div>
    <div>
      <el-button type="" @click="showRadarScan">添加雷达圆</el-button>
      <el-button type="" @click="removeRadar">移除雷达圆</el-button>
      <el-button type="" @click="clearRadar">移除所有</el-button>
    </div>
  </div>
</template>

<script>
import MyEarth from "@earth/components/my-earth/MyEarth";
import MyCircleScan from "@earth/js/animation/circleScan.js";
import MyRadarScan from "@earth/js/animation/radarScan.js";
import { setCameraPositionByCoordinate } from "@earth/js/Camera.js";

export default {
  components: {
    MyEarth
  },
  data() {
    return {
      circleScans: null,
      radarScans: null
    };
  },
  methods: {
    showCircleScan() {
      let viewer = this.$refs.earth.getViewer();
      if (viewer) {
        this.circleScans = new MyCircleScan({
          viewer: viewer
        });

        let params = {
          id: "scan_1",
          lon: 110.5,
          lat: 31.58,
          radius: 7000,
          color: "#ff0000",
          interval: 3000
        };
        this.circleScans.add(params);

        setCameraPositionByCoordinate(viewer.camera, 110.5, 31.58);
      }
    },
    remove() {
      if (this.circleScans) {
        this.circleScans.removeById("scan_1");
      }
    },
    clear() {
      if (this.circleScans) {
        this.circleScans.removeAll();
      }
    },
    showRadarScan() {
      let viewer = this.$refs.earth.getViewer();
      if (viewer) {
        this.radarScans = new MyRadarScan({
          viewer: viewer
        });

        let params = {
          id: "scan_1",
          lon: 110.5,
          lat: 31.58,
          radius: 7000,
          color: "#ff0000",
          interval: 3000
        };
        this.radarScans.add(params);

        setCameraPositionByCoordinate(viewer.camera, 110.5, 31.58);
      }
    },
    removeRadar() {
      if (this.radarScans) {
        this.radarScans.removeAll();
      }
    },
    clearRadar() {
      if (this.radarScans) {
        this.radarScans.removeAll();
      }
    }
  }
};
</script>
