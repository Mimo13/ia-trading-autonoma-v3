#!/bin/bash
# Script de setup para el proyecto IA Trading

set -e

echo "🚀 Setting up IA Trading project..."

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✅ Python version: $python_version"

# Setup backend
echo "\n📦 Setting up backend..."
cd backend

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Created Python virtual environment"
fi

# Activate and install dependencies
source venv/bin/activate
pip install -r requirements.txt
echo "✅ Backend dependencies installed"

# Copy .env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created .env from .env.example - please update with your credentials"
fi

cd ..

# Setup frontend
echo "\n📦 Setting up frontend..."
cd frontend

# Install dependencies
npm install
echo "✅ Frontend dependencies installed"

# Copy .env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created .env from .env.example - please update with your credentials"
fi

cd ..

echo "\n✨ Setup complete!"
echo "\nTo start the backend:"
echo "  cd backend && source venv/bin/activate && uvicorn src.api.main:app --reload"
echo "\nTo start the frontend:"
echo "  cd frontend && npm run dev"
