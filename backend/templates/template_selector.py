#!/usr/bin/env python3
"""
AI Template Selector for Infographic Templates
Intelligent selection system that matches user requirements to optimal templates
"""

import json
import re
from typing import Dict, List, Tuple, Optional

class TemplateSelector:
    def __init__(self, prompts_file: str = "AI_PROMPTS.json"):
        """Initialize the template selector with prompt configurations"""
        with open(prompts_file, 'r') as f:
            self.config = json.load(f)
        
        self.templates = self.config['templateSelection']['selectionRules']
        self.examples = self.config['examples']
    
    def analyze_keywords(self, user_input: str) -> Dict[str, int]:
        """Analyze user input for template-specific keywords"""
        user_input = user_input.lower()
        keyword_scores = {}
        
        for template, rules in self.templates.items():
            score = 0
            matched_keywords = []
            
            for keyword in rules['keywords']:
                if keyword.lower() in user_input:
                    score += 2  # 2 points per keyword match
                    matched_keywords.append(keyword)
            
            keyword_scores[template] = {
                'score': score,
                'matched_keywords': matched_keywords
            }
        
        return keyword_scores
    
    def detect_data_types(self, user_input: str) -> Dict[str, int]:
        """Detect data types mentioned in user input"""
        user_input = user_input.lower()
        data_type_scores = {}
        
        # Enhanced data type patterns for new templates
        data_patterns = {
            'currency': r'\$[\d,]+|\d+k|\d+m|revenue|profit|budget|cost',
            'percentages': r'\d+%|percent|rate',
            'social_metrics': r'followers|likes|shares|engagement|views',
            'comparison_data': r'vs|versus|compared|against|better|worse',
            'survey_data': r'survey|poll|feedback|rating|satisfaction',
            'financial_ratios': r'roi|p&l|ratio|margin|yield',
            'kpi_data': r'kpi|goal|target|objective|progress',
            'business_metrics': r'business|quarterly|performance|insights|metrics',
            'key_metrics': r'key|main|primary|important|highlight|showcase',
            'time_series': r'timeline|time|series|quarterly|monthly|progression|growth|evolution',
            'performance_scores': r'score|rating|performance|efficiency|satisfaction',
            'grid_data': r'grid|category|categories|multiple|various',
            'mixed_analytics': r'analytics|dashboard|overview|mixed|various|multiple',
            'department_data': r'department|team|division|unit|group'
        }
        
        for template, rules in self.templates.items():
            score = 0
            matched_types = []
            
            for data_type in rules['dataTypes']:
                for pattern_name, pattern in data_patterns.items():
                    if pattern_name in data_type and re.search(pattern, user_input):
                        score += 3  # 3 points per data type match
                        matched_types.append(data_type)
                        break
            
            data_type_scores[template] = {
                'score': score,
                'matched_types': matched_types
            }
        
        return data_type_scores
    
    def analyze_use_case(self, user_input: str) -> Dict[str, int]:
        """Analyze the intended use case from user input"""
        user_input = user_input.lower()
        use_case_scores = {}
        
        # Enhanced use case patterns for new templates
        use_case_patterns = {
            'financial_reporting': r'financial report|earnings|investment|portfolio',
            'competitive_analysis': r'competitor|competition|market share|benchmark',
            'social_reporting': r'social media|platform|engagement|content',
            'market_research': r'survey|research|feedback|customer',
            'performance_tracking': r'kpi|performance|goal|target|progress',
            'general_reporting': r'dashboard|overview|analytics|metrics',
            'business_overview': r'business overview|executive|summary|insights',
            'quarterly_reporting': r'quarterly|q1|q2|q3|q4|quarter',
            'executive_summary': r'executive|summary|leadership|board',
            'clean_presentation': r'clean|minimal|simple|professional',
            'data_highlighting': r'highlight|showcase|feature|emphasize',
            'key_metrics_display': r'key metrics|important|main|primary',
            'executive_dashboard': r'executive dashboard|leadership|c-level',
            'minimal_reporting': r'minimal|simple|clean|basic',
            'performance_overview': r'performance overview|360|radar|comprehensive',
            'multi_metric_analysis': r'multiple|various|many|multi',
            'radar_charts': r'radar|circular|radial|360',
            'circular_visualization': r'circular|round|orbit|center',
            'growth_tracking': r'growth|increase|progression|tracking',
            'timeline_visualization': r'timeline|time|chronological|sequence',
            'quarterly_progression': r'quarterly progression|quarter|q1|q2|q3|q4',
            'historical_analysis': r'historical|history|past|trend',
            'category_analysis': r'category|categories|classification|grouping',
            'geometric_presentation': r'geometric|shapes|modern|angular',
            'modern_visualization': r'modern|contemporary|current|new',
            'grid_layout': r'grid|layout|arrangement|structure',
            'analytics_dashboard': r'analytics dashboard|business intelligence',
            'department_reporting': r'department|team|division|unit',
            'split_view_analysis': r'split|divided|separate|comparison'
        }
        
        for template, rules in self.templates.items():
            score = 0
            matched_cases = []
            
            for use_case in rules['useCases']:
                if use_case in use_case_patterns:
                    pattern = use_case_patterns[use_case]
                    if re.search(pattern, user_input):
                        score += 4  # 4 points per use case match
                        matched_cases.append(use_case)
            
            use_case_scores[template] = {
                'score': score,
                'matched_cases': matched_cases
            }
        
        return use_case_scores
    
    def calculate_context_bonus(self, user_input: str, template: str) -> int:
        """Calculate additional context-based scoring"""
        user_input = user_input.lower()
        bonus = 0
        
        # Enhanced context bonuses for new templates
        if template == 'modern-statistics-overview.html':
            if any(term in user_input for term in ['clean', 'professional', 'modern', 'business']):
                bonus += 3
            if any(term in user_input for term in ['quarterly', 'q4', 'performance']):
                bonus += 2
        
        elif template == 'minimal-data-showcase.html':
            if any(term in user_input for term in ['minimal', 'clean', 'simple', 'highlight']):
                bonus += 4
            if any(term in user_input for term in ['large', 'prominent', 'showcase']):
                bonus += 3
        
        elif template == 'circular-metrics-layout.html':
            if any(term in user_input for term in ['circular', 'radar', '360', 'central']):
                bonus += 5
            if any(term in user_input for term in ['performance', 'surrounding', 'orbit']):
                bonus += 3
        
        elif template == 'vertical-timeline-stats.html':
            if any(term in user_input for term in ['timeline', 'progression', 'growth']):
                bonus += 4
            if any(term in user_input for term in ['quarterly', 'time series', 'evolution']):
                bonus += 3
        
        elif template == 'geometric-data-grid.html':
            if any(term in user_input for term in ['geometric', 'hexagonal', 'shapes']):
                bonus += 5
            if any(term in user_input for term in ['modern', 'angular', 'grid']):
                bonus += 3
        
        elif template == 'diagonal-split-layout.html':
            if any(term in user_input for term in ['diagonal', 'split', 'analytics dashboard']):
                bonus += 4
            if any(term in user_input for term in ['department', 'large metric', 'asymmetric']):
                bonus += 3
        
        elif template == 'financial-dashboard.html':
            if any(term in user_input for term in ['stock', 'trading', 'investment']):
                bonus += 3
        
        elif template == 'market-comparison.html':
            if 'vs' in user_input or 'versus' in user_input:
                bonus += 5
        
        elif template == 'social-media-metrics.html':
            platforms = ['instagram', 'facebook', 'twitter', 'tiktok', 'linkedin']
            platform_count = sum(1 for platform in platforms if platform in user_input)
            bonus += platform_count * 2
        
        elif template == 'survey-results.html':
            if any(term in user_input for term in ['satisfaction', 'rating', 'demographics']):
                bonus += 3
        
        return bonus
    
    def select_template(self, user_input: str) -> Tuple[str, Dict]:
        """Main method to select the best template"""
        # Analyze different aspects
        keyword_analysis = self.analyze_keywords(user_input)
        data_type_analysis = self.detect_data_types(user_input)
        use_case_analysis = self.analyze_use_case(user_input)
        
        # Calculate total scores
        total_scores = {}
        
        for template in self.templates.keys():
            keyword_score = keyword_analysis[template]['score']
            data_type_score = data_type_analysis[template]['score']
            use_case_score = use_case_analysis[template]['score']
            context_bonus = self.calculate_context_bonus(user_input, template)
            
            total_score = keyword_score + data_type_score + use_case_score + context_bonus
            
            total_scores[template] = {
                'total_score': total_score,
                'keyword_score': keyword_score,
                'data_type_score': data_type_score,
                'use_case_score': use_case_score,
                'context_bonus': context_bonus,
                'matched_keywords': keyword_analysis[template]['matched_keywords'],
                'matched_types': data_type_analysis[template]['matched_types'],
                'matched_cases': use_case_analysis[template]['matched_cases']
            }
        
        # Select template with highest score
        best_template = max(total_scores.keys(), key=lambda k: total_scores[k]['total_score'])
        
        # If no clear winner (all scores are low), default to chart-analytics.html
        if total_scores[best_template]['total_score'] < 3:
            best_template = 'chart-analytics.html'
        
        # Determine confidence level
        best_score = total_scores[best_template]['total_score']
        if best_score >= 10:
            confidence = 'High'
        elif best_score >= 5:
            confidence = 'Medium'
        else:
            confidence = 'Low'
        
        return best_template, {
            'confidence': confidence,
            'scores': total_scores,
            'reasoning': self._generate_reasoning(best_template, total_scores[best_template])
        }
    
    def _generate_reasoning(self, template: str, score_details: Dict) -> str:
        """Generate human-readable reasoning for template selection"""
        reasoning_parts = []
        
        if score_details['matched_keywords']:
            reasoning_parts.append(f"Keywords matched: {', '.join(score_details['matched_keywords'])}")
        
        if score_details['matched_types']:
            reasoning_parts.append(f"Data types detected: {', '.join(score_details['matched_types'])}")
        
        if score_details['matched_cases']:
            reasoning_parts.append(f"Use cases identified: {', '.join(score_details['matched_cases'])}")
        
        if score_details['context_bonus'] > 0:
            reasoning_parts.append(f"Additional context bonus: +{score_details['context_bonus']} points")
        
        return '; '.join(reasoning_parts) if reasoning_parts else "Default selection for general analytics"
    
    def generate_customization_prompt(self, template: str, user_data: str) -> str:
        """Generate customization instructions for the selected template"""
        base_prompt = self.config['dataCustomization']['customizationPrompt']
        return base_prompt.format(selected_template=template, user_data=user_data)
    
    def generate_qa_prompt(self, template: str, user_request: str, data_type: str) -> str:
        """Generate quality assurance prompt"""
        base_prompt = self.config['qualityAssurance']['qaPrompt']
        return base_prompt.format(
            selected_template=template,
            user_request=user_request,
            data_type=data_type
        )

