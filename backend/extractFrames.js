const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const Jimp = require('jimp');

async function extractFramesFromSprite(inputPath, outputDir) {
  const data = fs.readFileSync(inputPath);
  const png = PNG.sync.read(data);
  const { width, height, data: pixels } = png;

  const visited = new Array(width * height).fill(false);
  const frames = [];
  const PADDING = {
    top: 10,    // More padding at top
    bottom: 1, // Less padding at bottom
    sides: 15   // Equal padding for left and right
  };

  // Reduced minimum gap between frames to allow closer frames
  const MIN_FRAME_GAP = 2;

  function getIndex(x, y) {
    return (width * y + x) * 4;
  }

  function isTransparent(x, y) {
    const idx = getIndex(x, y);
    return pixels[idx + 3] === 0;
  }

  function hasTransparentNeighbor(x, y) {
    // Check immediate neighbors for transparency
    for (const [dx, dy] of [[0,1],[1,0],[-1,0],[0,-1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < width && ny < height && isTransparent(nx, ny)) {
        return true;
      }
    }
    return false;
  }

  function bfs(x, y) {
    const queue = [[x, y]];
    let minX = x, maxX = x, minY = y, maxY = y;
    const framePixels = new Set();
    let hasTransparentEdge = false;

    while (queue.length) {
      const [cx, cy] = queue.shift();
      const idx = cy * width + cx;
      
      if (visited[idx]) continue;
      visited[idx] = true;

      if (isTransparent(cx, cy)) continue;

      // Check if this pixel is on the edge of the frame
      if (hasTransparentNeighbor(cx, cy)) {
        hasTransparentEdge = true;
      }

      framePixels.add(idx);
      minX = Math.min(minX, cx);
      maxX = Math.max(maxX, cx);
      minY = Math.min(minY, cy);
      maxY = Math.max(maxY, cy);

      // Add neighboring pixels to the queue
      for (const [dx, dy] of [[0,1],[1,0],[-1,0],[0,-1]]) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
          queue.push([nx, ny]);
        }
      }
    }

    const frameWidth = maxX - minX + 1;
    const frameHeight = maxY - minY + 1;
    
    // More lenient size requirements
    if (frameWidth < 8 || frameHeight < 8 || framePixels.size < 30) {
      return null;
    }

    // More lenient overlap checking
    for (const existingFrame of frames) {
      const overlapX = !(maxX + MIN_FRAME_GAP < existingFrame.x || minX > existingFrame.x + existingFrame.width + MIN_FRAME_GAP);
      const overlapY = !(maxY + MIN_FRAME_GAP < existingFrame.y || minY > existingFrame.y + existingFrame.height + MIN_FRAME_GAP);
      
      // Only consider it an overlap if there's significant overlap
      if (overlapX && overlapY) {
        const overlapArea = Math.min(maxX, existingFrame.x + existingFrame.width) - Math.max(minX, existingFrame.x);
        const totalWidth = Math.max(maxX, existingFrame.x + existingFrame.width) - Math.min(minX, existingFrame.x);
        if (overlapArea / totalWidth > 0.5) { // If more than 50% overlap
          return null;
        }
      }
    }

    // Calculate new dimensions with asymmetric padding
    const newX = Math.max(0, minX - PADDING.sides);
    const newY = Math.max(0, minY - PADDING.top);
    const newWidth = Math.min(width - newX, frameWidth + (PADDING.sides * 2));
    const newHeight = Math.min(height - newY, frameHeight + PADDING.top + PADDING.bottom);

    return {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      pixels: framePixels
    };
  }

  // First pass: detect potential frames
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!visited[idx] && !isTransparent(x, y)) {
        const box = bfs(x, y);
        if (box) frames.push(box);
      }
    }
  }

  // Sort frames by their position (top to bottom, left to right)
  frames.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 15) { // Increased tolerance for same-row detection
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  console.log(`Detected ${frames.length} frames`);

  const jimpImg = await Jimp.read(inputPath);
  await fs.promises.mkdir(outputDir, { recursive: true });

  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const frame = jimpImg.clone().crop(f.x, f.y, f.width, f.height);
    await frame.writeAsync(path.join(outputDir, `frame${i + 1}.png`));
  }

  // Return frame information
  return {
    frameCount: frames.length,
    frameWidth: frames.length > 0 ? frames[0].width : 0,
    frameHeight: frames.length > 0 ? frames[0].height : 0
  };
}

module.exports = extractFramesFromSprite; 