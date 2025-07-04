const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class HTMLToImageService {
  constructor() {
    this.browser = null;
  }

  // Helper method to create a delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async initBrowser() {
    if (!this.browser) {
      try {
        this.browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ]
        });
      } catch (error) {
        console.error('Failed to launch browser:', error);
        throw new Error('Browser initialization failed');
      }
    }
    return this.browser;
  }

  async convertHtmlToImage(htmlContent, options = {}) {
    const defaultOptions = {
      width: 1200,
      height: 800,
      format: 'png',
      quality: 90,
      fullPage: true,
      deviceScaleFactor: 2
    };

    const config = { ...defaultOptions, ...options };
    
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // Set viewport for consistent rendering
      await page.setViewport({
        width: config.width,
        height: config.height,
        deviceScaleFactor: config.deviceScaleFactor
      });

      // Set content with proper base URL for assets
      await page.setContent(htmlContent, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000
      });

      // Wait for any charts or dynamic content to render
      await this.delay(2000);

      // Wait for Chart.js to finish rendering if present
      try {
        await page.waitForFunction(() => {
          return window.Chart ? 
            Object.keys(window.Chart.instances || {}).length === 0 || 
            Object.values(window.Chart.instances || {}).every(chart => chart.rendered !== false) :
            true;
        }, { timeout: 5000 });
      } catch (e) {
        // Continue if Chart.js not present or timeout
        console.log('Chart.js detection timeout or not present');
      }

      // Take screenshot
      const screenshotOptions = {
        type: config.format,
        fullPage: config.fullPage
      };

      if (config.format === 'jpeg') {
        screenshotOptions.quality = config.quality;
      }

      const imageBuffer = await page.screenshot(screenshotOptions);
      
      await page.close();
      
      return imageBuffer;
    } catch (error) {
      console.error('Error converting HTML to image:', error);
      throw new Error(`HTML to image conversion failed: ${error.message}`);
    }
  }

  async saveImage(imageBuffer, filename) {
    const imagesDir = path.join(__dirname, '..', 'generated-images');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const filePath = path.join(imagesDir, filename);
    fs.writeFileSync(filePath, imageBuffer);
    
    return filePath;
  }

  async convertAndSave(htmlContent, filename, options = {}) {
    try {
      const imageBuffer = await this.convertHtmlToImage(htmlContent, options);
      const filePath = await this.saveImage(imageBuffer, filename);
      
      return {
        success: true,
        imagePath: filePath,
        imageBuffer: imageBuffer,
        filename: filename
      };
    } catch (error) {
      console.error('Error in convertAndSave:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Get template-specific options
  getTemplateOptions(templateName) {
    const templateOptions = {
      'one.html': {
        width: 1000,
        height: 800,
        fullPage: true
      },
      'two.html': {
        width: 1200,
        height: 1000,
        fullPage: true
      },
      'three.html': {
        width: 500,
        height: 1200,
        fullPage: true
      },
      'four.html': {
        width: 1000,
        height: 700,
        fullPage: true
      }
    };

    return templateOptions[templateName] || {
      width: 1200,
      height: 800,
      fullPage: true
    };
  }
}

// Create singleton instance
const htmlToImageService = new HTMLToImageService();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing browser...');
  await htmlToImageService.closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing browser...');
  await htmlToImageService.closeBrowser();
  process.exit(0);
});

module.exports = htmlToImageService; 