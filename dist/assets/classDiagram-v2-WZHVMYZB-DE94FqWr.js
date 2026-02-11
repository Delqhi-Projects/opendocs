import { s as styles_default, c as classRenderer_v3_unified_default, a as classDiagram_default, C as ClassDB } from "./chunk-B4BG7PRW-B2r2d5Kn.js";
import { _ as __name } from "./index-BGbbBQdu.js";
import "./chunk-FMBD7UC4-F2f5z7lo.js";
import "./chunk-55IACEB6-DCh-QS53.js";
import "./chunk-QN33PNHL-B-xPQbdv.js";
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
