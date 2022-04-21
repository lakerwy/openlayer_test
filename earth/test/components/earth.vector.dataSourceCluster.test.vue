<template>
  <div>
    <MyEarth ref="earth" style="width: 1500px; height: 800px">
      <MyDataSourceCluster
        :dataSource="dataSource"
        :isFit="true"
        :isCluster="true"
        :styles="styles"
        :clusterStyles="clusterStyles"
      ></MyDataSourceCluster>
    </MyEarth>
  </div>
</template>

<script>
import MyEarth from "@earth/components/my-earth/MyEarth";
import MyDataSourceCluster from "@earth/components/my-earth-vector/MyDataSourceCluster";

import clusterIcon from "../../assets/icon-map.png";

export default {
  components: {
    MyEarth,
    MyDataSourceCluster
  },
  data() {
    return {
      dataSource: {
        type: "1",
        data: [
          {
            geometryType: "Point",
            coordinates: [110.7, 31.6]
          },
          {
            geometryType: "Point",
            coordinates: [110.71, 31.61]
          },
          {
            geometryType: "Point",
            coordinates: [115.7, 31.6]
          }
        ],
        geometryKey: "geometryType"
      },
      styles: {
        icon: {
          src: clusterIcon
        }
      },
      // clusterStyles: {
      //   icon: {
      //     src: clusterIcon
      //   }
      // }
      clusterStyles: len => {
        return {
          icon: {
            src: clusterIcon
          },
          text: {
            text: len
          }
        };
      }
    };
  }
};
</script>
