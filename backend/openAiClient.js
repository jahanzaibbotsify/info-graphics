const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
const { generateVisualIntelligencePrompt, analyzeDataForVisuals } = require('./visualIntelligence');

let openai;
try {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
} catch (error) {
    console.log('OpenAI not configured');
}

async function generateInfographic(userInfo, existingHtml = null) {
    try {
        // Check if OpenAI is configured
        if (!openai || !process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is required for infographic generation. Please configure OPENAI_API_KEY in your environment variables.');
        }

        // If we're updating an existing infographic
        if (existingHtml) {
            // Analyze data type for visual intelligence
            const dataType = analyzeDataForVisuals(userInfo);
            
            const updatePrompt = `Update the following HTML infographic based on this request: ${userInfo}

VISUAL INTELLIGENCE FOR UPDATES:
📊 Data Type: ${dataType.toUpperCase()}

HTML to Update:
${existingHtml}

CRITICAL INSTRUCTIONS:
1. ONLY modify the content that needs to be updated based on the user's request
2. Apply intelligent visual enhancements based on data type:
   - Use appropriate icons and colors for ${dataType} data
   - Adjust font sizes based on data importance and hierarchy
   - Maintain visual consistency with the detected data type
3. DO NOT change any HTML structure, CSS classes, or JavaScript code that isn't explicitly mentioned
4. Preserve all styling, colors, and layout unless specifically asked to change
5. Keep all existing elements that aren't mentioned in the update request
6. Maintain all CDN links and external dependencies exactly as they are
7. Return ONLY the raw HTML content - no markdown or code blocks

Visual Enhancement Guidelines:
- Apply larger fonts to key metrics and important data points
- Use contextually appropriate icons that match the ${dataType} theme
- Ensure visual hierarchy guides attention to the most important information
- Maintain readability while enhancing visual appeal

Return ONLY the complete HTML document with the requested updates and visual enhancements integrated. No formatting, no code blocks, just raw HTML.`;

            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert at precise HTML updates with visual intelligence. Your job is to modify ONLY the specific content requested while applying intelligent visual enhancements based on data type. Use appropriate icons, colors, and font sizes that match the data context. Never change structure or styling unless explicitly asked. Return only raw HTML."
                    },
                    {
                        role: "user",
                        content: updatePrompt
                    }
                ],
                temperature: 0.3,
            });

            let htmlContent = response.choices[0].message.content;
            return cleanHtmlContent(htmlContent);
        }

        // Step 0: Validate that the request is appropriate for factual data visualizations
        const validationPrompt = `You are a content validator for a data visualization AI system. Your job is to determine if a user request is appropriate for creating factual data visualizations and infographics.

ACCEPTABLE REQUESTS:
- Statistics and data analysis
- Business metrics and KPIs
- Health data and medical information  
- Technology trends and adoption rates
- Financial data and market analysis
- Social media analytics and engagement metrics
- Educational statistics and learning outcomes
- Environmental data and climate statistics
- Survey results and research findings
- Economic indicators and comparisons
- Demographic data and population statistics
- Scientific data and research visualization
- Industry trends and market insights
- Performance metrics and analytics dashboards

UNACCEPTABLE REQUESTS:
- Recipes and cooking instructions
- Entertainment content (movies, music, games)
- Personal stories and narratives
- Generic creative content
- Travel itineraries and guides
- Fashion and styling advice
- Product reviews unrelated to data
- General how-to guides without data
- Poetry, jokes, or creative writing
- Generic web content without statistics

USER REQUEST: "${userInfo}"

Analyze the request and respond with ONLY one word:
- "VALID" if the request is for factual data visualization, statistics, analytics, or quantifiable information
- "INVALID" if the request is for recipes, entertainment, or content outside data visualization scope

Response:`;

        const validationResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a strict content validator for data visualization requests. Only approve requests that involve factual data, statistics, analytics, or quantifiable information that can be visualized. Reject requests for recipes, entertainment, creative content, or anything not related to data visualization."
                },
                {
                    role: "user",
                    content: validationPrompt
                }
            ],
            temperature: 0.1,
            max_tokens: 10
        });

        const validationResult = validationResponse.choices[0].message.content.trim().toUpperCase();
        
        if (validationResult === "INVALID") {
            throw new Error('I specialize in creating factual data visualizations and infographics. Please provide requests related to statistics, data analysis, business metrics, health data, technology trends, or other factual information that can be visualized. Generic requests like recipes, entertainment, or unrelated topics are outside my expertise.');
        }

        // If validation passes, continue with existing logic
        // Read the prompt from the text file
        const promptPath = path.join(__dirname, '..', 'public', 'files', 'prompt.txt');
        let basePrompt;
        try {
            basePrompt = fs.readFileSync(promptPath, 'utf8');
        } catch (error) {
            console.log('Prompt file not found, using default prompt');
            basePrompt = 'Edit an HTML document by integrating user data into a predefined HTML template, ensuring only the data is updated while maintaining the original design.';
        }

        // Updated template descriptions for ALL available templates
        const templateDescriptions = {
            // New modern templates
            'modern-statistics-overview.html': 'Modern clean business statistics overview - Best for: professional business insights, quarterly metrics, clean presentations, executive summaries, performance indicators. Features clean modern design with professional styling.',
            'minimal-data-showcase.html': 'Minimal asymmetric data showcase - Best for: key metrics display, large number highlighting, two-column layouts, gradient text, clean design, executive dashboards. Features minimal design with prominent numbers.',
            'circular-metrics-layout.html': 'Circular orbital metrics layout - Best for: performance radar, central metrics with surrounding data, 360° visualization, radial charts, futuristic presentations. Features circular/orbital design patterns.',
            'vertical-timeline-stats.html': 'Vertical timeline statistics - Best for: quarterly progression, growth tracking, time series data, historical analysis, timeline visualization, chronological data. Features vertical timeline layout.',
            'geometric-data-grid.html': 'Geometric grid data layout - Best for: categorical data, grid layouts, hexagonal/triangular shapes, modern visualization, geometric presentations, angular designs. Features geometric shape patterns.',
            'diagonal-split-layout.html': 'Diagonal split analytics layout - Best for: analytics dashboards, department performance, large central metrics, split view analysis, performance tracking. Features diagonal split design.',
            'online-learning-infographic.html': 'Pros and cons of online learning - Best for: educational insights, e-learning presentations, student and teacher resources, remote education analysis. Features a balanced, modern layout with clear benefits and drawbacks, engaging visuals, and professional styling.',
            'diabetes-info.html': 'Diabetes information infographic - Best for: health education, disease awareness, medical info, diabetes types, symptoms, and treatments. Features clear sections for types, symptoms, and treatments with engaging visuals and health-focused design.',
            'diabetes-bg.html': 'Diabetes background infographic - Best for: health education, disease awareness, diabetes symptoms, treatment, and prevention. Features a visually engaging background, clear symptom icons, and sections for treatment and prevention tips.',
            'Infographics-Stock-Illustrations.html': 'Stock illustrations infographic - Best for: step-by-step processes, business workflows, multi-step guides, visual explanations, and general infographics. Features a central info circle, surrounding process steps, and colorful icon-based design.',
            'the-time-spend-on-internet.html': 'Internet usage and work-life infographic - Best for: visualizing time spent online, workplace stress, work week statistics, and digital habits. Features large headline stats, pie charts, and engaging layouts for internet and work-life data.',

            // Existing corrected templates  
            'data-visualization-report.html': 'Analytics dashboard with mixed chart types - Best for: business analytics, dashboard overviews, performance metrics, mixed data types, general business intelligence reports. Features multiple chart sections and KPI displays.',
            'financial-analytics.html': 'Financial performance dashboard - Best for: financial reporting, investment data, stock performance, revenue metrics, portfolio analysis, financial KPIs. Features financial-specific charts and currency displays.',
            'social-media-comparison.html': 'Social media analytics comparison - Best for: social platform performance, engagement metrics, follower data, content performance, social media reporting, platform comparisons. Features platform-specific visualizations.',
            'customer-analytics.html': 'Customer analytics and insights - Best for: customer data, satisfaction metrics, demographic analysis, customer journey, behavior tracking, customer intelligence. Features customer-focused visualizations.',
            'sales-performance-dashboard.html': 'Sales performance dashboard - Best for: sales metrics, revenue tracking, sales team performance, quarterly sales, sales targets, conversion rates. Features sales-specific KPI layouts.',
            'marketing-trends-timeline.html': 'Marketing trends and timeline - Best for: marketing campaigns, trend analysis, campaign performance, marketing timelines, brand metrics, marketing ROI. Features marketing-focused timeline design.',
            'global-economic-comparison.html': 'Global economic comparison - Best for: country comparisons, economic indicators, global markets, international data, geographic comparisons, economic analysis. Features global/economic data layouts.'
        };

        // Step 1: AI selects the best template based on data type using the intelligent selection criteria
        const selectionPrompt = `Analyze the user request and select the most appropriate infographic template based on these criteria:

USER REQUEST: ${userInfo}

SELECTION CRITERIA:
1. MODERN BUSINESS: Clean, professional business insights, quarterly metrics → modern-statistics-overview.html
2. MINIMAL SHOWCASE: Key metrics, large numbers, minimal design, two-column → minimal-data-showcase.html
3. CIRCULAR METRICS: Performance radar, central metric, 360° visualization → circular-metrics-layout.html
4. TIMELINE DATA: Quarterly progression, growth tracking, time series → vertical-timeline-stats.html
5. GEOMETRIC DESIGN: Grid layouts, hexagonal shapes, modern visualization → geometric-data-grid.html
6. SPLIT ANALYTICS: Analytics dashboard, department performance, large central metric → diagonal-split-layout.html
7. FINANCIAL: Revenue, stocks, investments, financial metrics → financial-analytics.html
8. SOCIAL MEDIA: Platforms, followers, engagement, social analytics → social-media-comparison.html
9. CUSTOMER DATA: Customer analytics, satisfaction, demographics → customer-analytics.html
10. SALES METRICS: Sales performance, revenue tracking, sales targets → sales-performance-dashboard.html
11. MARKETING: Marketing campaigns, trends, campaign performance → marketing-trends-timeline.html
12. GLOBAL/ECONOMIC: Country comparisons, economic indicators, global markets → global-economic-comparison.html
13. GENERAL ANALYTICS: Dashboard, overview, mixed metrics (fallback) → data-visualization-report.html
14. ONLINE LEARNING: Educational insights, e-learning, student/teacher resources, remote education analysis → online-learning-infographic.html
15. DIABETES INFO: Diabetes types, symptoms, treatments, health education → diabetes-info.html
16. DIABETES BG: Diabetes symptoms, treatment, prevention, health education → diabetes-bg.html
17. INFOGRAPHICS STOCK ILLUSTRATIONS: Step-by-step processes, business workflows, multi-step guides, visual explanations → Infographics-Stock-Illustrations.html
18. TIME SPENT ON INTERNET: Internet usage, work-life balance, workplace stress, digital habits, time statistics → the-time-spend-on-internet.html

Available Templates:
${Object.entries(templateDescriptions).map(([name, desc]) => `- ${name}: ${desc}`).join('\n')}

Analysis Process:
1. Identify key keywords in the user request
2. Determine the primary data type (financial, social media, survey, etc.)
3. Match use case to template strength
4. Consider visualization requirements

Based on the user data content, which template best matches the data structure and visualization needs?
Respond with ONLY the template filename (e.g., "chart-analytics.html").`;

        const selectionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an intelligent infographic template selector. Analyze user requests and select the most appropriate template from the available options based on data type, keywords, and use case. Always provide reasoning for your selection and respond with only the template filename."
                },
                {
                    role: "user",
                    content: selectionPrompt
                }
            ],
            temperature: 0.3,
        });

        const selectedTemplate = selectionResponse.choices[0].message.content.trim();
        console.log(`AI selected template: ${selectedTemplate}`);

        // Validate selected template against available templates
        const validTemplates = [
            'modern-statistics-overview.html',
            'minimal-data-showcase.html',
            'circular-metrics-layout.html',
            'vertical-timeline-stats.html',
            'geometric-data-grid.html',
            'diagonal-split-layout.html',
            'financial-analytics.html',
            'social-media-comparison.html',
            'customer-analytics.html',
            'sales-performance-dashboard.html',
            'marketing-trends-timeline.html',
            'global-economic-comparison.html',
            'data-visualization-report.html',
            'online-learning-infographic.html',
            'diabetes-info.html',
            'diabetes-bg.html',
            'Infographics-Stock-Illustrations.html',
            'the-time-spend-on-internet.html'
        ];
        
        const finalTemplate = validTemplates.includes(selectedTemplate) ? selectedTemplate : 'data-visualization-report.html';
        
        if (finalTemplate !== selectedTemplate) {
            console.log(`Invalid template selection "${selectedTemplate}", falling back to ${finalTemplate}`);
        }

        // Step 2: Load the selected template
        const templatePath = path.join(__dirname, 'templates', finalTemplate);
        let templateHtml;
        try {
            templateHtml = fs.readFileSync(templatePath, 'utf8');
            templateHtml = templateHtml.replace('{base_url}', process.env.SERVER_URL ?? '');            
        } catch (error) {
            throw new Error(`Template ${finalTemplate} not found. Please ensure all template files are present in the backend/templates directory.`);
        }

        // Step 3: AI populates the selected template with enhanced visual intelligence
        const populationPrompt = generateVisualIntelligencePrompt(userInfo, templateHtml, basePrompt);

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert data integrator with visual intelligence capabilities. Your job is to populate HTML templates with user data while applying intelligent visual enhancements based on data type. Use appropriate icons, colors, and font sizes that match the data context. Apply dynamic typography hierarchy based on data importance. NEVER modify HTML structure, CSS, or JavaScript beyond content updates and visual enhancements. CRITICAL: Return ONLY raw HTML content - NO markdown formatting, NO code blocks, NO triple backticks. Apply visual intelligence to make data compelling and contextually appropriate."
                },
                {
                    role: "user",
                    content: populationPrompt
                }
            ],
            temperature: 0.7,
        });

        let htmlContent = response.choices[0].message.content;
        
        // Clean up any markdown code blocks that might still appear
        htmlContent = cleanHtmlContent(htmlContent);

        return htmlContent;
    } catch (error) {
        console.error('Error generating infographic:', error);
        throw error;
    }
}

