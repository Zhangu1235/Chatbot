document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const chatMessages = document.getElementById("chat-messages");
    const typingIndicator = document.getElementById("typing-indicator");
    const resetBtn = document.getElementById("reset-btn");

    // Set focus on input initially
    userInput.focus();

    // 1. Form Submission Handler
    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // Append user message immediately
        appendMessage("user", message);
        
        // Reset and resize input box
        userInput.value = "";
        userInput.style.height = "auto";

        // Show typing indicator
        showTypingIndicator(true);

        try {
            // Call Flask API endpoint
            const response = await fetch("/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();

            if (!response.ok) {
                // If backend returns an error (e.g. API key missing)
                appendMessage("model", `<span class="system-error"><i class="fa-solid fa-triangle-exclamation"></i> Error: ${data.error || 'Something went wrong.'}</span>`, true);
            } else {
                // Success: append model response
                appendMessage("model", data.response);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            appendMessage("model", `<span class="system-error"><i class="fa-solid fa-wifi-slash"></i> Failed to communicate with backend. Make sure the Flask server is running.</span>`, true);
        } finally {
            // Hide typing indicator
            showTypingIndicator(false);
        }
    });

    // 2. Textarea Auto-Resize and Enter-to-Submit
    userInput.addEventListener("input", function() {
        this.style.height = "auto";
        // Constrain height expansion to 120px
        this.style.height = (this.scrollHeight > 120 ? 120 : this.scrollHeight) + "px";
    });

    userInput.addEventListener("keydown", (e) => {
        // Submit form on Enter key press (without Shift key)
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            chatForm.requestSubmit();
        }
    });

    // 3. Reset Button Handler
    resetBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to clear this conversation history? This will start a fresh session.")) {
            try {
                const response = await fetch("/reset", { method: "POST" });
                if (response.ok) {
                    // Clear messages container
                    chatMessages.innerHTML = "";
                    // Re-append the welcoming UI
                    appendWelcomeMessage();
                }
            } catch (error) {
                console.error("Reset error:", error);
                alert("Failed to reset session history.");
            }
        }
    });

    // 4. Helper Function: Append Message Elements to UI
    function appendMessage(sender, text, isRawHtml = false) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);

        const contentDiv = document.createElement("div");
        contentDiv.classList.add("message-content");

        if (isRawHtml) {
            contentDiv.innerHTML = text;
        } else if (sender === "user") {
            // User messages are safe text only
            contentDiv.textContent = text;
        } else {
            // Model messages parse simple markdown formats
            contentDiv.innerHTML = parseMarkdown(text);
        }

        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        // Instantly scroll messages area to the bottom
        scrollToBottom();
    }

    // 5. Helper Function: Quick Prompts
    window.useQuickPrompt = (promptText) => {
        userInput.value = promptText;
        userInput.style.height = "auto";
        userInput.style.height = userInput.scrollHeight + "px";
        userInput.focus();
    };

    // 6. Helper Function: Welcome Screen Generator
    function appendWelcomeMessage() {
        const welcomeHtml = `
            <div class="message-content">
                <p>Hi! I'm Kezha, your AI assistant. How can I help you today? Feel free to ask me anything!</p>
                <div class="quick-prompts">
                    <button class="prompt-chip" onclick="useQuickPrompt('Explain quantum computing simply')">Explain quantum computing</button>
                    <button class="prompt-chip" onclick="useQuickPrompt('Write a short story about a time traveler')">Write a short story</button>
                    <button class="prompt-chip" onclick="useQuickPrompt('Give me a recipe for chocolate cookies')">Cookie recipe</button>
                </div>
            </div>
        `;
        const welcomeDiv = document.createElement("div");
        welcomeDiv.classList.add("message", "model", "welcome-message");
        welcomeDiv.innerHTML = welcomeHtml;
        chatMessages.appendChild(welcomeDiv);
        scrollToBottom();
    }

    // 7. Helper Function: Scroll Window Bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 8. Helper Function: Typing Indicator State Toggle
    function showTypingIndicator(show) {
        typingIndicator.style.display = show ? "flex" : "none";
        if (show) scrollToBottom();
    }

    // 9. Simple Custom Markdown Parser
    function parseMarkdown(text) {
        // Safe conversion of HTML characters to prevent XSS
        let escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        // Parse Code blocks: ```code```
        escaped = escaped.replace(/```([\s\S]*?)```/g, function(_, code) {
            return `<pre><code>${code.trim()}</code></pre>`;
        });

        // Parse Inline code: `code`
        escaped = escaped.replace(/`([^`\n]+)`/g, '<code>$1</code>');

        // Parse Bold text: **text**
        escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Temporarily rescue pre/code elements from newline-to-break conversion
        const preBlocks = [];
        escaped = escaped.replace(/<pre>[\s\S]*?<\/pre>/g, function(match) {
            preBlocks.push(match);
            return `__PRE_BLOCK_PLACEHOLDER_${preBlocks.length - 1}__`;
        });

        // Convert line breaks to HTML breaks
        escaped = escaped.replace(/\n/g, '<br>');

        // Restore pre blocks back to text
        escaped = escaped.replace(/__PRE_BLOCK_PLACEHOLDER_(\d+)__/g, function(_, index) {
            return preBlocks[parseInt(index, 10)];
        });

        return escaped;
    }
});
