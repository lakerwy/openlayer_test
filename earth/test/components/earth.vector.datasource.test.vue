<template>
  <div>
    <MyEarth
      ref="earth"
      style="width: 1500px; height: 800px"
      @select="selectEntityEvent"
    >
      <MyDataSource
        :dataSource="dataSource"
        :isFit="true"
        :styles="styles"
        :id="id"
      ></MyDataSource>
      <MyEarthPopup v-if="info" :options="popupOpt">
        <div style="background:#fff;">{{ info.name }}</div>
      </MyEarthPopup>
    </MyEarth>
    <el-button type="" @click="changeVisible">可见/不可见</el-button>
    <el-button type="" @click="goEntityById('point1')">定位1</el-button>
    <el-button type="" @click="goEntityById('point2')">定位2</el-button>
  </div>
</template>

<script>
import MyEarth from "@earth/components/my-earth/MyEarth";
import MyDataSource from "@earth/components/my-earth-vector/MyDataSource";
import MyEarthPopup from "@earth/components/my-earth-popup/MyEarthPopup";

import icon from "@earth/assets/icon-map.png";

export default {
  components: {
    MyEarth,
    MyDataSource,
    MyEarthPopup
  },
  data() {
    return {
      id: "test",
      dataSource: {
        type: "1",
        data: [
          {
            geometryType: "Point",
            coordinates: [110.7, 31.6],
            name: "测试一",
            id: "point1"
          },
          {
            geometryType: "Point",
            coordinates: [115.7, 31.6],
            name: "测试二",
            id: "point2"
          },
          {
            geometryType: "LineString",
            coordinates: [
              [110.7, 31.6],
              [115.7, 31.6]
            ],
            name: "测试三",
            id: "line1"
          },
          {
            geometryType: "Polygon",
            coordinates: [
              [
                [110.7, 32],
                [115.7, 32],
                [113, 33],
                [110.7, 32]
              ]
            ],
            name: "测试四",
            id: "polygon1"
          }
        ],
        geometryKey: "geometryType"
      },
      // styles: {
      //   icon: {
      //     src: icon
      //   },
      //   text: {
      //     text: "hello world"
      //   }
      // },
      styles: (entity, properties) => {
        return {
          // icon: { // 与circle 二选一
          //   src: icon
          // },
          circle: {
            radius: 10,
            fill: {
              color: "#ff0"
            },
            stroke: {
              color: "#f00",
              width: 2
            }
          },
          text: {
            text: properties.name,
            offsetY: -40
          },
          stroke: {
            color: "#f00",
            width: 2
          },
          fill: {
            color: "rgba(0,0,0,0)"
          }
        };
      },
      info: null,
      popupOpt: null
    };
  },
  methods: {
    changeVisible() {
      let component = this.$refs.earth;
      if (component) {
        let layer = component.getDataSourceLayer(this.id);
        layer.setVisible(!layer.getVisible());
      }
    },
    selectEntityEvent(data) {
      this.popupOpt = {
        position: data ? data.position : null
      };
      this.info = data ? data.properties : null;
    },
    goEntityById(entityId) {
      let component = this.$refs.earth;
      if (component) {
        let source = component.getDataSourceById(this.id);
        if (source) {
          let entity = source.entities.getById(entityId);
          component.flyEntity(entity);
        }
      }
    }
  }
};
</script>
