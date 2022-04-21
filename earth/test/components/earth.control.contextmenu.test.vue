<template>
  <div>
    <MyEarth style="width:1500px;height:800px">
      <MyEarthContextmenu @callback="setCoordinate">
        <div class="contextmenu-container">
          <el-button type="" @click="setStart">起点</el-button>
          <el-button type="" @click="setEnd">终点</el-button>
        </div>
      </MyEarthContextmenu>
    </MyEarth>
    <div>右键坐标：{{ coordinate ? JSON.stringify(coordinate) : null }}</div>
    <div>
      起点坐标：{{ startCoordinate ? JSON.stringify(startCoordinate) : null }}
    </div>
    <div>
      终点坐标：{{ endCoordinate ? JSON.stringify(endCoordinate) : null }}
    </div>
  </div>
</template>

<script>
import MyEarth from "@earth/components/my-earth/MyEarth";
import MyEarthContextmenu from "@earth/components/my-earth-control/MyEarthContextmenu";

export default {
  components: {
    MyEarth,
    MyEarthContextmenu
  },
  data() {
    return {
      coordinate: null,
      startCoordinate: null,
      endCoordinate: null
    };
  },
  methods: {
    setCoordinate(coordinate) {
      console.log(coordinate);
      this.coordinate = coordinate;
    },
    setStart() {
      this.startCoordinate = this.coordinate;
    },
    setEnd() {
      this.endCoordinate = this.coordinate;
    }
  }
};
</script>

<style lang="less" scoped>
.contextmenu-container {
  background: #fff;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.29);
  -moz-box-shadow: 0 1px 10px rgba(0, 0, 0, 0.29);
  -webkit-box-shadow: 0 1px 10px rgba(0, 0, 0, 0.29);
  padding: 10px;
}
</style>
