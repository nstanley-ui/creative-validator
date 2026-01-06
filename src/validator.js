import JSZip from 'jszip';
import { PLATFORMS, checkDimensions, checkAspectRatio } from './platformSpecs';

// Validation severity levels
export const SEVERITY = {
  ERROR: 'error',    // Major problems - won't work
  WARNING: 'warning', // Minor adjustments needed
  SUCCESS: 'success'  // Passed
};

// Get file extension
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

// Get file size in KB
const getFileSizeKB = (bytes) => {
  return Math.round(bytes / 1024);
};

// Get file size in MB
const getFileSizeMB = (bytes) => {
  return (bytes / (1024 * 1024)).toFixed(2);
};

// Get image dimensions from file
const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

// Get video dimensions and duration
const getVideoMetadata = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Math.round(video.duration)
      });
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video'));
    };
    
    video.src = url;
  });
};

// Validate HTML5 zip file
const validateHTML5Zip = async (file, spec) => {
  const issues = [];
  
  try {
    const zip = await JSZip.loadAsync(file);
    const files = Object.keys(zip.files);
    
    // Check zip size
    if (spec.maxZipSize && file.size > spec.maxZipSize) {
      issues.push({
        severity: SEVERITY.ERROR,
        message: `Zip file too large: ${getFileSizeKB(file.size)}KB (max ${getFileSizeKB(spec.maxZipSize)}KB)`,
        fix: `Reduce file size by ${getFileSizeKB(file.size - spec.maxZipSize)}KB`
      });
    }
    
    // Calculate unzipped size
    if (spec.maxUnzippedSize) {
      let totalSize = 0;
      for (const filename of files) {
        const fileData = zip.files[filename];
        if (!fileData.dir) {
          const content = await fileData.async('arraybuffer');
          totalSize += content.byteLength;
        }
      }
      
      if (totalSize > spec.maxUnzippedSize) {
        issues.push({
          severity: SEVERITY.ERROR,
          message: `Unzipped size too large: ${getFileSizeKB(totalSize)}KB (max ${getFileSizeKB(spec.maxUnzippedSize)}KB)`,
          fix: `Reduce unzipped size by ${getFileSizeKB(totalSize - spec.maxUnzippedSize)}KB`
        });
      }
    }
    
    // Check for retina images (Demandbase)
    if (spec.noRetinaImages) {
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
      for (const imgFile of imageFiles) {
        if (/@2x\./i.test(imgFile) || /@3x\./i.test(imgFile)) {
          issues.push({
            severity: SEVERITY.ERROR,
            message: `Retina images not allowed: ${imgFile}`,
            fix: 'Use exact pixel dimensions (no @2x or @3x images)'
          });
        }
      }
    }
    
    // Check for clickTag
    if (spec.requireClickTag || spec.hasClickTag) {
      const htmlFiles = files.filter(f => /\.html?$/i.test(f));
      let hasClickTag = false;
      
      for (const htmlFile of htmlFiles) {
        const content = await zip.files[htmlFile].async('string');
        if (/clickTag/i.test(content)) {
          hasClickTag = true;
          break;
        }
      }
      
      if (!hasClickTag) {
        issues.push({
          severity: SEVERITY.ERROR,
          message: 'Missing clickTag variable',
          fix: 'Add clickTag to your HTML/JavaScript code'
        });
      }
    }
    
    // Check for HTTPS
    if (spec.requireHTTPS) {
      const htmlFiles = files.filter(f => /\.html?$/i.test(f));
      
      for (const htmlFile of htmlFiles) {
        const content = await zip.files[htmlFile].async('string');
        const httpMatches = content.match(/http:\/\/(?!localhost)/gi);
        
        if (httpMatches) {
          issues.push({
            severity: SEVERITY.ERROR,
            message: `Found ${httpMatches.length} HTTP URL(s) - must use HTTPS`,
            fix: 'Replace all http:// with https://'
          });
        }
      }
    }
    
    // Amazon DSP specific checks
    if (spec.codeValidation) {
      const jsFiles = files.filter(f => /\.(js|html)$/i.test(f));
      
      for (const jsFile of jsFiles) {
        const content = await zip.files[jsFile].async('string');
        
        // Check must include
        for (const required of spec.codeValidation.mustInclude) {
          if (!content.includes(required)) {
            issues.push({
              severity: SEVERITY.ERROR,
              message: `Missing required code: ${required}`,
              fix: `Add ${required} to your code`
            });
          }
        }
        
        // Check must not include
        for (const forbidden of spec.codeValidation.mustNotInclude) {
          if (content.includes(forbidden)) {
            issues.push({
              severity: SEVERITY.ERROR,
              message: `Forbidden code detected: ${forbidden}`,
              fix: `Remove ${forbidden} - use SDK.clickThrough() instead`
            });
          }
        }
      }
    }
    
  } catch (error) {
    issues.push({
      severity: SEVERITY.ERROR,
      message: `Failed to read zip file: ${error.message}`,
      fix: 'Ensure file is a valid zip archive'
    });
  }
  
  return issues;
};

