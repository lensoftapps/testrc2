export const stringIsNullOrEmpty = (str: string) => {
  if(!str || str.length === 0)
    return true;
  return false;  
}

export class SerializationHelper {
  static toInstance<T>(obj: T, json: string) : T {
      var jsonObj = JSON.parse(json);

      const obj_ =  obj as any;
      if (typeof obj_["fromJSON"] === "function") {
          obj_["fromJSON"](jsonObj);
      }
      else {
          for (var propName in jsonObj) {
              obj_[propName] = jsonObj[propName]
          }
      }

      return obj;
  }
}

export const getBrand = () => {
  let p = require("../../package.json");
  return p.brand;
}

export const getAppName = () => {
  let p = require("../../package.json");
  return p.name;
}

export const getAppVersion = () => {
  let p = require("../../package.json");
  return p.version;
}

export const getAppIconPath = (name: string) => {
  let p = require("../../package.json");
  if('banner' === name)
    return p.config.forge.packagerConfig.icon + '_msi_banner.jpg';
  if('bg' === name)
    return p.config.forge.packagerConfig.icon + '_msi_bg.jpg';
  return p.config.forge.packagerConfig.icon + '.ico';
}

export const getAppCustomProtocol = () => {
  const brand = getBrand();
  if('wi' === brand)
    return 'omxebooks';
  return 'readcloud';
}

export const getAppUpgradeCode = () => {
  const brand = getBrand();
  if('wi' === brand)
    return '{4A3E87AF-9CCA-4066-B7DD-7CD309B30464}';
  return '{BC3C51BD-926A-4D89-827D-8C3196DC4ECA}'; // rc
}

export function is_Dev() {
  return require('electron-is-dev');
}