#!/bin/bash

set -e

echo "🎨 Creating macOS icon from AppIcon.appiconset..."

# Create temporary iconset directory
ICONSET_DIR="AppIcon.iconset"
rm -rf "$ICONSET_DIR"
mkdir -p "$ICONSET_DIR"

# Convert WebP images to PNG and rename according to macOS iconset naming convention
echo "🔄 Converting images to PNG format..."
sips -s format png AppIcon.appiconset/16-mac.png --out "$ICONSET_DIR/icon_16x16.png" > /dev/null 2>&1
sips -s format png AppIcon.appiconset/32-mac.png --out "$ICONSET_DIR/icon_16x16@2x.png" > /dev/null 2>&1
sips -s format png AppIcon.appiconset/32-mac.png --out "$ICONSET_DIR/icon_32x32.png" > /dev/null 2>&1
sips -s format png AppIcon.appiconset/64-mac.png --out "$ICONSET_DIR/icon_32x32@2x.png" > /dev/null 2>&1
sips -s format png AppIcon.appiconset/128-mac.png --out "$ICONSET_DIR/icon_128x128.png" > /dev/null 2>&1
sips -s format png AppIcon.appiconset/256-mac.png --out "$ICONSET_DIR/icon_128x128@2x.png" > /dev/null 2>&1
sips -s format png AppIcon.appiconset/256-mac.png --out "$ICONSET_DIR/icon_256x256.png" > /dev/null 2>&1
sips -s format png AppIcon.appiconset/512-mac.png --out "$ICONSET_DIR/icon_256x256@2x.png" > /dev/null 2>&1
sips -s format png AppIcon.appiconset/512-mac.png --out "$ICONSET_DIR/icon_512x512.png" > /dev/null 2>&1
sips -s format png AppIcon.appiconset/1024-mac.png --out "$ICONSET_DIR/icon_512x512@2x.png" > /dev/null 2>&1

# Convert iconset to icns
echo "🔄 Converting to .icns format..."
iconutil -c icns "$ICONSET_DIR" -o AppIcon.icns

# Clean up
rm -rf "$ICONSET_DIR"

echo "✅ Icon created successfully: AppIcon.icns"