// Main validation function
export const validateCreative = async (file, platformIds) => {
  const results = {
    filename: file.name,
    fileSize: file.size,
    fileSizeDisplay: getFileSizeKB(file.size) + 'KB',
    fileType: getFileExtension(file.name),
    platforms: []
  };
  
  // Validate against each selected platform
  for (const platformId of platformIds) {
    const platform = PLATFORMS[platformId];
    if (!platform) continue;
    
    const platformResult = {
      platformId,
      platformName: platform.name,
      issues: []
    };
    
    const ext = results.fileType;
    
    // Determine which spec to use based on file type
    let spec = null;
    let specType = null;
    
    // Banner/HTML5
    if (ext === 'zip' || ext === 'html') {
      spec = platform.specs.banner;
      specType = 'banner';
    }
    // Images
    else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      spec = platform.specs.image || 
             platform.specs.singleImage || 
             platform.specs.native?.mainImage ||
             platform.specs.standardPin;
      specType = 'image';
    }
    // Video
    else if (['mp4', 'mov'].includes(ext)) {
      spec = platform.specs.video || 
             platform.specs.ctv ||
             platform.specs.commercials;
      specType = 'video';
    }
    // PDF
    else if (ext === 'pdf') {
      spec = platform.specs.document;
      specType = 'document';
    }
    
    if (!spec) {
      platformResult.issues.push({
        severity: SEVERITY.WARNING,
        message: `File type .${ext} not supported by ${platform.name}`,
        fix: 'Check platform specifications for supported formats'
      });
      results.platforms.push(platformResult);
      continue;
    }
    
    // Validate based on type
    if (ext === 'zip') {
      const zipIssues = await validateHTML5Zip(file, spec);
      platformResult.issues.push(...zipIssues);
    }
    else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      // Image validation
      try {
        const { width, height } = await getImageDimensions(file);
        results.dimensions = `${width}x${height}`;
        
        // Check dimensions
        if (spec.recommendedSize) {
          const [targetW, targetH] = spec.recommendedSize.split('x').map(Number);
          if (width !== targetW || height !== targetH) {
            platformResult.issues.push({
              severity: SEVERITY.WARNING,
              message: `Dimensions ${width}x${height} don't match recommended ${spec.recommendedSize}`,
              fix: `Resize image to ${spec.recommendedSize}`
            });
          }
        }
        
        // Check aspect ratio
        if (spec.aspectRatio) {
          const ratioMatch = checkAspectRatio(width, height, spec.aspectRatio);
          if (!ratioMatch) {
            platformResult.issues.push({
              severity: SEVERITY.ERROR,
              message: `Aspect ratio ${(width/height).toFixed(2)}:1 doesn't match required ${spec.aspectRatio}`,
              fix: `Adjust aspect ratio to ${spec.aspectRatio}`
            });
          }
        }
        
        // Check file size
        if (spec.maxFileSize && file.size > spec.maxFileSize) {
          platformResult.issues.push({
            severity: SEVERITY.ERROR,
            message: `File size ${getFileSizeMB(file.size)}MB exceeds max ${getFileSizeMB(spec.maxFileSize)}MB`,
            fix: `Reduce file size by ${getFileSizeMB(file.size - spec.maxFileSize)}MB`
          });
        } else if (spec.maxSize && file.size > spec.maxSize) {
          platformResult.issues.push({
            severity: SEVERITY.ERROR,
            message: `File size ${getFileSizeKB(file.size)}KB exceeds max ${getFileSizeKB(spec.maxSize)}KB`,
            fix: `Reduce file size by ${getFileSizeKB(file.size - spec.maxSize)}KB`
          });
        }
        
      } catch (error) {
        platformResult.issues.push({
          severity: SEVERITY.ERROR,
          message: `Failed to read image: ${error.message}`,
          fix: 'Ensure file is a valid image'
        });
      }
    }
    else if (['mp4', 'mov'].includes(ext)) {
      // Video validation
      try {
        const { width, height, duration } = await getVideoMetadata(file);
        results.dimensions = `${width}x${height}`;
        results.duration = duration;
        
        // Check resolution
        if (spec.resolution && spec.strict) {
          const [targetW, targetH] = spec.resolution.split('x').map(Number);
          if (width !== targetW || height !== targetH) {
            platformResult.issues.push({
              severity: SEVERITY.ERROR,
              message: `Resolution ${width}x${height} must be exactly ${spec.resolution}`,
              fix: `Re-encode video to ${spec.resolution}`
            });
          }
        }
        
        // Check aspect ratio
        if (spec.aspectRatio) {
          const ratioMatch = checkAspectRatio(width, height, spec.aspectRatio);
          if (!ratioMatch && spec.strict) {
            platformResult.issues.push({
              severity: SEVERITY.ERROR,
              message: `Aspect ratio must be ${spec.aspectRatio}`,
              fix: `Re-encode video to ${spec.aspectRatio}`
            });
          }
        }
        
        // Check duration
        if (spec.durations && Array.isArray(spec.durations)) {
          if (!spec.durations.includes(duration)) {
            platformResult.issues.push({
              severity: SEVERITY.ERROR,
              message: `Duration ${duration}s must be exactly ${spec.durations.join('s or ')}s`,
              fix: `Trim/extend video to ${spec.durations[0]}s or ${spec.durations[1]}s`
            });
          }
        } else if (spec.duration) {
          if (spec.duration.min && duration < spec.duration.min) {
            platformResult.issues.push({
              severity: SEVERITY.ERROR,
              message: `Duration ${duration}s below minimum ${spec.duration.min}s`,
              fix: `Extend video to at least ${spec.duration.min}s`
            });
          }
          if (spec.duration.max && duration > spec.duration.max) {
            platformResult.issues.push({
              severity: SEVERITY.ERROR,
              message: `Duration ${duration}s exceeds maximum ${spec.duration.max}s`,
              fix: `Trim video to ${spec.duration.max}s or less`
            });
          }
        }
        
        // Check file size
        if (spec.maxFileSize && file.size > spec.maxFileSize) {
          platformResult.issues.push({
            severity: SEVERITY.ERROR,
            message: `File size ${getFileSizeMB(file.size)}MB exceeds max ${getFileSizeMB(spec.maxFileSize)}MB`,
            fix: `Compress video to under ${getFileSizeMB(spec.maxFileSize)}MB`
          });
        }
        
      } catch (error) {
        platformResult.issues.push({
          severity: SEVERITY.ERROR,
          message: `Failed to read video metadata: ${error.message}`,
          fix: 'Ensure file is a valid video'
        });
      }
    }
    else if (ext === 'pdf') {
      // PDF validation
      if (spec.maxFileSize && file.size > spec.maxFileSize) {
        platformResult.issues.push({
          severity: SEVERITY.ERROR,
          message: `File size ${getFileSizeMB(file.size)}MB exceeds max ${getFileSizeMB(spec.maxFileSize)}MB`,
          fix: `Compress PDF to under ${getFileSizeMB(spec.maxFileSize)}MB`
        });
      }
    }
    
    // If no issues, mark as success
    if (platformResult.issues.length === 0) {
      platformResult.issues.push({
        severity: SEVERITY.SUCCESS,
        message: `All checks passed for ${platform.name}`,
        fix: null
      });
    }
    
    results.platforms.push(platformResult);
  }
  
  return results;
};

// Group results by severity
export const groupBySeverity = (results) => {
  const grouped = {
    errors: [],
    warnings: [],
    success: []
  };
  
  for (const platformResult of results.platforms) {
    const hasErrors = platformResult.issues.some(i => i.severity === SEVERITY.ERROR);
    const hasWarnings = platformResult.issues.some(i => i.severity === SEVERITY.WARNING);
    
    if (hasErrors) {
      grouped.errors.push(platformResult);
    } else if (hasWarnings) {
      grouped.warnings.push(platformResult);
    } else {
      grouped.success.push(platformResult);
    }
  }
  
  return grouped;
};
