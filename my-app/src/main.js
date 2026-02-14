import { Client } from "@langchain/langgraph-sdk";
import "./style.css";

// Modal Logic
const modal = document.getElementById("modal");
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");
openBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});
closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// API Chat

const chatDiv = document.getElementById("chat-messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const statusDiv = document.getElementById("status");

const state = {
  messages: [],
  isLoading: false,
  error: null,
};

function appendMessageToDOM(msg) {
  const div = document.createElement("div");
  div.className = `message ${msg.type}`;
  div.textContent = `${msg.type}: ${msg.content}`;
  chatDiv.appendChild(div);
  chatDiv.classList.add(msg.type);
  chatDiv.scrollTop = chatDiv.scrollHeight;
  return div;
}

const apiUrl = "http://localhost:2024";
const assistantId = "agent_me135";

const client = new Client({ apiUrl: apiUrl });

async function submitMessage(message) {
  state.error = null;
  state.isLoading = true;

  //  Add human message
  const humanMessage = {
    type: "human",
    content: message,
  };

  state.messages.push(humanMessage);
  appendMessageToDOM(humanMessage);

  // Create assistant placeholder
  const assistantMessage = {
    type: "ai",
    content: "",
  };

  state.messages.push(assistantMessage);
  const assistantDiv = appendMessageToDOM(assistantMessage);

  try {
    const streamResponse = client.runs.stream(null, assistantId, {
      input: {
        messages: [{ type: "human", content: message }],
      },
      streamMode: "messages-tuple",
    });

    for await (const chunk of streamResponse) {
      if (chunk.event === "messages") {
        const content = chunk.data?.at(0)?.content;
        if (!content) continue;

        // Append streamed content
        assistantMessage.content += content;
        assistantDiv.textContent = `ai: ${assistantMessage.content}`;
      }
    }
  } catch (error) {
    console.error(error);
    state.error = error.message;
  }

  state.isLoading = false;
}

sendBtn.addEventListener("click", () => {
  if (!input.value.trim()) return;

  submitMessage(input.value);
  input.value = "";
});
