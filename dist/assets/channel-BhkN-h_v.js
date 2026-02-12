import { ap as Utils, aq as Color } from "./index-DUc_R_dL.js";
const channel = (color, channel2) => {
  return Utils.lang.round(Color.parse(color)[channel2]);
};
export {
  channel as c
};
