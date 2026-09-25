const getScriptUrl = () => {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) {
    const error = new Error('GOOGLE_SCRIPT_URL chưa được cấu hình trên Vercel.');
    error.statusCode = 500;
    throw error;
  }
  return url;
};

async function parseAppsScriptResponse(response) {
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    const error = new Error('Apps Script trả về dữ liệu không hợp lệ.');
    error.statusCode = 502;
    throw error;
  }

  if (!response.ok || !data?.ok) {
    const error = new Error(data?.error || `Apps Script lỗi HTTP ${response.status}`);
    error.statusCode = 502;
    throw error;
  }
  return data;
}

async function postToAppsScript(payload) {
  const response = await fetch(getScriptUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: new URLSearchParams(payload),
    redirect: 'follow',
  });
  return parseAppsScriptResponse(response);
}

async function getFromAppsScript(params = {}) {
  const url = new URL(getScriptUrl());
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  url.searchParams.set('_t', Date.now().toString());
  const response = await fetch(url, { method: 'GET', redirect: 'follow', cache: 'no-store' });
  return parseAppsScriptResponse(response);
}

module.exports = { postToAppsScript, getFromAppsScript };
