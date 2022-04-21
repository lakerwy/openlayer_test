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

class RoamAnalyse {
  constructor(viewer, options) {
    this.viewer = viewer;
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
    this.marks = options.points;
    this.marksIndex = 1;
    this.pitchValue = -90;
    this.pointlayer = null;
    this.num = 0;
    this.points = [];
    this.showpath = true;
    this.Exection = null;
    if (this.marks == null || this.marks.length < 2) {
      alert("最少输入两个点");
      return;
    }
    this.flytime = options.flytime / this.marks.length;
    if (options.showpath != undefined && options.showpath == true) {
      let temppts = [];
      for (var i = 0; i < this.marks.length; i++) {
        temppts.push(this.marks[i].lng);
        temppts.push(this.marks[i].lat);
        temppts.push(this.marks[i].height);
      }
      ///获取点位的高度
      this.polyline = viewer.entities.add({
        name: "Red line on terrain",
        polyline: {
          positions: Cartesian3.fromDegreesArrayHeights(temppts),
          width: 5,
          material: Color.RED,
          clampToGround: false
        }
      });
    }

    viewer.scene.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        this.marks[0].lng,
        this.marks[0].lat,
        this.marks[0].height + 500
      ), //定位坐标点，建议使用谷歌地球坐标位置无偏差
      duration: 7 //定位的时间间隔
    });
    let that = this;
    setTimeout(function() {
      that.flyExtent();
    }, 7000);
  }
  clearroamanalyse() {
    this.viewer.clock.onTick.removeEventListener(this.Exection);
    if (this.points.length > 0) {
      for (var i = 0; i < this.points.length; i++) {
        this.viewer.entities.remove(this.points[i]);
      }
      this.num = 0;
      this.points = [];
    }
    if (this.polyline != null) {
      this.viewer.entities.remove(this.polyline);
      this.polyline = null;
    }
  }
  flyExtent() {
    let that = this;
    // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值
    var pitch = CesiumMath.toRadians(this.pitchValue);
    // 时间间隔2秒钟
    this.setExtentTime(that.flytime);

    this.Exection = function TimeExecution() {
      var preIndex = that.marksIndex - 1;
      if (that.marksIndex == 0) {
        preIndex = that.marks.length - 1;
      }
      var heading = that.bearing(
        that.marks[preIndex].lat,
        that.marks[preIndex].lng,
        that.marks[that.marksIndex].lat,
        that.marks[that.marksIndex].lng
      );
      heading = CesiumMath.toRadians(heading);
      // 当前已经过去的时间，单位s
      var delTime = JulianDate.secondsDifference(
        that.viewer.clock.currentTime,
        that.viewer.clock.startTime
      );
      var originLat =
        that.marksIndex == 0
          ? that.marks[that.marks.length - 1].lat
          : that.marks[that.marksIndex - 1].lat;
      var originLng =
        that.marksIndex == 0
          ? that.marks[that.marks.length - 1].lng
          : that.marks[that.marksIndex - 1].lng;
      var endPosition = Cartesian3.fromDegrees(
        originLng +
          ((that.marks[that.marksIndex].lng - originLng) / that.flytime) *
            delTime,
        originLat +
          ((that.marks[that.marksIndex].lat - originLat) / that.flytime) *
            delTime,
        that.marks[that.marksIndex].height + 500
      );
      that.viewer.scene.camera.setView({
        destination: endPosition,
        orientation: {
          heading: heading,
          pitch: pitch
        }
      });
      if (that.num > 1 && that.num % 2 == 0) {
        for (var i = 0; i < that.num; i++) {
          that.viewer.entities.remove(that.points[i]);
        }
        that.num = 0;
        that.points = [];
      }

      that.pointlayer = that.viewer.entities.add({
        position: Cartesian3.fromDegrees(
          originLng +
            ((that.marks[that.marksIndex].lng - originLng) / that.flytime) *
              delTime,
          originLat +
            ((that.marks[that.marksIndex].lat - originLat) / that.flytime) *
              delTime,
          that.marks[that.marksIndex].height
        ),
        point: {
          pixelSize: 20,
          color: Color.YELLOW
        }
      });
      that.num++;
      that.points.push(that.pointlayer);

      if (
        JulianDate.compare(
          that.viewer.clock.currentTime,
          that.viewer.clock.stopTime
        ) >= 0
      ) {
        that.viewer.clock.onTick.removeEventListener(that.Exection);
        that.changeCameraHeading();
      }
    };
    that.viewer.clock.onTick.addEventListener(that.Exection);
  }
  // 相机原地定点转向
  changeCameraHeading() {
    let that = this;
    var nextIndex = that.marksIndex + 1;
    if (that.marksIndex == that.marks.length - 1) {
      that.marksIndex = 0;
      nextIndex = 1;
      //return;
    }
    // 计算两点之间的方向
    var heading = that.bearing(
      that.marks[that.marksIndex].lat,
      that.marks[that.marksIndex].lng,
      that.marks[nextIndex].lat,
      that.marks[nextIndex].lng
    );
    // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值
    var pitch = CesiumMath.toRadians(this.pitchValue);
    // 给定飞行一周所需时间，比如10s, 那么每秒转动度数
    var angle =
      (heading - CesiumMath.toDegrees(this.viewer.camera.heading)) / 2;
    // 时间间隔2秒钟
    this.setExtentTime(2);
    // 相机的当前heading
    var initialHeading = this.viewer.camera.heading;
    this.Exection = function TimeExecution() {
      // 当前已经过去的时间，单位s
      var delTime = JulianDate.secondsDifference(
        that.viewer.clock.currentTime,
        that.viewer.clock.startTime
      );
      var heading = CesiumMath.toRadians(delTime * angle) + initialHeading;
      that.viewer.scene.camera.setView({
        orientation: {
          heading: heading,
          pitch: pitch
        }
      });
      if (
        JulianDate.compare(
          that.viewer.clock.currentTime,
          that.viewer.clock.stopTime
        ) >= 0
      ) {
        that.viewer.clock.onTick.removeEventListener(that.Exection);
        that.marksIndex =
          ++that.marksIndex >= that.marks.length ? 0 : that.marksIndex;
        that.flyExtent();
      }
    };
    that.viewer.clock.onTick.addEventListener(that.Exection);
  }
  // 设置飞行的时间到viewer的时钟里
  setExtentTime(time) {
    var startTime = JulianDate.fromDate(new Date());
    var stopTime = JulianDate.addSeconds(startTime, time, new JulianDate());
    this.viewer.clock.startTime = startTime.clone(); // 开始时间
    this.viewer.clock.stopTime = stopTime.clone(); // 结速时间
    this.viewer.clock.currentTime = startTime.clone(); // 当前时间
    this.viewer.clock.clockRange = ClockRange.CLAMPED; // 行为方式
    this.viewer.clock.clockStep = ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
  }
  /** 相机视角飞行 结束 **/
  /** 飞行时 camera的方向调整(heading) 开始 **/
  // Converts from degrees to radians.
  toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }
  // Converts from radians to degrees.
  toDegrees(radians) {
    return (radians * 180) / Math.PI;
  }
  bearing(startLat, startLng, destLat, destLng) {
    startLat = this.toRadians(startLat);
    startLng = this.toRadians(startLng);
    destLat = this.toRadians(destLat);
    destLng = this.toRadians(destLng);

    let y = Math.sin(destLng - startLng) * Math.cos(destLat);
    let x =
      Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = Math.atan2(y, x);
    let brngDgr = this.toDegrees(brng);
    return (brngDgr + 360) % 360;
  }
}
export default RoamAnalyse;
