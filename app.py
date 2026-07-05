import os
from flask import Flask, render_template, request, jsonify, session
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configure a secret key for session management. 
# In production, this should be a secure random string loaded from environment variables.
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev_fallback_secret_key_12345")

# Initialize and configure the Gemini API SDK
api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_gemini_api_key_here":
    genai.configure(api_key=api_key)
    # Using the fast, cost-effective gemini-2.5-flash model
    model = genai.GenerativeModel("gemini-2.5-flash")
else:
    model = None

def serialize_history(chat_history):
    """
    Helper function to convert Gemini's history objects into a JSON-serializable list of dicts.
    This allows us to store the conversation context in Flask's session object.
    """
    serialized = []
    for content in chat_history:
        parts_text = []
        for part in content.parts:
            # Safely extract text from the message parts
            if hasattr(part, 'text') and part.text:
                parts_text.append(part.text)
        
        serialized.append({
            "role": content.role, # 'user' or 'model'
            "parts": parts_text
        })
    return serialized

@app.route("/")
def index():
    """
    Renders the main single-page chat interface.
    """
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    """
    Handles user chat messages, interacts with Gemini API, and maintains context in session.
    """
    # 1. Verify Gemini API key is configured
    if not api_key or api_key == "your_gemini_api_key_here":
        return jsonify({
            "error": "Gemini API key is not configured. Please add your key to the .env file."
        }), 500

    if not model:
        return jsonify({
            "error": "Failed to initialize Gemini model. Please check your API key configuration."
        }), 500

    # 2. Extract user message from request
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "No message provided."}), 400

    user_message = data["message"].strip()
    if not user_message:
        return jsonify({"error": "Empty message."}), 400

    # 3. Retrieve and restore chat history from Flask session
    # Flask session stores cookies client-side (4KB limit).
    # We will limit the stored history to the last 20 messages (10 turns) to avoid cookie size errors.
    history_data = session.get("chat_history", [])

    try:
        # Start a chat session with the loaded history
        chat_session = model.start_chat(history=history_data)
        
        # Send the user's message and get response
        response = chat_session.send_message(user_message)
        
        # Serialize the updated history from Gemini and save it back to session
        # We slice the last 20 messages to keep the session cookie size small
        session["chat_history"] = serialize_history(chat_session.history)[-20:]
        
        # Return the response text as JSON
        return jsonify({
            "response": response.text
        })

    except Exception as e:
        # Log error in production, return descriptive message to client
        return jsonify({
            "error": f"An error occurred while calling the Gemini API: {str(e)}"
        }), 500

@app.route("/reset", methods=["POST"])
def reset():
    """
    Clears the chat history from the session, starting a fresh conversation.
    """
    session.pop("chat_history", None)
    return jsonify({"status": "success", "message": "Conversation history reset."})

if __name__ == "__main__":
    # Use the port defined in the environment (common for hosting providers), or default to 5001
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
