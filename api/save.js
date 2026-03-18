import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const state = req.body;
        const id = Math.random().toString(36).substring(2, 8);
        
        // Save to DB with Expiration (ex = seconds). 30 days = 2592000 seconds
        const EXPIRATION_SECONDS = 30 * 24 * 60 * 60; 
        
        await kv.set(`invite:${id}`, state, { ex: EXPIRATION_SECONDS });
        
        return res.status(200).json({ id, expires_in_days: 30 });
    } catch (error) {
        console.error("KV Save Error:", error);
        return res.status(500).json({ error: 'Failed to save to database' });
    }
}