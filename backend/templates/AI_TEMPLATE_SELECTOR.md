# AI Template Selection System

## 🤖 Intelligent Template Matching

This system analyzes user requirements and automatically selects the most appropriate infographic template based on data type, use case, and context.

## 📋 Template Selection Criteria

### 1. **Chart Analytics Dashboard** (`chart-analytics.html`)
**Trigger Keywords:**
- "analytics", "dashboard", "overview", "performance", "metrics", "KPI"
- "data visualization", "business intelligence", "reporting"
- "monthly/quarterly reports", "general analytics"

**Data Indicators:**
- Mixed data types (percentages, currency, growth rates)
- Multiple chart types needed
- General business performance data
- 4-8 key metrics to display

**User Intent:**
- Creating comprehensive business reports
- Showing overall performance
- General data visualization needs

**Selection Prompt:**
```
If user mentions: analytics, dashboard, performance metrics, business overview, mixed data types, or needs a general-purpose data visualization, SELECT: chart-analytics.html
```

### 2. **Market Comparison Chart** (`market-comparison.html`)
**Trigger Keywords:**
- "comparison", "vs", "versus", "competitor", "market share"
- "competitive analysis", "benchmark", "against", "compared to"
- "leader", "competition", "market position"

**Data Indicators:**
- Comparison data between entities
- Market share percentages
- Competitive metrics
- Side-by-side analysis needs

**User Intent:**
- Comparing products/services
- Competitive analysis
- Market positioning
- Performance benchmarking

**Selection Prompt:**
```
If user mentions: comparison, competitor analysis, market share, benchmarking, versus/vs, competitive landscape, or needs to compare multiple entities, SELECT: market-comparison.html
```

### 3. **Financial Dashboard** (`financial-dashboard.html`)
**Trigger Keywords:**
- "financial", "finance", "money", "revenue", "profit", "investment"
- "stock", "portfolio", "trading", "ROI", "P&L", "earnings"
- "budget", "financial performance", "monetary"

**Data Indicators:**
- Currency values
- Financial ratios
- Stock prices
- Investment data
- Portfolio allocations

**User Intent:**
- Financial reporting
- Investment summaries
- Stock analysis
- Financial performance tracking

**Selection Prompt:**
```
If user mentions: financial data, money, revenue, stocks, investments, portfolio, trading, financial performance, or any monetary metrics, SELECT: financial-dashboard.html
```

### 4. **Social Media Metrics** (`social-media-metrics.html`)
**Trigger Keywords:**
- "social media", "Instagram", "Facebook", "Twitter", "TikTok"
- "followers", "engagement", "likes", "shares", "comments"
- "social analytics", "platform performance", "content metrics"

**Data Indicators:**
- Social platform data
- Follower counts
- Engagement rates
- Content performance
- Platform-specific metrics

**User Intent:**
- Social media reporting
- Content strategy analysis
- Platform performance tracking
- Engagement analysis

**Selection Prompt:**
```
If user mentions: social media platforms, followers, engagement, social analytics, content performance, platform metrics, or any social media related data, SELECT: social-media-metrics.html
```

### 5. **Survey Results** (`survey-results.html`)
**Trigger Keywords:**
- "survey", "poll", "questionnaire", "feedback", "responses"
- "satisfaction", "rating", "customer feedback", "research"
- "demographics", "age groups", "survey data"

**Data Indicators:**
- Survey response data
- Satisfaction ratings
- Demographic breakdowns
- Poll results
- Research findings

**User Intent:**
- Presenting survey findings
- Customer feedback analysis
- Market research results
- Poll visualization

**Selection Prompt:**
```
If user mentions: survey, poll, questionnaire, customer feedback, satisfaction ratings, research results, demographics, or response data, SELECT: survey-results.html
```

### 6. **Business KPI Dashboard** (`business-kpi.html`)
**Trigger Keywords:**
- "KPI", "key performance indicators", "business metrics"
- "goals", "targets", "objectives", "progress tracking"
- "quarterly", "annual", "business performance"

**Data Indicators:**
- Goal progress data
- Target vs actual metrics
- Business performance indicators
- Growth tracking
- Quarterly/annual data

**User Intent:**
- Business performance tracking
- Goal progress visualization
- Executive reporting
- Strategic planning support

**Selection Prompt:**
```
If user mentions: KPIs, business goals, targets, progress tracking, quarterly/annual performance, business metrics, or goal achievement, SELECT: business-kpi.html
```

## 🎯 AI Selection Algorithm

### Primary Analysis Steps:

1. **Keyword Extraction**: Identify key terms in user request
2. **Data Type Recognition**: Analyze the type of data mentioned
3. **Use Case Classification**: Determine the primary purpose
4. **Context Evaluation**: Consider additional context clues

### Decision Matrix:

