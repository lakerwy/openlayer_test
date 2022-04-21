/*
 //天气分析
 create by wl  20211029
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
import PostProcessStage from "cesium/Source/Scene/PostProcessStage";
class WeatherAnalyse {
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
    this.snow=null;
    this.fog=null;
    this.rain=null;
  }
  ShowSnow() {
    this.snow = new PostProcessStage({
      name: "czm_snow",
      fragmentShader:
        "\n\
          uniform sampler2D colorTexture;\n\
          varying vec2 v_textureCoordinates;\n\
          float snow(vec2 uv,float scale)\n\
          {\n\
          float time = czm_frameNumber / 60.0;\n\
           float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
           uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
            uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
            p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
           k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
          return k*w;\n\
          }\n\
          void main(void){\n\
           vec2 resolution = czm_viewport.zw;\n\
           vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
           vec3 finalColor=vec3(0);\n\
             float c = 0.0;\n\
            c+=snow(uv,30.)*.0;\n\
            c+=snow(uv,20.)*.0;\n\
           c+=snow(uv,15.)*.0;\n\
           c+=snow(uv,10.);\n\
           c+=snow(uv,8.);\n\
            c+=snow(uv,6.);\n\
           c+=snow(uv,5.);\n\
            finalColor=(vec3(c)); \n\
          gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.5); \n\
          }"
    });

    this.viewer.scene.postProcessStages.add(this.snow);
  }
  ShowFog() {
    this.fog = new PostProcessStage({
      name: "czm_fog",
      fragmentShader:
        "uniform sampler2D colorTexture;\n" +
        "  uniform sampler2D depthTexture;\n" +
        "  varying vec2 v_textureCoordinates;\n" +
        "  void main(void)\n" +
        "  {\n" +
        "      vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);\n" +
        "      vec4 fogcolor=vec4(0.8,0.8,0.8,0.5);\n" +
        "      float depth = czm_readDepth(depthTexture, v_textureCoordinates);\n" +
        "      vec4 depthcolor=texture2D(depthTexture, v_textureCoordinates);\n" +
        "      float f=(depthcolor.r-0.7)/0.2;\n" +
        "      if(f<0.0) f=0.0;\n" +
        "      else if(f>1.0) f=1.0;\n" +
        "      gl_FragColor = mix(origcolor,fogcolor,f);\n" +
        "   }"
    });

    this.viewer.scene.postProcessStages.add(this.fog);
  }
  ShowRain() {
    this.rain = new PostProcessStage({
      name: "czm_rain",
      fragmentShader:
        "uniform sampler2D colorTexture;\n" +
        "varying vec2 v_textureCoordinates;\n" +
        "	float hash(float x){\n" +
        "	     return fract(sin(x*133.3)*13.13);\n" +
        "	 }\n" +
        "	void main(void){\n" +
        "	     float time = czm_frameNumber / 600.0;\n" +
        "	     vec2 resolution = czm_viewport.zw; \n" +
        "	     vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n" +
        "	     vec3 c=vec3(.6,.7,.8); \n" +
        "	     float a=-.4;\n" +
        "	     float si=sin(a),co=cos(a);\n" +
        "	     uv*=mat2(co,-si,si,co);\n" +
        "	     uv*=length(uv+vec2(0,4.9))*.3+1.;\n" +
        "	     float v=1.-sin(hash(floor(uv.x*100.))*2.);\n" +
        "	     float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n" +
        "	     c*=v*b; \n" +
        "	     gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5); \n" +
        "	}"
    });

    this.viewer.scene.postProcessStages.add(this.rain);
  }
  Clear() {
    this.viewer.scene.postProcessStages.remove(this.snow);
    this.viewer.scene.postProcessStages.remove(this.fog);
    this.viewer.scene.postProcessStages.remove(this.rain);
  }
}
export default WeatherAnalyse;