// Function to clean up markdown code blocks from HTML content
function cleanHtmlContent(content) {
    // Remove markdown code blocks
    content = content.replace(/```html\s*\n?/gi, '');
    content = content.replace(/```\s*$/g, '');
    content = content.replace(/^\s*```html\s*/gi, '');
    content = content.replace(/\s*```\s*$/g, '');
    
    // Ensure content starts with <!DOCTYPE or <html
    content = content.trim();
    
    return content;
}

// Function to analyze if a message is requesting modification to an infographic
async function analyzeMessageForModification(message, chatContext) {
    try {
        // First validate that the message is appropriate for data visualization context
        const validationPrompt = `You are validating a user message in the context of data visualization and infographic modification.

ACCEPTABLE REQUESTS:
- Questions about the infographic data or statistics
- Requests to modify colors, layout, or design elements
- Requests to update data values or add new data
- Questions about data interpretation or insights
- Requests to change chart types or visualization styles
- Technical questions about the infographic content

UNACCEPTABLE REQUESTS:
- Recipes and cooking instructions
- Entertainment content discussions
- Personal stories unrelated to data
- Generic creative content requests
- Travel, fashion, or lifestyle advice
- Content completely unrelated to data visualization

USER MESSAGE: "${message}"

Respond with ONLY one word:
- "VALID" if the message is related to data visualization, infographic modification, or factual data discussion
- "INVALID" if the message is completely unrelated to data visualization or infographics

Response:`;

        const validationResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a validator for infographic-related conversations. Only approve messages that relate to data visualization, infographic modification, or factual data discussions."
                },
                {
                    role: "user",
                    content: validationPrompt
                }
            ],
            temperature: 0.1,
            max_tokens: 10
        });

        const validationResult = validationResponse.choices[0].message.content.trim().toUpperCase();
        
        if (validationResult === "INVALID") {
            return 'invalid';
        }

        // If validation passes, analyze the intent
        const analysisPrompt = `Analyze this user message to determine the intent in the context of infographic interaction:

USER MESSAGE: "${message}"
CHAT CONTEXT: ${chatContext.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Classify the message intent. Respond with ONLY one word:
- "modify" if the user wants to change, update, edit, or modify the infographic
- "factual" if the user is asking questions about the data, seeking information, or having a factual discussion

Examples:
- "Change the colors to blue" → modify
- "Make the chart bigger" → modify
- "Update the revenue to 2.5M" → modify
- "What does this data mean?" → factual
- "How was this calculated?" → factual
- "Can you explain the trends?" → factual

Response:`;

        const analysisResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an intent classifier for infographic interactions. Determine if the user wants to modify the infographic or is asking factual questions about the data."
                },
                {
                    role: "user",
                    content: analysisPrompt
                }
            ],
            temperature: 0.1,
            max_tokens: 10
        });

        const intent = analysisResponse.choices[0].message.content.trim().toLowerCase();
        
        if (intent === 'modify' || intent === 'factual') {
            return intent;
        }
        
        // Default to factual if unclear
        return 'factual';
        
    } catch (error) {
        console.error('Error analyzing message:', error);
        return 'invalid';
    }
}

