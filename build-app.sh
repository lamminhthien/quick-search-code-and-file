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
npx pkg . --targets node18-macos-x64 --output dist/search-code-pro

# Create app bundle structure
echo "📁 Creating app bundle structure..."
mkdir -p "dist/Search Code Pro.app/Contents/MacOS"
mkdir -p "dist/Search Code Pro.app/Contents/Resources"

# Copy icon to Resources folder
echo "🎨 Adding app icon..."
cp AppIcon.icns "dist/Search Code Pro.app/Contents/Resources/"

# Copy executable
echo "📋 Copying executable..."
cp dist/search-code-pro "dist/Search Code Pro.app/Contents/MacOS/search-code-pro-bin"
chmod +x "dist/Search Code Pro.app/Contents/MacOS/search-code-pro-bin"

# Create launcher script
echo "🚀 Creating launcher script..."
cat > "dist/Search Code Pro.app/Contents/MacOS/search-code-pro" << 'EOF'
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Open Terminal and run the executable
osascript <<APPLESCRIPT
tell application "Terminal"
    activate
    do script "cd '$DIR' && ./search-code-pro-bin; exit"
end tell
APPLESCRIPT
EOF

chmod +x "dist/Search Code Pro.app/Contents/MacOS/search-code-pro"

# Create Info.plist
echo "📝 Creating Info.plist..."
cat > "dist/Search Code Pro.app/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>search-code-pro</string>
    <key>CFBundleIdentifier</key>
    <string>com.github.search-code-pro</string>
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

# Copy binary to home directory
echo "📋 Installing binary to home directory..."
BINARY_NAME="search-code-pro"
BINARY_PATH="$HOME/$BINARY_NAME"

# Copy the binary
cp dist/search-code-pro "$BINARY_PATH"
chmod +x "$BINARY_PATH"
echo "✓ Binary copied to: $BINARY_PATH"

# Function to add alias to shell config if not already present
add_alias_to_config() {
    local config_file=$1
    local alias_line="alias scp='$BINARY_PATH'"

    if [ -f "$config_file" ]; then
        # Check if alias already exists
        if grep -q "alias scp=" "$config_file"; then
            echo "✓ Alias already exists in $config_file"
        else
            echo "" >> "$config_file"
            echo "# Search Code Pro - Added by build script" >> "$config_file"
            echo "$alias_line" >> "$config_file"
            echo "✓ Added alias to $config_file"
        fi
    else
        # Create the file if it doesn't exist
        echo "# Search Code Pro - Added by build script" > "$config_file"
        echo "$alias_line" >> "$config_file"
        echo "✓ Created $config_file and added alias"
    fi
}

# Add to .zshrc
echo ""
echo "🔧 Registering in shell configurations..."
add_alias_to_config "$HOME/.zshrc"
add_alias_to_config "$HOME/.bashrc"

echo ""
echo "🎯 Installation complete!"
echo ""
echo "To use Search Code Pro from terminal:"
echo "   1. Restart your terminal or run: source ~/.zshrc (for zsh) or source ~/.bashrc (for bash)"
echo "   2. Run: scp (this will launch Search Code Pro in interactive mode)"
echo "   3. Or use directly: $BINARY_PATH"
echo ""
echo "To use the macOS app:"
echo "   1. Test the app: open 'dist/Search Code Pro.app'"
echo "   2. Copy to Applications: cp -r 'dist/Search Code Pro.app' /Applications/"
echo ""
