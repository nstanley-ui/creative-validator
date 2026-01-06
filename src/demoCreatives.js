// Demo Creative Files Generator
// Creates synthetic files for testing the validator

export const createDemoFiles = () => {
  const demoFiles = [];

  // Demo 1: TikTok Vertical Video
  demoFiles.push(createDemoVideo({
    name: 'tiktok-vertical.mp4',
    width: 1080,
    height: 1920,
    duration: 15,
    size: 2.5 * 1024 * 1024 // 2.5 MB
  }));

  // Demo 2: IAB Banner
  demoFiles.push(createDemoImage({
    name: 'banner-300x250.jpg',
    width: 300,
    height: 250,
    size: 45 * 1024 // 45 KB
  }));

  // Demo 3: Netflix 1080p Video
  demoFiles.push(createDemoVideo({
    name: 'netflix-1080p.mp4',
    width: 1920,
    height: 1080,
    duration: 30,
    size: 8 * 1024 * 1024 // 8 MB
  }));

  // Demo 4: LinkedIn Post Image
  demoFiles.push(createDemoImage({
    name: 'linkedin-post.jpg',
    width: 1200,
    height: 628,
    size: 180 * 1024 // 180 KB
  }));

  // Demo 5: Meta Square Post
  demoFiles.push(createDemoImage({
    name: 'meta-square.jpg',
    width: 1080,
    height: 1080,
    size: 220 * 1024 // 220 KB
  }));

  // Demo 6: Snapchat Commercial
  demoFiles.push(createDemoVideo({
    name: 'snapchat-ad.mp4',
    width: 1080,
    height: 1920,
    duration: 5,
    size: 1.2 * 1024 * 1024 // 1.2 MB
  }));

  return demoFiles;
};

// Create synthetic video file
function createDemoVideo({ name, width, height, duration, size }) {
  // Create a canvas and draw a demo video frame
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add text overlay
  ctx.fillStyle = 'white';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DEMO VIDEO', width / 2, height / 2 - 40);
  
  ctx.font = '32px Arial';
  ctx.fillText(`${width}x${height}`, width / 2, height / 2 + 20);
  ctx.fillText(`${duration}s`, width / 2, height / 2 + 60);

  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      // Create a File object with video metadata
      const file = new File([blob], name, { 
        type: 'video/mp4',
        lastModified: Date.now()
      });
      
      // Attach metadata that our validator can extract
      Object.defineProperty(file, '__demoMetadata', {
        value: { width, height, duration },
        writable: false
      });

      resolve(file);
    }, 'image/jpeg', 0.9);
  });
}

// Create synthetic image file
function createDemoImage({ name, width, height, size }) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#06b6d4');
  gradient.addColorStop(1, '#a855f7');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add decorative elements
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 50 + 20,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Add text overlay
  ctx.fillStyle = 'white';
  const fontSize = Math.min(width, height) * 0.15;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DEMO AD', width / 2, height / 2 - fontSize * 0.6);
  
  const smallFont = Math.min(width, height) * 0.08;
  ctx.font = `${smallFont}px Arial`;
  ctx.fillText(`${width}x${height}`, width / 2, height / 2 + fontSize * 0.4);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], name, { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      // Attach metadata
      Object.defineProperty(file, '__demoMetadata', {
        value: { width, height },
        writable: false
      });

      resolve(file);
    }, 'image/jpeg', 0.85);
  });
}

// Helper to extract demo metadata
export const getDemoMetadata = (file) => {
  return file.__demoMetadata || null;
};
