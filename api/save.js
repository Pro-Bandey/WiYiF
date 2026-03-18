import Redis from 'ioredis';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Connect to your new Redis Database
    const redis = new Redis(process.env.REDIS_URL);

    try {
        const state = req.body;
        const id = Math.random().toString(36).substring(2, 8);

        // 30 days in seconds
        const EXPIRATION_SECONDS = 30 * 24 * 60 * 60;

        // Save to DB (We stringify the data for standard Redis)
        await redis.set(`invite:${id}`, JSON.stringify(state), 'EX', EXPIRATION_SECONDS);

        // Close connection safely
        await redis.quit();

        return res.status(200).json({ id, expires_in_days: 30 });
    } catch (error) {
        console.error("Redis Save Error:", error);
        redis.quit(); // Close connection even on error
        return res.status(500).json({ error: 'Failed to save to database' });
    }
}