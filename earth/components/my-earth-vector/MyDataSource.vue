<script>
import MyDataSourceBase from "./MyDataSourceBase.vue";
import { setEntityStyles } from "../../js/vector/entityStyle";

export default {
  name: "MyEarthVector",
  mixins: [MyDataSourceBase],
  props: {
    styles: {
      type: [Object, Array, Function],
      default: () => {
        return null;
      },
    },
  },
  data() {
    return {
      localStyles: null,
    };
  },
  methods: {
    /**
     * 矢量图层的初始化
     */
    init() {
      this.initSource();
      this.initLayerFinish();

      this.setStyle();
    },
    setStyle(styles) {
      this.localStyles = styles || this.styles;
      this.source.entities.collectionChanged.addEventListener(
        (collection, added, removed, changed) => {
          // console.log(added);
          added.forEach((entity) => {
           setEntityStyles(entity,this.localStyles);
          });
        }
      );
    },
  },
};
</script>