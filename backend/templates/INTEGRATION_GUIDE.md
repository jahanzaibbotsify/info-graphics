# 🚀 AI Template Selection - Integration Guide

## Overview

This guide shows how to integrate the intelligent template selection system into your application. The AI analyzes user input and automatically selects the most appropriate infographic template from 6 available options.

## 📁 Files Overview

- `AI_TEMPLATE_SELECTOR.md` - Detailed documentation and selection criteria
- `AI_PROMPTS.json` - Structured prompts and configuration for AI systems
- `template_selector.py` - Python implementation example
- `INTEGRATION_GUIDE.md` - This integration guide

## 🔧 Quick Integration

### For AI/LLM Integration

Use the prompts from `AI_PROMPTS.json` directly in your AI system:

```python
import json

# Load the prompt configuration
with open('AI_PROMPTS.json', 'r') as f:
    prompts = json.load(f)

# Main template selection prompt
selection_prompt = prompts['templateSelection']['mainPrompt']
user_request = "Show Q4 financial performance with revenue and stock data"

# Format the prompt
formatted_prompt = selection_prompt.format(user_input=user_request)

# Send to your AI system (OpenAI, Claude, etc.)
response = ai_client.generate(formatted_prompt)
```

### For Custom Implementation

Use the Python class as a starting point:

```python
from template_selector import TemplateSelector

# Initialize the selector
selector = TemplateSelector()

# Analyze user request
user_input = "Create a social media analytics dashboard"
template, analysis = selector.select_template(user_input)

print(f"Selected: {template}")
print(f"Confidence: {analysis['confidence']}")
print(f"Reasoning: {analysis['reasoning']}")
```

## 🎯 Template Selection Logic

### Decision Flow

```
User Input → Keyword Analysis → Data Type Detection → Use Case Analysis → Context Bonus → Final Selection
```

### Scoring System

| Factor | Points | Description |
|--------|--------|-------------|
| Keyword Match | 2 per match | Direct keyword matches in user input |
| Data Type Match | 3 per match | Detected data patterns (currency, percentages, etc.) |
| Use Case Match | 4 per match | Identified use case patterns |
| Context Bonus | 1-5 | Additional context-based scoring |

### Template Priority

1. **financial-dashboard.html** - Financial data gets highest priority
2. **market-comparison.html** - Comparison requests are clearly identifiable
3. **social-media-metrics.html** - Platform-specific data is distinctive
4. **survey-results.html** - Survey/research data has unique patterns
5. **business-kpi.html** - KPI/goal tracking has specific terminology
6. **chart-analytics.html** - Default for general analytics

## 📋 Implementation Examples

### Example 1: Simple Web API

```python
from flask import Flask, request, jsonify
from template_selector import TemplateSelector

app = Flask(__name__)
selector = TemplateSelector()

@app.route('/select-template', methods=['POST'])
def select_template():
    user_input = request.json.get('user_input')
    template, analysis = selector.select_template(user_input)
    
    return jsonify({
        'selected_template': template,
        'confidence': analysis['confidence'],
        'reasoning': analysis['reasoning'],
        'scores': analysis['scores']
    })

if __name__ == '__main__':
    app.run(debug=True)
```

### Example 2: ChatBot Integration

```python
def process_user_message(message):
    """Process user message and return template recommendation"""
    selector = TemplateSelector()
    template, analysis = selector.select_template(message)
    
    # Generate response
    if analysis['confidence'] == 'High':
        response = f"✅ I recommend using **{template}** for your request.\n"
        response += f"Reasoning: {analysis['reasoning']}"
    elif analysis['confidence'] == 'Medium':
        response = f"🤔 I suggest **{template}**, but let me know if you need something different.\n"
        response += f"Reasoning: {analysis['reasoning']}"
    else:
        response = f"❓ I'm defaulting to **{template}**. Could you provide more details about your data?"
    
    return response, template
```

### Example 3: Direct AI Prompt Usage

```python
import openai

def select_template_with_ai(user_input):
    """Use OpenAI to select template based on prompts"""
    
    # Load prompt from configuration
    with open('AI_PROMPTS.json', 'r') as f:
        config = json.load(f)
    
    system_prompt = config['templateSelection']['systemPrompt']
    main_prompt = config['templateSelection']['mainPrompt'].format(user_input=user_input)
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": main_prompt}
        ]
    )
    
    return response.choices[0].message.content
```

## 🎨 Customization After Selection

Once a template is selected, use the customization prompts:

