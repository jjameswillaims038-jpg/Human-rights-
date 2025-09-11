const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const sendBtn = document.getElementById("sendChat");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

// Toggle chat window
chatBtn.addEventListener("click", () => {
  chatWindow.style.display = "flex";
});

closeChat.addEventListener("click", () => {
  chatWindow.style.display = "none";
});

// Send message
sendBtn.addEventListener("click", async () => {
  const msg = chatInput.value.trim();
  if (!msg) return;

  // Show user message
  const userMsg = document.createElement("div");
  userMsg.textContent = "You: " + msg;
  chatMessages.appendChild(userMsg);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Send to server
  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();

    // Show AI reply
    const aiMsg = document.createElement("div");
    aiMsg.textContent = "AI: " + data.reply;
    chatMessages.appendChild(aiMsg);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (err) {
    console.error(err);
    alert("Failed to connect to AI server.");
  }

  chatInput.value = "";
});
