import { request } from 'umi'

import {
  PROXY_WX_CLOUD_API_KEY,
} from '../../../config/proxy'

export const WX_APP_ID = "wxcc932cecb20613d7";
export const WX_APP_SECRET = "643c7a9e3a4b11daf808efb24deffca9";
export const WX_ENV = "cloud1-9gefcf135bd114f3";

// 本项目-微信配置
export const WX_ALS_IMAGE_PATH_ROOT = "als-care/image/"
export const WX_ALS_CLOUD_FUNCTION_NAME = "alsCare"

// token
export const WX_URL_TOKEN = `${PROXY_WX_CLOUD_API_KEY}/cgi-bin/token`;

// 云函数
export const WX_URL_CLOUD_FUNCTION = `${PROXY_WX_CLOUD_API_KEY}/tcb/invokecloudfunction`;

// 文件
export const WX_URL_UPLOAD_FILE = `${PROXY_WX_CLOUD_API_KEY}/tcb/uploadfile`;
export const WX_URL_BATCH_DOWNLOAD_FILE = `${PROXY_WX_CLOUD_API_KEY}/tcb/batchdownloadfile`;
export const WX_URL_BATCH_DELETE_FILE = `${PROXY_WX_CLOUD_API_KEY}/tcb/batchdeletefile`;

// 数据库
export const WX_URL_DATABASE_ADD = `${PROXY_WX_CLOUD_API_KEY}/tcb/databaseadd`;
export const WX_URL_DATABASE_QUERY = `${PROXY_WX_CLOUD_API_KEY}/tcb/databasequery`;
export const WX_URL_DATABASE_UPDATE = `${PROXY_WX_CLOUD_API_KEY}/tcb/databaseupdate`;
export const WX_URL_DATABASE_DELETE = `${PROXY_WX_CLOUD_API_KEY}/tcb/databasedelete`;

export type WxResultBase = {
  errcode: number,
  errmsg: string,
}

type WxResultToken = {
  access_token: string
  expires_in: number
}

let wxAccessToken = "";

export function getWxToken(): string {
  return wxAccessToken;
}

export async function updateWxAccessToken() {
  await request<WxResultToken>(WX_URL_TOKEN, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      grant_type: 'client_credential',
      appid: `${WX_APP_ID}`,
      secret: `${WX_APP_SECRET}`
    }
  }).then((resp) => {
    console.log("wxGetAccessToken then ", resp.access_token)
    wxAccessToken = resp.access_token;

  }).catch((err) => {
    console.log("wxGetAccessToken catch ", err)
  });
}

/**
 * 检查token
 */
export const checkToken = async (result: WxResultBase) => {
  if (!result) return false
  const code = result.errcode
  const TOKEN_MISS = 41001 // token miss 缺失
  const TOKEN_INVALID = 40001 // token invalid 无效 
  const TOKEN_ILLEGAL = 40014 // token illegal 不合法 
  if (
    TOKEN_MISS === code
    || TOKEN_INVALID === code
    || TOKEN_ILLEGAL === code
  ) {
    await updateWxAccessToken()
    return false
  }
  return true
}
