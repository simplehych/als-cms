import base64 from 'base-64';

export const encode = (content: string): string => {
  // 先 escape 防止超出 base64 范围
  const escapeStr = escape(content)
  return base64.encode(escapeStr)
}

export const decode = (content: string): string => {
  const decodeStr = base64.decode(content)
  return unescape(decodeStr)
}
