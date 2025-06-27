let apiKey = "";
let currentBehavior = "neutral";
let isLoading = false;
let chatHistory = [];
let canvas, ctx;
let animationFrame;

let roomState = {
  brightness: 0.7,
  hasPlant: false,
  hasLamp: true,
  lampLit: false,
  hasDecor: false,
  hasFurniture: true,
  hasRedLight: false,
  redLightBlinking: false,
  floorCracked: false,
};

document.addEventListener("DOMContentLoaded", function () {
  initializeCanvas();
  initializeEventListeners();
  loadApiKey();
  startAnimation();
});

function initializeCanvas() {
  canvas = document.getElementById("room-canvas");
  ctx = canvas.getContext("2d");
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = Math.min(container.clientWidth - 32, 600);
  canvas.height = Math.min(400, canvas.width * 0.6);
}

function initializeEventListeners() {
  document
    .getElementById("connect-btn")
    .addEventListener("click", handleApiKeySubmit);

  document
    .getElementById("chat-form")
    .addEventListener("submit", handleChatSubmit);

  document.querySelectorAll(".quick-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const behavior = this.dataset.behavior;
      updateRoomState(behavior);
      addChatMessage(
        "user",
        `Show me ${this.textContent.toLowerCase()} scenario`
      );
      addChatMessage(
        "ai",
        `Switching to ${this.textContent.toLowerCase()} financial behavior visualization.`
      );
    });
  });
}

function loadApiKey() {
  const savedApiKey = localStorage.getItem("gemini_api_key");
  if (savedApiKey) {
    apiKey = savedApiKey;
    updateApiKeyUI(true);
  }
}

function handleApiKeySubmit() {
  const input = document.getElementById("api-key-input");
  const key = input.value.trim();

  if (key) {
    apiKey = key;
    localStorage.setItem("gemini_api_key", key);
    updateApiKeyUI(true);
    input.value = "";
  }
}

function updateApiKeyUI(hasKey) {
  const keySection = document.getElementById("api-key-section");
  const connectedSection = document.getElementById("api-key-connected");
  const messageInput = document.getElementById("message-input");
  const sendBtn = document.getElementById("send-btn");
  const chatHistory = document.getElementById("chat-history");

  if (hasKey) {
    keySection.style.display = "none";
    connectedSection.style.display = "block";
    messageInput.disabled = false;
    sendBtn.disabled = false;
    chatHistory.innerHTML =
      '<p class="empty-chat">Start a conversation to get personalized financial advice!</p>';
  } else {
    keySection.style.display = "block";
    connectedSection.style.display = "none";
    messageInput.disabled = true;
    sendBtn.disabled = true;
  }
}

async function handleChatSubmit(e) {
  e.preventDefault();

  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();

  if (!message || !apiKey || isLoading) return;

  messageInput.value = "";
  isLoading = true;
  updateSendButton();

  addChatMessage("user", message);

  showLoadingMessage();

  try {
    const aiResponse = await analyzeFinancialBehavior(message, apiKey);

    hideLoadingMessage();

    updateRoomState(aiResponse.behaviour);

    addChatMessage("ai", aiResponse.response);
  } catch (error) {
    console.error("Error getting AI response:", error);
    hideLoadingMessage();
    addChatMessage(
      "ai",
      "I apologize, but I encountered an error. Please try again."
    );
  } finally {
    isLoading = false;
    updateSendButton();
  }
}

