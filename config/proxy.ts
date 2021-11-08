/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */

export const PROXY_WX_CLOUD_API_KEY = '/api-wx-cloud';
export const PROXY_WX_CLOUD_API_TARGET = 'https://api.weixin.qq.com';

export const PROXY_WX_CLOUD_UPLOAD_KEY = '/upload-wx-cloud';
export const PROXY_WX_CLOUD_UPLOAD_TARGET = 'https://cos.ap-shanghai.myqcloud.com';

export default {
  dev: {
    '/api/': {
      target: 'https://preview.pro.ant.design',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/api-wx-cloud': {
      target: PROXY_WX_CLOUD_API_TARGET,
      changeOrigin: true,
      pathRewrite: { '^/api-wx-cloud': '' },
    },
    '/upload-wx-cloud': {
      target: PROXY_WX_CLOUD_UPLOAD_TARGET,
      changeOrigin: true,
      pathRewrite: { '^/upload-wx-cloud': '' },
    },
  },
  test: {
    '/api/': {
      target: 'https://preview.pro.ant.design',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
