import { request } from 'umi'

import {
  PROXY_WX_CLOUD_UPLOAD_KEY,
  PROXY_WX_CLOUD_UPLOAD_TARGET
} from '../../../config/proxy';

import {
  getWxToken,
  updateWxAccessToken,
  WX_ENV,
  WX_ALS_IMAGE_PATH_ROOT,
  WX_URL_BATCH_DELETE_FILE,
  WX_URL_BATCH_DOWNLOAD_FILE,
  WX_URL_UPLOAD_FILE,
  WxResultBase
} from './wx_config';

type WxFile = {
  status: string,
  errmsg: string,
  fileid: string,
  download_url: string,
  max_age: number,
}

interface WxResultBatchDownloadFile extends WxResultBase {
  file_list: WxFile[]
}

type WxResultUploadFile = {
  url: string,
  token: string,
  authorization: string,
  file_id: string,
  cos_file_id: string
}

type WxResultBatchDeleteFile = {
  errcode: number,
  errmesg: string,
  delete_list: WxFile[]
}

// https://api.weixin.qq.com/tcb/uploadfile?access_token={{WX-CLOUD-ACCESS-TOKEN}}
export async function wxUploadFile(localFile: File, callback: (url: string) => void) {
  const fileName = localFile.name.split(".")[0];
  const currentTime = new Date().getTime();
  const remotePath = `${WX_ALS_IMAGE_PATH_ROOT}${fileName}_${currentTime}.png`;

  await request<WxResultUploadFile & WxResultBase>(WX_URL_UPLOAD_FILE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: getWxToken()
    },
    data: {
      env: WX_ENV,
      path: remotePath
    }
  }).then(async (resp) => {
    console.log("wxUploadFile then ", JSON.stringify(resp))
    await checkTokenInvalid(resp);
    wxUploadFileInner(resp.url, remotePath, resp.file_id, resp.authorization, resp.token, resp.cos_file_id, localFile, callback);

  }).catch((err) => {
    console.log("wxUploadFile catch ", err)
  });
}

// https://cos.ap-shanghai.myqcloud.com/636c-cloud1-9gefcf135bd114f3-1305682193/als-care/image/doraemon_1630753498808.png/
async function wxUploadFileInner(url: string,
  remotePath: string,
  fileId: string,
  signature: string,
  token: string,
  cosFileId: string,
  file: File,
  callback: (url: string) => void
) {

  if (!url) return;
  let proxyUrl = url;
  console.log('wxUploadFileInner origin url: ', url)
  if (url.includes(PROXY_WX_CLOUD_UPLOAD_TARGET)) {
    proxyUrl = url.replace(PROXY_WX_CLOUD_UPLOAD_TARGET, PROXY_WX_CLOUD_UPLOAD_KEY);
    console.log('wxUploadFileInner origin proxy url: ', proxyUrl)
  }

  const formData = new FormData();
  formData.append('key', remotePath)
  formData.append('Signature', signature)
  formData.append('x-cos-security-token', token)
  formData.append('x-cos-meta-fileid', cosFileId)
  formData.append('file', file, file.name)

  await request<WxResultBase>(proxyUrl, {
    method: 'POST',
    // headers: {
    //   'Content-Type': "multipart/form-data;", // 需要boundary约束，默认会添加
    // },
    data: formData

  }).then((resp) => {
    console.log("wxUploadFileInner then ", JSON.stringify(resp))
    wxBatchDownloadFile(fileId, callback);

  }).catch((err) => {
    console.log("wxUploadFileInner catch ", err)
  });
}

export async function wxBatchDownloadFile(fileId: string, callback: (url: string) => void) {
  const fileOb = [{ fileid: fileId, max_age: Number.MAX_VALUE }]
  wxBatchDownloadFileList(fileOb, callback);
}

export async function wxBatchDownloadFileList(fileList: { fileid: string; max_age: number; }[],
  callback: (url: string) => void) {
  await request<WxResultBatchDownloadFile>(WX_URL_BATCH_DOWNLOAD_FILE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: getWxToken()
    },
    data: {
      env: WX_ENV,
      file_list: fileList
    }
  }).then(async (resp) => {
    console.log("wxBatchDownloadFile then ", JSON.stringify(resp))
    callback(resp.file_list[0].download_url)

  }).catch((err) => {
    console.log("wxBatchDownloadFile catch ", err)
  });
}

export async function wxBatchDeleteFile(fileId: string) {
  wxBatchDeleteFileList([fileId])
}
export async function wxBatchDeleteFileList(fileIdList: string[]) {
  await request<WxResultBatchDeleteFile>(WX_URL_BATCH_DELETE_FILE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: getWxToken()
    },
    data: {
      env: WX_ENV,
      fileid_list: fileIdList
    }
  }).then(async (resp) => {
    console.log("wxBatchDeleteFileList then ", JSON.stringify(resp))

  }).catch((err) => {
    console.log("wxBatchDeleteFileList catch ", err)
  });
}

async function checkTokenInvalid(resp: WxResultBase) {
  if (resp.errorcode === 40001) {
    console.log('checkTokenInvalid', 'true')
    await updateWxAccessToken();
    return true;
  }
  console.log('checkTokenInvalid', 'false')
  return false;
}