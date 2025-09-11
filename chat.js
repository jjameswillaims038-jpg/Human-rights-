<script>
document.addEventListener("DOMContentLoaded", () => {
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

    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Example dummy reply (replace with your API later)
    const aiMsg = document.createElement("div");
    aiMsg.textContent = "AI: Hello! I’m your AI.";
    chatMessages.appendChild(aiMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    chatInput.value = "";
  });
});
</script>
