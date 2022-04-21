<template>
  <div style="width: 100%; height: 100%; position: relative">
    <slot></slot>
  </div>
</template>

<script>
import {
  CONFIG_VIEW,
  CONFIG_LAYERS,
  CONFIG_TERRAIN,
  CONFIG_TILESET
} from "@earth/config";
import MyViewer from "@earth/js/Viewer";
import { getEntityPropertiesAndPosition } from "../../js/vector/entity.js";

import {
  transformCartesian3ToCartographic,
  transformCartographicToCartesian3
} from "../../js/Transfrom.js";

export default {
  name: "MyEarth",
  provide: function() {
    return {
      myEarth: this
    };
  },
  props: {
    isDefaultBaseLayer: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      viewer: null,
      dataSourceLayers: new Map()
    };
  },
  mounted() {
    this.earthReady();
  },
  methods: {
    getViewer() {
      return this.viewer;
    },
    init() {
      this.viewer = new MyViewer({
        container: this.$el,
        layers: this.isDefaultBaseLayer ? CONFIG_LAYERS : [],
        terrain: CONFIG_TERRAIN,
        tileset: CONFIG_TILESET,
        ...CONFIG_VIEW
      });

      this.viewer.selectedEntityChanged.addEventListener(entity => {
        let result = getEntityPropertiesAndPosition(entity);
        this.$emit("select", result);
      });

      /**
       * 地图初始化完成时触发
       */
      this.$emit("ready", this.viewer);
    },
    /**
     * 地图初始化完成回调
     * @param callback
     */
    earthReady(callback) {
      if (!this.viewer) {
        this.init();
      }

      callback && callback(this.viewer, this);
    },
    //#region viewer 对 矢量数据源管理——增、删、查
    addDataSourceLayer(id, layer) {
      this.dataSourceLayers.set(id, layer);
    },
    getDataSourceLayer(id) {
      return this.dataSourceLayers.get(id);
    },
    /**
     * 根据id 获取dataSoure对应的layer
     * @param id
     */
    getDataSourceById(id) {
      let layer = this.dataSourceLayers.get(id);
      if (!layer) {
        return;
      }
      return layer.source;
    },
    clearDataSourceById(id) {
      let source = this.getDataSourceById(id);
      if (source) {
        this.viewer.dataSources.remove(source);
      }

      this.dataSourceLayers.delete(id);
    },
    clearAllDataSource() {
      this.viewer.dataSources.removeAll();
      this.dataSourceLayers.clear();
    },
    //#endregion 矢量数据源管理
    /**
     * @param entity
     * @param [args] = {heading: 0, pitch: -30, range: 1000}
     */
    flyEntity(entity, isSelect = true) {
      if (!entity) {
        return;
      }

      if (isSelect) {
        this.viewer.selectedEntity = entity;
      }

      if (entity.position) {
        let position = transformCartesian3ToCartographic(
          entity.position._value
        );
        let destination = transformCartographicToCartesian3(
          position.longitude,
          position.latitude,
          2000
        );
        this.viewer.scene.camera.flyTo({
          destination: destination
        });
      }
    }
  }
};
</script>
