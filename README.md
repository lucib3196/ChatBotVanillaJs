# LangGraph Vanilla JS Showcase

A minimal vanilla JavaScript application demonstrating how to connect to and interact with a LangGraph agent using a simple modal-based chat UI.

The app supports:

- Streaming responses
- Markdown rendering
- LaTeX math rendering (via MathJax)
- Configurable system prompts
- Local and production server configuration

## Features

- Simple modal chat interface
- Markdown rendering using marked
- LaTeX rendering using MathJax
- Streaming responses from LangGraph
- Configurable agent ID

# Installation

## Install dependencies:

npm install


Then run your development server (if using Vite):

npm run dev

## Configuration
Local Development

For local development using LangGraph HTTP server:
```js
const apiUrl = "http://127.0.0.1:2024";
const assistantId = "agent_question_tutor";

const client = new Client({
  apiUrl: apiUrl,
  apiKey: "api-key",
});
```

For local usage:

- Run LangGraph server on port 2024
- No real API key is required
- The deployed agent name should match your local agent

## Production Configuration

For production deployment, you must configure:

- apiUrl → Your deployed LangGraph endpoint
- apiKey → Your production API key

Example:
```js
const client = new Client({
  apiUrl: "https://your-production-endpoint.com",
  apiKey: process.env.LANGGRAPH_API_KEY,
});
```

Never commit production API keys to source control.

# Agent Interaction
The application sends messages to the agent using a streaming call:
```js
const streamResponse = client.runs.stream(null, assistantId, {
  input: {
    messages: [
      { type: "human", content: message },
      { type: "system", content: TutorGuide },
    ],
  },
  streamMode: "messages-tuple",
});
```

## Message Roles

- human → The user input
- system → Instructor guide / configuration
- ai → Agent response

### System Message Behavior

The submitMessage function allows additional context to be injected into the system message:
```js
async function submitMessage(message, questionStub = "", solutionGuide = "") {
  state.error = null;
  state.isLoading = true;
```

The questionStub and solutionGuide are appended to the system prompt to guide the LLM’s behavior.

This structure can be modified or expanded depending on your agent design.

The user message is what is directly passed to the agent as the primary query.