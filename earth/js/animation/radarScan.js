import * as Cesium from "cesium";

/**
 * 扩散圆
 */
class MyRadarScan {
  /**
   *
   * @param {Object} options
   * @param {import("cesium/Source/Widgets/Viewer/Viewer")}  options.viewer
   */
  constructor(options) {
    options = options || {};

    if (!options.viewer) {
      throw new Error("popup:未传入viewer");
    }

    this.viewer = options.viewer;

    this.scans = new Map();
  }

  /**
   *
   * @param {Object} param
   * @param {String|Numer} param.id 动画的编码
   * @param {Number} param.lon 经度，度十进制
   * @param {Number} param.lat 纬度，度十进制
   * @param {Number} param.radius 圆半径，单位米
   * @param {String} param.color  The CSS color value in #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(), or hsla() format.
   * @param {Number} param.interval 一圈的时间，单位毫秒
   */
  add({ id, lon, lat, radius, color, interval }) {
    let scan = this.add_({ lon, lat, radius, color, interval });
    this.scans.set(id, scan);
  }

  removeById(id) {
    let scan = this.scans.get(id);
    if (scan && this.viewer) {
      this.viewer.scene.postProcessStages.remove(scan);
    }

    if (this.scans.size === 0 && this.viewer) {
      this.viewer.scene.globe.depthTestAgainstTerrain = false;
    }
  }

  removeAll() {
    for (let scan of this.scans.values()) {
      if (scan && this.viewer) {
        this.viewer.scene.postProcessStages.remove(scan);
      }
    }
    this.scans.clear();

    if (this.viewer) {
      this.viewer.scene.globe.depthTestAgainstTerrain = false;
    }
  }

  add_({ lon, lat, radius, color, interval }) {
    if (!this.viewer) {
      return;
    }

    this.viewer.scene.globe.depthTestAgainstTerrain = true;

    let cartographic = new Cesium.Cartographic(
      Cesium.Math.toRadians(lon),
      Cesium.Math.toRadians(lat)
    );

    color = Cesium.Color.fromCssColorString(color);

    return addRadarScanPostStage(
      this.viewer,
      cartographic,
      radius,
      color,
      interval
    );
  }
}

export default MyRadarScan;

/*
  添加雷达扫描线
  viewer
  cartographicCenter 扫描中心
  radius  半径 米
  scanColor 扫描颜色
  duration 持续时间 毫秒
*/
function addRadarScanPostStage(
  viewer,
  cartographicCenter,
  radius,
  scanColor,
  duration
) {
  var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
  var _Cartesian4Center = new Cesium.Cartesian4(
    _Cartesian3Center.x,
    _Cartesian3Center.y,
    _Cartesian3Center.z,
    1
  );

  var _CartographicCenter1 = new Cesium.Cartographic(
    cartographicCenter.longitude,
    cartographicCenter.latitude,
    cartographicCenter.height + 500
  );
  var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(
    _CartographicCenter1
  );
  var _Cartesian4Center1 = new Cesium.Cartesian4(
    _Cartesian3Center1.x,
    _Cartesian3Center1.y,
    _Cartesian3Center1.z,
    1
  );

  var _CartographicCenter2 = new Cesium.Cartographic(
    cartographicCenter.longitude + Cesium.Math.toRadians(0.001),
    cartographicCenter.latitude,
    cartographicCenter.height
  );
  var _Cartesian3Center2 = Cesium.Cartographic.toCartesian(
    _CartographicCenter2
  );
  var _Cartesian4Center2 = new Cesium.Cartesian4(
    _Cartesian3Center2.x,
    _Cartesian3Center2.y,
    _Cartesian3Center2.z,
    1
  );
  var _RotateQ = new Cesium.Quaternion();
  var _RotateM = new Cesium.Matrix3();

  var _time = new Date().getTime();

  var _scratchCartesian4Center = new Cesium.Cartesian4();
  var _scratchCartesian4Center1 = new Cesium.Cartesian4();
  var _scratchCartesian4Center2 = new Cesium.Cartesian4();
  var _scratchCartesian3Normal = new Cesium.Cartesian3();
  var _scratchCartesian3Normal1 = new Cesium.Cartesian3();

  var ScanPostStage = new Cesium.PostProcessStage({
    fragmentShader: getRadarScanShader(),
    uniforms: {
      u_scanCenterEC: function() {
        return Cesium.Matrix4.multiplyByVector(
          viewer.camera._viewMatrix,
          _Cartesian4Center,
          _scratchCartesian4Center
        );
      },
      u_scanPlaneNormalEC: function() {
        var temp = Cesium.Matrix4.multiplyByVector(
          viewer.camera._viewMatrix,
          _Cartesian4Center,
          _scratchCartesian4Center
        );
        var temp1 = Cesium.Matrix4.multiplyByVector(
          viewer.camera._viewMatrix,
          _Cartesian4Center1,
          _scratchCartesian4Center1
        );
        _scratchCartesian3Normal.x = temp1.x - temp.x;
        _scratchCartesian3Normal.y = temp1.y - temp.y;
        _scratchCartesian3Normal.z = temp1.z - temp.z;

        Cesium.Cartesian3.normalize(
          _scratchCartesian3Normal,
          _scratchCartesian3Normal
        );
        return _scratchCartesian3Normal;
      },
      u_radius: radius,
      u_scanLineNormalEC: function() {
        var temp = Cesium.Matrix4.multiplyByVector(
          viewer.camera._viewMatrix,
          _Cartesian4Center,
          _scratchCartesian4Center
        );
        var temp1 = Cesium.Matrix4.multiplyByVector(
          viewer.camera._viewMatrix,
          _Cartesian4Center1,
          _scratchCartesian4Center1
        );
        var temp2 = Cesium.Matrix4.multiplyByVector(
          viewer.camera._viewMatrix,
          _Cartesian4Center2,
          _scratchCartesian4Center2
        );

        _scratchCartesian3Normal.x = temp1.x - temp.x;
        _scratchCartesian3Normal.y = temp1.y - temp.y;
        _scratchCartesian3Normal.z = temp1.z - temp.z;

        Cesium.Cartesian3.normalize(
          _scratchCartesian3Normal,
          _scratchCartesian3Normal
        );

        _scratchCartesian3Normal1.x = temp2.x - temp.x;
        _scratchCartesian3Normal1.y = temp2.y - temp.y;
        _scratchCartesian3Normal1.z = temp2.z - temp.z;

        var tempTime = ((new Date().getTime() - _time) % duration) / duration;
        Cesium.Quaternion.fromAxisAngle(
          _scratchCartesian3Normal,
          tempTime * Cesium.Math.PI * 2,
          _RotateQ
        );
        Cesium.Matrix3.fromQuaternion(_RotateQ, _RotateM);
        Cesium.Matrix3.multiplyByVector(
          _RotateM,
          _scratchCartesian3Normal1,
          _scratchCartesian3Normal1
        );
        Cesium.Cartesian3.normalize(
          _scratchCartesian3Normal1,
          _scratchCartesian3Normal1
        );
        return _scratchCartesian3Normal1;
      },
      u_scanColor: scanColor
    }
  });
  viewer.scene.postProcessStages.add(ScanPostStage);

  return ScanPostStage;
}

