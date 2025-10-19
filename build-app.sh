#!/bin/bash

set -e

echo "🔨 Building Search Code Pro Application..."

# Create icon first
echo "🎨 Creating app icon..."
if [ ! -f "AppIcon.icns" ]; then
    ./create-icon.sh
fi

# Clean previous build
echo "📦 Cleaning previous build..."
rm -rf dist

# Build executable with npx pkg
echo "🏗️  Building executable..."
npx pkg . --targets node18-macos-x64 --output dist/macos-cache-cleaner

# Create app bundle structure
echo "📁 Creating app bundle structure..."
mkdir -p "dist/Search Code Pro.app/Contents/MacOS"
mkdir -p "dist/Search Code Pro.app/Contents/Resources"

# Copy icon to Resources folder
echo "🎨 Adding app icon..."
cp AppIcon.icns "dist/Search Code Pro.app/Contents/Resources/"

# Copy executable
echo "📋 Copying executable..."
cp dist/macos-cache-cleaner "dist/Search Code Pro.app/Contents/MacOS/macos-cache-cleaner-bin"
chmod +x "dist/Search Code Pro.app/Contents/MacOS/macos-cache-cleaner-bin"

# Create launcher script
echo "🚀 Creating launcher script..."
cat > "dist/Search Code Pro.app/Contents/MacOS/macos-cache-cleaner" << 'EOF'
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Open Terminal and run the executable
osascript <<APPLESCRIPT
tell application "Terminal"
    activate
    do script "cd '$DIR' && ./macos-cache-cleaner-bin; exit"
end tell
APPLESCRIPT
EOF

chmod +x "dist/Search Code Pro.app/Contents/MacOS/macos-cache-cleaner"

# Create Info.plist
echo "📝 Creating Info.plist..."
cat > "dist/Search Code Pro.app/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>macos-cache-cleaner</string>
    <key>CFBundleIdentifier</key>
    <string>com.github.macos-cache-cleaner</string>
    <key>CFBundleName</key>
    <string>Search Code Pro</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Application location: dist/Search Code Pro.app"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the app: open 'dist/Search Code Pro.app'"
echo "   2. Copy to Applications: cp -r 'dist/Search Code Pro.app' /Applications/"
echo ""
