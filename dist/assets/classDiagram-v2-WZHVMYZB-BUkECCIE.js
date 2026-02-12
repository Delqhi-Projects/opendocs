import { s as styles_default, c as classRenderer_v3_unified_default, a as classDiagram_default, C as ClassDB } from "./chunk-B4BG7PRW-CLnNTbjz.js";
import { _ as __name } from "./index-DHwwA6CL.js";
import "./chunk-FMBD7UC4-BZ2CUy9A.js";
import "./chunk-55IACEB6-CvCB-R4h.js";
import "./chunk-QN33PNHL-Cg_3KX9T.js";
var diagram = {
  parser: classDiagram_default,
  get db() {
    return new ClassDB();
  },
  renderer: classRenderer_v3_unified_default,
  styles: styles_default,
  init: /* @__PURE__ */ __name((cnf) => {
    if (!cnf.class) {
      cnf.class = {};
    }
    cnf.class.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
  }, "init")
};
export {
  diagram
};