async function analyzeFinancialBehavior(userMessage, apiKey) {
  let context = chatHistory.join("\n\n");

  const prompt = `You are a financial advisor AI. Your task is to analyze the user's financial message and return a structured JSON object with two keys:

1. "behaviour": One of the following exact strings:
   - "saving_good"
   - "overspending"
   - "income_high"
   - "debt_risk"
   - "neutral"

2. "response": A concise, clear piece of financial advice based on the message.

Classification Rules:
- Use "saving_good" if the user mentions saving, investing wisely, or budgeting successfully.
- Use "overspending" if the user reports excessive spending, unnecessary purchases, or going over budget.
- Use "income_high" for events like raises, bonuses, new high-paying jobs, or profitable investments.
- Use "debt_risk" if the user mentions loans, debt stress, late payments, or credit problems.
- Use "neutral" for questions, mixed signals, or unrelated statements.
- If the message is ambiguous or non-financial, default to the previous behaviour. If none exists, use "neutral".

Maintain consistent interpretation. Do not make assumptions beyond what is stated.

Previous Behaviour: "${context}"  
User Message: "${userMessage}"

Respond **only** with a valid JSON object in this exact format (no extra commentary, no markdown):

{
  "behaviour": "category_here",
  "response": "your_advice_here"
}
`;

  chatHistory.push(`User Said: ${userMessage}`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;

    console.log(generatedText);

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    if (!parsedResponse.behaviour || !parsedResponse.response) {
      throw new Error("Invalid response structure");
    }

    chatHistory.push(`AI Said: ${parsedResponse.response}`);

    return parsedResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    chatHistory.push(
      `AI Said: I apologize, but I encountered an error processing your request. Please try again.`
    );

    return {
      behaviour: "undefined",
      response:
        "I apologize, but I encountered an error processing your request. Please try again.",
    };
  }
}

function updateRoomState(behavior) {
  currentBehavior = behavior;
  document.getElementById("current-behavior").textContent = behavior.replace(
    "_",
    " "
  );

  switch (behavior) {
    case "saving_good":
      roomState = {
        brightness: 1.0,
        hasPlant: true,
        hasLamp: true,
        lampLit: true,
        hasDecor: true,
        hasFurniture: true,
        hasRedLight: false,
        redLightBlinking: false,
        floorCracked: false,
      };
      break;
    case "overspending":
      roomState = {
        brightness: 0.3,
        hasPlant: false,
        hasLamp: false,
        lampLit: false,
        hasDecor: false,
        hasFurniture: false,
        hasRedLight: false,
        redLightBlinking: false,
        floorCracked: true,
      };
      break;
    case "income_high":
      roomState = {
        brightness: 0.9,
        hasPlant: true,
        hasLamp: true,
        lampLit: true,
        hasDecor: true,
        hasFurniture: true,
        hasRedLight: false,
        redLightBlinking: false,
        floorCracked: false,
      };
      break;
    case "debt_risk":
      roomState = {
        brightness: 0.2,
        hasPlant: false,
        hasLamp: false,
        lampLit: false,
        hasDecor: false,
        hasFurniture: true,
        hasRedLight: true,
        redLightBlinking: true,
        floorCracked: false,
      };
      break;
    case "undefined":
      break;
    default:
      roomState = {
        brightness: 0.7,
        hasPlant: false,
        hasLamp: true,
        lampLit: false,
        hasDecor: false,
        hasFurniture: true,
        hasRedLight: false,
        redLightBlinking: false,
        floorCracked: false,
      };
  }
}

