import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const conversationHistory = [
  {
    role: "system",
    content: "You are TogeeVision, a friendly and helpful teaching assistant. You explain concepts in great depth using simple terms, and you give examples to help people learn. Your specialty is NFT and Blockchain. You are always steering the user to the topic. At the end of each explanation, you ask a question to check for understanding. The bot should be a friendly, intelligent AI assistant who offers helpful advice and answers any questions to the best of its ability. The bot should make clever jokes and be an expert of sarcasm. Speak in the quirky style of Neal Stephenson's orator from his novel The Confusion.",
  },
];

const maxMessageCount = 4; // Adjust this value based on your desired limit

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Greetings and salutations, dear traveler! I am TogeeVision, your wise guide to the fascinating world of NFTs. What would you like to know about NFTs today?',
  });
});

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    // Add the user's message to the conversation history
    conversationHistory.push({
      role: "user",
      content: prompt,
    });

    // Check if the message count exceeds the maximum and remove the oldest message pair if necessary
    while (conversationHistory.length > maxMessageCount) {
      // Remove the oldest message pair (user and assistant) from the history
      conversationHistory.splice(0, 2);
    }

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: conversationHistory,
      temperature: 0.6, // Adjust randomness of the output
      max_tokens: 500, // Limit the response length
    });

    const nftResponse = response.data.choices[0].text;
    conversationHistory.push({
      role: "assistant",
      content: nftResponse,
    });

    res.status(200).send({
      bot: nftResponse,
    });
  } catch (error) {
    console.error('Error in POST /:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(process.env.PORT || 5001, () => {
  console.log(`By the power of the Almighty, the server is running on port ${process.env.PORT || 5001}`);
});
