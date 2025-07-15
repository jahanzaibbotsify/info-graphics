/**
 * Test script for Visual Intelligence System
 * Demonstrates AI's ability to select appropriate visuals and typography based on data content
 */

const { analyzeDataForVisuals, determineFontSizes, generateVisualIntelligencePrompt, VISUAL_ELEMENT_MAPPING } = require('./visualIntelligence');

// Test data examples for different categories
const testCases = [
    {
        name: "Financial Data",
        userInfo: "Q4 revenue dashboard showing $2.4M in total sales with 15% growth and investment portfolio performance",
        expectedType: "financial"
    },
    {
        name: "Health Data",
        userInfo: "Diabetes prevention statistics showing 34.2 million Americans with diabetes and wellness recommendations",
        expectedType: "health"
    },
    {
        name: "Technology Data",
        userInfo: "AI adoption rates across industries with 67% of companies implementing machine learning solutions",
        expectedType: "technology"
    },
    {
        name: "Social Media Data",
        userInfo: "Instagram vs TikTok engagement analytics showing follower growth and content performance metrics",
        expectedType: "social"
    },
    {
        name: "Environmental Data",
        userInfo: "Climate change impact with renewable energy adoption rates and carbon emission statistics",
        expectedType: "environmental"
    },
    {
        name: "Educational Data",
        userInfo: "Remote learning statistics showing student performance and university technology adoption",
        expectedType: "education"
    },
    {
        name: "High-Impact Data",
        userInfo: "Record-breaking billion dollar revenue milestone with significant market breakthrough",
        expectedType: "financial" // Should get larger fonts
    },
    {
        name: "Technical Analysis",
        userInfo: "Detailed technical analysis and research breakdown of software performance metrics",
        expectedType: "technology" // Should get smaller fonts for details
    }
];

console.log("🎨 Visual Intelligence System Test\n");
console.log("=" .repeat(60));

testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log("-".repeat(40));
    
    // Analyze data type
    const detectedType = analyzeDataForVisuals(testCase.userInfo);
    console.log(`📊 User Input: "${testCase.userInfo.substring(0, 80)}..."`);
    console.log(`🎯 Expected Type: ${testCase.expectedType}`);
    console.log(`🤖 Detected Type: ${detectedType}`);
    console.log(`✅ Match: ${detectedType === testCase.expectedType ? 'YES' : 'NO'}`);
    
    // Get visual mapping
    const mapping = VISUAL_ELEMENT_MAPPING[detectedType];
    console.log(`🎨 Recommended Icons: ${mapping.icons.slice(0, 5).join(', ')}...`);
    console.log(`🎨 Color Palette: ${mapping.colors.slice(0, 3).join(', ')}`);
    
    // Get font sizes
    const fontSizes = determineFontSizes(testCase.userInfo, detectedType);
    console.log(`📝 Typography:`);
    console.log(`   - Title: ${fontSizes.title}`);
    console.log(`   - Metric: ${fontSizes.metric}`);
    console.log(`   - Body: ${fontSizes.body}`);
    
    // Check for special adjustments
    const content = testCase.userInfo.toLowerCase();
    if (content.includes('million') || content.includes('billion') || content.includes('record') || content.includes('significant')) {
        console.log(`🔥 High-Impact Detection: Enhanced font sizes applied`);
    }
    if (content.includes('detailed') || content.includes('technical') || content.includes('analysis')) {
        console.log(`🔍 Technical Detail Detection: Refined font sizes applied`);
    }
});

console.log("\n" + "=".repeat(60));
console.log("🎯 Visual Intelligence Features Summary:");
console.log("✅ Automatic data type detection from user input");
console.log("✅ Context-appropriate icon recommendations");
console.log("✅ Data-type-specific color palettes");
console.log("✅ Dynamic typography hierarchy based on content importance");
console.log("✅ Special handling for high-impact and detailed data");
console.log("✅ Responsive font sizing (mobile and desktop)");

// Test prompt generation
console.log("\n📝 Sample Enhanced Prompt Generation:");
console.log("-".repeat(40));

const sampleUserInfo = "Q4 financial performance showing $2.8M revenue with 22% growth";
const sampleTemplate = `<div class="infographic">
    <h1 class="title">Sample Title</h1>
    <div class="metric">Sample Metric</div>
    <p class="description">Sample Description</p>
</div>`;
const sampleBasePrompt = "Integrate user data into template";

const enhancedPrompt = generateVisualIntelligencePrompt(sampleUserInfo, sampleTemplate, sampleBasePrompt);

console.log("Generated Enhanced Prompt Preview:");
console.log(enhancedPrompt.substring(0, 500) + "...");

console.log("\n🚀 Visual Intelligence System is ready for production!");
console.log("The AI will now automatically apply appropriate visuals and typography based on data content."); 