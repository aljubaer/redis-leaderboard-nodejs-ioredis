require("dotenv").config();

const express = require("express");
const app = express();

const Redis = require("ioredis");
const redis = new Redis();

const PORT = process.env.PORT || 5000;

const SET_KEY = 'LEADERBOARD';

function formatResponse (array) {
    let response = [];
    for (let i = 0; i < array.length; i++) {
        if (i % 2) { 
            response.push({
                id: array[i-1],
                rank: parseInt(i / 2 + 1), 
                score: array[i]
            })
        }
    }
    return response;
}

app.get("/api", (req, res) => {
    res.sendStatus(200);
});

app.get('/api/leaderboard/rank/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await redis.zrevrank(SET_KEY, id);

        res.status(200).json(result);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const results = await redis.zrevrange(SET_KEY, 0, -1, "WITHSCORES");

        res.status(200).json(formatResponse(results));
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/api/leaderboard/:id/:score', async (req, res) => {
    const id = req.params.id;
    const score = +req.params.score;

    try {
        await redis.zadd(SET_KEY, score, id);
        const results = await redis.zrevrange(SET_KEY, 0, -1, "WITHSCORES");

        res.status(201).json(formatResponse(results));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});