```python
def generate_customization_instructions(template, user_data):
    """Generate step-by-step customization guide"""
    selector = TemplateSelector()
    
    # Generate customization prompt
    custom_prompt = selector.generate_customization_prompt(template, user_data)
    
    # Send to AI for processing
    instructions = ai_client.generate(custom_prompt)
    
    return instructions
```

## 🔍 Quality Assurance

Validate template selection with QA prompts:

```python
def validate_selection(template, user_request, data_type):
    """Validate template selection quality"""
    selector = TemplateSelector()
    
    # Generate QA prompt
    qa_prompt = selector.generate_qa_prompt(template, user_request, data_type)
    
    # Process with AI
    validation = ai_client.generate(qa_prompt)
    
    return validation
```

## 📊 Testing the System

Run the demo to test selection accuracy:

```bash
python template_selector.py
```

Expected output for test cases:

```
📝 TEST CASE 1:
Input: Create an infographic showing Q4 revenue of $2.4M, portfolio allocation, and stock performance with 15% growth
✅ Selected: financial-dashboard.html
🎯 Confidence: High
💡 Reasoning: Keywords matched: financial, revenue, portfolio; Data types detected: currency; Additional context bonus: +3 points
📊 Score: 15
```

## 🛠️ Advanced Configuration

### Custom Keywords

Add domain-specific keywords to `AI_PROMPTS.json`:

```json
{
  "templateSelection": {
    "selectionRules": {
      "financial-dashboard.html": {
        "keywords": ["financial", "revenue", "profit", "crypto", "blockchain"],
        "customKeywords": ["your-domain-specific-terms"]
      }
    }
  }
}
```

### Custom Scoring

Modify scoring weights in the Python implementation:

```python
def custom_scoring(self, keyword_score, data_type_score, use_case_score, context_bonus):
    """Custom scoring algorithm"""
    # Weight financial data higher
    if template == 'financial-dashboard.html':
        return keyword_score * 1.5 + data_type_score * 2 + use_case_score + context_bonus
    
    return keyword_score + data_type_score + use_case_score + context_bonus
```

## 🔗 Integration Patterns

### Pattern 1: Microservice

```python
# Template selection microservice
@app.route('/api/v1/templates/select', methods=['POST'])
def select_template_api():
    data = request.get_json()
    user_input = data.get('input')
    context = data.get('context', {})
    
    # Enhanced selection with context
    template, analysis = enhanced_select(user_input, context)
    
    return jsonify({
        'template': template,
        'analysis': analysis,
        'next_steps': generate_next_steps(template, user_input)
    })
```

### Pattern 2: Plugin Architecture

```python
class TemplatePlugin:
    def __init__(self):
        self.selector = TemplateSelector()
    
    def process(self, user_request):
        template, analysis = self.selector.select_template(user_request)
        return {
            'template_path': f'templates/{template}',
            'customization_guide': self.generate_guide(template, user_request)
        }
```

### Pattern 3: Batch Processing

```python
def process_batch_requests(requests):
    """Process multiple template selection requests"""
    selector = TemplateSelector()
    results = []
    
    for request in requests:
        template, analysis = selector.select_template(request['input'])
        results.append({
            'request_id': request['id'],
            'template': template,
            'confidence': analysis['confidence']
        })
    
    return results
```

## 📝 Best Practices

### 1. Error Handling

```python
def safe_template_selection(user_input):
    try:
        selector = TemplateSelector()
        template, analysis = selector.select_template(user_input)
        return template, analysis
    except Exception as e:
        # Fallback to default template
        return 'chart-analytics.html', {'confidence': 'Low', 'error': str(e)}
```

### 2. Caching

```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_template_selection(user_input_hash):
    selector = TemplateSelector()
    return selector.select_template(user_input_hash)
```

### 3. Logging

```python
import logging

def logged_selection(user_input):
    selector = TemplateSelector()
    template, analysis = selector.select_template(user_input)
    
    logging.info(f"Template selected: {template}, Confidence: {analysis['confidence']}")
    logging.debug(f"Analysis details: {analysis}")
    
    return template, analysis
```

## 🚀 Deployment

### Environment Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export TEMPLATE_PATH="/path/to/templates"
export AI_API_KEY="your-api-key"

# Run the service
python app.py
```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

EXPOSE 5000
CMD ["python", "app.py"]
```

## 📈 Monitoring

Track selection accuracy and user satisfaction:

```python
def track_selection_metrics(template, user_feedback):
    """Track template selection performance"""
    metrics = {
        'template': template,
        'user_satisfaction': user_feedback,
        'timestamp': datetime.now()
    }
    
    # Send to analytics
    analytics.track('template_selection', metrics)
```

Ready to integrate intelligent template selection into your application! 🎯✨ 