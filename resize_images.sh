#!/bin/bash

# Script to find images and resize them if their height exceeds 1700px,
# maintaining aspect ratio.

# Target directory - set to your specific develop folder
TARGET_DIR="/Users/mrezkys/Desktop/company/web/develop/img/hotels"

# Maximum height allowed
MAX_HEIGHT=1500

# Counter for processed images
processed_count=0
resized_count=0

echo "Starting image processing in directory: $TARGET_DIR"

# Check if target directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Target directory '$TARGET_DIR' not found."
    exit 1
fi

# Find images and process them
# Use process substitution to avoid subshell issue with counters
while IFS= read -r -d $'\0' image_file; do
    ((processed_count++))
    echo "Processing ($processed_count): $image_file"

    current_height=$(sips -g pixelHeight "$image_file" | awk '/pixelHeight/ {print $2}')

    if ! [[ "$current_height" =~ ^[0-9]+$ ]]; then
        echo "  Warning: Could not determine height for $image_file. Skipping."
        continue
    fi

    if [ "$current_height" -gt "$MAX_HEIGHT" ]; then
        echo "  Height ($current_height px) > $MAX_HEIGHT px. Resizing..."
        sips --resampleHeight $MAX_HEIGHT "$image_file"
        if [ $? -eq 0 ]; then
            echo "  Successfully resized $image_file to height $MAX_HEIGHT px."
            ((resized_count++))
        else
            echo "  Error: Failed to resize $image_file."
        fi
    else
        echo "  Height ($current_height px) <= $MAX_HEIGHT px. No resize needed."
    fi
    echo "----"
done < <(find "$TARGET_DIR" -type f \
\( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" \
-o -iname "*.bmp" -o -iname "*.tiff" -o -iname "*.tif" \
-o -iname "*.heic" -o -iname "*.heif" -o -iname "*.webp" \) \
-print0)

echo "Script finished."
echo "Total images checked in $TARGET_DIR: $processed_count"
echo "Total images resized: $resized_count" 