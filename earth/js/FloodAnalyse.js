/*
 //淹没分析
 create by wl  20211028
 */

import Color from "cesium/Source/Core/Color";
import { Cartesian3, isLeapYear } from "cesium";
import ClippingPlaneCollection from "cesium/Source/Scene/ClippingPlaneCollection";
import Plane from "cesium/Source/Core/Plane";
import { ClippingPlane } from "cesium";
import ScreenSpaceEventHandler from "cesium/Source/Core/ScreenSpaceEventHandler";
import defined from "cesium/Source/Core/defined";
import ScreenSpaceEventType from "cesium/Source/Core/ScreenSpaceEventType";
import CallbackProperty from "cesium/Source/DataSources/CallbackProperty";
import HeightReference from "cesium/Source/Scene/HeightReference";
import Cartographic from "cesium/Source/Core/Cartographic";
import CesiumMath from "cesium/Source/Core/Math";
import ImageMaterialProperty from "cesium/Source/DataSources/ImageMaterialProperty";
import { PolygonGeometry } from "cesium";
import { PerInstanceColorAppearance } from "cesium";
import defaultValue from "cesium/Source/Core/defaultValue";
import { sampleTerrainMostDetailed } from "cesium";
import PolygonHierarchy from "cesium/Source/Core/PolygonHierarchy";
import Material from "cesium/Source/Scene/Material";
import MaterialAppearance from "cesium/Source/Scene/MaterialAppearance";
import Primitive from "cesium/Source/Scene/Primitive";
import GeometryInstance from "cesium/Source/Core/GeometryInstance";
import WallGeometry from "cesium/Source/Core/WallGeometry";
import ColorGeometryInstanceAttribute from "cesium/Source/Core/ColorGeometryInstanceAttribute";
import EllipsoidSurfaceAppearance from "cesium/Source/Scene/EllipsoidSurfaceAppearance";
import ClassificationType from "cesium/Source/Scene/ClassificationType";
import Cartesian2 from "cesium/Source/Core/Cartesian2";
class FloodAnalyse {
  constructor(viewer, options) {
    let date = new Date();
    this.drawid =
      date.getFullYear() +
      "" +
      date.getMonth() +
      1 +
      "" +
      date.getDate() +
      "" +
      date.getHours() +
      "" +
      date.getMinutes() +
      "" +
      date.getSeconds();
    this.viewer = viewer;
    this.waterHeight = 99999;
    this.targetHeight = -99999;
    this.watermodel = null;
    this.floodaddheight = options.height ? options.height : 2;
    this.waterimg = options.waterimg ? options.waterimg : "";
  }
  initDrawPolygon() {
    let that = this;
    that.drawpoly = null;
    // 深度开启或关闭   这个不开启的话   viewer.scene.pickPosition就会报错
    that.viewer.scene.globe.depthTestAgainstTerrain = true;
    // 取消双击事件-追踪该位置
    that.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
    // 鼠标事件
    let handler = new ScreenSpaceEventHandler(
      that.viewer.scene._imageryLayerCollection
    );
    var positions = [];
    var tempPoints = [];
    var polygon = null;
    var cartesian = null;
    var floatingPoint; //浮动点
    var floatingPointArr = []; //浮动点

    handler.setInputAction(function(movement) {
      // 深度开启或关闭   这个不开启的话   viewer.scene.pickPosition就会报错
      that.viewer.scene.globe.depthTestAgainstTerrain = true;
      movement.endPosition.x = movement.endPosition.x - 150;
      let ray = that.viewer.camera.getPickRay(movement.endPosition);
      cartesian = that.viewer.scene.globe.pick(ray, that.viewer.scene);
      if (positions.length >= 2) {
        if (!defined(polygon)) {
          polygon = new PolygonPrimitive(positions);
        } else {
          positions.pop();
          positions.push(cartesian);
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(function(movement) {
      // 深度开启或关闭   这个不开启的话   viewer.scene.pickPosition就会报错
      that.viewer.scene.globe.depthTestAgainstTerrain = true;
      movement.position.x = movement.position.x - 150;
      let ray = that.viewer.camera.getPickRay(movement.position);
      cartesian = that.viewer.scene.globe.pick(ray, that.viewer.scene);
      if (positions.length == 0) {
        positions.push(cartesian.clone());
      }
      //positions.pop();
      positions.push(cartesian);
      //在三维场景中添加点
      var cartographic = Cartographic.fromCartesian(
        positions[positions.length - 1]
      );
      var longitudeString = CesiumMath.toDegrees(cartographic.longitude);
      var latitudeString = CesiumMath.toDegrees(cartographic.latitude);
      var heightString = cartographic.height;
      if (heightString < that.waterHeight) {
        that.waterHeight = heightString;
      }
      if (heightString > that.targetHeight) {
        that.targetHeight = heightString;
      }
      tempPoints.push({
        lon: longitudeString,
        lat: latitudeString,
        hei: heightString
      });
      floatingPoint = that.viewer.entities.add({
        // id: that.drawid + "_",
        name: that.drawid,
        position: positions[positions.length - 1],
        point: {
          pixelSize: 5,
          color: Color.RED,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          heightReference: HeightReference.CLAMP_TO_GROUND
        }
      });
      floatingPointArr.push(floatingPoint);
    }, ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(function(movement) {
      handler.destroy();
      positions.pop();
      that.viewer.entities.remove(that.drawpoly);
      for (let m = 0; m < floatingPointArr.length; m++) {
        that.viewer.entities.remove(floatingPointArr[m]);
      }
      that.waterHeight = that.getMinHeight(positions);
      that.createPolygon(tempPoints);
    }, ScreenSpaceEventType.RIGHT_CLICK);

    var PolygonPrimitive = (function() {
      function _(positions) {
        this.options = {
          name: that.drawid,
          polygon: {
            hierarchy: [],
            // perPositionHeight : true,
            material: Color.GREEN.withAlpha(0.5)
            // heightReference:20000
          }
        };

        this.hierarchy = { positions };
        this._init();
      }

      _.prototype._init = function() {
        var _self = this;
        var _update = function() {
          return _self.hierarchy;
        };
        //实时更新polygon.hierarchy
        this.options.polygon.hierarchy = new CallbackProperty(_update, false);
        that.drawpoly = that.viewer.entities.add(this.options);
      };

      return _;
    })();
  }
  //创建多边形
  createPolygon(points) {
    let that = this;
    let arr = [];
    for (let k = 0; k < points.length; k++) {
      arr.push(points[k].lon);
      arr.push(points[k].lat);
      arr.push(0);
    }
  
    let intervaltime = (that.targetHeight - that.waterHeight) / that.time;
    that.watermodel = this.viewer.entities.add({
      polygon: {
        hierarchy: new PolygonHierarchy(
          Cartesian3.fromDegreesArrayHeights(arr)
        ),
        perPositionHeight: true,
        //closeBottom: false,
        closeTop: false,
        extrudedHeight: new CallbackProperty(function() {
          //此处用属性回调函数，直接设置extrudedHeight会导致闪烁。
          that.waterHeight += that.floodaddheight;
          if (that.waterHeight > that.targetHeight) {
            that.waterHeight = that.targetHeight; //给个最大值
          }
          return that.waterHeight;
        }, false),
        //extrudedHeight: 1500,
        // material: new Color.fromBytes(0.5, 191, 255, 100)
        // 设置图片的样式
        material: new ImageMaterialProperty({
          image: that.waterimg,
          //repeat: Cartesian2(1.0, 1.0), // 不重复
          transparent: true, // 启用png透明
          color: Color.WHITE.withAlpha(0.5)
        })
      }
    });
  }
  //获取多边形范围内最低高程
  getMinHeight(positions) {
    let minHeight = 99999;
    // var cartographic = Cartographic.fromCartesian(
    //   positions[positions.length - 1]
    // );
    for (let i = 0; i < positions.length - 1; i++) {
      let spoint = Cartographic.fromCartesian(positions[0]);
      let epoint = Cartographic.fromCartesian(positions[i + 1]);
      for (let j = 1; j < 100; j++) {
        let m = CesiumMath.lerp(spoint.longitude, epoint.longitude, j / 100);
        let g = CesiumMath.lerp(spoint.latitude, epoint.latitude, j / 100);
        let lon = CesiumMath.toDegrees(m);
        let lat = CesiumMath.toDegrees(g);
        var carto = new Cartographic.fromDegrees(lon, lat); //输入经纬度
        var h1 = this.viewer.scene.globe.getHeight(carto);
        if (h1 < minHeight) {
          minHeight = h1;
        }
      }
    }
    return minHeight;
  }
  Clear() {
    this.viewer.entities.remove(this.watermodel);
  }
}
export default FloodAnalyse;
