const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');

let openai;
try {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
} catch (error) {
    console.log('OpenAI not configured');
}

async function generateInfographic(userInfo) {
    try {
        // Check if OpenAI is configured
        if (!openai || !process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is required for infographic generation. Please configure OPENAI_API_KEY in your environment variables.');
        }

        // Read the prompt from the text file
        const promptPath = path.join(__dirname, '..', 'public', 'files', 'prompt.txt');
        let basePrompt;
        try {
            basePrompt = fs.readFileSync(promptPath, 'utf8');
        } catch (error) {
            console.log('Prompt file not found, using default prompt');
            basePrompt = 'Edit an HTML document by integrating user data into a predefined HTML template, ensuring only the data is updated while maintaining the original design.';
        }

        // Updated template descriptions for the new templates
        const templateDescriptions = {
            'chart-analytics.html': 'Analytics dashboard with mixed chart types - Best for: business analytics, dashboard overviews, performance metrics, mixed data types, general business intelligence reports. Features multiple chart sections and KPI displays.',
            'tips-infographic.html': 'Tips and educational infographic - Best for: educational content, how-to guides, tips lists, process explanations, instructional materials. Features numbered tips with icons and explanations.',
            'market-comparison.html': 'Market comparison chart - Best for: competitive analysis, market share comparisons, product vs product, benchmarking data, versus analysis. Features side-by-side comparison visualizations.',
            'financial-dashboard.html': 'Financial performance dashboard - Best for: financial reporting, investment data, stock performance, revenue metrics, portfolio analysis, financial KPIs. Features financial-specific charts and currency displays.',
            'social-media-metrics.html': 'Social media analytics - Best for: social platform performance, engagement metrics, follower data, content performance, social media reporting. Features platform-specific visualizations.',
            'survey-results.html': 'Survey and research results - Best for: poll results, survey data, research findings, satisfaction ratings, demographic analysis, questionnaire responses. Features survey-specific data presentations.',
            'business-kpi.html': 'Business KPI dashboard - Best for: goal tracking, performance indicators, target vs actual metrics, quarterly reports, business objectives, progress monitoring. Features KPI-focused layouts.',
            'product-showcase.html': 'Product showcase and features - Best for: product launches, app showcases, feature presentations, product benefits, app store displays, software demos. Features modern card layouts and feature grids.',
            'pricing-comparison.html': 'Pricing plans and subscription tiers - Best for: subscription plans, pricing tables, plan comparisons, feature breakdowns, SaaS pricing, service packages. Features clean pricing table design.',
            'event-promotion.html': 'Event promotion and conferences - Best for: conference promotion, festival announcements, event schedules, speaker showcases, workshop details, meetup promotion. Features vibrant event-style design.',
            'team-structure.html': 'Team and organizational structure - Best for: company hierarchy, team introductions, organizational charts, staff showcases, department structures, corporate profiles. Features person cards and org charts.',
            'timeline-infographic.html': 'Timeline and process visualization - Best for: project timelines, historical events, process flows, milestones, roadmaps, step-by-step guides. Features chronological layout design.'
        };

        // Step 1: AI selects the best template based on data type using the intelligent selection criteria
        const selectionPrompt = `Analyze the user request and select the most appropriate infographic template based on these criteria:

USER REQUEST: ${userInfo}

SELECTION CRITERIA:
1. FINANCIAL: Revenue, stocks, investments, financial metrics → financial-dashboard.html
2. COMPARISON: VS, competitors, market share, benchmarking → market-comparison.html  
3. SOCIAL MEDIA: Platforms, followers, engagement, social analytics → social-media-metrics.html
4. SURVEY/RESEARCH: Polls, feedback, satisfaction, research results → survey-results.html
5. BUSINESS KPI: Goals, targets, progress, quarterly performance → business-kpi.html
6. TIPS/EDUCATION: How-to, guides, tips, educational content → tips-infographic.html
7. GENERAL ANALYTICS: Dashboard, overview, mixed metrics → chart-analytics.html
8. PRODUCT: Product launch, app showcase, features, benefits, demos → product-showcase.html
9. PRICING: Subscription plans, pricing tables, plan comparison, SaaS pricing → pricing-comparison.html
10. EVENTS: Conferences, festivals, workshops, meetups, event promotion → event-promotion.html
11. TEAM/ORG: Company hierarchy, team structure, staff, organizational charts → team-structure.html
12. TIMELINE: Project timelines, roadmaps, milestones, process flows, chronological → timeline-infographic.html

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
            'chart-analytics.html',
            'tips-infographic.html', 
            'market-comparison.html',
            'financial-dashboard.html',
            'social-media-metrics.html',
            'survey-results.html',
            'business-kpi.html',
            'product-showcase.html',
            'pricing-comparison.html',
            'event-promotion.html',
            'team-structure.html',
            'timeline-infographic.html'
        ];
        
        const finalTemplate = validTemplates.includes(selectedTemplate) ? selectedTemplate : 'chart-analytics.html';
        
        if (finalTemplate !== selectedTemplate) {
            console.log(`Invalid template selection "${selectedTemplate}", falling back to ${finalTemplate}`);
        }

        // Step 2: Load the selected template
        const templatePath = path.join(__dirname, 'templates', finalTemplate);
        let templateHtml;
        try {
            templateHtml = fs.readFileSync(templatePath, 'utf8');
        } catch (error) {
            throw new Error(`Template ${finalTemplate} not found. Please ensure all template files are present in the backend/templates directory.`);
        }

        // Step 3: AI populates the selected template with data only
        const populationPrompt = `${basePrompt}

User Data to Integrate: ${userInfo}

HTML Template (DO NOT MODIFY STRUCTURE):
${templateHtml}

CRITICAL INSTRUCTIONS:
1. ONLY update data content - titles, numbers, percentages, chart data arrays
2. DO NOT modify HTML structure, CSS classes, or JavaScript code
3. DO NOT change styling, colors, or layout
4. DO NOT add or remove HTML elements
5. Keep all CDN links and external dependencies exactly as they are

Data Integration Requirements:
- Replace template titles with topic from user data
- Update all statistical values with user's numbers  
- Modify chart data arrays (if present) with user's data
- Change category labels to match user's context
- Update source information if provided
- Ensure data consistency (percentages sum correctly)

Return ONLY the complete HTML document with user data integrated into the existing template structure.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert data integrator. Your ONLY job is to replace data content within the provided HTML template. NEVER modify HTML structure, CSS, or JavaScript. Only update text content, numbers, and data arrays. Preserve the exact template design and functionality."
                },
                {
                    role: "user",
                    content: populationPrompt
                }
            ],
            temperature: 0.7,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating infographic:', error);
        throw error;
    }
}

module.exports = {
    generateInfographic
};
