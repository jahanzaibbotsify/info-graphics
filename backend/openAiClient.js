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
- Use the exact data provided by the user, do not add, subtract, or modify any data.
- Add equal padding to the top and bottom, left and right of the infographic.
- Make sure the infogrphics are not getting cut off or truncated.`;

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
 * Generate infographic image using the new gpt-image-1 model
 * @param {string} userInstruction - User's instruction for the infographic
 * @param {boolean} isUpdate - Whether this is an update to existing infographic
 * @param {string} updateContext - Context for updates
 * @param {string|null} previousImagePath - Path to previous image for updates
 * @returns {Promise<Object>} Result object with success status and image data
 */
async function generateInfographicImage(userInstruction, isUpdate = false, updateContext = '', previousImagePath = null) {
    try {
        if (!openai || !process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is required');
        }

        // Create enhanced prompt based on whether it's an update or new generation
        const enhancedPrompt = createEnhancedPrompt(userInstruction, isUpdate, updateContext);

        let imageResponse;

        if (isUpdate && previousImagePath && fs.existsSync(previousImagePath)) {
            // Use image editing for updates with previous image
            console.log('Updating existing infographic...');
            imageResponse = await updateExistingImage(enhancedPrompt, previousImagePath);
        } else {
            // Generate new infographic
            console.log('Generating new infographic...');
            imageResponse = await generateNewImage(enhancedPrompt);
        }

        console.log('Infographic generated successfully');
        return {
            success: true,
            imageUrl: `data:image/png;base64,${imageResponse.data[0].b64_json}`,
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
 * Create enhanced prompt for infographic generation
 * @param {string} userInstruction - User's instruction
 * @param {boolean} isUpdate - Whether this is an update
 * @param {string} updateContext - Update context
 * @returns {string} Enhanced prompt
 */
function createEnhancedPrompt(userInstruction, isUpdate, updateContext) {
    const basePrompt = `Create a professional, visually appealing infographic that accurately represents the following data: ${userInstruction}`;

    if (isUpdate && updateContext) {
        return `${basePrompt}

UPDATE INSTRUCTIONS: ${updateContext}
Modify the existing design while maintaining visual consistency and professional appearance.

${SYSTEM_PROMPT}`;
    }

    return `${basePrompt}${SYSTEM_PROMPT}`;
}

/**
 * Generate new image
 * @param {string} prompt - Enhanced prompt for generation
 * @returns {Promise<Object>} OpenAI API response
 */
async function generateNewImage(prompt) {
    return await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        quality: "hd",
        size: "1024x1024"
    });
}

/**
 * Update existing image (fallback to new generation since DALL-E 3 doesn't support editing)
 * @param {string} prompt - Prompt for modifications
 * @param {string} imagePath - Path to existing image
 * @returns {Promise<Object>} OpenAI API response
 */
async function updateExistingImage(prompt, imagePath) {
    try {
        // DALL-E 3 doesn't support image editing, so we'll generate a new image
        console.log('DALL-E 3 does not support image editing, generating new image instead...');
        return await generateNewImage(prompt);
    } catch (error) {
        console.error('Failed to generate new image:', error.message);
        throw error;
    }
}

/**
 * Save base64 image data to local file system
 * @param {string} imageData - Base64 encoded image data (with or without data URL prefix)
 * @param {string} filename - Name for the saved file
 * @returns {Promise<Object>} Result object with success status and file information
 */
async function downloadAndSaveImage(imageData, filename) {
    try {
        const imagesDir = path.join(__dirname, 'generated-images');
        
        // Ensure directory exists
        await fs.promises.mkdir(imagesDir, { recursive: true });
        
        const filePath = path.join(imagesDir, filename);

        // Extract base64 data (remove data URL prefix if present)
        let base64Data = imageData;
        if (imageData.startsWith('data:image/')) {
            base64Data = imageData.split(',')[1];
        }

        // Validate base64 data
        if (!base64Data || typeof base64Data !== 'string') {
            throw new Error('Invalid base64 image data provided');
        }
        
        // Convert base64 to buffer and save
        const buffer = Buffer.from(base64Data, 'base64');
        await fs.promises.writeFile(filePath, buffer);

        console.log(`Image saved successfully: ${filename}`);
        return {
            success: true,
            imagePath: filePath,
            filename: filename
        };

    } catch (error) {
        console.error('Error saving image:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Simplified function: Generate single image from prompt
 */
async function generateInfographic(userInstruction, existingImagePath = null) {
    try {
        if (!openai || !process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is required');
        }

        console.log('Generating image from prompt...');
        
        // Create a simple, friendly prompt for image generation
        const enhancedPrompt = `Create a beautiful, professional image based on this description: ${userInstruction}. 
        Make it visually appealing, well-designed, and high-quality. If it involves data or information, present it in an attractive, easy-to-understand visual format.`;

        let imageResponse;

        if (existingImagePath && fs.existsSync(existingImagePath)) {
            // Use image editing for updates with previous image
            console.log('Updating existing image...');
            imageResponse = await updateExistingImage(enhancedPrompt, existingImagePath);
        } else {
            // Generate new image
            console.log('Generating new image...');
            imageResponse = await generateNewImage(enhancedPrompt);
        }

        // Download and save image
        console.log('Downloading and saving image...');
        const timestamp = Date.now();
        const filename = `image_${timestamp}.png`;
        
        const imageUrl = `data:image/png;base64,${imageResponse.data[0].b64_json}`;
        const saveResult = await downloadAndSaveImage(imageUrl, filename);
        
        if (!saveResult.success) {
            throw new Error(`Failed to save image: ${saveResult.error}`);
        }

        return {
            imageUrl: imageUrl,
            localPath: saveResult.imagePath,
            filename: saveResult.filename,
            isUpdate: existingImagePath ? true : false
        };

    } catch (error) {
        console.error('Error in generateInfographic:', error);
        throw error;
    }
}

// Complex chat analysis functions removed for simplified single image generation

module.exports = {
    generateInfographic,
    downloadAndSaveImage
};
