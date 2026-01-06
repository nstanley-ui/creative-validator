// Auto-Detection Engine
// Analyzes uploaded files and intelligently suggests platforms

import { PLATFORMS } from './platformSpecs';

// File signature for pattern matching
export const getFileSignature = (file, metadata = {}) => {
  return {
    type: file.type,
    extension: file.name.split('.').pop().toLowerCase(),
    size: file.size,
    name: file.name,
    ...metadata
  };
};

// Detect platforms based on file characteristics
export const detectPlatforms = (file, metadata = {}) => {
  const detections = [];
  const { width, height, duration } = metadata;
  const ext = file.name.split('.').pop().toLowerCase();
  const aspectRatio = width && height ? width / height : null;
  
  // VIDEO DETECTION
  if (['mp4', 'mov'].includes(ext) && aspectRatio) {
    
    // 9:16 (Vertical) - TikTok, Snapchat, Stories
    if (Math.abs(aspectRatio - 0.5625) < 0.02) {
      detections.push({
        platform: 'tiktok',
        confidence: 0.95,
        reason: '9:16 aspect ratio (1080x1920)',
        autoSelect: true
      });
      
      detections.push({
        platform: 'snapchat',
        confidence: 0.90,
        reason: '9:16 vertical format',
        autoSelect: true
      });
      
      detections.push({
        platform: 'meta',
        confidence: 0.85,
        reason: 'Stories format (9:16)',
        autoSelect: true
      });
      
      // If exactly 15s or 30s, suggest Demandbase CTV
      if (duration && [15, 30].includes(duration)) {
        detections.push({
          platform: 'demandbase',
          confidence: 0.90,
          reason: `${duration}s duration matches CTV specs`,
          autoSelect: true
        });
      }
    }
    
    // 16:9 (Horizontal) - Netflix, Hulu, LinkedIn
    if (Math.abs(aspectRatio - 1.7778) < 0.02) {
      
      // 1920x1080 exact = Netflix
      if (width === 1920 && height === 1080) {
        detections.push({
          platform: 'netflix',
          confidence: 0.98,
          reason: 'Exact 1920x1080 resolution',
          autoSelect: true
        });
      }
      
      detections.push({
        platform: 'hulu',
        confidence: 0.85,
        reason: '16:9 streaming format',
        autoSelect: true
      });
      
      detections.push({
        platform: 'linkedin',
        confidence: 0.75,
        reason: '16:9 video format supported',
        autoSelect: false
      });
    }
    
    // 1:1 (Square) - Meta Feed, LinkedIn
    if (Math.abs(aspectRatio - 1.0) < 0.02) {
      detections.push({
        platform: 'meta',
        confidence: 0.90,
        reason: 'Square format (1:1) for Feed',
        autoSelect: true
      });
      
      detections.push({
        platform: 'linkedin',
        confidence: 0.80,
        reason: 'Square video supported',
        autoSelect: false
      });
    }
    
    // Duration-based detection
    if (duration) {
      // 3-6s = Snapchat Commercials
      if (duration >= 3 && duration <= 6) {
        detections.push({
          platform: 'snapchat',
          confidence: 0.85,
          reason: '3-6s duration (Snapchat Commercials)',
          autoSelect: true
        });
      }
      
      // 5-60s = TikTok
      if (duration >= 5 && duration <= 60) {
        if (!detections.find(d => d.platform === 'tiktok')) {
          detections.push({
            platform: 'tiktok',
            confidence: 0.70,
            reason: '5-60s duration range',
            autoSelect: false
          });
        }
      }
    }
  }
  
  // IMAGE DETECTION
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext) && width && height) {
    
    // Standard IAB sizes
    const iabSizes = [
      { w: 300, h: 250, name: 'Medium Rectangle' },
      { w: 728, h: 90, name: 'Leaderboard' },
      { w: 160, h: 600, name: 'Wide Skyscraper' },
      { w: 300, h: 600, name: 'Half Page' },
      { w: 320, h: 50, name: 'Mobile Banner' },
      { w: 970, h: 250, name: 'Billboard' }
    ];
    
    const matchedIAB = iabSizes.find(s => s.w === width && s.h === height);
    if (matchedIAB) {
      detections.push({
        platform: 'iab',
        confidence: 0.95,
        reason: `${matchedIAB.name} (${width}x${height})`,
        autoSelect: true
      });
      
      detections.push({
        platform: 'ttd',
        confidence: 0.90,
        reason: 'Standard display size',
        autoSelect: true
      });
      
      // Check file size for Demandbase
      if (file.size <= 200 * 1024) {
        detections.push({
          platform: 'demandbase',
          confidence: 0.85,
          reason: 'Standard size + under 200KB',
          autoSelect: true
        });
      } else {
        detections.push({
          platform: 'demandbase',
          confidence: 0.50,
          reason: 'Standard size but over 200KB limit',
          autoSelect: false,
          warning: 'File size exceeds Demandbase 200KB limit'
        });
      }
    }
    
    // 1080x1080 = Meta Feed
    if (width === 1080 && height === 1080) {
      detections.push({
        platform: 'meta',
        confidence: 0.95,
        reason: 'Square format (1080x1080) for Feed',
        autoSelect: true
      });
    }
    
    // 1080x1350 = Meta Feed (4:5)
    if (width === 1080 && height === 1350) {
      detections.push({
        platform: 'meta',
        confidence: 0.95,
        reason: 'Vertical format (4:5) for Feed',
        autoSelect: true
      });
    }
    
    // 1080x1920 = Stories
    if (width === 1080 && height === 1920) {
      detections.push({
        platform: 'meta',
        confidence: 0.90,
        reason: 'Stories format (9:16)',
        autoSelect: true
      });
      
      detections.push({
        platform: 'tiktok',
        confidence: 0.85,
        reason: 'Vertical image format',
        autoSelect: false
      });
    }
    
    // 1200x628 = LinkedIn
    if (width === 1200 && height === 628) {
      detections.push({
        platform: 'linkedin',
        confidence: 0.95,
        reason: 'Recommended LinkedIn image (1.91:1)',
        autoSelect: true
      });
    }
    
    // 1000x1500 = Pinterest
    if (width === 1000 && height === 1500) {
      detections.push({
        platform: 'pinterest',
        confidence: 0.95,
        reason: 'Standard Pin format (2:3)',
        autoSelect: true
      });
    }
    
    // 1200x627 = Demandbase Native
    if (width === 1200 && height === 627) {
      detections.push({
        platform: 'demandbase',
        confidence: 0.90,
        reason: 'Native ad main image size',
        autoSelect: true
      });
    }
  }
  
  // HTML5 / ZIP DETECTION
  if (ext === 'zip' || ext === 'html') {
    
    // Always suggest programmatic platforms
    detections.push({
      platform: 'iab',
      confidence: 0.85,
      reason: 'HTML5 display format',
      autoSelect: true
    });
    
    detections.push({
      platform: 'ttd',
      confidence: 0.85,
      reason: 'Programmatic display',
      autoSelect: true
    });
    
    // Size-based detection
    if (file.size <= 150 * 1024) {
      detections.push({
        platform: 'iab',
        confidence: 0.90,
        reason: 'Under 150KB (IAB limit)',
        autoSelect: true
      });
      
      detections.push({
        platform: 'ttd',
        confidence: 0.90,
        reason: 'Under 150KB (TTD limit)',
        autoSelect: true
      });
    }
    
    if (file.size <= 200 * 1024) {
      detections.push({
        platform: 'demandbase',
        confidence: 0.85,
        reason: 'Under 200KB (Demandbase limit)',
        autoSelect: true
      });
    } else if (file.size > 200 * 1024) {
      detections.push({
        platform: 'demandbase',
        confidence: 0.30,
        reason: 'HTML5 format but exceeds 200KB',
        autoSelect: false,
        warning: `File is ${Math.round(file.size / 1024)}KB (max 200KB)`
      });
    }
    
    // Check for Amazon-specific patterns
    if (file.name.toLowerCase().includes('amazon') || 
        file.name.toLowerCase().includes('dsp')) {
      detections.push({
        platform: 'amazon',
        confidence: 0.75,
        reason: 'Filename suggests Amazon DSP',
        autoSelect: false
      });
    }
  }
  
  // PDF DETECTION
  if (ext === 'pdf') {
    detections.push({
      platform: 'linkedin',
      confidence: 0.95,
      reason: 'PDF document ad format',
      autoSelect: true
    });
    
    // Check file size
    if (file.size > 100 * 1024 * 1024) {
      detections.push({
        platform: 'linkedin',
        confidence: 0.50,
        reason: 'PDF format but exceeds 100MB',
        autoSelect: false,
        warning: `File is ${Math.round(file.size / (1024 * 1024))}MB (max 100MB)`
      });
    }
  }
  
  // Remove duplicates and sort by confidence
  const unique = [];
  const seen = new Set();
  
  for (const detection of detections) {
    if (!seen.has(detection.platform)) {
      seen.add(detection.platform);
      unique.push(detection);
    }
  }
  
  return unique.sort((a, b) => b.confidence - a.confidence);
};

