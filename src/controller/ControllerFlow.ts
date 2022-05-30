import CommonDataManager from "./CommonDataManager";
import { stringIsNullOrEmpty } from "./util";
import * as path from "path";
import { getAuthURL, logout } from "./auth";

export default class ControllerFlow {

  static myInstance: ControllerFlow = null;

  _userID = "";


  /**
   * @returns {ControllerFlow}
   */
  static getInstance() {
      if (ControllerFlow.myInstance == null) {
        ControllerFlow.myInstance = new ControllerFlow();
      }

      return this.myInstance;
  }

  getUserID() {
      return this._userID;
  }

  setUserID(id: string) {
      this._userID = id;
  }

  getUrl() {//return "https://dlptest.com/https-post/";
    let uri = "";
    if(stringIsNullOrEmpty(CommonDataManager.getInstance().getAccessToken()))
      uri = getAuthURL();
    else {
      const p = path.join(__dirname, "../../bundle.html");
      const url = "file://" + p;
      //console.log(url);
      uri = url;
    }
    console.log("about to load url: " + uri);
    return uri;
  }

  getUrlLogout(redirectUrl: string) {
    return "https://accounts.readcloud.com/session/end?" + new URLSearchParams({
      "redirect_uri": redirectUrl,
    });
  }

  async doLogout() {
    await logout();
  }

}