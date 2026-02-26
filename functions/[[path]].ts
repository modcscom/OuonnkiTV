// functions/[[path]].ts
export async function onRequest(context) {
  const { request, next } = context;
  
  // 1. 克隆原始请求，避免修改原请求对象
  const newRequest = new Request(request);
  
  // 2. 如果是对 TMDB API 的直接请求，重写 URL
  const url = new URL(newRequest.url);
  if (url.hostname === 'api.themoviedb.org') {
    url.hostname = 'tmdb.melonhu.cn';
    url.protocol = 'https:';
    newRequest.url = url.toString();
  }

  // 3. 处理响应：替换响应内容中的 TMDB API 地址
  const response = await next(newRequest);
  const modifiedResponse = new Response(response.body, response);
  
  // 只处理文本类型的响应（HTML/JS/CSS 等），避免破坏二进制文件
  const contentType = modifiedResponse.headers.get('Content-Type') || '';
  if (contentType.includes('text/') || contentType.includes('application/javascript')) {
    let body = await modifiedResponse.text();
    // 替换所有出现的 TMDB 官方 API 地址
    body = body.replace(/https:\/\/api\.themoviedb\.org/g, 'https://tmdb.melonhu.cn');
    return new Response(body, modifiedResponse);
  }

  // 非文本响应直接返回
  return modifiedResponse;
}
