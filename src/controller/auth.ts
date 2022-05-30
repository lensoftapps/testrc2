import { URL } from "url";
import axios from "axios";
import jwt_decode from "jwt-decode";

const clientId = "electrontest";
export const redirectUrl = "http://localhost/oauth/redirect";

/**
 * Generate a random string of x length
 * @param length
 * @returns
 */
export const makeid = (length: number) => {
  var result = '';
  var characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

export const getAuthURL = () => {
  return getAuthenticationURL(clientId, redirectUrl);
}

/**
 * Return our authentication URL
 * @param clientId
 * @param redirectUri
 * @returns
 */
export const getAuthenticationURL = (clientId: string, redirectUri: string) => {
  const state = makeid(32);
  return (
    "https://" +
    "accounts.readcloud.com" +
    "/auth?" +
    "scope=openid profile email offline_access&" +
    "response_type=code&" +
    "response_mode=query&" +
    "client_id=" +
    clientId +
    "&state" +
    state +
    "&redirect_uri" +
    redirectUri
  );
}

export const getTokensDefault = async (url: string) => {
  return getTokens(url, clientId, redirectUrl);
}

export const getTokens = async (url: string, clientId: string, redirectUri: string) => {
  const parts = new URL(url);
  const query = parts.searchParams;

  const result = await axios.post("https://accounts.readcloud.com/token", new URLSearchParams({
    "grant_type": "authorization_code",
    "client_id": clientId,
    "redirect_uri": redirectUri,
    "code": query.get("code")
  }).toString());

  try{
    return result.data.access_token;
  }
  catch(e) {}
  return null;

  //console.log("result", result.data);

  //console.log("Access Token", result.data.access_token);

  //const decoded = jwt_decode(result.data.access_token);
 
  //console.log(decoded);

}

export const logout = async () => {

  const result = await axios.get("https://accounts.readcloud.com/session/end?" + new URLSearchParams({
    "redirect_uri": redirectUrl,
  }));

  console.log("Logged out");

}