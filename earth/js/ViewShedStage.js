/*
可视域分析
create by wl 20210930
*/
import { Cartesian3 } from "cesium";
import Color from "cesium/Source/Core/Color";
import CesiumMath from "cesium/Source/Core/Math";
import Camera from "cesium/Source/Scene/Camera";
import ShadowMap from "cesium/Source/Scene/ShadowMap";
import Cartesian2 from "cesium/Source/Core/Cartesian2";
import Cartesian4 from "cesium/Source/Core/Cartesian4";
import PostProcessStage from "cesium/Source/Scene/PostProcessStage";
import Matrix3 from "cesium/Source/Core/Matrix3";
import Matrix4 from "cesium/Source/Core/Matrix4";
import Quaternion from "cesium/Source/Core/Quaternion";
import GeometryInstance from "cesium/Source/Core/GeometryInstance";
import FrustumOutlineGeometry from "cesium/Source/Core/FrustumOutlineGeometry";
import ColorGeometryInstanceAttribute from "cesium/Source/Core/ColorGeometryInstanceAttribute";
import ShowGeometryInstanceAttribute from "cesium/Source/Core/ShowGeometryInstanceAttribute";
import Primitive from "cesium/Source/Scene/Primitive";
import PerInstanceColorAppearance from "cesium/Source/Scene/PerInstanceColorAppearance";
import Transforms from "cesium/Source/Core/Transforms";
import HeadingPitchRoll from "cesium/Source/Core/HeadingPitchRoll";
import Cartographic from "cesium/Source/Core/Cartographic";
import glsl from "./GLSL";
import ScreenSpaceEventHandler from "cesium/Source/Core/ScreenSpaceEventHandler";
import ScreenSpaceEventType from "cesium/Source/Core/ScreenSpaceEventType";
import HeightReference from "cesium/Source/Scene/HeightReference";
import ShadowMode from "cesium/Source/Scene/ShadowMode";
/**
 * 可视域分析。
 *
 * @author Helsing
 * @date 2020/08/28
 * @alias ViewShedStage
 * @class
 * @param {Cesium.Viewer} viewer Cesium三维视窗。
 * @param {Object} options 选项。
 * @param {Cesium.Cartesian3} options.viewPosition 观测点位置。
 * @param {Cesium.Cartesian3} options.viewPositionEnd 最远观测点位置（如果设置了观测距离，这个属性可以不设置）。
 * @param {Number} options.viewDistance 观测距离（单位`米`，默认值100）。
 * @param {Number} options.viewHeading 航向角（单位`度`，默认值0）。
 * @param {Number} options.viewPitch 俯仰角（单位`度`，默认值0）。
 * @param {Number} options.horizontalViewAngle 可视域水平夹角（单位`度`，默认值90）。
 * @param {Number} options.verticalViewAngle 可视域垂直夹角（单位`度`，默认值60）。
 * @param {Cesium.Color} options.visibleAreaColor 可视区域颜色（默认值`绿色`）。
 * @param {Cesium.Color} options.invisibleAreaColor 不可视区域颜色（默认值`红色`）。
 * @param {Boolean} options.enabled 阴影贴图是否可用。
 * @param {Boolean} options.softShadows 是否启用柔和阴影。
 * @param {Boolean} options.size 每个阴影贴图的大小。
 */
