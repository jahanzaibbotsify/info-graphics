#!/usr/bin/env node

const htmlToImageService = require('./services/htmlToImageService');
const path = require('path');

const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            margin: 0; 
            padding: 40px; 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            width: 100%;
            min-height: 1080px;
        }
        .container {
            text-align: center;
            padding: 50px;
        }
        h1 {
            font-size: 48px;
            margin-bottom: 20px;
        }
        p {
            font-size: 24px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Test Infographic</h1>
        <p>This is a test to verify image generation is working correctly.</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>
`;

async function testImageGeneration() {
    try {
        console.log('🧪 Testing image generation...\n');
        
        const filename = `test_infographic_${Date.now()}.png`;
        const result = await htmlToImageService.convertAndSave(testHTML, filename);
        
        if (result.success) {
            console.log('✅ Image generation successful!');
            console.log(`📁 Image saved as: ${filename}`);
            console.log(`📍 Full path: ${result.imagePath}`);
            console.log(`🔗 URL endpoint: /images/${filename}`);
        } else {
            console.log('❌ Image generation failed!');
            console.log('Error:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
if (require.main === module) {
    testImageGeneration();
}

module.exports = testImageGeneration; 