//雷达扫描线效果Shader
function getRadarScanShader() {
  var scanSegmentShader =
    "uniform sampler2D colorTexture;\n" +
    "uniform sampler2D depthTexture;\n" +
    "varying vec2 v_textureCoordinates;\n" +
    "uniform vec4 u_scanCenterEC;\n" +
    "uniform vec3 u_scanPlaneNormalEC;\n" +
    "uniform vec3 u_scanLineNormalEC;\n" +
    "uniform float u_radius;\n" +
    "uniform vec4 u_scanColor;\n" +
    "vec4 toEye(in vec2 uv, in float depth)\n" +
    " {\n" +
    " vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n" +
    " vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n" +
    " posInCamera =posInCamera / posInCamera.w;\n" +
    " return posInCamera;\n" +
    " }\n" +
    "bool isPointOnLineRight(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n" +
    "{\n" +
    "vec3 v01 = testPt - ptOnLine;\n" +
    "normalize(v01);\n" +
    "vec3 temp = cross(v01, lineNormal);\n" +
    "float d = dot(temp, u_scanPlaneNormalEC);\n" +
    "return d > 0.5;\n" +
    "}\n" +
    "vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n" +
    "{\n" +
    "vec3 v01 = point -planeOrigin;\n" +
    "float d = dot(planeNormal, v01) ;\n" +
    "return (point - planeNormal * d);\n" +
    "}\n" +
    "float distancePointToLine(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n" +
    "{\n" +
    "vec3 tempPt = pointProjectOnPlane(lineNormal, ptOnLine, testPt);\n" +
    "return length(tempPt - ptOnLine);\n" +
    "}\n" +
    "float getDepth(in vec4 depth)\n" +
    "{\n" +
    "float z_window = czm_unpackDepth(depth);\n" +
    "z_window = czm_reverseLogDepth(z_window);\n" +
    "float n_range = czm_depthRange.near;\n" +
    "float f_range = czm_depthRange.far;\n" +
    "return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n" +
    "}\n" +
    "void main()\n" +
    "{\n" +
    "gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n" +
    "float depth = getDepth( texture2D(depthTexture, v_textureCoordinates));\n" +
    "vec4 viewPos = toEye(v_textureCoordinates, depth);\n" +
    "vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n" +
    "float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n" +
    "float twou_radius = u_radius * 2.0;\n" +
    "if(dis < u_radius)\n" +
    "{\n" +
    "float f0 = 1.0 -abs(u_radius - dis) / u_radius;\n" +
    "f0 = pow(f0, 64.0);\n" +
    "vec3 lineEndPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius;\n" +
    "float f = 0.0;\n" +
    "if(isPointOnLineRight(u_scanCenterEC.xyz, u_scanLineNormalEC.xyz, prjOnPlane.xyz))\n" +
    "{\n" +
    "float dis1= length(prjOnPlane.xyz - lineEndPt);\n" +
    "f = abs(twou_radius -dis1) / twou_radius;\n" +
    "f = pow(f, 3.0);\n" +
    "}\n" +
    "gl_FragColor = mix(gl_FragColor, u_scanColor, f + f0);\n" +
    "}\n" +
    "}\n";
  return scanSegmentShader;
}
