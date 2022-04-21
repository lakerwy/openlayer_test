/*
 //挖方分析
 create by wl  20210929 
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
import * as Cesium from "cesium";
import WallGeometry from "cesium/Source/Core/WallGeometry";
import ColorGeometryInstanceAttribute from "cesium/Source/Core/ColorGeometryInstanceAttribute";
class ClipPlane {
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
    this.points = null;
    this.viewer = viewer;
    this.height = options.height || 0;
    this.bottomImg = options.bottomImg;
    this.wallImg = options.wallImg;
    this.splitNum = defaultValue(options.splitNum, 50);
    this.wellWallEntity = null;
    this.bottomSurfaceEntty = null;
  }
  initClipPlane() {
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
      // let xpf=Math.pow(cartesian.x,2);
      // let ypf=Math.pow(cartesian.y,2);
      // let zpf=Math.pow(cartesian.z,2);
      // let kf=Math.sqrt(xpf+ypf);
      // let final=Math.sqrt(zpf+Math.pow(kf,2));
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
      that.StartClipPlane(positions, floatingPointArr);
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
  StartClipPlane(points, floatingPointArr) {
    let that = this;
    let isck = that.Clockwise(points);
    if (isck == true) {
      points.reverse();
    }
    that.viewer.entities.removeById("polyvolume");
    //---------------------------------------------------------
    let t = [];
    let i = points.length;
    let a = new Cartesian3();
    let n = Cartesian3.subtract(points[0], points[1], a);
    n = n.x > 0;
    that.excavateMinHeight = 9999;
    for (let r = 0; r < i; ++r) {
      let s = (r + 1) % i;
      let u = Cartographic.fromCartesian(points[r]);
      let c = that.viewer.scene.globe.getHeight(u) || u.height;
      c < that.excavateMinHeight && (that.excavateMinHeight = c);

      let midpoint = Cartesian3.add(points[r], points[s], new Cartesian3());
      midpoint = Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);

      let up = Cartesian3.normalize(midpoint, new Cartesian3());
      let right = Cartesian3.subtract(points[s], midpoint, new Cartesian3());
      right = Cartesian3.normalize(right, right);

      let normal = Cartesian3.cross(right, up, new Cartesian3());
      normal = Cartesian3.normalize(normal, normal);

      let originCenteredPlane = new Plane(normal, 0.0);
      let distance = Plane.getPointDistance(originCenteredPlane, midpoint);

      t.push(new ClippingPlane(normal, distance));
    }
    that.viewer.scene.globe.clippingPlanes = new ClippingPlaneCollection({
      planes: t,
      edgeWidth: 1,
      edgeColor: Color.WHITE,
      enabled: !0
    });
    that.prepareWell(points);
    //------------------------------------------------------------
    that.viewer.entities.remove(that.drawpoly);
    for (let m = 0; m < floatingPointArr.length; m++) {
      that.viewer.entities.remove(floatingPointArr[m]);
    }
  }
  //
  //createWell(this.wellData);
  prepareWell(points) {
    let that = this;
    let t = that.splitNum;
    let i = points.length;
    var a = that.excavateMinHeight - that.height;
    var n = [];
    var r = [];
    var s = [];
    if (0 != i) {
      for (let l = 0; l < i; l++) {
        let u = l == i - 1 ? 0 : l + 1;
        let c = Cartographic.fromCartesian(points[l]);
        let d = Cartographic.fromCartesian(points[u]);
        let h = [c.longitude, c.latitude];
        let f = [d.longitude, d.latitude];
        0 == l &&
          (s.push(new Cartographic(h[0], h[1])),
          r.push(Cartesian3.fromRadians(h[0], h[1], a)),
          n.push(Cartesian3.fromRadians(h[0], h[1], 0)));

        for (var p = 1; p <= t; p++) {
          let m = CesiumMath.lerp(h[0], f[0], p / t);
          let g = CesiumMath.lerp(h[1], f[1], p / t);
          (l == i - 1 && p == t) ||
            (s.push(new Cartographic(m, g)),
            r.push(Cartesian3.fromRadians(m, g, a)),
            n.push(Cartesian3.fromRadians(m, g, 0)));
        }
      }
      that.wellData = {
        lerp_pos: s,
        bottom_pos: r,
        no_height_top: n
      };
      that.CreateWell(that.wellData);
    }
  }
  //创建墙
  CreateWell(points) {
    let that = this;
    if (that.viewer.terrainProvider._layers) {
      that.createBottomSurface(points.bottom_pos);
      var i = sampleTerrainMostDetailed(
        that.viewer.terrainProvider,
        points.lerp_pos
      );
      Cesium.when(i, function(i) {
        for (var a = i.length, n = [], r = 0; r < a; r++) {
          var s = Cartesian3.fromRadians(
            i[r].longitude,
            i[r].latitude,
            i[r].height
          );
          n.push(s);
        }
        that.createWellWall(points.bottom_pos, n);
      });
    } else {
      that.createBottomSurface(points.bottom_pos);
      that.createWellWall(points.bottom_pos, points.no_height_top);
    }
  }
  createBottomSurface(points) {
    let that = this;
    if (points.length) {
      let minHeight = that.getMinHeight(points);
      let positions = [];
      for (let i = 0; i < points.length; i++) {
        let p = that.ellipsoidToLonLat(points[i]);
        positions.push(p.longitude);
        positions.push(p.latitude);
        positions.push(minHeight);
      }

      let polygon = new PolygonGeometry({
        polygonHierarchy: new PolygonHierarchy(
          Cartesian3.fromDegreesArrayHeights(positions)
        ),
        perPositionHeight: true,
        closeBottom: false
      });
      let geometry = PolygonGeometry.createGeometry(polygon);

      var i = new Material({
        fabric: {
          type: "Image",
          uniforms: {
            image: that.bottomImg
          }
        }
      });
      var a = new MaterialAppearance({
        translucent: !1,
        flat: !0,
        material: i
      });
      that.bottomSurface = new Primitive({
        geometryInstances: new GeometryInstance({
          geometry: geometry
        }),
        appearance: a,
        asynchronous: !1
      });
      that.bottomSurfaceEntty = that.viewer.scene.primitives.add(
        that.bottomSurface
      );
    }
  }
  createWellWall(bottompoints, points) {
    let that = this;
    let minHeight = that.getMinHeight(bottompoints);
    let maxHeights = [];
    let minHeights = [];
    for (let i = 0; i < points.length; i++) {
      maxHeights.push(that.ellipsoidToLonLat(points[i]).altitude);
      minHeights.push(minHeight);
    }
    let wall = new Cesium.WallGeometry({
      positions: points,
      maximumHeights: maxHeights,
      minimumHeights: minHeights
    });
    let geometry = WallGeometry.createGeometry(wall);
    var a = new Material({
      fabric: {
        type: "Image",
        uniforms: {
          image: this.wallImg
        }
      }
    });
    let n = new MaterialAppearance({
      translucent: !1,
      flat: !0,
      material: a
    });
    that.wellWall = new Primitive({
      geometryInstances: new GeometryInstance({
        geometry: geometry,
        attributes: {
          color: ColorGeometryInstanceAttribute.fromColor(Cesium.Color.GREY)
        },
        id: "PitWall"
      }),
      appearance: n,
      asynchronous: !1
    });
    that.wellWallEntity = that.viewer.scene.primitives.add(that.wellWall);
  }
  getMinHeight(points) {
    let minHeight = 5000000;
    let minPoint = null;
    let that = this;
    for (let i = 0; i < points.length; i++) {
      let height = points[i]["z"];
      if (height < minHeight) {
        minHeight = height;
        minPoint = that.ellipsoidToLonLat(points[i]);
      }
    }
    return minPoint.altitude;
  }
  ellipsoidToLonLat(point) {
    let ellipsoid = this.viewer.scene.globe.ellipsoid;
    let cartesian3 = new Cartesian3(point.x, point.y, point.z);
    let cartographic = ellipsoid.cartesianToCartographic(cartesian3);
    let lat = CesiumMath.toDegrees(cartographic.latitude);
    let lng = CesiumMath.toDegrees(cartographic.longitude);
    let alt = cartographic.height;
    return {
      longitude: lng,
      latitude: lat,
      altitude: alt
    };
  }
  Clear() {
    if (this.wellWallEntity != null) {
      this.viewer.scene.primitives.remove(this.wellWallEntity);
    }
    if (this.bottomSurfaceEntty != null) {
      this.viewer.scene.primitives.remove(this.bottomSurfaceEntty);
    }
    this.viewer.scene.globe.clippingPlanes = null;
  }
  //判断顺时针还是逆时针  如果是顺时针则改为逆时针
  Clockwise(points) {
    let that = this;
    //角度和
    let angSum = 0;
    for (let i = 0; i < points.length; i++) {
      let c1, c2, c3;
      if (i == 0) {
        c1 = points[points.length - 1];
        c2 = points[i];
        c3 = points[i + 1];
      } else if (i == points.length - 1) {
        c1 = points[i - 1];
        c2 = points[i];
        c3 = points[0];
      } else {
        c1 = points[i - 1];
        c2 = points[i];
        c3 = points[i + 1];
      }
      let x1, y1, x2, y2, x3, y3;
      x1 = parseFloat(c1.x);
      y1 = parseFloat(c1.y);
      x2 = parseFloat(c2.x);
      y2 = parseFloat(c2.y);
      x3 = parseFloat(c3.x);
      y3 = parseFloat(c3.y);

      var angRight = that.getCoordAngRight(x1, y1, x2, y2, x3, y3);
      angSum += angRight;
    }
    var isShunshizhen = Math.abs(angSum - (points.length - 2) * 180);
    //涉及到平方和开方计算，因此结果与理论值会有一点偏差，所以使用一个容差值
    return isShunshizhen < points.length;
  }
  //计算夹角
  getCoordAngRight(x1, y1, x2, y2, x3, y3) {
    // 要先判断是左转还是右转，如果是右转，右侧角=夹角，如果是左转，右侧角=360-夹角
    var s = (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
    var len12 = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    var len23 = Math.sqrt(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2));
    var len13 = Math.sqrt(Math.pow(x1 - x3, 2) + Math.pow(y1 - y3, 2));
    var cos2 =
      (Math.pow(len23, 2) + Math.pow(len12, 2) - Math.pow(len13, 2)) /
      (2 * len12 * len23);
    var angle2 = Math.round((Math.acos(cos2) * 180) / Math.PI);
    if (s < 0) {
      //顺时针
      return angle2;
    } else if (s > 0) {
      //逆时针
      return 360 - angle2;
    } else {
      //平行
      return 360;
    }
  }
}
export default ClipPlane;
