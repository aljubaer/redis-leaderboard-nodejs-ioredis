require("dotenv").config();

const express = require("express");
const app = express();

const Redis = require("ioredis");
const redis = new Redis();

const PORT = process.env.PORT || 5000;

const SET_KEY = 'LEADERBOARD';

function arrayToJsonResponse (array) {
    let jsonResponse = {};
    for (let i = 0; i < array.length; i++) {
        if (i % 2) jsonResponse[array[i-1]] = array[i];
    }
    return jsonResponse;
}

app.get("/api", (req, res) => {
    res.sendStatus(200);
});

app.get('/api/leaderboard/:rank', async (req, res) => {
    const rank = req.params.rank;

    try {
        const result = await redis.zrank(SET_KEY, rank);

        res.status(200).json(result);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const results = await redis.zrevrange(SET_KEY, 0, -1, "WITHSCORES");

        res.status(200).json(arrayToJsonResponse(results));
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/api/leaderboard/:rank/:score', async (req, res) => {
    const rank = req.params.rank;
    const score = +req.params.score;

    try {
        await redis.zadd(SET_KEY, score, rank);
        const results = await redis.zrevrange(SET_KEY, 0, -1, "WITHSCORES");

        res.status(201).json(arrayToJsonResponse(results));
    } catch (error) {
        res.sendStatus(500);
    }
});

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});