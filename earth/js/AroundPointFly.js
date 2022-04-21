/*
 //漫游分析
 create by wl  20210929 
 */
import Color from "cesium/Source/Core/Color";
// import { Math } from "core-js/library";
import CesiumMath from "cesium/Source/Core/Math";
import { Cartesian3 } from "cesium";
import JulianDate from "cesium/Source/Core/JulianDate";
import ClockRange from "cesium/Source/Core/ClockRange";
import ClockStep from "cesium/Source/Core/ClockStep";

class AroundPointFly {
  constructor(viewer, options) {
    this.viewer = viewer;
    this.Exection = null;
    // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值，这里取-30度
    this.pitch = CesiumMath.toRadians(-30);
    // 给定飞行一周所需时间，比如10s, 那么每秒转动度数
    this.time = options.time;
    this.angle = 360 / this.time;
    // 给定相机距离点多少距离飞行，这里取值为5000m
    this.distance = 5000;
    this.point = options.point;
    this.initAroundPoingFly();
  }
  initAroundPoingFly() {
    let that = this;
    var startTime = JulianDate.fromDate(new Date());
    var stopTime = JulianDate.addSeconds(
      startTime,
      that.time,
      new JulianDate()
    );

    that.viewer.clock.startTime = startTime.clone(); // 开始时间
    that.viewer.clock.stopTime = stopTime.clone(); // 结速时间
    that.viewer.clock.currentTime = startTime.clone(); // 当前时间
    that.viewer.clock.clockRange = ClockRange.CLAMPED; // 行为方式
    that.viewer.clock.clockStep = ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。

    this.pointlayer = that.viewer.entities.add({
      position: Cartesian3.fromDegrees(
        that.point[0],
        that.point[1],
        that.point[2]
      ),
      point: {
        pixelSize: 20,
        color: Color.YELLOW
      }
    });

    that.viewer.scene.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        that.point[0],
        that.point[1],
        that.point[2]
      ), //定位坐标点，建议使用谷歌地球坐标位置无偏差
      duration: 7 //定位的时间间隔
    });

    // 相机的当前heading
    var initialHeading = that.viewer.camera.heading;
    this.Exection = function TimeExecution() {
      // 当前已经过去的时间，单位s
      var delTime = JulianDate.secondsDifference(
        that.viewer.clock.currentTime,
        that.viewer.clock.startTime
      );
      var heading = CesiumMath.toRadians(delTime * that.angle) + initialHeading;
      that.viewer.scene.camera.setView({
        destination: Cartesian3.fromDegrees(
          that.point[0],
          that.point[1],
          that.point[2]
        ), // 点的坐标
        orientation: {
          heading: heading,
          pitch: that.pitch
        }
      });
      that.viewer.scene.camera.moveBackward(that.distance);
      if (
        JulianDate.compare(
          that.viewer.clock.currentTime,
          that.viewer.clock.stopTime
        ) >= 0
      ) {
        that.viewer.clock.onTick.removeEventListener(that.Exection);
      }
    };

    that.viewer.clock.onTick.addEventListener(that.Exection);
  }
  clearAroundPoingFly() {
    let that = this;
    if (that.pointlayer != null) {
      that.viewer.entities.remove(that.pointlayer);
      that.pointlayer = null;
    }
    that.viewer.clock.onTick.removeEventListener(that.Exection);
  }
}
export default AroundPointFly;