class ViewShedStage {
  constructor(viewer, options) {
    this.viewer = viewer;
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
    this.viewPosition = null;
    this.viewPositionEnd = null;
    this.viewDistance = 100.0;
    this.viewHeading = 0.0;
    this.viewPitch = 0.0;
    this.horizontalViewAngle = options.horizontalViewAngle
      ? options.horizontalViewAngle
      : 90;
    this.verticalViewAngle = options.verticalViewAngle
      ? options.verticalViewAngle
      : 60.0;
    this.visibleAreaColor = Color.GREEN;
    this.invisibleAreaColor = Color.RED;
    this.enabled = true;
    this.softShadows = true;
    this.size = 2048;
    this.initViewShedStage();
  }
  initViewShedStage() {
    let that = this;
    var positions = [];
    var tempPoints = [];
    var cartesian = null;
    var positionentity = [];
    // 鼠标事件
    let handler = new ScreenSpaceEventHandler(
      that.viewer.scene._imageryLayerCollection
    );
    handler.setInputAction(function(movement) {
      // 深度开启或关闭   这个不开启的话   viewer.scene.pickPosition就会报错
      that.viewer.scene.globe.depthTestAgainstTerrain = true;
      movement.position.x = movement.position.x - 150;
      let ray = that.viewer.camera.getPickRay(movement.position);
      cartesian = that.viewer.scene.globe.pick(ray, that.viewer.scene);

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
      let point = that.viewer.entities.add({
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
      positionentity.push(point);
      if (positions.length == 2) {
        that.viewer.entities.remove(positionentity[0]);
        that.viewer.entities.remove(positionentity[1]);
        handler.destroy(); //关闭事件句柄
        that.viewPosition = positions[0];
        that.viewPositionEnd = positions[1];
        that.viewDistance = Cartesian3.distance(
          that.viewPosition,
          that.viewPositionEnd
        );
        that.viewHeading = that.getHeading(
          that.viewPosition,
          that.viewPositionEnd
        );
        that.viewPitch = that.getPitch(that.viewPosition, that.viewPositionEnd);
        that.update();
        // that.createViewshedMap(positions[0],positions[1]);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  }
  add() {
    this.createLightCamera();
    this.createShadowMap();
    this.createPostStage();
    this.drawFrustumOutline();
    this.drawSketch();
  }

  update() {
    this.clear();
    this.add();
  }

  clear() {
    if (this.sketch) {
      // this.viewer.entities.removeById(this.sketch.id);
      // this.sketch = null;
      this.viewer.entities.remove(this.sketch);
      this.sketch = null;
    }
    if (this.frustumOutline) {
      // this.frustumOutline.destroy();
      // this.frustumOutline = null;
      this.viewer.scene.primitives.remove(this.frustumOutline);
      this.frustumOutline = null;
    }
    if (this.postStage) {
      this.viewer.scene.postProcessStages.remove(this.postStage);
      this.postStage = null;
    }
  }
  //创建相机
  createLightCamera() {
    let that = this;
    that.lightCamera = new Camera(that.viewer.scene);
    that.lightCamera.position = that.viewPosition;
    // if (this.viewPositionEnd) {
    //     let direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(this.viewPositionEnd, this.viewPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    //     this.lightCamera.direction = direction; // direction是相机面向的方向
    // }
    that.lightCamera.frustum.near = that.viewDistance * 0.001;
    that.lightCamera.frustum.far = that.viewDistance;
    const hr = CesiumMath.toRadians(that.horizontalViewAngle);
    const vr = CesiumMath.toRadians(that.verticalViewAngle);
    const aspectRatio =
      (that.viewDistance * Math.tan(hr / 2) * 2) /
      (that.viewDistance * Math.tan(vr / 2) * 2);
    that.lightCamera.frustum.aspectRatio = aspectRatio;
    if (hr > vr) {
      that.lightCamera.frustum.fov = hr;
    } else {
      that.lightCamera.frustum.fov = vr;
    }
    that.lightCamera.setView({
      destination: that.viewPosition,
      orientation: {
        heading: CesiumMath.toRadians(that.viewHeading || 0),
        pitch: CesiumMath.toRadians(that.viewPitch || 0),
        roll: 0
      }
    });
  }
  //创建阴影贴图
  createShadowMap() {
    let that = this;
    that.shadowMap = new ShadowMap({
      context: that.viewer.scene.context,
      lightCamera: that.lightCamera,
      enabled: that.enabled,
      isPointLight: true,
      pointLightRadius: that.viewDistance,
      cascadesEnabled: false,
      size: that.size,
      softShadows: that.softShadows,
      normalOffset: false,
      fromLightSource: false
    });
    that.viewer.scene.shadowMap = that.shadowMap;
  }
  //
  createPostStage() {
    let that = this;
    that.viewer.shadows = true;
    that.viewer.terrainShadows = ShadowMode.ENABLED;
    const fs = glsl;
    const postStage = new PostProcessStage({
      fragmentShader: fs,
      uniforms: {
        shadowMap_textureCube: () => {
          that.shadowMap.update(Reflect.get(that.viewer.scene, "_frameState"));
          return Reflect.get(that.shadowMap, "_shadowMapTexture");
        },
        shadowMap_matrix: () => {
          that.shadowMap.update(Reflect.get(that.viewer.scene, "_frameState"));
          return Reflect.get(that.shadowMap, "_shadowMapMatrix");
        },
        shadowMap_lightPositionEC: () => {
          that.shadowMap.update(Reflect.get(that.viewer.scene, "_frameState"));
          return Reflect.get(that.shadowMap, "_lightPositionEC");
        },
        shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
          that.shadowMap.update(Reflect.get(that.viewer.scene, "_frameState"));
          const bias = that.shadowMap._pointBias;
          let abc = Cartesian4.fromElements(
            bias.normalOffsetScale,
            that.shadowMap._distance,
            that.shadowMap.maximumDistance,
            that.shadowMap._darkness,
            new Cartesian4()
          );
          console.log(that.shadowMap._darkness);
          return abc;
        },
        shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
          that.shadowMap.update(Reflect.get(that.viewer.scene, "_frameState"));
          const bias = that.shadowMap._pointBias;
          const scratchTexelStepSize = new Cartesian2();
          const texelStepSize = scratchTexelStepSize;
          texelStepSize.x = 1.0 / that.shadowMap._textureSize.x;
          texelStepSize.y = 1.0 / that.shadowMap._textureSize.y;
          let abc = Cartesian4.fromElements(
            texelStepSize.x,
            texelStepSize.y,
            bias.depthBias,
            bias.normalShadingSmooth,
            new Cartesian4()
          );
          return abc;
        },
        camera_projection_matrix: that.lightCamera.frustum.projectionMatrix,
        camera_view_matrix: that.lightCamera.viewMatrix,
        helsing_viewDistance: () => {
          return that.viewDistance;
        },
        helsing_visibleAreaColor: that.visibleAreaColor,
        helsing_invisibleAreaColor: that.invisibleAreaColor
      }
    });
    that.postStage = that.viewer.scene.postProcessStages.add(postStage);
  }
  //创建视锥线
  drawFrustumOutline() {
    let that = this;
    const scratchRight = new Cartesian3();
    const scratchRotation = new Matrix3();
    const scratchOrientation = new Quaternion();
    const position = that.lightCamera.positionWC;
    const direction = that.lightCamera.directionWC;
    const up = that.lightCamera.upWC;
    let right = that.lightCamera.rightWC;
    right = Cartesian3.negate(right, scratchRight);
    let rotation = scratchRotation;
    Matrix3.setColumn(rotation, 0, right, rotation);
    Matrix3.setColumn(rotation, 1, up, rotation);
    Matrix3.setColumn(rotation, 2, direction, rotation);
    let orientation = Quaternion.fromRotationMatrix(
      rotation,
      scratchOrientation
    );

    let instance = new GeometryInstance({
      geometry: new FrustumOutlineGeometry({
        frustum: that.lightCamera.frustum,
        origin: that.viewPosition,
        orientation: orientation
      }),
      id: Math.random()
        .toString(36)
        .substr(2),
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(
          Color.YELLOWGREEN //new Cesium.Color(0.0, 1.0, 0.0, 1.0)
        ),
        show: new ShowGeometryInstanceAttribute(true)
      }
    });

    that.frustumOutline = that.viewer.scene.primitives.add(
      new Primitive({
        geometryInstances: [instance],
        appearance: new PerInstanceColorAppearance({
          flat: true,
          translucent: false
        })
      })
    );
  }
  //创建视网
  drawSketch() {
    let that = this;
    that.sketch = that.viewer.entities.add({
      name: "sketch",
      position: that.viewPosition,
      orientation: Transforms.headingPitchRollQuaternion(
        that.viewPosition,
        HeadingPitchRoll.fromDegrees(
          that.viewHeading - that.horizontalViewAngle,
          that.viewPitch,
          0.0
        )
      ),
      ellipsoid: {
        radii: new Cartesian3(
          that.viewDistance,
          that.viewDistance,
          that.viewDistance
        ),
        // innerRadii: new Cesium.Cartesian3(2.0, 2.0, 2.0),
        minimumClock: CesiumMath.toRadians(-that.horizontalViewAngle / 2),
        maximumClock: CesiumMath.toRadians(that.horizontalViewAngle / 2),
        minimumCone: CesiumMath.toRadians(that.verticalViewAngle + 7.75),
        maximumCone: CesiumMath.toRadians(180 - that.verticalViewAngle - 7.75),
        fill: false,
        outline: true,
        subdivisions: 256,
        stackPartitions: 64,
        slicePartitions: 64,
        outlineColor: Color.YELLOWGREEN
      }
    });
  }

  getHeading(fromPosition, toPosition) {
    let finalPosition = new Cartesian3();
    let matrix4 = Transforms.eastNorthUpToFixedFrame(fromPosition);
    Matrix4.inverse(matrix4, matrix4);
    Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
    Cartesian3.normalize(finalPosition, finalPosition);
    return CesiumMath.toDegrees(Math.atan2(finalPosition.x, finalPosition.y));
  }

  getPitch(fromPosition, toPosition) {
    let finalPosition = new Cartesian3();
    let matrix4 = Transforms.eastNorthUpToFixedFrame(fromPosition);
    Matrix4.inverse(matrix4, matrix4);
    Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
    Cartesian3.normalize(finalPosition, finalPosition);
    return CesiumMath.toDegrees(Math.asin(finalPosition.z));
  }
}
export default ViewShedStage;
