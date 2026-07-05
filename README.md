# Kezha AI Chatbot Web Application

A lightweight, beginner-friendly single-page chatbot web application built using Python + Flask on the backend and modern glassmorphic HTML/CSS/JS on the frontend. The application utilizes the official Google Generative AI SDK to communicate with Gemini models while maintaining conversation context across sessions.

---

## Features

- **Gemini 2.5 Flash**: Connected to Google's fast, high-performance generative model.
- **Glassmorphic UI**: Beautiful, premium dark-themed interface with smooth ambient animations, custom scrollbars, and dynamic message layouts.
- **Session History Context**: Retains conversation history using Flask's secure session cookies (capped to the last 20 messages to fit cookie constraints).
- **Responsive Layout**: Designed to look great on desktop monitors as well as mobile screens.
- **Context Control**: Easily start a fresh conversation using the "Reset" button in the header.
- **Rich Output Formatting**: Simple Markdown parser implemented in vanilla JS to render bold text, inline code, and code blocks returned by Gemini.

---

## Directory Structure

```
gemini-flask-chatbot/
│
├── static/
│   ├── script.js        # Frontend network fetch logic & custom markdown rendering
│   └── style.css         # Custom responsive dark-mode glassmorphic styles
│
├── templates/
│   └── index.html       # Chat app markup structure
│
├── .env.example         # Example configuration file
├── .gitignore           # File to ignore local env values & virtual envs
├── app.py               # Flask application with Gemini API endpoint logic
├── README.md            # Setup and deployment documentation
└── requirements.txt     # Python pinned dependencies
```

---

## Local Setup & Installation

Follow these steps to run the chatbot app locally on your computer:

### Prerequisites
Make sure you have **Python 3.8+** installed on your system. You can verify this by running:
```bash
python --version
```

### 1. Create a Project Folder and Navigate Into It
```bash
mkdir gemini-flask-chatbot
cd gemini-flask-chatbot
```
*(Copy the project files from this repository into this folder)*

### 2. Set Up a Virtual Environment (Recommended)
Create an isolated Python virtual environment to manage project dependencies:
```bash
# Create the virtual environment
python -m venv venv

# Activate the virtual environment
# On macOS / Linux:
source venv/bin/activate

# On Windows (Command Prompt):
venv\Scripts\activate.bat

# On Windows (PowerShell):
venv\Scripts\Activate.ps1
```

### 3. Install Required Dependencies
With the virtual environment active, run the following command to install Flask, the Gemini SDK, and python-dotenv:
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
You need a Gemini API Key to use the application. If you don't have one, get a free key from [Google AI Studio](https://aistudio.google.com/).

1. Make a copy of the `.env.example` file and name it `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file in a text editor and replace the placeholder value with your actual API key:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_key_here
   FLASK_SECRET_KEY=generate_some_random_string_here
   ```

### 5. Run the Application
Start the Flask development server:
```bash
python app.py
```

Open your browser and navigate to:
```
http://127.0.0.1:5000
```
You are now ready to chat with Gemini!

---

## Deployment to Free Hosting (Render or Railway)

You can easily host this chatbot online for free. Below are the steps to deploy using **Render** or **Railway**.

> [!CAUTION]
> **Never commit your `.env` file to Git!** It contains your secret API Key. The `.gitignore` file included in this repo is already configured to keep your `.env` file safe and off GitHub.

### Deploying on Render (render.com)
1. **Create a GitHub Repository**: Push your code (excluding the `.env` file) to a public or private GitHub repository.
2. **Log into Render**: Create a free account on [Render](https://render.com/) and click **New > Web Service**.
3. **Connect Repository**: Connect your GitHub account and select your chatbot repository.
4. **Configure Service Settings**:
   - **Name**: `gemini-flask-chatbot`
   - **Region**: Select a location close to you
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app` (Note: You may need to add `gunicorn` to your `requirements.txt` for production deployment, or Render will use Flask's dev server which is not recommended for production. To be safe, add `gunicorn` to dependencies or run `python app.py`). On Render, using `python app.py` or installing `gunicorn` and using `gunicorn app:app` works great.
5. **Set Environment Variables**:
   - Click on the **Advanced** button or go to the **Environment** tab.
   - Add the following environment variables:
     - `GEMINI_API_KEY` = *[Your actual Gemini API key]*
     - `FLASK_SECRET_KEY` = *[A secure random string]*
     - `PYTHON_VERSION` = `3.10.0` (or your preferred Python version)
6. **Deploy**: Click **Create Web Service**. Render will build and deploy your app. Once finished, they will provide you with a public HTTPS URL.

### Deploying on Railway (railway.app)
1. **Create a GitHub Repository**: Push your code (without `.env`) to GitHub.
2. **Log into Railway**: Create a free account on [Railway](https://railway.app/) and start a new project.
3. **Deploy from GitHub**: Select **Deploy from GitHub repo** and choose your chatbot repository.
4. **Add Variables**:
   - Once the service block is created, click on it, go to the **Variables** tab.
   - Add your variables:
     - `GEMINI_API_KEY` = *[Your actual Gemini API key]*
     - `FLASK_SECRET_KEY` = *[A secure random string]*
5. **Set Start Command**: Railway detects Flask automatically, but you can explicitly specify the start command under **Settings > Start Command**:
   - Set to `python app.py` or install `gunicorn` and set to `gunicorn app:app`.
6. **Generate Domain**: Go to the service **Settings** tab, scroll down to the **Environment** section, and click **Generate Domain** to get a public HTTPS URL.