// Function to generate conversational response about infographic data
async function generateConversationalResponse(message, chatContext, existingInfographic) {
    try {
        const responsePrompt = `You are an AI assistant specializing in data visualization and infographics. A user is asking about their infographic data.

INFOGRAPHIC CONTEXT:
Title: ${existingInfographic.title}
Original Request: ${existingInfographic.userInfo}

USER MESSAGE: "${message}"
CHAT HISTORY: ${chatContext.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Guidelines for your response:
1. Focus on factual data and statistical insights
2. Provide helpful explanations about the data visualization
3. Offer constructive suggestions related to data interpretation
4. Keep responses educational and informative
5. Stay within the context of data visualization and analytics
6. If the question is outside your expertise, politely redirect to data-related topics

Generate a helpful, conversational response that addresses the user's question while staying focused on data visualization and factual information.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a knowledgeable assistant specializing in data visualization and infographics. Provide helpful, educational responses about data interpretation, visualization techniques, and statistical insights. Always stay focused on factual data and avoid topics outside of data visualization."
                },
                {
                    role: "user",
                    content: responsePrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 300
        });

        return response.choices[0].message.content.trim();
        
    } catch (error) {
        console.error('Error generating conversational response:', error);
        return "I can help you with questions about your infographic data and visualization. Please ask about the statistics, data interpretation, or visualization elements.";
    }
}

module.exports = {
    generateInfographic,
    analyzeMessageForModification,
    generateConversationalResponse
};
