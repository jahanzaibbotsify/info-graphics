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
      'modern-statistics-overview.html': {
        width: 1200,
        height: 800,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      },
      'minimal-data-showcase.html': {
        width: 1000,
        height: 1000,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      },
      'circular-metrics-layout.html': {
        width: 1200,
        height: 1200,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      },
      'vertical-timeline-stats.html': {
        width: 800,
        height: 1600,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      },
      'geometric-data-grid.html': {
        width: 1200,
        height: 800,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      },
      'diagonal-split-layout.html': {
        width: 1200,
        height: 800,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      },
      'financial-analytics.html': {
        width: 1400,
        height: 900,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      },
      'social-media-comparison.html': {
        width: 1200,
        height: 1000,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      },
      'customer-analytics.html': {
        width: 1200,
        height: 900,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      },
      'sales-performance-dashboard.html': {
        width: 1400,
        height: 900,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      },
      'marketing-trends-timeline.html': {
        width: 1000,
        height: 1400,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      },
      'global-economic-comparison.html': {
        width: 1400,
        height: 900,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      },
      'data-visualization-report.html': {
        width: 1200,
        height: 900,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      },
      'default': {
        width: 1200,
        height: 800,
        fullPage: true,
        deviceScaleFactor: 2,
        quality: 95
      }
    };

    return templateOptions[templateName] || templateOptions['default'];
  }

  // Add method to handle custom image options
  async convertWithCustomOptions(htmlContent, customOptions = {}) {
    const defaultOptions = this.getTemplateOptions('default');
    const options = { ...defaultOptions, ...customOptions };
    
    try {
      const imageBuffer = await this.convertHtmlToImage(htmlContent, options);
      return imageBuffer;
    } catch (error) {
      console.error('Error in convertWithCustomOptions:', error);
      throw error;
    }
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