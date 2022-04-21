<template>
  <div>
    <MyEarth ref="earthCom" style="width: 1500px; height: 800px"></MyEarth>
    <div
      @click="measureDistince"
      style="position:absolute;width:150px;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:10px;cursor:pointer;"
    >
      测距
    </div>
    <div
      @click="measurArea"
      style="position:absolute;width:150px;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:50px;cursor:pointer;"
    >
      测面积
    </div>
    <!-- <div
      @click="clearMeasureArea"
      style="position:absolute;width:150px;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:130px;cursor:pointer;"
    >
      清除面积
    </div> -->
  </div>
</template>
<script>
import MyEarth from "@earth/components/my-earth/MyEarth";
import EarthTools from "../../js/EarthTools";
var earthTools;
export default {
  components: {
    MyEarth
  },
  methods: {
    measureDistince: function() {
      let viewer = this.$refs.earthCom.viewer;
      earthTools = new EarthTools();
      earthTools.measureLineSpace(viewer);
    },
    measurArea: function() {
      let viewer = this.$refs.earthCom.viewer;
      earthTools = new EarthTools();
      earthTools.measureAreaSpace(viewer);
    }
  }
};
</script>
