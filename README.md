# Conversational API with Node.js and Python

This project sets up a Node.js API server that interacts with a Python program to handle conversational queries using models such as Llama2 and Mistral. The server stores conversation data in a local MongoDB database.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Python](https://www.python.org/) (v3.6 or later)
- [MongoDB](https://www.mongodb.com/) (v4.0 or later)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sachinkt1/conversational-api.git
cd conversational-api
```
### 2. Set Up Python Environment

 - Create a virtual environment and activate it:

```bash
 python -m venv venv
 source venv/bin/activate   # On Windows: venv\Scripts\activate
```

  - Install Python dependencies:

```bash
 pip install transformers torch
```

### 3. Set Up Node.js Environment
  - Install Node.js dependencies:
  
```bash
 npm install
```

### 4. Running the Project
  - Start MongoDB

```bash
  mongod
```

  - Start the Node.js Server

```bash
  node server.js
```
  - Start Docker on your local machine
  - Run below commands to build and run the containers

```bash
  docker-compose build
  docker-compose up
```


### 5. API Endpoints

  - Start a New Conversation: POST /start-conversation
    - Request Body: ``{ "model": "Llama2" }``
    - Response: ``{ "conversationId": "unique_id" }``

  - Send a Query: POST /send-query
    - Request Body: ``{ "conversationId": "unique_id", "question": "Your question here" }``
    - Response: ``{ "response": "Model's response" }``

  - List Conversation History: GET /conversation-history
    - Response: ``[ { "id": "unique_id", "model": "Llama2", "history": [ ... ] }, ... ]``

  - Get Specific Conversation Details: GET /conversation/:id
    - Response: ``[ { "question": "Your question here", "response": "Model's response", "date": "ISO date string" }, ... ]``