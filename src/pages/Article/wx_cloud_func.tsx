import { request } from 'umi'
import {
  WX_ALS_CLOUD_FUNCTION_NAME,
  getWxToken,
  WxResultBase,
  WX_ENV, WX_URL_CLOUD_FUNCTION, checkToken, updateWxAccessToken
} from './wx_config'

interface WxResultCloudFunc extends WxResultBase {
  resp_data: string
}

interface Callback {
  onSuccess: (res: any) => void
  onFail: (err: any) => void
}

const invokeCloudFunctionC = async (type: string, node: string, data: any, callback: Callback | null) => {
  await request<WxResultCloudFunc>(WX_URL_CLOUD_FUNCTION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: getWxToken(),
      env: WX_ENV,
      name: WX_ALS_CLOUD_FUNCTION_NAME,
    },
    data: { type, node, data }
  }).then(async (res) => {
    const tokenNormal = await checkToken(res)
    if (!tokenNormal) {
      invokeCloudFunctionC(type, node, data, callback)
      return
    }
    if (callback) callback.onSuccess(res)
  }).catch((err) => {
    if (callback) callback.onFail(err)
  })
}

export function articleAdd<T>(data: T, callback: Callback) {
  return invokeCloudFunctionC("article", "update", data, callback)
}

export function articleQuery(id: string) {
  const data = { id }
  return invokeCloudFunctionC("article", "retrieve", data, null)
}

export function articleQueryAll() {
  return invokeCloudFunctionC("article", "retrieve", {}, null)
}

export function articleQueryAllA() {
  return invokeCloudFunction("article", "retrieve", {})
}

export function articleDeleteA(ids: string[]) {
  const data = { ids }
  
  return invokeCloudFunction("article", "delete", data)
}

async function invokeCloudFunction(type: string, node: string, data: any | null) {
  if (!getWxToken()) await updateWxAccessToken()
  return await request<WxResultCloudFunc>(WX_URL_CLOUD_FUNCTION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: getWxToken(),
      env: WX_ENV,
      name: WX_ALS_CLOUD_FUNCTION_NAME,
    },
    data: { type, node, data }
  })
}


