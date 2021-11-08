
import { request } from 'umi'

import {
  getWxToken,
  WxResultBase,
  WX_ENV,
  WX_URL_DATABASE_QUERY
} from './wx_config';

type Page = {
  Offset: number,
  Limit: number,
  Total: number
}

interface ListResult<T> extends WxResultBase {
  pager: Page,
  data: T[]
}

export async function queryList<T>(tableName: string,  count: string, condition: object) {
  // Object.keys(condition).forEach(key => {
  //   const value = condition[key]
  // });
  const queryStatement = `db.collection("${tableName}")
  .where(${JSON.stringify(condition)})
  .limit(${count})
  .get()`
  console.log("queryList statement: ", queryStatement);
  return await request<ListResult<T>>(WX_URL_DATABASE_QUERY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: getWxToken(),
    },
    data: {
      env: WX_ENV,
      query: queryStatement,
    }
  })
}

export async function query(statement: string) {
  return await request(WX_URL_DATABASE_QUERY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: getWxToken(),
    },
    data: {
      env: WX_ENV,
      query: statement,
    }
  })
}

export async function queryCallback(
  statement: string,
  callback: { success: (data: string) => any, fail: (err: string) => any }
) {
  await request(WX_URL_DATABASE_QUERY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: getWxToken,
    },
    data: {
      env: WX_ENV,
      query: statement,
    }
  }).then((resp) => {
    console.log("queryCallback then ", resp.data[0])
    callback.success(JSON.stringify(resp.data[0]))
  }).catch((err) => {
    console.log("queryCallback catch ", err)
    callback.fail(err)
  });
}


