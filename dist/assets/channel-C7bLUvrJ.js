import { ap as Utils, aq as Color } from "./index-V2148MFu.js";
const channel = (color, channel2) => {
  return Utils.lang.round(Color.parse(color)[channel2]);
};
export {
  channel as c
};
