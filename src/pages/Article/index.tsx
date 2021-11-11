/* eslint-disable no-console */
import React, { useEffect, useRef, useState } from 'react';
import ReactWEditor from '@/components/WangEditor';

import { request, history } from 'umi'
import {
  PROXY_WX_CLOUD_API_KEY,
  PROXY_WX_CLOUD_UPLOAD_KEY,
  PROXY_WX_CLOUD_UPLOAD_TARGET,
} from '../../../config/proxy'

import styles from './index.less';
import { queryArticle } from './model';
import { updateWxAccessToken } from './wx_config';
import { queryList } from './wx_database';
import { articleAdd, articleQuery, articleQueryAll, articleUpdateA } from './wx_cloud_func';
import { wxUploadFile } from './wx_file';
import { Affix, PageHeader, Form, Input, InputNumber, Button, Row, Space, Drawer, BackTop, message, Modal } from 'antd';
import {
  ExclamationCircleOutlined,
  UpOutlined,
} from '@ant-design/icons';

export default ({ location }): React.ReactNode => {
  // eslint-disable-next-line no-underscore-dangle
  const oldData: API.ArticleItem = location?.state
  const defaultContentHtml = oldData?.content;
  const [contentHtml, setContentHtml] = useState(defaultContentHtml)
  const [showPreviewView, setShowPreviewView] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formInstance] = Form.useForm()
  const editorRef = useRef(null);

  useEffect(() => {
    console.log("模拟componentDidMount，即只运行一次该函数 ", JSON.stringify(location));
    // 填充旧数据
    fillOldData()
    // 滑动到页面顶部
    scrollTo(0, 0)
  }, []);

  const layout = {
    labelCol: { span: 2 },
    wrapperCol: { span: 19 },
  };

  /* eslint-disable no-template-curly-in-string */
  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!',
      number: '${label} is not a valid number!',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  };

  const activeValidate = () => {
    formInstance.validateFields()
  }

  // 当前输入框改变的值
  const onValuesChange = (value: any) => {
    console.log("onValuesChange value: ", JSON.stringify(value));
  }

  const onClickPreview = () => {
    // form.date = new Date().getDate
    setShowPreviewView(true)
  }

  const onFinish = (allValues: any) => {
    const submitOb = {
      ...allValues,
      id: oldData?._id, content: contentHtml, updatedAt: new Date()
    }
    console.log("onFinish ", JSON.stringify(submitOb));
    setSubmitting(true)
    articleAdd(submitOb, {
      onSuccess: () => {
        setSubmitting(false)
        history.goBack()
      },
      onFail: () => {
        setSubmitting(false)
        message.error('This is an error message')
      }
    })
  };

  const { confirm } = Modal;

  function showConfirm() {
    confirm({
      title: '内容未提交，是否退出?',
      icon: <ExclamationCircleOutlined />,
      content: '',
      onOk() { history.goBack() },
      onCancel() { },
    });
  }

  const clickBack = () => {
    if (submitting) {
      message.info('正在提交中，请稍等')
      return
    }
    if(isEmptyStr(contentHtml)) {
      history.goBack()
      return
    }
    showConfirm()
  }
  const onReset = () => {
    if (editorRef) {
      editorRef.current.setContentByHTMLString("")
    }
    formInstance.resetFields();
  };

  const fillOldData = () => {
    if (oldData) formInstance.setFieldsValue(oldData);
  };

  return (
    <div>
      <p>
        <Form
          {...layout}
          form={formInstance}
          onFinish={onFinish}
          // onValuesChange={onValuesChange}
          validateMessages={validateMessages}>

          <Affix offsetTop={50} onChange={affixed => console.log("Affix", affixed)}>
            <Row justify="space-between" style={{ background: "#EEEEEE" }} align="middle">
              <PageHeader
                className="site-page-header"
                onBack={clickBack}
                title="文章编辑"
                subTitle=""
              />
              <Space style={{ margin: 10 }}>
                <Button type="default" htmlType="button" size="large" onClick={onReset} >重置</Button>
                <Button type="default" htmlType="button" size="large" onClick={onClickPreview} >预览</Button>
                <Button type="primary" htmlType="submit" size="large" loading={submitting}>提交</Button>
              </Space>
            </Row>
          </Affix>
          <div style={{ height: 30 }} />
          <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="source" label="来源"><Input.TextArea /></Form.Item>
          <Form.Item name="class" label="分类"><Input.TextArea /></Form.Item>
          <Form.Item label="内容">
            <Form.Item
              name="username"
              noStyle
              rules={[{ message: '直接包裹才会绑定表单，见 https://ant.design/components/form-cn/#components-form-demo-complex-form-control' }]}
            />
            <Row >
              <ReactWEditor ref={editorRef}
                className={styles.wangeditor}
                defaultValue={contentHtml}
                config={{
                  height: 500,
                  customUploadImg: (resultFiles: File[], insertImgFn: (url: string) => void) => {
                    // resultFiles 是 input 中选中的文件列表
                    // insertImgFn 是获取图片 url 后，插入到编辑器的方法
                    // 上传图片，返回结果，将图片插入到编辑器中
                    console.log('customUploadImg', resultFiles)
                    wxUploadFile(resultFiles[0], (url) => {
                      console.log('customUploadImg', url)
                      insertImgFn(url)
                    })
                  },
                }}
                linkImgCallback={(src, alt, href) => {
                  // 插入网络图片的回调事件
                  console.log('图片 src ', src)
                  console.log('图片文字说明', alt)
                  console.log('跳转链接', href)
                }}
                onlineVideoCallback={(video) => {
                  // 插入网络视频的回调事件
                  console.log('插入视频内容', video)
                }}
                onChange={(html) => {
                  console.log('onChange html:', html)
                  setContentHtml(html)
                }}
                onBlur={(html) => {
                  console.log('onBlur html:', html)
                }}
                onFocus={(html) => {
                  console.log('onFocus html:', html)
                }}
              />
            </Row>
          </Form.Item>
        </Form>

        <Drawer
          width={600}
          visible={showPreviewView}
          onClose={() => {
            setShowPreviewView(false);
          }}
          closable={false}
        >
          <div>{JSON.stringify(formInstance.getFieldsValue())}</div>
          <div dangerouslySetInnerHTML={{ __html: (contentHtml) }} />
        </Drawer>
      </p>
      <p onClick={() => submitArticle({ title: "title", content: contentHtml })}><button>提交</button></p>
      <p onClick={() => {
        articleQuery("14139e126134bfe609ce74a5339e4853")
          .then((resp) => { console.log("queryArticle then ", resp.data[0]) })
          .catch()
      }}>
        <button>查询14139e126134bfe609ce74a5339e4853</button>
      </p>
      <p onClick={() => {
        articleUpdateA()
      }}>
        <button>测试云函数 invokeCloudFunction</button>
      </p>
      <p onClick={updateWxAccessToken}>获取AccessToken</p>
      <p onClick={testDownloadFile}>testDownloadFile</p>
      <p onClick={testDeleteFile}>testDeleteFile</p>
      <p onClick={() => queryList("article", "1", { _id: "14139e126134bfe609ce74a5339e4853" })}>测试查询语句</p>
      <p>当前编辑的 html 如下：</p>
      <p>{contentHtml}</p>
      <Affix offsetBottom={10}>
        <Button type="primary" onClick={() => activeValidate()}>
          检查
        </Button>
      </Affix>
      <BackTop
        visibilityHeight={50}
        style={{
          height: 50, width: 50, lineHeight: '50px', borderRadius: 25, right: '50px',
          backgroundColor: '#1088e9', color: '#fff', textAlign: 'center', fontSize: 14,
        }}
      >
        <UpOutlined />
      </BackTop>
    </div>
  );
};

