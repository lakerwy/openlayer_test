import CesiumTerrainProvider from "cesium/Source/Core/CesiumTerrainProvider";

export function getTerrain({ type, url }) {
  return new CesiumTerrainProvider({
    url: url
  });
}
