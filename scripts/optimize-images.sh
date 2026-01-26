#!/bin/bash

# Image Optimization Script
# Optimizes PNG images to reduce file size while maintaining quality
# Requires: imagemagick (install with: sudo apt install imagemagick)

echo "🖼️  Image Optimization Script"
echo "=============================="
echo ""

# Check if imagemagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick is not installed"
    echo "Install with: sudo apt install imagemagick"
    exit 1
fi

# Create backup directory
BACKUP_DIR="public/images/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Creating backup in: $BACKUP_DIR"
cp -r public/images/*.png "$BACKUP_DIR/" 2>/dev/null || true
cp -r public/images/hero/*.png "$BACKUP_DIR/hero/" 2>/dev/null || mkdir -p "$BACKUP_DIR/hero" && cp -r public/images/hero/*.png "$BACKUP_DIR/hero/"

echo ""
echo "🔄 Optimizing images..."
echo ""

# Optimize hero images (reduce to 1920px width, 85% quality)
for img in public/images/hero/*.png; do
    if [ -f "$img" ]; then
        original_size=$(du -h "$img" | cut -f1)
        convert "$img" -resize '1920x>' -quality 85 -strip "${img%.png}_optimized.png"
        mv "${img%.png}_optimized.png" "$img"
        new_size=$(du -h "$img" | cut -f1)
        echo "✅ $(basename $img): $original_size → $new_size"
    fi
done

# Optimize main images (reduce to 1920px width, 85% quality)
for img in public/images/*.png; do
    if [ -f "$img" ]; then
        original_size=$(du -h "$img" | cut -f1)
        convert "$img" -resize '1920x>' -quality 85 -strip "${img%.png}_optimized.png"
        mv "${img%.png}_optimized.png" "$img"
        new_size=$(du -h "$img" | cut -f1)
        echo "✅ $(basename $img): $original_size → $new_size"
    fi
done

echo ""
echo "✨ Optimization complete!"
echo "📦 Backup saved in: $BACKUP_DIR"
echo ""
echo "⚠️  Note: If images look wrong, restore from backup:"
echo "   cp -r $BACKUP_DIR/* public/images/"
