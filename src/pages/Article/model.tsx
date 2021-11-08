import { request } from 'umi'

import { getWxToken, WX_ENV, WX_URL_DATABASE_QUERY } from './wx_config';

type Result = {
  errorcode: number,
  errormsg: string
}

type Page = {
  Offset: number,
  Limit: number,
  Total: number
}

type ARTICLE = {
  title: string,
  content: string
}

interface ArticleResult extends Result {
  pager: Page,
  data: ARTICLE[]
}

export async function queryArticle(id: string) {
  console.log("queryArticle token: ", getWxToken())
  const queryStatement = `db.collection("article").where({_id:"${id}"}).limit(1).get()`
  return await request<ArticleResult>(WX_URL_DATABASE_QUERY, {
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

export async function queryArticleCallback(
  id: string,
  callback: { success: (data: string) => any, fail: (err: string) => any }
) {
  const queryStatement = `db.collection("article").where({_id:"${id}"}).limit(1).get()`
  await request<ArticleResult>(WX_URL_DATABASE_QUERY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: getWxToken,
    },
    data: {
      env: WX_ENV,
      query: queryStatement,
    }
  }).then((resp) => {
    console.log("queryArticle then ", resp.data[0])
    callback.success(JSON.stringify(resp.data[0]))
  }).catch((err) => {
    console.log("queryArticle catch ", err)
    callback.fail(err)
  });
}

