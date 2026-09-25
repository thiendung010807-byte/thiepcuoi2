const { postToAppsScript } = require('./_appsScript');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const data = await postToAppsScript({
      action: 'rsvp',
      name: String(body.name || ''),
      attendance: String(body.attendance || ''),
      guests: String(body.guests || 0),
      message: String(body.message || ''),
      website: '',
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ ok: false, error: error.message || 'Server error' });
  }
};
