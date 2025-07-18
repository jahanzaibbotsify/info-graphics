const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
const https = require('https');

let openai;
try {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
} catch (error) {
    console.log('OpenAI not configured');
}

// System prompt placeholder - to be replaced
const SYSTEM_PROMPT = `Act as an expert infographic designer highly skilled in visual communication, information design, and data visualization. Your sole task is to create an infographic outline based strictly and only on the exact factual data or numbers provided in the user’s input prompt. You may NOT alter, supplement, summarize, research, invent, or estimate any data or figures—use the provided factual data exactly as given in the user's instruction, and nothing else.

**CRITICAL REQUIREMENT:**  
- Only use the exact factual data given in the user’s instruction. Do not add, deduce, infer, invent, generalize, research, update, or supplement the information. No external facts or interpretation—output must be strictly based on the provided data only.

**VISUALIZATION ACCURACY:**  
- Every visual element (chart, graph, icon, segment, etc.) must physically and proportionally represent the underlying factual values as provided, with no exaggeration, distortion, or visual error.  
- Example: If one group is 30% and another 70%, their respective chart elements must be visually and proportionally correct and reflect those exact values—small vs. large as dictated by the numbers.

**LABEL AND TYPOGRAPHY STANDARDS:**  
- All infographic text/labels/annotations must be spelled correctly, use proper punctuation, and always use a dot (.) as the decimal separator.  
- Do not introduce or alter any data when designing or labeling.

**SOURCE:**
- Do not include any data source field, reference, or citation anywhere in the infographic or its description.

# Steps

1. Identify and extract all relevant and exact data values from the provided input—do not add or alter any value or label.
2. For each proposed visual element:
    - Explicitly specify the underlying value(s) from the input, and describe how its graphical dimension(s) (height, area, angle, etc.) will represent the numbers precisely and visually.
    - Check that every value’s visual representation is strictly proportional and corresponds directly to the provided numbers.
    - Carefully verify correct spelling and use of dots as decimal separators in all labels and values.
3. Build an infographic outline, listing the headline, subheadings, narrative, and each chart/visual in a logical, visually progressive sequence.
4. Contain roughly 30% text and 70% visuals, with a clear and accessible color palette and strong visual hierarchy, harmonious style, and adequate white space.
5. For each visual: state the type (pie chart, bar chart, etc.), accompanying data, explicit proportional mapping, label details (with spelling/notation checks), and rationale for that visualization.
6. Confirm in your notes for each chart that:
    - Only provided data is represented.
    - Every label is spelled correctly.
    - Every decimal uses a dot.
    - No source or citation appears anywhere.

# Output Format

Provide your answer as a clear, ordered bullet-pointed storyboard or outline describing all infographic elements and visuals. For each chart or visual element, include:
- Data used (must match user input exactly).
- Visualization type.
- Explicit description of proportional/graphical mapping (matching the given numbers, with examples like “A: 30%, B: 70%” shown as visually smaller/larger chart elements).
- Label wording (with spelling and decimal separator confirmation).
- Rationale for visualization type.
- Explicit note confirming use of only the provided factual data and verification of spelling, punctuation, and no source/citation.

Length: 10–30 bullet points, with thoroughly described visuals and notes for proportional mapping, data fidelity, and correct text/labeling.

# Examples

Example 1 (excerpt):  
Input Data:  
A: 30%  
B: 70%  

Output:  
- Main headline: “Distribution of Groups A and B”
- Visualization: Pie chart  
    - Data: A (30%), B (70%) (used exactly as provided)
    - Physical mapping: Slice A = 108°, slice B = 252°, visibly proportional; A is clearly smaller than B
    - Labels: “A: 30%”, “B: 70%” (spelling verified, decimal separator is dot if needed)
    - Rationale: Pie chart shows part-to-whole split visually
    - Note: Only provided data used, all spelling double-checked, decimal uses dot, no source/citation present

Example 2 (excerpt):  
Input Data: Q1: 15.5, Q2: 84.5  
- Visualization: Vertical bar chart  
    - Bars: Q1 (height = 15.5 units), Q2 (height = 84.5 units)—strictly matches input numbers
    - Labels: “Q1: 15.5”, “Q2: 84.5” with dot as decimal
    - Rationale: Bar chart for easy magnitude comparison
    - Note: Used only the input data, spelling/punctuation checked, decimal is dot, no source/citation anywhere

(For real applications, provide a fully detailed outline with all visual elements, structure, and checks for spelling and correct data usage according to this template. Placeholders may be used to indicate where more detailed content/labels fit in.)

# Notes

- Never use, invent, supplement, or modify any data—absolutely restrict all infographics and visuals to the specific input values provided by the user.
- Verify that all spelling is correct, every decimal uses a dot, and sources/citations are entirely omitted.
- Explain or annotate any ambiguous or unvisualizable data, but do not infer or substitute your own.
- Your output should allow direct implementation of the infographic, as a bullet-pointed visual/narrative plan.
- Rigorously confirm that only the given factual data is used—no added, summarized, generalized, or external content.

**Remember:**  
- Use only the exact factual data given in the user’s input, nothing more.  
- All charts/visuals must be quantitatively and visually accurate, strictly proportional to the supplied numbers.  
- Every word is spelled correctly, all decimals use a dot, and no source/citation can appear anywhere.  
- Confirm fidelity to these principles explicitly in each element description.
- Use the exact data provided by the user, do not add, subtract, or modify any data.`;