def demonstrate_selection():
    """Demonstrate the template selection system with examples including new templates"""
    selector = TemplateSelector()
    
    # Enhanced test cases covering all templates
    test_cases = [
        # New templates
        "Create a clean business overview showing Q4 2024 performance metrics with professional styling",
        "Show key metrics with large prominent numbers and minimal design",
        "Display performance radar with central score and surrounding department metrics",
        "Show quarterly revenue growth timeline and progression over time",
        "Create modern data visualization with hexagonal shapes and geometric design",
        "Analytics dashboard with large central metric and department performance charts",
        
        # Original templates
        "Create an infographic showing Q4 revenue of $2.4M, portfolio allocation, and stock performance with 15% growth",
        "Show Instagram engagement rates, TikTok follower growth, and compare platform performance",
        "Compare our product vs 3 competitors showing market share and performance benchmarks",
        "Display customer satisfaction survey with 85% satisfaction rate and demographic breakdown",
        "Create a business dashboard with various metrics and performance indicators"
    ]
    
    print("🤖 AI Template Selection System Demo (11 Templates)\n" + "="*60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 TEST CASE {i}:")
        print(f"Input: {test_case}")
        
        selected_template, analysis = selector.select_template(test_case)
        
        print(f"✅ Selected: {selected_template}")
        print(f"🎯 Confidence: {analysis['confidence']}")
        print(f"💡 Reasoning: {analysis['reasoning']}")
        print(f"📊 Score: {analysis['scores'][selected_template]['total_score']}")
        print("-" * 60)

def list_available_templates():
    """List all available templates with their descriptions"""
    selector = TemplateSelector()
    
    print("📋 Available Infographic Templates\n" + "="*50)
    
    template_descriptions = {
        'modern-statistics-overview.html': 'Clean business insights with professional styling',
        'minimal-data-showcase.html': 'Two-column layout with large prominent numbers',
        'circular-metrics-layout.html': 'Central metric with orbiting data points',
        'vertical-timeline-stats.html': 'Timeline visualization for growth progression',
        'geometric-data-grid.html': 'Hexagonal/triangular shapes with modern design',
        'diagonal-split-layout.html': 'Analytics dashboard with split layout',
        'financial-dashboard.html': 'Financial metrics and investment data',
        'market-comparison.html': 'Competitive analysis and benchmarking',
        'social-media-metrics.html': 'Social platform engagement tracking',
        'survey-results.html': 'Survey data and demographic analysis',
        'chart-analytics.html': 'General analytics and mixed metrics'
    }
    
    for i, (template, description) in enumerate(template_descriptions.items(), 1):
        priority = selector.templates[template]['priority']
        print(f"{i:2d}. {template}")
        print(f"    📝 {description}")
        print(f"    🎯 Priority: {priority}")
        print(f"    🔍 Keywords: {', '.join(selector.templates[template]['keywords'][:5])}{'...' if len(selector.templates[template]['keywords']) > 5 else ''}")
        print()

if __name__ == "__main__":
    print("Choose an option:")
    print("1. Run template selection demo")
    print("2. List available templates")
    
    choice = input("Enter choice (1 or 2): ").strip()
    
    if choice == "1":
        demonstrate_selection()
    elif choice == "2":
        list_available_templates()
    else:
        print("Running default demo...")
        demonstrate_selection() 