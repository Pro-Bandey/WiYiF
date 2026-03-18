import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID required' });

    try {
        const state = await kv.get(`invite:${id}`);
        if (!state) return res.status(404).json({ error: 'Invitation not found or expired' });
        
        return res.status(200).json(state);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve data' });
    }
}