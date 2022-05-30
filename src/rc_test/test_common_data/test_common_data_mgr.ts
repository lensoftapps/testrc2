export default class CommonDataManager {

    static myInstance: CommonDataManager = null;

    _userID = "";
    _proxyUserName = "";
    _proxyPassword = "";


    /**
     * @returns {CommonDataManager}
     */
    static getInstance() {
        if (CommonDataManager.myInstance == null) {
            CommonDataManager.myInstance = new CommonDataManager();
        }

        return this.myInstance;
    }

    getUserID() {
        return this._userID;
    }

    setUserID(id: string) {
        this._userID = id;
    }

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
    }
}