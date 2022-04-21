/*
 //等高线分析
 create by wl  20211101
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
class ContourAnalyse {
  constructor(viewer, options) {
    this.viewer = viewer;
    this.width = options.width ? options.width : 2;
    this.spacing = options.spacing ? options.spacing : 100;
  }
  initContour() {
    let contourColor = Color.YELLOW.clone();
    let contourUniforms = {};
    let globe = this.viewer.scene.globe;
    let material;
    material = Material.fromType("ElevationContour");
    contourUniforms = material.uniforms;
    contourUniforms.width = this.width;
    contourUniforms.spacing = this.spacing;
    contourUniforms.color = contourColor;
    globe.material = material;
  }
  initSlope() {
    var shadingUniforms = {};
    let material = Material.fromType("SlopeRamp");
    let globe = this.viewer.scene.globe;
    shadingUniforms = material.uniforms;
    shadingUniforms.image = this.getColorRamp();
    globe.material = material;
  }
  getColorRamp() {
    var ramp = document.createElement('canvas');
    ramp.width = 100;
    ramp.height = 1;
    var ctx = ramp.getContext('2d');

    var values = [0.0, 0.29, 0.5, Math.sqrt(2)/2, 0.87, 0.91, 1.0];

    var grd = ctx.createLinearGradient(0, 0, 100, 0);
    grd.addColorStop(values[0], '#000000'); //black
    grd.addColorStop(values[1], '#2747E0'); //blue
    grd.addColorStop(values[2], '#D33B7D'); //pink
    grd.addColorStop(values[3], '#D33038'); //red
    grd.addColorStop(values[4], '#FF9742'); //orange
    grd.addColorStop(values[5], '#ffd700'); //yellow
    grd.addColorStop(values[6], '#ffffff'); //white

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 100, 1);

    return ramp;
}
  clear() {
    this.viewer.scene.globe.material = null;
  }
}
export default ContourAnalyse;
