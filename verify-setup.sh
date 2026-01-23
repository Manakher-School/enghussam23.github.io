#!/bin/bash

# School Platform - Quick Start Verification Script

echo "🎓 School Educational Platform - Setup Verification"
echo "=================================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "  Node.js version: $NODE_VERSION"
else
    echo "  ❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check npm
echo "✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "  npm version: $NPM_VERSION"
else
    echo "  ❌ npm is not installed. Please install npm"
    exit 1
fi

echo ""
echo "📦 Project Structure Check..."

# Check key directories
directories=(
    "src/components"
    "src/context"
    "src/data"
    "src/locales"
    "src/navigation"
    "src/screens"
    "src/services"
    "src/theme"
    "assets"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✓ $dir/"
    else
        echo "  ❌ Missing: $dir/"
    fi
done

echo ""
echo "📄 Key Files Check..."

# Check key files
files=(
    "App.js"
    "package.json"
    "app.json"
    "babel.config.js"
    "metro.config.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ Missing: $file"
    fi
done

echo ""
echo "🎨 Assets Check..."

# Check asset files
assets=(
    "assets/icon.png"
    "assets/splash.png"
    "assets/adaptive-icon.png"
    "assets/favicon.png"
)

missing_assets=0
for asset in "${assets[@]}"; do
    if [ -f "$asset" ]; then
        echo "  ✓ $asset"
    else
        echo "  ⚠️  Missing: $asset (will need to be created)"
        missing_assets=$((missing_assets + 1))
    fi
done

echo ""
if [ $missing_assets -gt 0 ]; then
    echo "⚠️  Note: $missing_assets asset file(s) missing."
    echo "   The app will still run, but you should add them before deploying."
    echo "   See SETUP.md for instructions on creating assets."
fi

echo ""
echo "📚 Data Files Check..."

# Check data files
data_files=(
    "src/data/homework.json"
    "src/data/materials.json"
    "src/data/news.json"
    "src/data/quizzes.json"
)

for file in "${data_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ Missing: $file"
    fi
done

echo ""
echo "=================================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Dependencies not installed."
    echo ""
    read -p "Would you like to install dependencies now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Installing dependencies..."
        npm install
        echo ""
        echo "✓ Dependencies installed!"
    fi
else
    echo "✓ Dependencies are installed."
fi

echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Create missing assets (if any) - see SETUP.md"
echo "2. Run 'npm start' to start Expo development server"
echo "3. Run 'npm run web' to test in browser"
echo "4. Run 'npm run deploy' to build for GitHub Pages"
echo ""
echo "For detailed instructions, see SETUP.md and README.md"
echo ""
echo "Happy coding! 🎓"
