// Midtrans notification handler removed as requested.
export default async function handler(req, res) {
  return res.status(410).json({ error: 'This endpoint is no longer active' });
}
