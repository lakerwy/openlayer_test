<template>
  <div>
    <MyEarth ref="earthCom" style="width: 1500px; height: 800px"></MyEarth>
    <div
      style="position:absolute;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:10px;cursor:pointer;"
    >
      <div
        @click="profileanalyse"
        style="float:left;padding-left:15px;padding-right:5px;cursor:pointer;"
      >
        剖面分析
      </div>
      <div
        @click="clearProfileanalyse"
        style="float:left;padding-left:15px;padding-right:15px;cursor:pointer;"
      >
        清除
      </div>
    </div>

    <div
      style="position:absolute;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:50px;cursor:pointer;"
    >
      <div
        @click="viewShedStageanalyse"
        style="float:left;padding-left:15px;padding-right:5px;cursor:pointer;"
      >
        可视域分析
      </div>
      <div
        @click="clearViewShedStageanalyse"
        style="float:left;padding-left:15px;padding-right:15px;cursor:pointer;"
      >
        清除
      </div>
    </div>

    <div
      style="position:absolute;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:90px;cursor:pointer;"
    >
      <div
        @click="roamanalyse"
        style="float:left;padding-left:15px;padding-right:5px;cursor:pointer;"
      >
        漫游分析
      </div>
      <div
        @click="clearroamanalyse"
        style="float:left;padding-left:15px;padding-right:15px;cursor:pointer;"
      >
        清除
      </div>
    </div>
    <div
      style="position:absolute;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:130px;cursor:pointer;"
    >
      <div
        @click="aroundPoingFly"
        style="float:left;padding-left:15px;padding-right:5px;cursor:pointer;"
      >
        绕点飞行
      </div>
      <div
        @click="clearAroundPoingFly"
        style="float:left;padding-left:15px;padding-right:15px;cursor:pointer;"
      >
        清除
      </div>
    </div>
    <div
      style="position:absolute;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:170px;cursor:pointer;"
    >
      <div
        @click="clipPlane"
        style="float:left;padding-left:15px;padding-right:5px;cursor:pointer;"
      >
        挖方分析
      </div>
      <div
        @click="clearClipPlane"
        style="float:left;padding-left:15px;padding-right:15px;cursor:pointer;"
      >
        清除
      </div>
    </div>
    <div
      style="position:absolute;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:210px;cursor:pointer;"
    >
      <div
        @click="floodAnalyse"
        style="float:left;padding-left:15px;padding-right:5px;cursor:pointer;"
      >
        淹没分析
      </div>
      <div
        @click="clearFloodAnalyse"
        style="float:left;padding-left:15px;padding-right:15px;cursor:pointer;"
      >
        清除
      </div>
    </div>
    <div
      style="position:absolute;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:250px;cursor:pointer;"
    >
      <div
        @click="snow_day"
        style="float:left;padding-left:15px;padding-right:5px;cursor:pointer;"
      >
        雪天
      </div>
      <div
        @click="clear_weather"
        style="float:left;padding-left:15px;padding-right:15px;cursor:pointer;"
      >
        清除
      </div>
    </div>
    <div
      style="position:absolute;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:290px;cursor:pointer;"
    >
      <div
        @click="fog_day"
        style="float:left;padding-left:15px;padding-right:5px;cursor:pointer;"
      >
        雾天
      </div>
      <div
        @click="clear_weather"
        style="float:left;padding-left:15px;padding-right:15px;cursor:pointer;"
      >
        清除
      </div>
    </div>
    <div
      style="position:absolute;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:330px;cursor:pointer;"
    >
      <div
        @click="rain_day"
        style="float:left;padding-left:15px;padding-right:5px;cursor:pointer;"
      >
        雨天
      </div>
      <div
        @click="clear_weather"
        style="float:left;padding-left:15px;padding-right:15px;cursor:pointer;"
      >
        清除
      </div>
    </div>
    <div
      style="position:absolute;width:100px;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:330px;cursor:pointer;"
    >
      <input type="checkbox" @click="showdem()" />
      等高线
    </div>
     <div
      style="position:absolute;width:100px;height:30px;text-align:center;line-height:30px;background-color:white;left:175px;top:370px;cursor:pointer;"
    >
      <input type="checkbox" @click="showslop()" />
      坡度分析
    </div>
    <div
      id="profileChart"
      style="position:absolute;bottom:0px;right:0px;left:155px;height:300px;background-color:white;display:none;"
    ></div>
  </div>
