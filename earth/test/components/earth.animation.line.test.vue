<template>
  <div>
    <MyEarth
      ref="earth"
      style="width: 1500px; height: 800px"
      @ready="showFlyLine"
    ></MyEarth>
  </div>
</template>

<script>
import MyEarth from "@earth/components/my-earth/MyEarth";
import { addFlyLine } from "../../js/animation/flyCurve.js";
import { getModelEntity } from "../../js/model/ModelEntity";
import { getRadarEntity } from "../../js/model/RadarEntity";
import { getWaveEntity } from "../../js/model/WaveEntity";

export default {
  components: {
    MyEarth
  },
  methods: {
    showFlyLine() {
      let viewer = this.$refs.earth.getViewer();
      if (viewer) {
        let start = [100, 30];
        let end = [115, 31];

        let entity = addFlyLine(viewer.entities, start, end);
        viewer.zoomTo(entity);

        let coneEnity = getModelEntity({
          lon: end[0],
          lat: end[1],
          height: 200,
          url: "/data/cone.glb",
          modelOptions: {
            scale: 150,
            minimumPixelSize: 20
          }
        });
        viewer.entities.add(coneEnity);

        let circleWave = getWaveEntity({
          lon: end[0],
          lat: end[1],
          radius: 30,
          height: 100,
          count: 3
        });
        viewer.entities.add(circleWave);

        let coneEnity1 = getModelEntity({
          lon: start[0],
          lat: start[1],
          height: 200,
          url: "/data/cone.glb",
          modelOptions: {
            scale: 150,
            minimumPixelSize: 20
          }
        });
        viewer.entities.add(coneEnity1);

        let circleRader = getRadarEntity({
          lon: start[0],
          lat: start[1],
          radius: 30,
          height: 100
        });
        viewer.entities.add(circleRader);
      }
    }
  }
};
</script>
