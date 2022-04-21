import * as Cesium from "cesium";

class CircleWaveMaterialProperty {
  /**
   *
   * @param { Object } option
   * @param { Cesium.Color } option.color
   * @param { Number } option.duration
   * @param { Number } option.count
   * @param { Number } option.gradient
   */
  constructor(option = {}) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;

    this.color = option.color
      ? option.color
      : Cesium.Color.fromCssColorString("rgba(90,90,255, 1)");
    this.duration = Cesium.defaultValue(option.duration, 1e3);
    this.count = Cesium.defaultValue(option.count, 2);
    if (this.count <= 0) this.count = 1;
    this.gradient = Cesium.defaultValue(option.gradient, 0.1);
    if (this.gradient < 0) this.gradient = 0;
    else if (this.gradient > 1) this.gradient = 1;

    this._time = new Date().getTime();

    // 类型（会自动加载到cesium中）
    this.type = "CircleWave";

    // 着色器
    this.source = `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    material.diffuse = 1.5 * color.rgb;
    vec2 st = materialInput.st;
    vec3 str = materialInput.str;
    float dis = distance(st, vec2(0.5, 0.5));
    float per = fract(time);
    if (abs(str.z) > 0.001) {
      discard;
    }
    if (dis > 0.5) {
       discard;
    } else {
      float perDis = 0.5 / count;
      float disNum;
      float bl = 0.0;
      for (int i = 0; i <= 999; i++) {
         if (float(i) <= count) {
           disNum = perDis *float(i) - dis + per / count;
            if (disNum > 0.0) {
              if (disNum < perDis) {
                 bl = 1.0 - disNum / perDis;
              } else if(disNum - perDis < perDis) {
                 bl = 1.0 - abs(1.0 - disNum / perDis);
              }
              material.alpha = pow(bl, gradient);
            }
          }
        }
      }
      return material;
    }`;
    this.addMaterial();
  }

  getType() {
    return "CircleWave";
  }
  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }

    result.color = Cesium.Property.getValueOrClonedDefault(
      this._color,
      time,
      this.color,
      result.color
    );
    result.time =
      ((new Date().getTime() - this._time) % this.duration) / this.duration;
    result.count = this.count;
    result.gradient = 1 + 10 * (1 - this.gradient);

    return result;
  }
  equals(other) {
    return (
      this === other ||
      (other instanceof CircleWaveMaterialProperty &&
        Cesium.Property.equals(this._color, other._color))
    );
  }
  addMaterial() {
    Cesium.Material._materialCache.addMaterial(this.type, {
      fabric: {
        type: this.type,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          time: 1,
          count: 1,
          gradient: 0.1
        },
        source: this.source
      },

      translucent: material => {
        return true;
      }
    });

    // 注意Cesium.defineProperties会报错，需要改为Object
    Object.defineProperties(CircleWaveMaterialProperty.prototype, {
      isConstant: {
        get: () => {
          return Cesium.Property.isConstant(this._color);
        },
        configurable: true
      },
      definitionChanged: {
        get: () => {
          return this._definitionChanged;
        },
        configurable: true
      },
      color: {
        value: Cesium.createPropertyDescriptor("color"),
        configurable: true,
        writable: true
      }
    });
  }
}
export default CircleWaveMaterialProperty;
