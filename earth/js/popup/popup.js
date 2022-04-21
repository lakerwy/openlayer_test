import SceneTransforms from "cesium/Source/Scene/SceneTransforms";

export let PopupPositioning = {
  BOTTOM_LEFT: "bottom-left",
  BOTTOM_CENTER: "bottom-center",
  BOTTOM_RIGHT: "bottom-right",
  CENTER_LEFT: "center-left",
  CENTER_CENTER: "center-center",
  CENTER_RIGHT: "center-right",
  TOP_LEFT: "top-left",
  TOP_CENTER: "top-center",
  TOP_RIGHT: "top-right",
};

class MyCesiumPopup {
  /**
   *
   * @param { Object } options
   * @param {import("cesium/Source/Widgets/Viewer/Viewer")}  options.viewer
   * @param { HTMLELement } options.element
   * @param {import("cesium/Source/Core/Cartesian3")} options.position The position in WGS84 (world) coordinates.
   * @param {[left,top]} [options.offset] = [0,50]
   * @param { PopupPositioning | String } [options.positioning] = "bottom-center"
   */
  constructor(options) {
    options = options || {};

    if (!options.viewer) {
      throw new Error("popup:未传入viewer");
    }

    if (!options.element) {
      throw new Error("popup:未传入HTML DOM ELEMENT");
    }
    this.viewer = options.viewer;
    this.element = document.createElement("div");
    this.element.className = "my-earth-overlay-container";
    this.element.style.position = "absolute";
    this.element.style.pointerEvents = "auto";
    this.element.appendChild(options.element);

    this.setViewer();

    this.position = options.position;
    this.positioning = options.positioning || PopupPositioning.BOTTOM_CENTER;
    this.offset = options.offset || [0, -50];

    if (this.position) {
      this.setPosition(this.position);
    } else {
      this.element.style.display = "none";
    }
  }

  getViewer() {
    return this.viewer;
  }

  setViewer(viewer) {
    if (viewer) {
      this.viewer = viewer;
    }

    this.viewer.container.appendChild(this.element);
    this.viewer.clock.onTick.addEventListener(this.updateElement.bind(this));
  }

  setPosition(position) {
    this.position = position;

    this.updateElement();
  }

  updateElement() {
    if (!this.position) {
      return;
    }
    let position = SceneTransforms.wgs84ToWindowCoordinates(
      this.viewer.scene,
      this.position
    );

    if (!position) {
      return;
    }

    const x = position.x + this.offset[0];
    const y = position.y + this.offset[1];
    const width = this.element.offsetWidth;
    const height = this.element.offsetHeight;
    let left = x;
    let top = y;
    if (
      this.positioning == PopupPositioning.BOTTOM_RIGHT ||
      this.positioning == PopupPositioning.CENTER_RIGHT ||
      this.positioning == PopupPositioning.TOP_RIGHT
    ) {
      left = x - width;
    } else if (
      this.positioning == PopupPositioning.BOTTOM_CENTER ||
      this.positioning == PopupPositioning.CENTER_CENTER ||
      this.positioning == PopupPositioning.TOP_CENTER
    ) {
      left = x - width / 2;
    }
    if (
      this.positioning == PopupPositioning.BOTTOM_LEFT ||
      this.positioning == PopupPositioning.BOTTOM_CENTER ||
      this.positioning == PopupPositioning.BOTTOM_RIGHT
    ) {
      top = y - height;
    } else if (
      this.positioning == PopupPositioning.CENTER_LEFT ||
      this.positioning == PopupPositioning.CENTER_CENTER ||
      this.positioning == PopupPositioning.CENTER_RIGHT
    ) {
      top = y - height / 2;
    }

    this.element.style.left = left + "px";
    this.element.style.top = top + "px";
  }

  setOffset(offset) {
    this.offset = offset;
    if (!offset) {
      return;
    }
    this.updateElement();
  }

  setPositioning(positioning) {
    this.positioning = positioning;
    this.updateElement();
  }

  remove() {
    this.viewer.container.removeChild(this.element);
    this.viewer.clock.onTick.removeEventListener(this.updateElement.bind(this));
  }
}

export default MyCesiumPopup;
