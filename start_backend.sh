#!/bin/bash
echo "Starting Backend Server..."
cd backend

# Check if virtual environment exists and activate it
if [ -d ".venv" ]; then
    echo "Activating virtual environment..."
    source .venv/bin/activate
elif [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo "No virtual environment found. Creating one..."
    python -m venv .venv
    source .venv/bin/activate
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Set environment variables for dev container compatibility
export HOST=0.0.0.0
export PORT=8000

echo "Starting FastAPI server on $HOST:$PORT..."
python main.py

