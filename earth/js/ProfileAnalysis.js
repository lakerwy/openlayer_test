/*
 //剖面分析
 create by wl  20210929 
 */

import defined from "cesium/Source/Core/defined";
import ScreenSpaceEventHandler from "cesium/Source/Core/ScreenSpaceEventHandler";
import ScreenSpaceEventType from "cesium/Source/Core/ScreenSpaceEventType";
import Color from "cesium/Source/Core/Color";
import HeightReference from "cesium/Source/Scene/HeightReference";
import LabelStyle from "cesium/Source/Scene/LabelStyle";
import VerticalOrigin from "cesium/Source/Scene/VerticalOrigin";
import { Cartesian2 } from "cesium";
import CallbackProperty from "cesium/Source/DataSources/CallbackProperty";
import Cartographic from "cesium/Source/Core/Cartographic";
import EllipsoidGeodesic from "cesium/Source/Core/EllipsoidGeodesic";
// import { Math } from "core-js/library";
import CesiumMath from "cesium/Source/Core/Math";
import { Cartesian3 } from "cesium";
import * as echarts from "echarts";

class ProfileAnalysis {
    constructor() {
        //this.floatingPoints = [];
        //this.polyline=null;
    }
  ///初始化剖面分析
  InitProfileAnalysis(options,callback) {
    var viewer = options.viewer;
    var polyline = null;
    var floatingPoints = [];
    var handler = new ScreenSpaceEventHandler(
      viewer.scene._imageryLayerCollection
    );
    var positions = [];
    var positionsCartographic = [];
    var positions_Inter = [];
    var poly = null;
    var distance = 0;
    var cartesian = null;

    var DistanceArray = [];
    var profileItem = [];
    var floatingPoint = null;

    handler.setInputAction(function(movement) {
      // 深度开启或关闭   这个不开启的话   viewer.scene.pickPosition就会报错
      viewer.scene.globe.depthTestAgainstTerrain = true;

      var scene = viewer.scene;
      if (!scene.pickPositionSupported) {
        console.log("This browser does not support pickPosition.");
      }
      movement.endPosition.x = movement.endPosition.x - 150;
      //movement.endPosition.x = movement.endPosition.x;
      cartesian = viewer.scene.pickPosition(movement.endPosition);
      if (positions.length >= 2) {
        if (!defined(poly)) {
          poly = new PolyLinePrimitive(positions);
        } else {
          positions.pop();
          positions.push(cartesian);
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(function(movement) {
      // 深度开启或关闭
      viewer.scene.globe.depthTestAgainstTerrain = true;

      var scene = viewer.scene;
      if (!scene.pickPositionSupported) {
        console.log("This browser does not support pickPosition.");
      }

      movement.position.x = movement.position.x - 150;
      cartesian = viewer.scene.pickPosition(movement.position);
      if (positions.length == 0) {
        positions.push(cartesian.clone());
      }
      positions.push(cartesian);
      if (poly) {
        //进行插值计算
        interPoints(poly.positions);
        distance = getSpaceDistance(positions_Inter);
      } else {
        distance = getSpaceDistance(positions);
      }
      var textDisance = distance + "米";
      DistanceArray.push(distance);
      floatingPoint = viewer.entities.add({
        position: positions[positions.length - 1],
        point: {
          pixelSize: 5,
          color: Color.RED,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          heightReference: HeightReference.NONE
        },
        label: {
          text: textDisance,
          font: "18px sans-serif",
          fillColor: Color.GOLD,
          style: LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(20, -20),
          heightReference: HeightReference.NONE
        }
      });
      floatingPoints.push(floatingPoint);
    }, ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(function(movement) {
      handler.destroy(); //关闭事件句柄
      positions.pop(); //最后一个点无效
      createProfileChart(profileItem, options.targetid,callback);
    }, ScreenSpaceEventType.RIGHT_CLICK);

    var PolyLinePrimitive = (function() {
      function _(positions) {
        this.options = {
          polyline: {
            show: true,
            positions: [],
            material: Color.CHARTREUSE,
            width: 2,
            clampToGround: true
          }
        };
        this.positions = positions;
        this._init();
      }
      _.prototype._init = function() {
        var _self = this;
        var _update = function() {
          return _self.positions;
        };
        //实时更新polyline.positions
        this.options.polyline.positions = new CallbackProperty(_update, false);
        polyline = viewer.entities.add(this.options);
      };
      return _;
    })();

    //空间两点距离计算函数
    function getSpaceDistance(positions) {
      profileItem = [
        {
          point: cartesian3ToDegrees(positions[0]),
          distance: 0
        }
      ];
      var distance = 0;
      for (var i = 0; i < positions.length - 1; i++) {
        var point1cartographic = Cartographic.fromCartesian(positions[i]);
        var point2cartographic = Cartographic.fromCartesian(positions[i + 1]);
        /**根据经纬度计算出距离**/
        var geodesic = new EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        var s = geodesic.surfaceDistance;
        //返回两点之间的距离
        s = Math.sqrt(
          Math.pow(s, 2) +
            Math.pow(point2cartographic.height - point1cartographic.height, 2)
        );
        distance = distance + s;
        var m_Item = {
          point: cartesian3ToDegrees(positions[i + 1]),
          distance: distance
        };
        profileItem.push(m_Item);
      }
      return distance.toFixed(2);
    }

    //世界坐标系转为经纬度
    function cartesian3ToDegrees(position) {
      // 此处是经纬度，单位：弧度；高度单位：米。
      var catographic = Cartographic.fromCartesian(position);
      var height = Number(catographic.height.toFixed(2));
      // 此处是经纬度，单位：度。
      var longitude = Number(
        CesiumMath.toDegrees(catographic.longitude).toFixed(6)
      );
      var latitude = Number(
        CesiumMath.toDegrees(catographic.latitude).toFixed(6)
      );
      return [longitude, latitude, height];
    }

    //线段插值点
    function interPoints(positions) {
      positionsCartographic = [];
      var terrainSamplePositions = [];
      for (let index = 0; index < positions.length - 1; index++) {
        const element = positions[index];
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var cartographic = ellipsoid.cartesianToCartographic(element);
        positionsCartographic.push(cartographic);
      }
      for (let i = 0; i < positionsCartographic.length; i++) {
        const m_Cartographic0 = positionsCartographic[i];
        const m_Cartographic1 = positionsCartographic[i + 1];
        if (m_Cartographic1) {
          var a =
            Math.abs(m_Cartographic0.longitude - m_Cartographic1.longitude) *
            10000000;
          var b =
            Math.abs(m_Cartographic0.latitude - m_Cartographic1.latitude) *
            10000000;
          //等距采样
          if (a > b) b = a;
          var length = parseInt(b / 2);
          if (length > 100) length = 100;
          if (length < 2) length = 2;
          // var length = 4;//等分采样
          for (var j = 0; j < length; j++) {
            terrainSamplePositions.push(
              new Cartographic(
                CesiumMath.lerp(
                  m_Cartographic0.longitude,
                  m_Cartographic1.longitude,
                  j / (length - 1)
                ),
                CesiumMath.lerp(
                  m_Cartographic0.latitude,
                  m_Cartographic1.latitude,
                  j / (length - 1)
                )
              )
            );
          }
          terrainSamplePositions.pop();
        } else {
          terrainSamplePositions.push(m_Cartographic0);
        }
      }
      positions_Inter = [];
      for (var n = 0; n < terrainSamplePositions.length; n++) {
        //地理坐标（弧度）转经纬度坐标
        var m_cartographic = terrainSamplePositions[n];
        var height = viewer.scene.globe.getHeight(m_cartographic);
        var point = Cartesian3.fromDegrees(
          (m_cartographic.longitude / Math.PI) * 180,
          (m_cartographic.latitude / Math.PI) * 180,
          height
        );
        positions_Inter.push(point);
      }
    }

    function createProfileChart(Positions, id) {
      document.getElementById(id).style.display = "block";
      var x_Range = parseInt(Positions[Positions.length - 1].distance);
      console.log(x_Range);
      var ProfileData = [];
      var ProfileData_Lon = [];

      var y_Min = 100000000;
      for (let index = 0; index < Positions.length; index++) {
        const element = Positions[index];
        var m_distance = element.distance.toFixed(2);
        var m_Lon = element.point[0].toFixed(5);
        var m_Lat = element.point[1].toFixed(5);
        var m_height = element.point[2].toFixed(2);
        if (m_height < y_Min) {
          y_Min = m_height;
        }
        var m_data = [m_distance, m_height];
        ProfileData.push(m_data);
        ProfileData_Lon.push([m_Lon, m_Lat]);
      }
      console.log(ProfileData);
      var lineChart = echarts.init(document.getElementById(id));
      // background: rgba(255, 255, 255, 1);
      var lineoption = {
        title: {
          text: "剖面分析"
        },
        tooltip: {
          trigger: "axis"
          //formatter(params) {
          //    // console.log(params['data']);
          //    return "当前高度：" + params['data'][1];
          //}
        },
        legend: {
          data: ["剖面线"]
        },
        grid: {
          x: 40,
          x2: 40,
          y2: 24
        },
        calculable: true,
        xAxis: [
          {
            type: "value",
            max: "dataMax",
            scale: true
          }
        ],
        yAxis: [
          {
            type: "value",
            min: y_Min,
            scale: true
          }
        ],
        series: [
          {
            name: "剖面线",
            type: "line",
            data: ProfileData,
            markPoint: {
              data: [
                { type: "max", name: "最高点" },
                { type: "min", name: "最低点" }
              ]
            }
          }
        ]
      };
      lineChart.setOption(lineoption);
      document.getElementById(id).style.backgroundColor =
        "rgba(255, 255, 255, 1)";
      document.getElementById(id).style.visibility = "visible";
      if (typeof callback === "function") {
        callback(floatingPoints,polyline); //调用传入的回调函数
      }
    }
  }
  ///获取中间数据
  GetData(){
      return [this.floatingPoints,this.polyline];
  }
}
export default ProfileAnalysis;