const WX_APP_ID = "wxcc932cecb20613d7";
const WX_APP_SECRET = "643c7a9e3a4b11daf808efb24deffca9";
const WX_ENV = "cloud1-9gefcf135bd114f3";
const ALS_IMAGE_PATH_ROOT = "als-care/image/"

const WX_URL_TOKEN = `${PROXY_WX_CLOUD_API_KEY}/cgi-bin/token`;
const WX_URL_UPLOAD_FILE = `${PROXY_WX_CLOUD_API_KEY}/tcb/uploadfile`;
const WX_URL_BATCH_DOWNLOAD_FILE = `${PROXY_WX_CLOUD_API_KEY}/tcb/batchdownloadfile`;
const WX_URL_BATCH_DELETE_FILE = `${PROXY_WX_CLOUD_API_KEY}/tcb/batchdeletefile`;
const WX_URL_DATABASE_ADD = `${PROXY_WX_CLOUD_API_KEY}/tcb/databaseadd`;
const WX_URL_DATABASE_QUERY = `${PROXY_WX_CLOUD_API_KEY}/tcb/databasequery`;
const WX_URL_DATABASE_UPDATE = `${PROXY_WX_CLOUD_API_KEY}/tcb/databaseupdate`;

let wxAccessToken: string = "48_zHwTn0rZpWTOdsBPxoSZAsNdlVkLfBsfgYBgt-5evyvk4sw6vBXBS5z6u1AcL1N4ApjVdKxUTyRCtWGZ1oOMKcHWL5XB3Avwd0xrDYEuNtbPDhA26mr-KLaSgYYrFbCpHsxWLW6jlK4K7VTNMUOaAHAZHB";

type RESULT_WX = {
  errorcode: number,
  errormsg: string,
}

type RESULT_WX_TOKEN = {
  access_token: string
  expires_in: number
}

type RESULT_WX_UPLOAD_FILE = {
  url: string,
  token: string,
  authorization: string,
  file_id: string,
  cos_file_id: string
}

