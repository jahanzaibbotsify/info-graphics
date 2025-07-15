/**
 * Data Structure Intelligence Module
 * Analyzes user data to determine component duplication needs and structural enhancements
 */

// Component duplication patterns based on data structure
const COMPONENT_PATTERNS = {
    cards: {
        triggers: ['categories', 'departments', 'platforms', 'metrics', 'kpis', 'comparison', 'vs', 'between'],
        minCount: 2,
        maxCount: 8,
        detectMultiple: (userInfo) => {
            const content = userInfo.toLowerCase();
            
            // Detect lists and multiple items
            const listIndicators = [
                content.match(/(\d+)\s*(categories|departments|platforms|teams|metrics|kpis)/),
                content.match(/(and|vs|versus|compared to|between)/g),
                content.match(/(\w+),\s*(\w+),\s*(\w+)/g), // comma-separated lists
                content.match(/(top|best|worst)\s*(\d+)/),
                content.match(/(\w+)\s*(vs|versus)\s*(\w+)/g)
            ];
            
            // Count explicit numbers
            const numberMatch = content.match(/(\d+)\s*(categories|departments|platforms|teams|metrics|kpis|items|sections)/);
            if (numberMatch) {
                return Math.min(parseInt(numberMatch[1]), 8);
            }
            
            // Count comparison items
            const vsMatches = content.match(/(vs|versus|compared to|between)/g);
            if (vsMatches) {
                return Math.min(vsMatches.length + 1, 6);
            }
            
            // Count comma-separated items
            const commaItems = content.split(/,|\band\b/).filter(item => item.trim().length > 2);
            if (commaItems.length > 2) {
                return Math.min(commaItems.length, 6);
            }
            
            return 3; // Default for multiple items
        }
    },
    
    charts: {
        triggers: ['trends', 'over time', 'quarterly', 'monthly', 'yearly', 'growth', 'timeline'],
        detectTimePoints: (userInfo) => {
            const content = userInfo.toLowerCase();
            
            // Detect time-based data points
            if (content.includes('quarterly')) return 4;
            if (content.includes('monthly')) return 12;
            if (content.includes('yearly') || content.includes('annual')) return 5;
            if (content.includes('weekly')) return 8;
            
            // Look for specific time mentions
            const timeMatches = content.match(/(q1|q2|q3|q4|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/gi);
            if (timeMatches) {
                return Math.min(timeMatches.length, 12);
            }
            
            return 6; // Default timeline points
        }
    },
    
    grids: {
        triggers: ['breakdown', 'analysis', 'overview', 'dashboard', 'summary', 'multiple'],
        detectGridSize: (userInfo) => {
            const content = userInfo.toLowerCase();
            
            // Count different data types mentioned
            const dataTypes = [
                content.includes('revenue') || content.includes('sales'),
                content.includes('growth') || content.includes('increase'),
                content.includes('users') || content.includes('customers'),
                content.includes('engagement') || content.includes('interaction'),
                content.includes('conversion') || content.includes('rate'),
                content.includes('traffic') || content.includes('visitors'),
                content.includes('retention') || content.includes('churn'),
                content.includes('satisfaction') || content.includes('rating')
            ].filter(Boolean).length;
            
            if (dataTypes >= 6) return { rows: 3, cols: 2 };
            if (dataTypes >= 4) return { rows: 2, cols: 2 };
            if (dataTypes >= 3) return { rows: 3, cols: 1 };
            
            return { rows: 2, cols: 1 }; // Default grid
        }
    }
};

// Icon and illustration integration patterns
const VISUAL_INTEGRATION_PATTERNS = {
    business: {
        cardIcons: ['📊', '📈', '💼', '🎯', '📋', '💹', '🏢', '💰'],
        illustrations: {
            header: '📊', // Main dashboard icon
            sections: ['📈', '💼', '🎯', '📋'], // Section-specific icons
            metrics: '💹', // For numbers/percentages
            growth: '📈', // For positive trends
            decline: '📉' // For negative trends
        },
        backgroundPattern: 'business-gradient'
    },
    
    health: {
        cardIcons: ['🏥', '❤️', '💊', '🩺', '🧬', '💉', '🏃‍♂️', '🥗'],
        illustrations: {
            header: '🏥',
            sections: ['❤️', '💊', '🩺', '🧬'],
            metrics: '📊',
            positive: '✅',
            warning: '⚠️'
        },
        backgroundPattern: 'medical-gradient'
    },
    
    technology: {
        cardIcons: ['💻', '📱', '🤖', '⚡', '🌐', '📡', '💾', '🖥️'],
        illustrations: {
            header: '🤖',
            sections: ['💻', '📱', '⚡', '🌐'],
            metrics: '📊',
            innovation: '⚡',
            data: '💾'
        },
        backgroundPattern: 'tech-gradient'
    },
    
    financial: {
        cardIcons: ['💰', '📈', '💹', '🏦', '💳', '💎', '🤑', '💵'],
        illustrations: {
            header: '💰',
            sections: ['📈', '💹', '🏦', '💳'],
            metrics: '💰',
            profit: '📈',
            loss: '📉'
        },
        backgroundPattern: 'financial-gradient'
    },
    
    social: {
        cardIcons: ['📱', '👥', '💬', '❤️', '👍', '📸', '🎥', '🌟'],
        illustrations: {
            header: '📱',
            sections: ['👥', '💬', '❤️', '👍'],
            metrics: '📊',
            engagement: '❤️',
            growth: '🌟'
        },
        backgroundPattern: 'social-gradient'
    },
    
    environmental: {
        cardIcons: ['🌍', '🌱', '♻️', '🌿', '⚡', '☀️', '🌊', '🌳'],
        illustrations: {
            header: '🌍',
            sections: ['🌱', '♻️', '⚡', '☀️'],
            metrics: '📊',
            positive: '🌱',
            renewable: '⚡'
        },
        backgroundPattern: 'eco-gradient'
    }
};

// Transparency and styling patterns
const TRANSPARENCY_PATTERNS = {
    cards: {
        background: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white
        backdrop: 'blur(10px)', // Glass effect
        border: 'rgba(255, 255, 255, 0.2)',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    
    grids: {
        container: 'rgba(255, 255, 255, 0.05)',
        items: 'rgba(255, 255, 255, 0.1)',
        hover: 'rgba(255, 255, 255, 0.15)'
    },
    
    overlays: {
        light: 'rgba(255, 255, 255, 0.8)',
        medium: 'rgba(255, 255, 255, 0.6)',
        dark: 'rgba(0, 0, 0, 0.2)'
    }
};

/**
 * Analyze user data to determine component duplication needs
 */
function analyzeDataStructure(userInfo) {
    const content = userInfo.toLowerCase();
    const analysis = {
        needsCardDuplication: false,
        cardCount: 1,
        needsChartExpansion: false,
        chartPoints: 1,
        needsGridLayout: false,
        gridSize: { rows: 1, cols: 1 },
        dataComplexity: 'simple'
    };
    
    // Check for card duplication needs
    for (const trigger of COMPONENT_PATTERNS.cards.triggers) {
        if (content.includes(trigger)) {
            analysis.needsCardDuplication = true;
            analysis.cardCount = COMPONENT_PATTERNS.cards.detectMultiple(userInfo);
            break;
        }
    }
    
    // Check for chart expansion needs
    for (const trigger of COMPONENT_PATTERNS.charts.triggers) {
        if (content.includes(trigger)) {
            analysis.needsChartExpansion = true;
            analysis.chartPoints = COMPONENT_PATTERNS.charts.detectTimePoints(userInfo);
            break;
        }
    }
    
    // Check for grid layout needs
    for (const trigger of COMPONENT_PATTERNS.grids.triggers) {
        if (content.includes(trigger)) {
            analysis.needsGridLayout = true;
            analysis.gridSize = COMPONENT_PATTERNS.grids.detectGridSize(userInfo);
            break;
        }
    }
    
    // Determine data complexity
    const complexityIndicators = [
        analysis.needsCardDuplication,
        analysis.needsChartExpansion,
        analysis.needsGridLayout,
        content.includes('detailed'),
        content.includes('comprehensive'),
        content.includes('breakdown')
    ].filter(Boolean).length;
    
    if (complexityIndicators >= 3) analysis.dataComplexity = 'complex';
    else if (complexityIndicators >= 1) analysis.dataComplexity = 'moderate';
    
    return analysis;
}

/**
 * Generate component duplication instructions
 */
function generateComponentInstructions(dataStructure, dataType) {
    const visualPatterns = VISUAL_INTEGRATION_PATTERNS[dataType] || VISUAL_INTEGRATION_PATTERNS.business;
    let instructions = [];
    
    if (dataStructure.needsCardDuplication) {
        instructions.push(`
🔄 COMPONENT DUPLICATION - CARDS:
- Create ${dataStructure.cardCount} cards to display all data categories
- Each card should have:
  * Unique icon from: ${visualPatterns.cardIcons.join(', ')}
  * Transparent background: ${TRANSPARENCY_PATTERNS.cards.background}
  * Glass effect: backdrop-filter: ${TRANSPARENCY_PATTERNS.cards.backdrop}
  * Border: ${TRANSPARENCY_PATTERNS.cards.border}
  * Shadow: ${TRANSPARENCY_PATTERNS.cards.shadow}
- Distribute data evenly across cards
- Apply consistent spacing and alignment`);
    }
    
    if (dataStructure.needsChartExpansion) {
        instructions.push(`
📊 CHART EXPANSION:
- Expand chart to show ${dataStructure.chartPoints} data points
- Use appropriate time labels (Q1-Q4, months, years)
- Add trend indicators: ${visualPatterns.illustrations.growth} for increases, ${visualPatterns.illustrations.decline || '📉'} for decreases
- Apply data-appropriate colors and styling`);
    }
    
    if (dataStructure.needsGridLayout) {
        instructions.push(`
🏗️ GRID LAYOUT ENHANCEMENT:
- Create ${dataStructure.gridSize.rows}x${dataStructure.gridSize.cols} grid layout
- Grid container background: ${TRANSPARENCY_PATTERNS.grids.container}
- Grid items background: ${TRANSPARENCY_PATTERNS.grids.items}
- Hover effect: ${TRANSPARENCY_PATTERNS.grids.hover}
- Each grid item should have relevant icon and data
- Maintain responsive design`);
    }
    
    return instructions.join('\n');
}

/**
 * Generate illustration and icon integration instructions
 */
function generateVisualIntegrationInstructions(dataType, dataStructure) {
    const patterns = VISUAL_INTEGRATION_PATTERNS[dataType] || VISUAL_INTEGRATION_PATTERNS.business;
    
    return `
🎨 VISUAL INTEGRATION INSTRUCTIONS:

📍 ICON PLACEMENT:
- Header/Title Icon: ${patterns.illustrations.header}
- Section Icons: ${patterns.illustrations.sections.join(', ')} (rotate based on content)
- Metric Icons: ${patterns.illustrations.metrics} (for numerical data)
- Status Icons: ${patterns.illustrations.positive || '✅'} (positive), ${patterns.illustrations.warning || '⚠️'} (caution)

🖼️ ILLUSTRATION INTEGRATION:
- Replace generic placeholders with contextual icons
- Add icons before section titles
- Use metric-specific icons for numbers and percentages
- Apply icons consistently throughout the design

🎭 TRANSPARENCY EFFECTS:
- Card backgrounds: ${TRANSPARENCY_PATTERNS.cards.background}
- Apply glass morphism: backdrop-filter: ${TRANSPARENCY_PATTERNS.cards.backdrop}
- Grid containers: ${TRANSPARENCY_PATTERNS.grids.container}
- Maintain readability while adding visual depth

💡 IMPLEMENTATION RULES:
1. Place icons using <span class="icon">🔥</span> or similar structure
2. Apply transparency classes: bg-white/10, backdrop-blur-sm
3. Ensure icons enhance rather than clutter the design
4. Use consistent icon sizing and spacing
5. Test contrast and readability with transparent backgrounds`;
}

/**
 * Generate comprehensive enhancement prompt
 */
function generateDataStructurePrompt(userInfo, templateHtml, basePrompt, dataType) {
    const dataStructure = analyzeDataStructure(userInfo);
    const componentInstructions = generateComponentInstructions(dataStructure, dataType);
    const visualInstructions = generateVisualIntegrationInstructions(dataType, dataStructure);
    
    return `${basePrompt}

USER DATA TO POPULATE: ${userInfo}

🧠 DATA STRUCTURE ANALYSIS:
- Complexity Level: ${dataStructure.dataComplexity.toUpperCase()}
- Cards Needed: ${dataStructure.cardCount}
- Chart Points: ${dataStructure.chartPoints}
- Grid Layout: ${dataStructure.gridSize.rows}x${dataStructure.gridSize.cols}

${componentInstructions}

${visualInstructions}

HTML TEMPLATE TO ENHANCE:
${templateHtml}

🎯 COMPREHENSIVE ENHANCEMENT REQUIREMENTS:

1. DATA POPULATION:
   - Distribute user data across duplicated components
   - Ensure each component has meaningful, relevant content
   - Apply appropriate data formatting and presentation

2. COMPONENT DUPLICATION:
   - Intelligently duplicate cards, sections, or grid items as needed
   - Maintain template structure while expanding content
   - Apply consistent styling across duplicated elements

3. VISUAL INTEGRATION:
   - Add contextual icons and illustrations
   - Apply transparency effects to cards and grids
   - Enhance visual hierarchy with appropriate icons

4. STYLING ENHANCEMENTS:
   - Implement glass morphism effects with backdrop-filter
   - Apply semi-transparent backgrounds for modern look
   - Maintain accessibility and readability

🔧 CRITICAL IMPLEMENTATION RULES:
- Duplicate HTML elements when needed, not just content
- Add icons using emoji or icon classes within existing structure  
- Apply transparency with rgba() values and backdrop-filter
- Maintain responsive design across all enhancements
- Ensure all duplicated components have unique, relevant data
- Return ONLY the complete enhanced HTML - no markdown or code blocks

Enhanced Template Output: Generate a comprehensive, visually rich infographic with intelligent component duplication, integrated illustrations, and modern transparency effects.`;
}

module.exports = {
    COMPONENT_PATTERNS,
    VISUAL_INTEGRATION_PATTERNS,
    TRANSPARENCY_PATTERNS,
    analyzeDataStructure,
    generateComponentInstructions,
    generateVisualIntegrationInstructions,
    generateDataStructurePrompt
}; 