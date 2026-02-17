import { Client } from "@langchain/langgraph-sdk";
import { marked } from "https://esm.sh/marked@9";
import DOMPurify from "https://esm.sh/dompurify";
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

// Markdown Rendering
function renderMarkdown(content) {
  const rawHTML = marked.parse(content);
  return DOMPurify.sanitize(rawHTML);
}

// API Chat
const chatDiv = document.getElementById("chat-messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

const state = {
  messages: [],
  isLoading: false,
  error: null,
};

function appendMessageToDOM(msg) {
  const div = document.createElement("div");
  div.className = `message ${msg.type}`;
  div.innerHTML = `${msg.type}: ${renderMarkdown(msg.content)}`;

  chatDiv.appendChild(div);
  chatDiv.classList.add(msg.type);
  chatDiv.scrollTop = chatDiv.scrollHeight;

  return div;
}

const apiUrl = "http://127.0.0.1:2024";
const assistantId = "agent_question_tutor";

const client = new Client({
  apiUrl: apiUrl,
  apiKey: "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",
});

async function submitMessage(message, questionStub = "", solutionGuide = "") {
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

  const TutorGuide = `The question stub is ${questionStub}\n The approved solution is ${solutionGuide}`;

  try {
    const streamResponse = client.runs.stream(null, assistantId, {
      input: {
        messages: [
          { type: "human", content: message },
          { type: "system", content: TutorGuide },
        ],
      },
      streamMode: "messages-tuple",
    });

    for await (const chunk of streamResponse) {
      if (chunk.event === "messages") {
        const content = chunk.data?.at(0)?.content;
        if (!content) continue;

        // Append streamed content
        assistantMessage.content += content;
        assistantDiv.innerHTML = renderMarkdown(assistantMessage.content);

        if (window.MathJax) {
          window.MathJax.typesetPromise([assistantDiv]);
        }
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
