const { postToAppsScript, getFromAppsScript } = require('./_appsScript');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const data = await getFromAppsScript({ action: 'wishes' });
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const data = await postToAppsScript({
        action: 'wish',
        name: String(body.name || ''),
        message: String(body.message || ''),
        website: '',
      });
      return res.status(200).json(data);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ ok: false, error: error.message || 'Server error' });
  }
};