// Batch analysis - detect campaign type from multiple files
export const analyzeBatch = (filesWithMetadata) => {
  const analysis = {
    campaignType: 'unknown',
    suggestedPlatforms: [],
    patterns: [],
    warnings: []
  };
  
  const files = filesWithMetadata;
  
  // All vertical videos (9:16)
  const verticalVideos = files.filter(f => {
    const ar = f.metadata.width / f.metadata.height;
    return Math.abs(ar - 0.5625) < 0.02;
  });
  
  if (verticalVideos.length === files.length && files.length > 2) {
    analysis.campaignType = 'vertical-social';
    analysis.suggestedPlatforms = ['tiktok', 'snapchat', 'meta'];
    analysis.patterns.push('All files are 9:16 vertical format');
  }
  
  // Standard banner sizes
  const bannerSizes = files.filter(f => {
    return ['300x250', '728x90', '160x600', '300x600'].includes(
      `${f.metadata.width}x${f.metadata.height}`
    );
  });
  
  if (bannerSizes.length === files.length && files.length > 2) {
    analysis.campaignType = 'display-programmatic';
    analysis.suggestedPlatforms = ['iab', 'ttd', 'demandbase'];
    analysis.patterns.push('Multiple IAB standard sizes detected');
  }
  
  // CTV videos (15s or 30s)
  const ctvVideos = files.filter(f => {
    return [15, 30].includes(f.metadata.duration);
  });
  
  if (ctvVideos.length > 0) {
    analysis.campaignType = 'streaming-ctv';
    analysis.suggestedPlatforms = ['netflix', 'hulu', 'demandbase'];
    analysis.patterns.push(`${ctvVideos.length} files with CTV-standard durations`);
  }
  
  // Check for common issues across batch
  const oversized = files.filter(f => f.file.size > 5 * 1024 * 1024);
  if (oversized.length > files.length / 2) {
    analysis.warnings.push({
      severity: 'warning',
      message: `${oversized.length} files exceed 5MB - may fail platform limits`,
      affectedFiles: oversized.map(f => f.file.name)
    });
  }
  
  return analysis;
};

// Get platform name by ID
export const getPlatformName = (platformId) => {
  return PLATFORMS[platformId]?.name || platformId;
};

// Format confidence as percentage
export const formatConfidence = (confidence) => {
  return `${Math.round(confidence * 100)}%`;
};

// Get confidence color
export const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return '#10b981'; // Green
  if (confidence >= 0.6) return '#f59e0b'; // Yellow
  return '#64748b'; // Gray
};
