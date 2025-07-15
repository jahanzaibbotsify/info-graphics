/**
 * Visual Intelligence Module for Infographic Generation
 * Provides AI prompts and logic for intelligent visual element selection and typography
 */

// Visual element mapping based on data types and content
const VISUAL_ELEMENT_MAPPING = {
    business: {
        icons: ['📊', '💼', '📈', '💰', '🏢', '📋', '🎯', '📊', '💹', '🔧'],
        illustrations: ['charts', 'graphs', 'office-scenes', 'meeting-rooms', 'presentations'],
        colors: ['#2563eb', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'],
        fontSizes: {
            title: 'text-4xl lg:text-5xl', // 36-48px
            subtitle: 'text-xl lg:text-2xl', // 20-24px
            metric: 'text-3xl lg:text-4xl', // 30-36px
            body: 'text-base lg:text-lg' // 16-18px
        }
    },
    health: {
        icons: ['🏥', '💊', '🩺', '❤️', '🧬', '🔬', '💉', '🏃‍♂️', '🥗', '💪'],
        illustrations: ['medical-equipment', 'health-charts', 'human-anatomy', 'wellness-icons'],
        colors: ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fed7d7'],
        fontSizes: {
            title: 'text-3xl lg:text-4xl',
            subtitle: 'text-lg lg:text-xl',
            metric: 'text-2xl lg:text-3xl',
            body: 'text-sm lg:text-base'
        }
    },
    technology: {
        icons: ['💻', '📱', '🤖', '⚡', '🔧', '🌐', '📡', '💾', '🖥️', '⚙️'],
        illustrations: ['tech-devices', 'network-diagrams', 'ai-robots', 'digital-interfaces'],
        colors: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
        fontSizes: {
            title: 'text-4xl lg:text-5xl',
            subtitle: 'text-xl lg:text-2xl',
            metric: 'text-3xl lg:text-4xl',
            body: 'text-base lg:text-lg'
        }
    },
    financial: {
        icons: ['💰', '📈', '💹', '🏦', '💳', '💎', '📊', '🤑', '💵', '🔒'],
        illustrations: ['financial-charts', 'money-stacks', 'investment-growth', 'banking-icons'],
        colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
        fontSizes: {
            title: 'text-4xl lg:text-6xl', // Larger for financial impact
            subtitle: 'text-2xl lg:text-3xl',
            metric: 'text-4xl lg:text-5xl', // Emphasis on numbers
            body: 'text-base lg:text-lg'
        }
    },
    social: {
        icons: ['📱', '👥', '💬', '❤️', '👍', '📸', '🎥', '🌟', '🔄', '📊'],
        illustrations: ['social-networks', 'people-connections', 'engagement-icons', 'platform-logos'],
        colors: ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#fdf2f8'],
        fontSizes: {
            title: 'text-3xl lg:text-4xl',
            subtitle: 'text-lg lg:text-xl',
            metric: 'text-2xl lg:text-3xl',
            body: 'text-sm lg:text-base'
        }
    },
    environmental: {
        icons: ['🌍', '🌱', '♻️', '🌿', '⚡', '☀️', '🌊', '🏔️', '🌳', '🍃'],
        illustrations: ['nature-scenes', 'renewable-energy', 'climate-charts', 'eco-icons'],
        colors: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
        fontSizes: {
            title: 'text-3xl lg:text-4xl',
            subtitle: 'text-lg lg:text-xl',
            metric: 'text-2xl lg:text-3xl',
            body: 'text-sm lg:text-base'
        }
    },
    education: {
        icons: ['📚', '🎓', '📝', '🏫', '💡', '🧠', '📖', '✏️', '🔬', '📐'],
        illustrations: ['school-scenes', 'learning-icons', 'education-charts', 'academic-symbols'],
        colors: ['#ea580c', '#fb7c2c', '#fdba74', '#fed7aa', '#fff7ed'],
        fontSizes: {
            title: 'text-3xl lg:text-4xl',
            subtitle: 'text-lg lg:text-xl',
            metric: 'text-2xl lg:text-3xl',
            body: 'text-sm lg:text-base'
        }
    }
};

// Function to analyze data content and determine appropriate visual elements
function analyzeDataForVisuals(userInfo) {
    const content = userInfo.toLowerCase();
    
    // Detect data type based on keywords
    let dataType = 'business'; // default
    
    if (content.includes('health') || content.includes('medical') || content.includes('disease') || 
        content.includes('diabetes') || content.includes('wellness') || content.includes('clinical')) {
        dataType = 'health';
    } else if (content.includes('technology') || content.includes('ai') || content.includes('software') || 
               content.includes('digital') || content.includes('tech') || content.includes('app')) {
        dataType = 'technology';
    } else if (content.includes('financial') || content.includes('revenue') || content.includes('profit') || 
               content.includes('investment') || content.includes('stock') || content.includes('money')) {
        dataType = 'financial';
    } else if (content.includes('social') || content.includes('instagram') || content.includes('facebook') || 
               content.includes('twitter') || content.includes('engagement') || content.includes('followers')) {
        dataType = 'social';
    } else if (content.includes('environment') || content.includes('climate') || content.includes('renewable') || 
               content.includes('sustainability') || content.includes('green') || content.includes('carbon')) {
        dataType = 'environmental';
    } else if (content.includes('education') || content.includes('learning') || content.includes('student') || 
               content.includes('school') || content.includes('academic') || content.includes('university')) {
        dataType = 'education';
    }
    
    return dataType;
}

// Function to determine font size hierarchy based on data importance
function determineFontSizes(userInfo, dataType) {
    const mapping = VISUAL_ELEMENT_MAPPING[dataType];
    const content = userInfo.toLowerCase();
    
    // Adjust font sizes based on data emphasis keywords
    let fontSizes = { ...mapping.fontSizes };
    
    // Increase sizes for high-impact data
    if (content.includes('million') || content.includes('billion') || content.includes('breakthrough') || 
        content.includes('record') || content.includes('significant') || content.includes('major')) {
        fontSizes.title = 'text-5xl lg:text-6xl';
        fontSizes.metric = 'text-4xl lg:text-5xl';
    }
    
    // Smaller sizes for detailed/technical data
    if (content.includes('detailed') || content.includes('technical') || content.includes('breakdown') || 
        content.includes('analysis') || content.includes('research')) {
        fontSizes.body = 'text-xs lg:text-sm';
        fontSizes.subtitle = 'text-base lg:text-lg';
    }
    
    return fontSizes;
}

// Enhanced AI prompt for visual intelligence
function generateVisualIntelligencePrompt(userInfo, templateHtml, basePrompt) {
    const dataType = analyzeDataForVisuals(userInfo);
    const visualMapping = VISUAL_ELEMENT_MAPPING[dataType];
    const fontSizes = determineFontSizes(userInfo, dataType);
    
    return `${basePrompt}

USER DATA TO INTEGRATE: ${userInfo}

VISUAL INTELLIGENCE GUIDELINES:
📊 DATA TYPE DETECTED: ${dataType.toUpperCase()}

🎨 VISUAL ELEMENTS TO USE:
- Recommended Icons: ${visualMapping.icons.join(', ')}
- Illustration Style: ${visualMapping.illustrations.join(', ')}
- Color Palette: ${visualMapping.colors.join(', ')}

📝 TYPOGRAPHY HIERARCHY:
- Main Title: ${fontSizes.title} (Use for primary heading)
- Subtitle: ${fontSizes.subtitle} (Use for secondary headings)
- Key Metrics: ${fontSizes.metric} (Use for important numbers/percentages)
- Body Text: ${fontSizes.body} (Use for descriptions and details)

🖼️ VISUAL ENHANCEMENT INSTRUCTIONS:
1. ICON SELECTION: Choose icons that directly relate to your data content from the recommended list
   - For business data: Use 📊, 📈, 💼 for professional appeal
   - For health data: Use 🏥, ❤️, 💊 for medical context
   - For tech data: Use 💻, 🤖, ⚡ for innovation feel

2. FONT SIZE INTELLIGENCE:
   - Apply larger fonts (${fontSizes.title}) to the most important data points
   - Use medium fonts (${fontSizes.metric}) for key statistics and percentages
   - Apply smaller fonts (${fontSizes.body}) for supporting information
   - Ensure hierarchy: Most important → Largest, Supporting details → Smallest

3. COLOR COORDINATION:
   - Primary color: ${visualMapping.colors[0]} (for main elements)
   - Secondary color: ${visualMapping.colors[1]} (for supporting elements)
   - Accent colors: ${visualMapping.colors.slice(2).join(', ')} (for highlights)

4. VISUAL CONTEXT MATCHING:
   - Match visual elements to data content (e.g., 📈 for growth, 🏥 for health)
   - Use appropriate illustrations that enhance data understanding
   - Ensure visual consistency throughout the infographic

HTML TEMPLATE TO POPULATE:
${templateHtml}

CRITICAL IMPLEMENTATION RULES:
1. ONLY modify content within existing HTML structure
2. Apply font size classes directly to text elements (e.g., <h1 class="${fontSizes.title}">)
3. Replace placeholder icons with contextually appropriate ones
4. Update color values using the recommended palette
5. Maintain all existing CSS classes and structure
6. DO NOT change HTML layout or add new elements
7. Ensure all text is readable with chosen font sizes
8. Return ONLY the complete HTML document with enhanced visuals

Enhanced Visual Output Guidelines:
- Make the infographic visually compelling and data-appropriate
- Use the recommended color palette for cohesive design
- Apply font hierarchy that guides viewer attention to key data
- Include relevant icons that enhance data comprehension
- Ensure visual elements support rather than distract from the data story`;
}

module.exports = {
    VISUAL_ELEMENT_MAPPING,
    analyzeDataForVisuals,
    determineFontSizes,
    generateVisualIntelligencePrompt
}; 