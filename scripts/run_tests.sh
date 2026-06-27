#!/bin/bash
# Script para ejecutar tests

set -e

echo "🧪 Running tests..."

# Backend tests
echo "\n📦 Running backend tests..."
cd backend
source venv/bin/activate
pytest tests/ -v
cd ..

# Frontend tests
echo "\n📦 Running frontend tests..."
cd frontend
npm test
cd ..

echo "\n✨ All tests passed!"