async function submitArticle(articleBean: ARTICLE) {
  if (nullAccessToken()) await wxGetAccessToken();
  const { title, content } = articleBean
  const encodeContent = escape(content)
  const date = new Date().getDate
  const queryStatement = `db.collection("article").add({data:[{
    title:"${title}",
    content:"${encodeContent}",
    date:"${date}"
  }]})`
  await request<RESULT_WX>(WX_URL_DATABASE_ADD, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: wxAccessToken,
    },
    data: {
      env: WX_ENV,
      query: queryStatement,
    }
  }).then((resp) => {
    console.log("submitArticle then ", resp.errormsg)

  }).catch((err) => {
    console.log("submitArticle catch ", err)
  });
}

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

async function queryArticle1(id: string | null) {
  if (nullAccessToken()) await wxGetAccessToken();
  const queryStatement = `db.collection("article").where({_id:"${id}"}).limit(1).get()`
  await request<ArticleResult>(WX_URL_DATABASE_QUERY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: wxAccessToken,
    },
    data: {
      env: WX_ENV,
      query: queryStatement,
    }
  }).then((resp) => {
    console.log("queryArticle then ", resp.data[0])
  }).catch((err) => {
    console.log("queryArticle catch ", err)
  });
}

async function wxGetAccessToken() {
  await request<RESULT_WX_TOKEN>(WX_URL_TOKEN, {
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

// https://api.weixin.qq.com/tcb/uploadfile?access_token={{WX-CLOUD-ACCESS-TOKEN}}
async function wxUploadFilexx(localFile: File, callback: (url: string) => void) {
  if (nullAccessToken()) await wxGetAccessToken();
  const fileName = localFile.name.split(".")[0];
  const currentTime = new Date().getTime();
  const remotePath = `${ALS_IMAGE_PATH_ROOT}${fileName}_${currentTime}.png`;

  await request<RESULT_WX_UPLOAD_FILE & RESULT_WX>(WX_URL_UPLOAD_FILE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: wxAccessToken
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

  if (nullAccessToken()) await wxGetAccessToken();
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

  await request<RESULT_WX>(proxyUrl, {
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

type WX_FILE = {
  fileid: string,
  max_age: number,
}

type RESULT_WX_BATCH_DOWNLOAD_FILE = {
  errcode: number,
  errmesg: string,
  file_list: {
    fileid: string,
    download_url: string,
    status: string,
    errmsg: string,
  }[]
}

function testDownloadFile() {
  const testFileId = "cloud://cloud1-9gefcf135bd114f3.636c-cloud1-9gefcf135bd114f3-1305682193/als-care/image/doraemon_1630837941602.png";
  const testFileId1 = "cloud://cloud1-9gefcf135bd114f3.636c-cloud1-9gefcf135bd114f3-1305682193/als-care/image/100th-aniniversary.png";
  wxBatchDownloadFile(testFileId, (url) => {

  })
}

async function wxBatchDownloadFile(fileId: string, callback: (url: string) => void) {
  const fileOb: WX_FILE[] = [{ fileid: fileId, max_age: Number.MAX_VALUE }]
  wxBatchDownloadFileList(fileOb, callback);
}

async function wxBatchDownloadFileList(fileList: WX_FILE[], callback: (url: string) => void) {
  if (nullAccessToken()) await wxGetAccessToken();
  await request<RESULT_WX_BATCH_DOWNLOAD_FILE>(WX_URL_BATCH_DOWNLOAD_FILE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: wxAccessToken
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


type RESULT_WX_BATCH_DELETE_FILE = {
  errcode: number,
  errmesg: string,
  delete_list: {
    fileid: string,
    status: string,
    errmsg: string,
  }[]
}

function testDeleteFile() {
  const fileId = "cloud://cloud1-9gefcf135bd114f3.636c-cloud1-9gefcf135bd114f3-1305682193/als-care/image/doraemon_1630838532540.png";
  wxBatchDeleteFile(fileId);
}
async function wxBatchDeleteFile(fileId: string) {
  wxBatchDeleteFileList([fileId])
}
async function wxBatchDeleteFileList(fileIdList: string[]) {
  if (nullAccessToken()) await wxGetAccessToken();
  await request<RESULT_WX_BATCH_DELETE_FILE>(WX_URL_BATCH_DELETE_FILE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      access_token: wxAccessToken
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



function nullAccessToken(): boolean {
  // if (wxAccessToken) return false;
  // return true;
  return false;
}

async function checkTokenInvalid(resp: RESULT_WX) {
  if (resp.errorcode === 40001) {
    console.log('checkTokenInvalid', 'true')
    await wxGetAccessToken();
    return true;
  }
  console.log('checkTokenInvalid', 'false')
  return false;
}

function isEmptyStr(str: string) {
  return typeof str === 'undefined' || str == null || str === '';
}

function isEmptyArr(arr: []) {
  return Array.isArray(arr) && arr.length
}