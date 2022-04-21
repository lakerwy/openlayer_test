import { Viewer } from "cesium";
import Entity from "cesium/Source/DataSources/Entity";

/**
 *
 * 线轨迹播放类
 * @class LineTrack
 */
class LineTrack {
  /**
   * @param  { Object } options
   * @param  { Viewer } options.viewer 地图
   * @param  { Entity } options.entity 线要素
   * @param  { Number} [options.speed] = 1 速率
   * @param  { Boolean } [options.showStartAndEnd] = false 是否标注起点和终点
   * @param  { Boolean } [options.showNode] = false 是否显示节点
   * @param  { Boolean } [options.showDir] = false 是否显示方向
   * @param  { Boolean } [options.isTrack] = false 是否跟踪移动点
   * @param  { Object } [options.moveStyle] 移动电样式
   * @param  { Object } [options.nodeStyle] 节点样式
   * @param { Function } [options.callback] 移动时返回的轨迹段百分位
   */
  constructor(options) {
    options = options || {};

    this.viewer = options.viewer;
    if (!(this.viewer instanceof Viewer)) {
      throw new Error("三维地图对象错误!");
    }

    this.entity = options.entity;
    if (!(this.entity instanceof Entity)) {
      throw new Error("线实体对象错误!");
    }

    this.speed = options.speed || 1;

    this.showStartAndEnd = options.showStartAndEnd || false;

    this.showNode = options.showNode || false;

    this.showDir = options.showDir || false;

    this.isTrack = options.isTrack || false;

    this.moveStyle = options.moveStyle;

    this.nodeStyle = options.nodeStyle;

    this.callback = options.callback;

    this.init();
  }

  /**
   * 修改速度
   * @param { Number } value
   */
  setSpeed(value) {
    this.speed = value;
  }

  setShowStartAndEnd(value) {
    this.showStartAndEnd = value;
  }

  /**
   * 是否显示节点
   * @param { Boolean } value
   */
  setShowNode(value) {
    this.showNode = value;
  }

  /**
   * 是否显示方向
   * @param { Boolean } value
   */
  setShowDir(value) {
    this.showDir = value;
  }

  /**
   * 是否跟踪移动点
   * @param { Boolean } value
   */
  setIsTrack(value) {
    this.isTrack = value;
  }

  init() {}

  showStartAndEndOnMap() {}

  hideStartAndEndOnMap() {}

  showNodeOnMap() {}

  hideNodeOnMap() {}

  start() {}

  pause() {}

  finish() {
    this.pause();
  }

  destroy() {
    this.finish();
  }
}

export default LineTrack;