/**
 * Step 1: Check if user instruction is factual or not
 */
async function validateUserInstruction(userInstruction) {
    try {
        if (!openai || !process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is required');
        }

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

USER REQUEST: "${userInstruction}"

Analyze the request and respond with ONLY one word:
- "VALID" if the request is for factual data visualization, statistics, analytics, or quantifiable information
- "INVALID" if the request is for recipes, entertainment, or content outside data visualization scope

Response:`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a strict content validator for data visualization requests. Only approve requests that involve factual data, statistics, analytics, or quantifiable information that can be visualized."
                },
                {
                    role: "user",
                    content: validationPrompt
                }
            ],
            temperature: 0.1,
            max_tokens: 10
        });

        const validationResult = response.choices[0].message.content.trim().toUpperCase();
        return validationResult === "VALID";

    } catch (error) {
        console.error('Error validating user instruction:', error);
        return false;
    }
}

/**
 * Step 2: Generate infographic image using GPT-4o and image generation
 */
async function generateInfographicImage(userInstruction, isUpdate = false, updateContext = '', previousImagePath = null) {
    try {
        if (!openai || !process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is required');
        }

        // Create the prompt based on whether it's an update or new generation
        const promptMessage = isUpdate ? 
            `UPDATE CONTEXT: ${updateContext}
MODIFICATION REQUEST: ${userInstruction}

Generate an updated infographic that incorporates the requested changes while maintaining design consistency. Use the provided previous image as a reference.` :
            `USER REQUEST: ${userInstruction}`;

        // Prepare user content array
        const userContent = [
            {
                "type": "input_text",
                "text": promptMessage
            }
        ];

        // If updating and previous image exists, include it in the request
        if (isUpdate && previousImagePath && fs.existsSync(previousImagePath)) {
            try {
                // Read the previous image and convert to base64
                const imageBuffer = fs.readFileSync(previousImagePath);
                const base64Image = imageBuffer.toString('base64');
                const mimeType = previousImagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
                
                // Add the previous image to user content
                userContent.push({
                    "type": "input_image",
                    "source": {
                        "type": "base64",
                        "media_type": mimeType,
                        "data": base64Image
                    }
                });
                
                console.log('Previous image included in update request');
            } catch (imageError) {
                console.warn('Could not read previous image, proceeding without it:', imageError.message);
            }
        }

        // Generate the infographic image using image generation
        const response = await openai.responses.create({
            model: "gpt-4.1",
            input: [
              {
                "role": "system",
                "content": [
                  {
                    "type": "input_text",
                    "text": SYSTEM_PROMPT
                  }
                ]
              },
              {
                "role": "user",
                "content": userContent
              },
            ],
            text: {
              "format": {
                "type": "text"
              }
            },
            reasoning: {},
            tools: [
              {
                "type": "image_generation",
                "size": "auto",
                "quality": "high",
                "output_format": "png",
                "background": "auto",
                "moderation": "auto",
              }
            ],
            tool_choice: {
              "type": "image_generation"
            },
            temperature: 1.0,
            max_output_tokens: 32768,
            top_p: 1.0,
            store: true
          });
          console.log(response);
        return {
            success: true,
            imageUrl: response.output[0].result,
            isUpdate: isUpdate
        };

    } catch (error) {
        console.error('Error generating infographic image:', error);
        return {
            success: false,
            error: error.message,
            isUpdate: isUpdate
        };
    }
}

/**
 * Step 3: Save image locally (handles both base64 and URL)
 */
async function downloadAndSaveImage(imageData, filename) {
    return new Promise((resolve, reject) => {
        try {
            const imagesDir = path.join(__dirname, 'generated-images');
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir, { recursive: true });
            }

            const filePath = path.join(imagesDir, filename);

            // Check if imageData is base64 encoded
            if (typeof imageData === 'string' && (imageData.startsWith('data:image/') || imageData.length > 100)) {
                // Handle base64 image data
                let base64Data = imageData;
                
                // Remove data URL prefix if present (e.g., "data:image/png;base64,")
                if (imageData.startsWith('data:image/')) {
                    base64Data = imageData.split(',')[1];
                }
                
                // Convert base64 to buffer and save
                const buffer = Buffer.from(base64Data, 'base64');
                
                fs.writeFile(filePath, buffer, (error) => {
                    if (error) {
                        reject({
                            success: false,
                            error: error.message
                        });
                    } else {
                        resolve({
                            success: true,
                            imagePath: filePath,
                            filename: filename
                        });
                    }
                });
            } else {
                // Handle URL (fallback for backward compatibility)
                const file = fs.createWriteStream(filePath);

                https.get(imageData, (response) => {
                    response.pipe(file);
                    
                    file.on('finish', () => {
                        file.close();
                        resolve({
                            success: true,
                            imagePath: filePath,
                            filename: filename
                        });
                    });

                    file.on('error', (error) => {
                        fs.unlink(filePath, () => {}); // Delete incomplete file
                        reject({
                            success: false,
                            error: error.message
                        });
                    });

                }).on('error', (error) => {
                    reject({
                        success: false,
                        error: error.message
                    });
                });
            }

        } catch (error) {
            reject({
                success: false,
                error: error.message
            });
        }
    });
}

/**
 * Main function: Generate infographic (new or update)
 */
async function generateInfographic(userInstruction, existingImagePath = null) {
    try {
        // Step 1: Check if user instruction is factual
        console.log('Step 1: Validating user instruction...');
        const isFactual = await validateUserInstruction(userInstruction);
        
        if (!isFactual) {
            throw new Error('I specialize in creating factual data visualizations and infographics. Please provide requests related to statistics, data analysis, business metrics, health data, technology trends, or other factual information that can be visualized. Generic requests like recipes, entertainment, or unrelated topics are outside my expertise.');
        }

        // Step 2: Generate infographic image
        const isUpdate = existingImagePath && fs.existsSync(existingImagePath);
        const updateContext = isUpdate ? 'This is an update to an existing infographic. Maintain design consistency while incorporating requested changes.' : '';
        
        console.log(`Step 2: Generating infographic image (${isUpdate ? 'update' : 'new'})...`);
        const imageResult = await generateInfographicImage(userInstruction, isUpdate, updateContext, existingImagePath);
        
        if (!imageResult.success) {
            throw new Error(`Failed to generate infographic: ${imageResult.error}`);
        }

        // Step 3: Download and save image
        console.log('Step 3: Downloading and saving image...');
        const timestamp = Date.now();
        const filename = `infographic_${timestamp}.png`;
        
        const saveResult = await downloadAndSaveImage(imageResult.imageUrl, filename);
        
        if (!saveResult.success) {
            throw new Error(`Failed to save image: ${saveResult.error}`);
        }

        return {
            imageUrl: imageResult.imageUrl,
            localPath: saveResult.imagePath,
            filename: saveResult.filename,
            isUpdate: imageResult.isUpdate
        };

    } catch (error) {
        console.error('Error in generateInfographic:', error);
        throw error;
    }
}

/**
 * Handle update image scenario specifically
 */
async function updateInfographic(userInstruction, existingImagePath) {
    try {
        if (!existingImagePath || !fs.existsSync(existingImagePath)) {
            throw new Error('Existing image path is required for updates');
        }

        console.log('Handling update scenario...');
        return await generateInfographic(userInstruction, existingImagePath);

    } catch (error) {
        console.error('Error updating infographic:', error);
        throw error;
    }
}

/**
 * Analyze message for modification intent
 */
async function analyzeMessageForModification(message, chatContext) {
    try {
        if (!openai || !process.env.OPENAI_API_KEY) {
            return 'invalid';
        }

        // First validate if the message is appropriate for data visualization
        const validationPrompt = `You are a content validator for a data visualization AI system. Determine if this message is appropriate for infographic interaction.

ACCEPTABLE TOPICS:
- Data visualization questions and modifications
- Statistical analysis and interpretation
- Chart and graph adjustments
- Infographic design changes
- Data accuracy discussions
- Visualization technique questions

UNACCEPTABLE TOPICS:
- Recipes, cooking, food preparation
- Entertainment (movies, music, games)
- Personal stories and narratives
- Generic creative content not related to data
- Off-topic conversations

USER MESSAGE: "${message}"
CHAT CONTEXT: ${chatContext.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Respond with ONLY one word:
- "VALID" if the message relates to data visualization, infographics, or statistical content
- "INVALID" if the message is off-topic or inappropriate for data visualization

Response:`;

        const validationResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a strict content validator for data visualization interactions. Only approve messages related to infographics, data analysis, and visualization topics."
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

/**
 * Generate conversational response about infographic data
 */
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
    updateInfographic,
    downloadAndSaveImage,
    analyzeMessageForModification,
    generateConversationalResponse
};
