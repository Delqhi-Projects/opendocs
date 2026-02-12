import { s as styles_default, c as classRenderer_v3_unified_default, a as classDiagram_default, C as ClassDB } from "./chunk-B4BG7PRW-DMcIhkMQ.js";
import { _ as __name } from "./index-V2148MFu.js";
import "./chunk-FMBD7UC4-CBq1zu2j.js";
import "./chunk-55IACEB6-uLt9Y2GC.js";
import "./chunk-QN33PNHL-CMc2YxaB.js";
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
