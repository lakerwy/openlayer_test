<!--
 * @ Author: Qi Zhiwu
 * @ Create Time: 2021-08-31 11:41:29
 * @ Modified by: Qi Zhiwu
 * @ Modified time: 2021-09-01 14:59:59
 * @ Description: cesium 中 dataSource 相关操作
 * source 对应 cesium 的 dataSource 对象
 * 因无法在dataSource对象上增删属性，故增加一个 layer 对象，作为source 的父对象，用于业务操作
 -->

<script>
/**
 * 矢量图层基础组件
 * 实现对数据、图层的基本操作
 */
import dataSourceFactory from "@earth/js/vector/dataSourceFactory";

export default {
  name: "MyEarthVectorBase",
  inject: ["myEarth"],
  render() {
    return null;
  },
  props: {
    /**
     * @property {object} dataSource
     * @property {string} dataSource.type - "1" | "2" | "3" | "4" 参考 GEOJSON_SOURCE_TYPE
     * @property {object | String | Array} dataSource.data -  数据，需配合type的值
     * @property {string} dataSource.geometryKey = "type" -  几何类型对应的key值
     * @property {string} dataSource.idKey = "id" -  id对应的key值
     */
    dataSource: {
      type: Object,
      default: () => {
        return null;
      }
    },
    dataType: {
      // 数据类型 json
      type: String,
      default: () => {
        return "json";
      }
    },
    name: {
      // 图层名
      type: String,
      default: null
    },
    id: {
      // 图层ID
      type: [String, Number],
      default: null
    },
    isFit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      source: null,
      layer: null
    };
  },
  watch: {
    dataSource() {
      this.clear();
      this.addData(this.dataSource);
    }
  },
  methods: {
    /**
     * 矢量图层的初始化
     */
    init() {
      this.initSource();
      this.initLayerFinish();
    },
    /**
     * 数据源的初始化
     */
    initSource() {
      let options = {};
      this.source = new dataSourceFactory(options).create(this.dataType);

      // 数据源添加数据
      this.addData(this.dataSource);
    },
    /**
     * 图层初始化完后，将图层增加到地图中
     */
    initLayerFinish() {
      if (this.source) {
        // 将 dataSource 添加进 viewer 中
        this.myEarth.viewer.dataSources.add(this.source);

        this.fit();

        // 封装一层，作为业务操作
        this.layer = {
          source: this.source,
          id: this.id || new Date().getTime(),
          name: this.name,
          _vm: this,
          getVisible: () => {
            return this.source.show;
          },
          setVisible: value => {
            this.source.show = value;
          }
        };
        this.myEarth.addDataSourceLayer(this.id, this.layer);

        /**
         * 图层完成时触发
         */
        this.$emit("ready");
      }
    },
    /**
     * 增加数据
     */
    addData(dataSource) {
      if (this.source && dataSource) {
        this.source.addSourceData(dataSource);
      }

      this.fit();
    },
    fit() {
      if (this.source && this.isFit) {
        setTimeout(() => {
          this.myEarth.viewer.flyTo(this.source);
        }, 0);
      }
    },
    /**
     * 清空source数据
     */
    clear() {
      if (this.source) {
        this.source.entities.removeAll();
      }
    },
    /**
     * 清空source,移除图层
     */
    dispose() {
      if (this.myEarth && this.myEarth.viewer && this.source) {
        this.clear();
        this.myEarth.viewer.dataSources.remove(this.source);
        this.myEarth.dataSourceLayers.delete(this.layer.id);
      }
    }
  },
  /**
   * 地图加载完后，调用图层初始化
   */
  mounted() {
    this.myEarth.earthReady(this.init);
  },
  /**
   * 移除
   */
  beforeDestroy() {
    this.dispose();
  }
};
</script>
