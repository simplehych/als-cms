import { articleDeleteA, articleQueryAllA } from "../Article/wx_cloud_func";

export const requestArticleAll = async (
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) => {
  console.log("requestA", `${params} ${options}`)

  const result = await articleQueryAllA();

  const dataArr: API.ArticleItem[] = JSON.parse(result.resp_data).data
  dataArr.map((item, index) => {
    const article = { ...item }
    article.callNo = index
    return article
  })

  return {
    data: dataArr,
    success: true,
    total: dataArr.length,
  }
}

export const articleDelete = async (ids: string[]) => {
  return articleDeleteA(ids)
}

