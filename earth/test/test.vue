<template>
  <div class="container">
    <div id="leftbar" class="left">
      <router-link to="/test/earth">三维地图</router-link>
      <div class="title">地图服务</div>
      <router-link to="/test/earth/earth_server_arcgis"
        >ArcGIS Server服务</router-link
      >
      <router-link to="/test/earth/earth_server_geoserver"
        >GeoServer服务</router-link
      >
      <router-link to="/test/earth/earth_server_xyz">XYZ服务</router-link>
      <router-link to="/test/earth/earth_server_stamen">stamen服务</router-link>
      <div class="title">矢量数据</div>
      <router-link to="/test/earth/earth_vector_datasource"
        >dataSource方式</router-link
      >
      <router-link to="/test/earth/earth_vector_dataSourceCluster"
        >dataSource方式(聚合)</router-link
      >
      <div class="title">控件</div>
      <router-link to="/test/earth/earth_control_basemap">底图切换</router-link>
      <router-link to="/test/earth/earth_control_contextmenu"
        >右键菜单</router-link
      >
      <div class="title">动画</div>
      <router-link to="/test/earth/earth_animation_circleScan"
        >扩散圆</router-link
      >
      <router-link to="/test/earth/earth_animation_line">飞行线路</router-link>
      <div class="title">地形</div>
      <router-link to="/test/earth/earth_terrain_local">本地数据</router-link>
      <div class="title">Entity绘制</div>
      <router-link to="/test/earth/earth_vector_entity">画点</router-link>
      <div class="title">分析</div>
      <router-link to="/test/earth/earth_vector_analyse">三维分析</router-link>
      <div class="title">工具</div>
      <router-link to="/test/earth/earth_tools">通用工具</router-link>
    </div>
    <div class="right">
      <router-view></router-view>
    </div>
  </div>
</template>
<script>
export default {};
</script>
<style scoped>
.container {
  padding: 0;
  margin: 0;
  display: inline-grid;
  grid-template-columns: 150px 1fr;
}

.left > * {
  display: block;
}

.left > .title {
  font-weight: bold;
  font-size: 20px;
}
</style>
