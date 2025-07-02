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

        // Updated template descriptions for ALL available templates
        const templateDescriptions = {
            // New modern templates
            'modern-statistics-overview.html': 'Modern clean business statistics overview - Best for: professional business insights, quarterly metrics, clean presentations, executive summaries, performance indicators. Features clean modern design with professional styling.',
            'minimal-data-showcase.html': 'Minimal asymmetric data showcase - Best for: key metrics display, large number highlighting, two-column layouts, gradient text, clean design, executive dashboards. Features minimal design with prominent numbers.',
            'circular-metrics-layout.html': 'Circular orbital metrics layout - Best for: performance radar, central metrics with surrounding data, 360° visualization, radial charts, futuristic presentations. Features circular/orbital design patterns.',
            'vertical-timeline-stats.html': 'Vertical timeline statistics - Best for: quarterly progression, growth tracking, time series data, historical analysis, timeline visualization, chronological data. Features vertical timeline layout.',
            'geometric-data-grid.html': 'Geometric grid data layout - Best for: categorical data, grid layouts, hexagonal/triangular shapes, modern visualization, geometric presentations, angular designs. Features geometric shape patterns.',
            'diagonal-split-layout.html': 'Diagonal split analytics layout - Best for: analytics dashboards, department performance, large central metrics, split view analysis, performance tracking. Features diagonal split design.',
            
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
            'data-visualization-report.html'
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
6. DO NOT wrap the response in markdown code blocks or any other formatting
7. DO NOT use triple backticks or html code block tags - return ONLY the raw HTML content

Data Integration Requirements:
- Replace template titles with topic from user data
- Update all statistical values with user's numbers  
- Modify chart data arrays (if present) with user's data
- Change category labels to match user's context
- Update source information if provided
- Ensure data consistency (percentages sum correctly)

Return ONLY the complete HTML document with user data integrated into the existing template structure. No markdown formatting, no code blocks, just raw HTML.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert data integrator. Your ONLY job is to replace data content within the provided HTML template. NEVER modify HTML structure, CSS, or JavaScript. Only update text content, numbers, and data arrays. Preserve the exact template design and functionality. CRITICAL: Return ONLY raw HTML content - NO markdown formatting, NO code blocks, NO triple backticks or html tags. Just return the plain HTML document."
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

module.exports = {
    generateInfographic
};
