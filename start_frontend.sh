#!/bin/bash
echo "Starting Frontend Development Server..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Set environment variables for dev container compatibility
export HOST=0.0.0.0

echo "Starting Vite development server..."
npm run dev