</template>
<script>
import MyEarth from "@earth/components/my-earth/MyEarth";
import ProfileAnalysis from "../../js/ProfileAnalysis";
import ViewShedStage from "../../js/ViewShedStage";
import RoamAnalyse from "../../js/RoamAnalyse";
import AroundPointFly from "../../js/AroundPointFly";
import ClipPlane from "../../js/ClipPlane";
import FloodAnalyse from "../../js/FloodAnalyse";
import WeatherAnalyse from "../../js/WeatherAnalyse";
import ContourAnalyse from "../../js/ContourAnalyse";
var points_ = [];
var line_ = null;
var roamanalyse = null;
var aroundPointFly = null;
var analyse = null;
var clipPlane = null;
var floodAnalyse = null;
var weatherAnalyse = null;
var contourAnalyse = null;
export default {
  components: {
    MyEarth
  },
  methods: {
    profileanalyse: function() {
      this.clearProfileanalyse();
      let viewer = this.$refs.earthCom.viewer;
      var analyse = new ProfileAnalysis();
      var options = {
        viewer: viewer,
        targetid: "profileChart" //echartid
      };
      analyse.InitProfileAnalysis(options, function(points, line) {
        points_ = points;
        line_ = line;
      });
      //analyse.test(viewer);
    },

    clearProfileanalyse: function() {
      document.getElementById("profileChart").style.display = "none";
      let viewer = this.$refs.earthCom.viewer;
      var polyline = line_;
      viewer.entities.remove(polyline);
      var points = points_;
      if (points != null) {
        for (var i = 0; i < points.length; i++) {
          viewer.entities.remove(points[i]);
        }
      }
    },
    viewShedStageanalyse: function() {
      if (analyse != null) {
        analyse.clear();
      }
      let viewer = this.$refs.earthCom.viewer;
      let options = {
        horizontalViewAngle: 90, //横向角度
        verticalViewAngle: 60 //纵向角度
      };
      analyse = new ViewShedStage(viewer, options);
    },
    clearViewShedStageanalyse: function() {
      analyse.clear();
    },
    roamanalyse: function() {
      let viewer = this.$refs.earthCom.viewer;
      let options = {
        points: [
          { lng: 112.6274, lat: 27.1395, height: 1500 }, // height:相机高度(单位米) flytime:相机两个标注点飞行时间(单位秒)
          { lng: 112.6296, lat: 27.1456, height: 1500 },
          { lng: 112.6369, lat: 27.1491, height: 1500 },
          { lng: 112.6415, lat: 27.1411, height: 1500 }
        ],
        flytime: 30, //飞行时间
        showpath: true //是否展示飞行路径
      };
      roamanalyse = new RoamAnalyse(viewer, options);
    },
    clearroamanalyse: function() {
      roamanalyse.clearroamanalyse();
    },
    aroundPoingFly: function() {
      let viewer = this.$refs.earthCom.viewer;
      let options = {
        point: [112.6274, 27.1395, 1500], // height:相机高度(单位米) flytime:相机两个标注点飞行时间(单位秒)
        time: 10 //一圈飞行的时间
      };
      aroundPointFly = new AroundPointFly(viewer, options);
    },
    clearAroundPoingFly: function() {
      aroundPointFly.clearAroundPoingFly();
    },
    clipPlane: function() {
      if (clipPlane != null) {
        clipPlane.Clear();
      }
      let viewer = this.$refs.earthCom.viewer;
      clipPlane = new ClipPlane(viewer, {
        height: 20, //挖的深度，最高点算
        splitNum: 1000, //插值的精度
        bottomImg:
          "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic119.huitu.com%2Fres%2F20190503%2F2022843_20190503183644054070_1.jpg&refer=http%3A%2F%2Fpic119.huitu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1637827474&t=deec5ac167c9a0fb09b5f06549a517c5",
        wallImg:
          "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fi.carimg.com%2F0%2Fdb%2F20130709%2F51dbc9e806bb9.jpg&refer=http%3A%2F%2Fi.carimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1637825766&t=a32bbf751acd886239a7510a515e75a3"
      });
      clipPlane.initClipPlane();
    },
    clearClipPlane: function() {
      if (clipPlane != null) {
        clipPlane.Clear();
      }
    },
    floodAnalyse: function() {
      if (floodAnalyse != null) {
        floodAnalyse.Clear();
      }
      let options = {
        waterimg:
          "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2Fc1a7ce3901bc6b61c657b9c165ee847819c55cf0393eb-iBjQU0_fw658&refer=http%3A%2F%2Fhbimg.b0.upaiyun.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1638002029&t=13a7f7eeff361f4dbd63ae99e30c4526",
        height: 2 //每次淹没的高度
      };
      let viewer = this.$refs.earthCom.viewer;
      floodAnalyse = new FloodAnalyse(viewer, options);
      floodAnalyse.initDrawPolygon();
    },
    clearFloodAnalyse: function() {
      if (floodAnalyse != null) {
        floodAnalyse.Clear();
      }
    },
    snow_day: function() {
      let viewer = this.$refs.earthCom.viewer;
      weatherAnalyse = new WeatherAnalyse(viewer);
      weatherAnalyse.ShowSnow();
    },
    fog_day: function() {
      let viewer = this.$refs.earthCom.viewer;
      weatherAnalyse = new WeatherAnalyse(viewer);
      weatherAnalyse.ShowFog();
    },
    rain_day: function() {
      let viewer = this.$refs.earthCom.viewer;
      weatherAnalyse = new WeatherAnalyse(viewer);
      weatherAnalyse.ShowRain();
    },
    clear_weather: function() {
      weatherAnalyse.Clear();
    },
    showdem: function(e) {
      let ischeck = event.target.checked;
      let options = {
        width: 2,//等高线宽度
        spacing: 200//等高线高度差
      };
      if (ischeck == true) {
        let viewer = this.$refs.earthCom.viewer;
        contourAnalyse = new ContourAnalyse(viewer, options);
        contourAnalyse.initContour();
      } else {
        contourAnalyse.clear();
      }
    },
    showslop:function(){
       let ischeck = event.target.checked;
      let options = {
        width: 2,//等高线宽度
        spacing: 200//等高线高度差
      };
      if (ischeck == true) {
        let viewer = this.$refs.earthCom.viewer;
        contourAnalyse = new ContourAnalyse(viewer, options);
        contourAnalyse.initSlope();
      } else {
        contourAnalyse.clear();
      }
    }
  }
};
</script>
