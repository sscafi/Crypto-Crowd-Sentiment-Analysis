// app.js

import express from 'express';
import { urlencoded, json } from 'body-parser';
import Twitter from 'twitter'; // Twitter API library
import sentiment from 'sentiment'; // Sentiment analysis library
import { S3 } from 'aws-sdk'; // AWS SDK for S3

const app = express();
const port = process.env.PORT || 3000;

// Initialize Twitter API client
const twitterClient = new Twitter({
  consumer_key: 'YOUR_CONSUMER_KEY',
  consumer_secret: 'YOUR_CONSUMER_SECRET',
  access_token_key: 'YOUR_ACCESS_TOKEN',
  access_token_secret: 'YOUR_ACCESS_TOKEN_SECRET',
});

// AWS S3 configuration
const s3 = new S3({
  accessKeyId: 'YOUR_ACCESS_KEY',
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
});

app.use(urlencoded({ extended: true }));
app.use(json());

// Route for retrieving sentiment analysis
app.get('/sentiment/:cryptocurrency', async (req, res) => {
  try {
    const cryptocurrency = req.params.cryptocurrency;

    // Retrieve tweets from Twitter API
    const tweets = await twitterClient.get('search/tweets', { q: cryptocurrency, count: 100 });

    // Perform sentiment analysis on tweets
    const sentimentData = tweets.statuses.map((tweet) => {
      const { text } = tweet;
      const { score, comparative } = sentiment(text);
      return { text, score, comparative };
    });

    // Calculate average sentiment score
    const averageScore = sentimentData.reduce((total, data) => total + data.score, 0) / sentimentData.length;

    // Store sentiment analysis data in S3
    const params = {
      Bucket: 'YOUR_BUCKET_NAME',
      Key: `${cryptocurrency}.json`,
      Body: JSON.stringify(sentimentData),
    };
    await s3.upload(params).promise();

    res.json({ sentimentData, averageScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