function drawRoom() {
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  ctx.globalAlpha = roomState.brightness;

  ctx.fillStyle = "#8B7355";
  ctx.fillRect(0, 0, width, height * 0.7);

  if (roomState.floorCracked) {
    ctx.fillStyle = "#5D4E37";
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
    ctx.strokeStyle = "#3D2E17";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.75);
    ctx.lineTo(width * 0.8, height * 0.85);
    ctx.moveTo(width * 0.1, height * 0.9);
    ctx.lineTo(width * 0.6, height * 0.8);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
  }

  ctx.globalAlpha = 1.0;

  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(width * 0.7, height * 0.1, width * 0.25, height * 0.3);
  ctx.strokeStyle = "#654321";
  ctx.lineWidth = 3;
  ctx.strokeRect(width * 0.7, height * 0.1, width * 0.25, height * 0.3);

  ctx.beginPath();
  ctx.moveTo(width * 0.825, height * 0.1);
  ctx.lineTo(width * 0.825, height * 0.4);
  ctx.moveTo(width * 0.7, height * 0.25);
  ctx.lineTo(width * 0.95, height * 0.25);
  ctx.stroke();

  if (roomState.hasFurniture) {
    ctx.fillStyle = "#D2691E";
    ctx.fillRect(width * 0.3, height * 0.5, width * 0.4, height * 0.05);
    ctx.fillRect(width * 0.32, height * 0.55, width * 0.03, height * 0.15);
    ctx.fillRect(width * 0.65, height * 0.55, width * 0.03, height * 0.15);
  }

  if (roomState.hasPlant) {
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(width * 0.1, height * 0.6, width * 0.08, width * 0.08);
    ctx.fillStyle = "#228B22";
    ctx.beginPath();
    ctx.arc(width * 0.14, height * 0.55, width * 0.04, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width * 0.12, height * 0.52, width * 0.03, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width * 0.16, height * 0.52, width * 0.03, 0, 2 * Math.PI);
    ctx.fill();
  }

  if (roomState.hasLamp) {
    ctx.fillStyle = "#696969";
    ctx.fillRect(width * 0.05, height * 0.35, width * 0.02, height * 0.35);
    const lampColor = roomState.lampLit ? "#FFFF99" : "#F5F5DC";
    ctx.fillStyle = lampColor;
    ctx.beginPath();
    ctx.ellipse(
      width * 0.06,
      height * 0.35,
      width * 0.04,
      height * 0.08,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.strokeStyle = "#696969";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  if (roomState.hasDecor) {
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(width * 0.15, height * 0.15, width * 0.15, width * 0.1);
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(width * 0.16, height * 0.16, width * 0.13, width * 0.08);

    if (roomState.hasFurniture) {
      ctx.fillStyle = "#4169E1";
      ctx.beginPath();
      ctx.ellipse(
        width * 0.5,
        height * 0.48,
        width * 0.03,
        height * 0.05,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }

  if (roomState.hasRedLight) {
    const alpha = roomState.redLightBlinking
      ? (Math.sin(Date.now() / 200) + 1) / 2
      : 1;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#FF0000";
    ctx.beginPath();
    ctx.arc(width * 0.9, height * 0.05, width * 0.02, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  if (roomState.brightness < 1.0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${1 - roomState.brightness})`;
    ctx.fillRect(0, 0, width, height);
  }
}

function startAnimation() {
  function animate() {
    drawRoom();
    animationFrame = requestAnimationFrame(animate);
  }
  animate();
}

function addChatMessage(sender, text) {
  const chatHistory = document.getElementById("chat-history");

  const emptyChat = chatHistory.querySelector(".empty-chat");
  if (emptyChat) {
    emptyChat.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `chat-message ${sender}`;

  const bubbleDiv = document.createElement("div");
  bubbleDiv.className = `message-bubble ${sender}`;
  bubbleDiv.textContent = text;

  messageDiv.appendChild(bubbleDiv);
  chatHistory.appendChild(messageDiv);

  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function showLoadingMessage() {
  const chatHistory = document.getElementById("chat-history");

  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading-message";
  loadingDiv.id = "loading-message";

  const bubbleDiv = document.createElement("div");
  bubbleDiv.className = "loading-bubble";
  bubbleDiv.textContent = "Analyzing your financial situation...";

  loadingDiv.appendChild(bubbleDiv);
  chatHistory.appendChild(loadingDiv);

  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function hideLoadingMessage() {
  const loadingMessage = document.getElementById("loading-message");
  if (loadingMessage) {
    loadingMessage.remove();
  }
}

function updateSendButton() {
  const sendBtn = document.getElementById("send-btn");
  if (isLoading) {
    sendBtn.textContent = "Getting AI Response...";
    sendBtn.disabled = true;
  } else {
    sendBtn.textContent = "Send Message";
    sendBtn.disabled = !apiKey;
  }
}
