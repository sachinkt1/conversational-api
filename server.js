const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/conversations', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const conversationSchema = new mongoose.Schema({
    model: String,
    history: [{
        question: String,
        response: String,
        date: { type: Date, default: Date.now }
    }]
});

const Conversation = mongoose.model('Conversation', conversationSchema);

// Endpoint to start a new conversation and select a model
app.post('/start-conversation', async (req, res) => {
    const { model } = req.body;

    if (!model) {
        return res.status(400).send("Model is required.");
    }

    const newConversation = new Conversation({ model });
    try {
        await newConversation.save();
        res.json({ conversationId: newConversation._id });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error starting conversation.");
    }
});

// Endpoint to send a query to the Python program
app.post('/send-query', async (req, res) => {
    const { conversationId, question } = req.body;

    if (!conversationId || !question) {
        return res.status(400).send("Conversation ID and question are required.");
    }

    try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).send("Conversation not found.");
        }

        // Send query to Python script
        exec(`python model_inference.py --model ${conversation.model} --prompt "${question}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.status(500).send(stderr);
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return res.status(500).send(stderr);
            }

            const response = stdout.trim();
            conversation.history.push({ question, response });
            
            conversation.save((err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Error saving conversation history.");
                }

                res.json({ response });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing query.");
    }
});

// Endpoint to list conversation history
app.get('/conversation-history', async (req, res) => {
    try {
        const conversations = await Conversation.find().sort({ 'history.date': -1 });
        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving conversation history.");
    }
});

// Endpoint to get details of a specific conversation
app.get('/conversation/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const conversation = await Conversation.findById(id);

        if (!conversation) {
            return res.status(404).send("Conversation not found.");
        }

        res.json(conversation.history);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving conversation details.");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
