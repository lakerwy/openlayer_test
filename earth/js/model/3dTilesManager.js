// 全局3DTileSet
let globalTileset = new Map();

class TilesetCollection {
  getTileSet(id) {
    return globalTileset.get(id);
  }

  setTileSet(id, tileset) {
    globalTileset.set(id, tileset);
  }
}

export default TilesetCollection;
