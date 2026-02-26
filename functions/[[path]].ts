// functions/[[path]].ts
// 引入 Cloudflare Pages 函数的类型定义
import type { PagesFunction } from "@cloudflare/pages-plugin-utils";

// 使用正确的类型定义，避免 any 类型错误
export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  
  // 解析原始请求 URL
  const originalUrl = new URL(request.url);
  
  // 1. 如果是对 TMDB API 的直接请求，创建新的 Request 对象（解决 url 只读问题）
  let modifiedRequest = request;
  if (originalUrl.hostname === 'api.themoviedb.org') {
    // 构建新的 URL
    const newUrl = new URL(originalUrl.toString());
    newUrl.hostname = 'tmdb.melonhu.cn';
    newUrl.protocol = 'https:';
    
    // 创建新的 Request 对象（不能直接修改原对象的 url）
    modifiedRequest = new Request(newUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: request.redirect,
    });
  }

  // 2. 处理响应：替换响应内容中的 TMDB API 地址
  const response = await next(modifiedRequest);
  
  // 克隆响应对象以修改内容
  const responseClone = response.clone();
  
  // 只处理文本类型的响应（HTML/JS/CSS 等），避免破坏二进制文件
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('text/') || contentType.includes('application/javascript')) {
    let body = await responseClone.text();
    // 替换所有出现的 TMDB 官方 API 地址
    body = body.replace(/https:\/\/api\.themoviedb\.org/g, 'https://tmdb.melonhu.cn');
    
    // 返回修改后的响应
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  // 非文本响应直接返回原始响应
  return response;
};
