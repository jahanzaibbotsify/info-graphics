const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const PADDING = 10;
const MIN_WIDTH = 20;
const MIN_HEIGHT = 20;
const MAX_FRAME_SIZE = 0.8; // Maximum size a frame can be relative to the sprite sheet

async function extractFrames(inputPath, outputDir) {
    const image = await Jimp.read(inputPath);
    const visited = Array(image.bitmap.height).fill().map(() => Array(image.bitmap.width).fill(false));
    const frames = [];

    const isPixelFilled = (x, y) => {
        if (x < 0 || y < 0 || x >= image.bitmap.width || y >= image.bitmap.height) return false;
        const idx = (image.bitmap.width * y + x) * 4;
        const alpha = image.bitmap.data[idx + 3];
        // Check if the pixel is significantly filled (not just a tiny bit of alpha)
        return alpha > 128; // Increased threshold for better separation
    };

    const floodFill = (x, y, bounds) => {
        const queue = [[x, y]];
        while (queue.length) {
            const [cx, cy] = queue.pop();
            if (cx < 0 || cy < 0 || cx >= image.bitmap.width || cy >= image.bitmap.height) continue;
            if (visited[cy][cx] || !isPixelFilled(cx, cy)) continue;
            visited[cy][cx] = true;

            bounds.minX = Math.min(bounds.minX, cx);
            bounds.maxX = Math.max(bounds.maxX, cx);
            bounds.minY = Math.min(bounds.minY, cy);
            bounds.maxY = Math.max(bounds.maxY, cy);

            queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
    };

    for (let y = 0; y < image.bitmap.height; y++) {
        for (let x = 0; x < image.bitmap.width; x++) {
            if (!visited[y][x] && isPixelFilled(x, y)) {
                const bounds = { minX: x, maxX: x, minY: y, maxY: y };
                floodFill(x, y, bounds);
                const width = bounds.maxX - bounds.minX + 1;
                const height = bounds.maxY - bounds.minY + 1;

                // Skip if the frame is too large (likely the entire sprite sheet)
                const frameArea = width * height;
                const totalArea = image.bitmap.width * image.bitmap.height;
                if (frameArea > totalArea * MAX_FRAME_SIZE) continue;

                if (width >= MIN_WIDTH && height >= MIN_HEIGHT) {
                    const frame = image.clone().crop(bounds.minX, bounds.minY, width, height);
                    const padded = new Jimp(width + PADDING * 2, height + PADDING * 2, 0x00000000);
                    padded.composite(frame, PADDING, PADDING);

                    const filename = path.join(outputDir, `frame${frames.length + 1}.png`);
                    await padded.writeAsync(filename);

                    frames.push({ width, height });
                }
            }
        }
    }

    const frameCount = frames.length;
    const frameWidth = Math.round(frames.reduce((sum, f) => sum + f.width, 0) / frameCount);
    const frameHeight = Math.round(frames.reduce((sum, f) => sum + f.height, 0) / frameCount);

    return { frameCount, frameWidth, frameHeight };
}

module.exports = extractFrames;

// Example usage:
// extractFrames('sprite.png', './output').then(console.log);
