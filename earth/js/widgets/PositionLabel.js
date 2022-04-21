import defined from "cesium/Source/Core/defined";
import destroyObject from "cesium/Source/Core/destroyObject";
import DeveloperError from "cesium/Source/Core/DeveloperError";
import getElement from "cesium/Source/Widgets/getElement";
import ScreenSpaceEventHandler from "cesium/Source/Core/ScreenSpaceEventHandler";
import ScreenSpaceEventType from "cesium/Source/Core/ScreenSpaceEventType";
import Cartographic from "cesium/Source/Core/Cartographic";
import CesiumMath from "cesium/Source/Core/Math";

class PositionLabel {
  constructor(container, viewer) {
    if (!defined(container)) {
      throw new DeveloperError("container is required.");
    }

    container = getElement(container);

    let element = document.createElement("div");
    element.id = "cesium-viewer-footer";
    container.appendChild(element);

    let childElement = document.createElement("div");
    childElement.className = "cesium-footer cesium-position-label";
    element.appendChild(childElement);

    // Mouse over the globe to see the cartographic position
    let scene = viewer.scene;
    let handler = new ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(movement => {
      let cartesian = viewer.camera.pickEllipsoid(
        movement.endPosition,
        scene.globe.ellipsoid
      );
      if (cartesian) {
        let cartographic = Cartographic.fromCartesian(cartesian);
        let longitudeString = CesiumMath.toDegrees(
          cartographic.longitude
        ).toFixed(8);
        let latitudeString = CesiumMath.toDegrees(
          cartographic.latitude
        ).toFixed(8);
        let viewHeight = viewer.camera.positionCartographic.height;
        viewHeight =
          viewHeight > 1000
            ? `${Math.round(viewHeight / 1000)}千米`
            : `${Math.round(viewHeight)}米`;
        let pitch = CesiumMath.toDegrees(viewer.camera.pitch).toFixed(0);
        let heading = CesiumMath.toDegrees(viewer.camera.heading).toFixed(0);
        childElement.innerHTML =
          `经度：<span class="long">${longitudeString}°</span>` +
          `纬度：<span class="long">${latitudeString}°</span>` +
          `俯视角：<span>${pitch}°</span>` +
          `方向：<span>${heading}°</span>` +
          `高度：<span class="long">${viewHeight}</span>`;
      } else {
        childElement.innerHTML = "";
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    this._container = container;
    this._element = element;
  }

  get container() {
    return this._container;
  }

  destroy() {
    this._container.removeChild(this._element);
    return destroyObject(this);
  }
}

export default PositionLabel;
