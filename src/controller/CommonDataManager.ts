import { app } from "electron";
import * as path from "path";
import { LoginData } from "../model/LoginData";
import jwt_decode from "jwt-decode";
import * as fs from "fs";
import { SerializationHelper, stringIsNullOrEmpty } from "./util";

export default class CommonDataManager {

  static myInstance: CommonDataManager = null;

  _appDataPathCommon = path.join(app.getPath('userData'), "rcl"); 

  //_userID = "";
  _proxyUserName = "";
  _proxyPassword = "";
  _accessToken = "";
  _loginData = new LoginData();


  /**
   * @returns {CommonDataManager}
   */
  static getInstance() {
      if (CommonDataManager.myInstance == null) {
          CommonDataManager.myInstance = new CommonDataManager();
          CommonDataManager.myInstance.loadFromFileAccessToken();
          CommonDataManager.myInstance.loadFromFileProxy();
      }

      return this.myInstance;
  }

  getLoginData() {
    return this._loginData; // _userID;
  }

  /*setUserID(id: string) {
      this._userID = id;
  }*/

  getProxyUserName() {
      return this._proxyUserName;
  }

  setProxyUserName(s: string) {
      this._proxyUserName = s;
  }

  getProxyPassword() {
      return this._proxyPassword;
  }

  setProxyPassword(s: string) {
      this._proxyPassword = s;
      this.saveToFileProxy();
  }

  getAccessToken() {
    return this._accessToken;
  }

  setAccessToken(s: string) {
    // main process
    this._accessToken = s;

    if(s){
      this._loginData = jwt_decode(s);
      this.saveToFileAccessToken();
      console.log("set login data");
      console.log(this._loginData.email);
    }
  }

  getAppDataPathCommon() {
    const p = this._appDataPathCommon;
    console.log("path: " + p);
    return p;
  }

  getAppDataPathCurrentUser() {
    const p = path.join(this.getAppDataPathCommon(), this._loginData.userId);
    return p;
  }

  getAppDataPathBooks() {
    const p = path.join(this.getAppDataPathCommon(), "Books");
    if (!fs.existsSync(p)){
      fs.mkdirSync(p);
    }
    return p;
  }

  logoutClearData(){
    this._loginData = new LoginData();
    this._accessToken = "";
    this.saveToFileAccessToken();
  }

  saveToFileAccessToken() {
    //const p = path.join(this.getAppDataPathCurrentUser(), this._loginData.userId);
    fs.writeFile(this.getAppDataPathCommon() + '/accessToken.dat', this._accessToken, (err)=>{
      if (err) {
        return console.error(err);
      }
      //console.log("File created!");
    }/* callback will go here */);
  }

  loadFromFileAccessToken() {
    try{
      console.log("load access token");
      this._accessToken = fs.readFileSync(this.getAppDataPathCommon() + '/accessToken.dat', 'utf8');
      if(!stringIsNullOrEmpty(this._accessToken)){
        this._loginData = jwt_decode(this._accessToken);
        //console.log(this._loginData);
      }      
    }
    catch(e){
      console.log("Error in loadFromFileLoginData: " + e);
    }    
  }

  saveToFileProxy() {
    //const p = path.join(this.getAppDataPathCurrentUser(), this._loginData.userId);
    fs.writeFile(this.getAppDataPathCommon() + '/proxy.dat', this._proxyUserName + ":" + this._proxyPassword, (err)=>{
      if (err) {
        return console.error(err);
      }
    }/* callback will go here */);
  }

  loadFromFileProxy() {
    try{
      const pdata = fs.readFileSync(this.getAppDataPathCommon() + '/proxy.dat', 'utf8');
      if(!stringIsNullOrEmpty(pdata)){
        this._proxyUserName = pdata.split(':')[0];
        this._proxyPassword = pdata.split(':')[1];
      }      
    }
    catch(e){
      console.log("Error in loadFromFileProxy: " + e);
    }    
  }

  /*saveToFileLoginData() {
    //const p = path.join(this.getAppDataPathCurrentUser(), this._loginData.userId);
    fs.writeFile(this.getAppDataPathCommon() + '/loginData.dat', JSON.stringify(this._loginData), (err)=>{
      if (err) {
        return console.error(err);
      }
      console.log("File created!");
    });
  }

  loadFromFileLoginData() {
    try{
      console.log("load login data");
      const jsonStr = fs.readFileSync(this.getAppDataPathCommon() + '/loginData.dat', 'utf8');
      this._loginData = SerializationHelper.toInstance(new LoginData(), jsonStr);
      console.log(this._loginData);
    }
    catch(e){
      console.log("Error in loadFromFileLoginData: " + e);
    }    
  }*/
}
