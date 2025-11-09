#!/bin/bash

# Character Image Download Script
# This script helps you download character images from Unsplash

echo "====================================="
echo "Literary Chat - Character Image Setup"
echo "====================================="
echo ""

# Create characters directory if it doesn't exist
mkdir -p public/characters

echo "To download images for characters, visit the following URLs and save them:"
echo ""

echo "1. Sherlock Holmes (sherlock-holmes.jpg)"
echo "   URL: https://unsplash.com/s/photos/detective-magnifying-glass"
echo "   Search: 'detective victorian magnifying glass'"
echo ""

echo "2. Elizabeth Bennet (elizabeth-bennet.jpg)"
echo "   URL: https://unsplash.com/s/photos/regency-dress"
echo "   Search: 'regency era dress woman portrait'"
echo ""

echo "3. Holden Caulfield (holden-caulfield.jpg)"
echo "   URL: https://unsplash.com/s/photos/vintage-teenager"
echo "   Search: '1950s teenage boy vintage'"
echo ""

echo "4. Hermione Granger (hermione-granger.jpg)"
echo "   URL: https://unsplash.com/s/photos/student-reading"
echo "   Search: 'student girl reading books library'"
echo ""

echo "5. Atticus Finch (atticus-finch.jpg)"
echo "   URL: https://unsplash.com/s/photos/vintage-lawyer"
echo "   Search: '1930s professional man lawyer'"
echo ""

echo "6. Jay Gatsby (jay-gatsby.jpg)"
echo "   URL: https://unsplash.com/s/photos/1920s-man"
echo "   Search: '1920s man suit art deco'"
echo ""

echo "7. Jane Eyre (jane-eyre.jpg)"
echo "   URL: https://unsplash.com/s/photos/victorian-portrait"
echo "   Search: 'victorian woman portrait gothic'"
echo ""

echo "8. Dracula (dracula.jpg)"
echo "   URL: https://unsplash.com/s/photos/gothic-vampire"
echo "   Search: 'gothic vampire castle dark'"
echo ""

echo "====================================="
echo "Alternative: Use AI Image Generation"
echo "====================================="
echo ""
echo "You can also generate images using AI tools like:"
echo "- DALL-E: https://openai.com/dall-e"
echo "- Midjourney: https://midjourney.com"
echo "- Stable Diffusion"
echo ""
echo "Example prompt: 'Portrait of [character name] from [book], [era/style], realistic'"
echo ""

echo "After downloading, place images in: public/characters/"
echo "Files should be named exactly as shown above"
echo ""
echo "====================================="
