# Image Optimization Guide

## Current Image Sizes

The project currently has large PNG images:
- Hero images: 20-23MB each (3 images = ~65MB total)
- Main images: 7-49MB each

**Total image size: ~148MB**

## How to Optimize

### Option 1: Automatic Script (Recommended)

Run the provided optimization script:

```bash
./scripts/optimize-images.sh
```

This will:
- Backup all images to `public/images/backup_[timestamp]/`
- Resize images to max 1920px width
- Reduce quality to 85% (visually identical, much smaller)
- Reduce file sizes by 80-90%

**Requirements:**
- ImageMagick: `sudo apt install imagemagick` (Linux)
- Or Homebrew: `brew install imagemagick` (Mac)

### Option 2: Manual Online Tools

Use online image compressors:
- [TinyPNG](https://tinypng.com/) - PNG compression
- [Squoosh](https://squoosh.app/) - Google's image optimizer
- [CompressPNG](https://compresspng.com/) - Bulk compression

### Option 3: Manual ImageMagick Commands

```bash
# Optimize a single image
convert input.png -resize '1920x>' -quality 85 -strip output.png

# Optimize all hero images
cd public/images/hero
for img in *.png; do
  convert "$img" -resize '1920x>' -quality 85 -strip "${img%.png}_opt.png"
done
```

## Recommended Sizes

For best web performance:

- **Hero images**: < 500KB each (currently 20-23MB!)
- **News images**: < 200KB each
- **Icons/logos**: < 50KB each

## Target Resolution

- **Hero carousel**: 1920x1080px (Full HD) is sufficient
- **News images**: 1200x800px is plenty
- **Thumbnails**: 400x300px

## Image Format Recommendations

- **Photos**: Use WebP format (smaller than PNG/JPG)
- **Graphics/logos**: PNG with transparency
- **Simple images**: JPG at 80-90% quality

## After Optimization

Expected results:
- Hero images: ~500KB-1MB each (was 20-23MB)
- Total reduction: ~90% smaller files
- Faster page load: 3-5 seconds improvement
- Better mobile experience
- Lower bandwidth usage

## Restore from Backup

If something goes wrong:

```bash
# Find your backup folder
ls public/images/backup_*

# Restore from backup
cp -r public/images/backup_[timestamp]/* public/images/
```

## Git LFS (Alternative for Future)

For very large images, consider using Git Large File Storage:

```bash
# Install Git LFS
git lfs install

# Track PNG files
git lfs track "*.png"

# Commit the .gitattributes file
git add .gitattributes
git commit -m "Track PNG files with Git LFS"
```

**Note**: This requires GitHub LFS quota (free tier: 1GB storage, 1GB bandwidth/month)
