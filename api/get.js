import Redis from 'ioredis';

export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID required' });

    // Connect to your new Redis Database
    const redis = new Redis(process.env.REDIS_URL);

    try {
        // Get data from DB
        const data = await redis.get(`invite:${id}`);

        // Close connection safely
        await redis.quit();

        if (!data) return res.status(404).json({ error: 'Invitation expired or not found' });

        // Parse the string back into JSON and return
        return res.status(200).json(JSON.parse(data));
    } catch (error) {
        console.error("Redis Get Error:", error);
        redis.quit();
        return res.status(500).json({ error: 'Failed to retrieve data' });
    }
}