```
IF (financial_keywords > 2 OR currency_mentioned OR investment_data)
    → SELECT: financial-dashboard.html

ELSE IF (comparison_keywords > 1 OR "vs" mentioned OR competitive_data)
    → SELECT: market-comparison.html

ELSE IF (social_media_keywords > 1 OR platform_names mentioned)
    → SELECT: social-media-metrics.html

ELSE IF (survey_keywords > 1 OR feedback_data OR research_mentioned)
    → SELECT: survey-results.html

ELSE IF (kpi_keywords > 1 OR goals_mentioned OR progress_tracking)
    → SELECT: business-kpi.html

ELSE (default for general analytics OR mixed_data_types)
    → SELECT: chart-analytics.html
```

## 🔧 Implementation Prompts

### Main Template Selection Prompt:
```
Analyze the user's request and select the most appropriate infographic template based on these criteria:

1. FINANCIAL DATA (money, revenue, stocks, investments, financial performance)
   → Use: financial-dashboard.html

2. COMPARISON/COMPETITIVE (vs, competitor, market share, benchmarking)
   → Use: market-comparison.html

3. SOCIAL MEDIA (platforms, followers, engagement, social analytics)
   → Use: social-media-metrics.html

4. SURVEY/RESEARCH (polls, feedback, satisfaction, survey results)
   → Use: survey-results.html

5. BUSINESS KPIs (goals, targets, progress, quarterly performance)
   → Use: business-kpi.html

6. GENERAL ANALYTICS (dashboard, overview, mixed metrics, business performance)
   → Use: chart-analytics.html

User Request: "{USER_INPUT}"

Selected Template: [template-name.html]
Reasoning: [Brief explanation of why this template was chosen]
```

### Data Customization Prompt:
```
Based on the selected template {SELECTED_TEMPLATE} and user data:

1. Extract key metrics from user input
2. Map data to appropriate chart types in the template
3. Suggest color scheme based on data context
4. Recommend chart modifications if needed
5. Provide customization instructions

User Data: "{USER_DATA}"
Template: {SELECTED_TEMPLATE}

Customization Plan:
- Data Mapping: [How to map user data to template elements]
- Color Scheme: [Recommended colors based on context]
- Modifications: [Any template adjustments needed]
- Instructions: [Step-by-step customization guide]
```

### Quality Assurance Prompt:
```
Verify template selection accuracy:

1. Does the selected template match the data type?
2. Are the chart types appropriate for the data?
3. Will the template effectively communicate the user's message?
4. Are there any better alternatives?

If template selection needs adjustment, provide alternative recommendation with reasoning.

Selected: {SELECTED_TEMPLATE}
User Intent: {USER_INTENT}
Data Type: {DATA_TYPE}

Verification Result: [APPROVED/NEEDS_CHANGE]
Alternative: [If needed, suggest better template]
```

## 📊 Usage Examples

### Example 1: Financial Request
**User Input**: "I need to show our Q4 revenue, stock performance, and portfolio allocation"
**AI Analysis**: Keywords: revenue (financial), stock (financial), portfolio (financial)
**Selected Template**: `financial-dashboard.html`
**Reasoning**: Multiple financial indicators requiring financial-specific visualizations

### Example 2: Social Media Request
**User Input**: "Create an infographic showing Instagram vs TikTok engagement rates and follower growth"
**AI Analysis**: Keywords: Instagram (social), TikTok (social), engagement (social), followers (social)
**Selected Template**: `social-media-metrics.html`
**Reasoning**: Platform-specific social media metrics requiring social analytics layout

### Example 3: Comparison Request
**User Input**: "Compare our product against 3 competitors showing market share and performance"
**AI Analysis**: Keywords: compare (comparison), competitors (comparison), market share (comparison)
**Selected Template**: `market-comparison.html`
**Reasoning**: Competitive analysis requiring side-by-side comparison layout

### Example 4: Survey Request
**User Input**: "Display customer satisfaction survey results with demographics breakdown"
**AI Analysis**: Keywords: survey (research), satisfaction (survey), demographics (survey)
**Selected Template**: `survey-results.html`
**Reasoning**: Survey data requiring satisfaction ratings and demographic visualizations

### Example 5: Business Performance Request
**User Input**: "Show our quarterly KPIs, goal progress, and business metrics dashboard"
**AI Analysis**: Keywords: KPIs (business), goal progress (business), quarterly (business)
**Selected Template**: `business-kpi.html`
**Reasoning**: Business performance tracking requiring KPI-specific layouts

### Example 6: General Analytics Request
**User Input**: "Create a dashboard showing various business metrics and performance data"
**AI Analysis**: Keywords: dashboard (general), metrics (general), performance (general)
**Selected Template**: `chart-analytics.html`
**Reasoning**: Mixed data types requiring flexible analytics dashboard layout

## 🚀 Integration Instructions

1. **Input Processing**: Analyze user text for keywords and data types
2. **Template Matching**: Use decision matrix to select appropriate template
3. **Data Mapping**: Map user data to template structure
4. **Customization**: Apply user-specific modifications
5. **Output Generation**: Provide template with customized data

This system ensures users always get the most suitable template for their specific data visualization needs! 📊✨ 