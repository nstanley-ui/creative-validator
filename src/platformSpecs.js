// Platform Specifications Database
// Based on Mojo Major Ad Platform Ad Specs v4.0

export const AD_TYPES = {
  BANNER: 'Display Banner',
  CTV: 'Connected TV / Streaming',
  NATIVE: 'Native Ads',
  SOCIAL: 'Social Media',
  VIDEO: 'In-Stream Video',
  DOCUMENT: 'Document Ads'
};

export const PLATFORMS = {
  // IAB Standards (Default Baseline)
  iab: {
    name: 'IAB Standards',
    description: 'Global baseline - use when platform not listed',
    adTypes: [AD_TYPES.BANNER, AD_TYPES.VIDEO],
    specs: {
      banner: {
        acceptedSizes: [
          '300x250', '728x90', '160x600', '300x600', '320x50', '970x250'
        ],
        maxFileSize: 150 * 1024, // 150 KB initial load
        maxSubloadSize: 2.2 * 1024 * 1024, // 2.2 MB subload
        maxRequests: 10,
        maxAnimationDuration: 30,
        requireHTTPS: true,
        fileTypes: ['html', 'zip', 'jpg', 'png', 'gif']
      },
      video: {
        protocol: 'VAST 4.0',
        minBitrate: 2000, // kbps
        audioLoudness: -24, // LKFS
        audioTolerance: 2, // dB
        fileTypes: ['mp4', 'mov']
      }
    }
  },

  // Demandbase (B2B)
  demandbase: {
    name: 'Demandbase',
    description: 'B2B Account-Based Marketing',
    adTypes: [AD_TYPES.BANNER, AD_TYPES.NATIVE, AD_TYPES.CTV],
    specs: {
      banner: {
        maxZipSize: 200 * 1024, // 200 KB strict
        maxUnzippedSize: 1000 * 1024, // 1 MB unzipped
        noRetinaImages: true,
        requireHTTPS: true,
        hasClickTag: true,
        fileTypes: ['zip']
      },
      native: {
        mainImage: {
          aspectRatio: '1200x627',
          maxSize: 1200 * 1024, // 1200 KB
          noTextOnImage: true
        },
        logo: {
          size: '128x128',
          required: true
        },
        headline: { maxChars: 25 },
        bodyText: { maxChars: 90 },
        cta: { maxChars: 15 },
        fileTypes: ['jpg', 'png']
      },
      ctv: {
        durations: [15, 30], // Exactly 15s or 30s
        minBitrate: 15000, // kbps
        maxBitrate: 30000, // kbps
        bitrateMode: 'CBR',
        forbiddenPixels: ['bluekai', 'marketo', 'rubicon'],
        allowedPixels: ['ias', 'doubleverify'],
        fileTypes: ['mp4', 'mov']
      }
    }
  },

  // LinkedIn
  linkedin: {
    name: 'LinkedIn',
    description: 'Professional B2B network',
    adTypes: [AD_TYPES.SOCIAL, AD_TYPES.DOCUMENT],
    specs: {
      singleImage: {
        aspectRatio: '1.91:1',
        recommendedSize: '1200x628',
        maxFileSize: 5 * 1024 * 1024, // 5 MB
        fileTypes: ['jpg', 'png']
      },
      video: {
        aspectRatios: ['16:9', '1:1', '9:16'],
        maxFileSize: 200 * 1024 * 1024, // 200 MB
        fileTypes: ['mp4', 'mov']
      },
      document: {
        format: 'PDF',
        maxFileSize: 100 * 1024 * 1024, // 100 MB
        orientations: ['vertical', 'square', 'landscape'],
        fileTypes: ['pdf']
      }
    }
  },

  // Meta (Facebook & Instagram)
  meta: {
    name: 'Meta (Facebook & Instagram)',
    description: 'Social media - Facebook, Instagram, Messenger',
    adTypes: [AD_TYPES.SOCIAL],
    specs: {
      image: {
        aspectRatios: [
          { ratio: '1:1', size: '1080x1080', placement: 'Feed' },
          { ratio: '4:5', size: '1080x1350', placement: 'Feed' },
          { ratio: '9:16', size: '1080x1920', placement: 'Stories' }
        ],
        maxFileSize: 30 * 1024 * 1024, // 30 MB
        fileTypes: ['jpg', 'png']
      },
      video: {
        codec: 'H.264',
        audio: 'Stereo AAC',
        maxFileSize: 4 * 1024 * 1024 * 1024, // 4 GB
        rejectionRule: 'text_covering_15_percent_top_bottom',
        fileTypes: ['mp4', 'mov']
      }
    }
  },

  // TikTok
  tiktok: {
    name: 'TikTok',
    description: 'Short-form video platform',
    adTypes: [AD_TYPES.SOCIAL],
    specs: {
      video: {
        aspectRatio: '9:16',
        resolution: '1080x1920',
        strict: true,
        safeZone: {
          bottom: 150, // pixels
          right: 64 // pixels
        },
        duration: { min: 5, max: 60 },
        fileTypes: ['mp4', 'mov']
      }
    }
  },

  // Snapchat
  snapchat: {
    name: 'Snapchat',
    description: 'Ephemeral messaging & content',
    adTypes: [AD_TYPES.SOCIAL],
    specs: {
      commercials: {
        duration: { min: 3, max: 6 },
        strict: true,
        resolution: '1080x1920',
        skippable: false,
        fileTypes: ['mp4']
      }
    }
  },

  // Pinterest
  pinterest: {
    name: 'Pinterest',
    description: 'Visual discovery platform',
    adTypes: [AD_TYPES.SOCIAL],
    specs: {
      standardPin: {
        aspectRatio: '2:3',
        recommendedSize: '1000x1500',
        fileTypes: ['jpg', 'png']
      }
    }
  },

  // Netflix
  netflix: {
    name: 'Netflix',
    description: 'Premium streaming service',
    adTypes: [AD_TYPES.CTV],
    specs: {
      video: {
        resolution: '1920x1080',
        strict: true,
        audioLoudness: -24, // LKFS
        audioTolerance: 2, // +/- 2dB
        truePeak: -2, // dBTP
        noLetterboxing: true,
        rejectBlackBars: true,
        fileTypes: ['mp4', 'mov', 'prores']
      }
    }
  },

  // Hulu / Disney
  hulu: {
    name: 'Hulu / Disney+',
    description: 'Major streaming platforms',
    adTypes: [AD_TYPES.CTV],
    specs: {
      video: {
        preferredCodec: 'Apple ProRes 422 HQ',
        minBitrate: 15000, // Mbps = 15,000 kbps
        audioLoudness: -24, // LKFS
        fileTypes: ['mp4', 'mov', 'prores']
      }
    }
  },

  // The Trade Desk / DV360
  ttd: {
    name: 'The Trade Desk / DV360',
    description: 'Programmatic DSPs',
    adTypes: [AD_TYPES.BANNER, AD_TYPES.VIDEO],
    specs: {
      banner: {
        maxFileSize: 150 * 1024, // 150 KB
        requireClickTag: true,
        requireAdSizeMetaTag: true,
        requireHTTPS: true,
        fileTypes: ['html', 'zip']
      },
      audio: {
        protocol: 'DAAST',
        fileTypes: ['mp3', 'wav']
      },
      video: {
        protocol: 'VAST 4.0',
        fileTypes: ['mp4']
      }
    }
  },

  // Amazon DSP
  amazon: {
    name: 'Amazon DSP',
    description: 'Amazon advertising platform',
    adTypes: [AD_TYPES.BANNER],
    specs: {
      banner: {
        requireSDKLoader: true,
        requireSDKClickThrough: true,
        forbiddenClickTag: true,
        codeValidation: {
          mustInclude: ['SDKLoader.js', 'SDK.clickThrough('],
          mustNotInclude: ['var clickTag', 'clickTag =']
        },
        fileTypes: ['html', 'zip']
      }
    }
  }
};

// Helper function to get platforms by ad type
export const getPlatformsByAdType = (adType) => {
  return Object.entries(PLATFORMS)
    .filter(([_, platform]) => platform.adTypes.includes(adType))
    .map(([id, platform]) => ({ id, ...platform }));
};

// Helper function to get all ad types
export const getAllAdTypes = () => {
  return Object.values(AD_TYPES);
};

// Helper to check if dimension matches spec
export const checkDimensions = (width, height, spec) => {
  if (spec.resolution) {
    const [w, h] = spec.resolution.split('x').map(Number);
    return width === w && height === h;
  }
  if (spec.acceptedSizes) {
    return spec.acceptedSizes.includes(`${width}x${height}`);
  }
  if (spec.recommendedSize) {
    const [w, h] = spec.recommendedSize.split('x').map(Number);
    return width === w && height === h;
  }
  return true;
};

// Helper to check aspect ratio
export const checkAspectRatio = (width, height, targetRatio) => {
  const actualRatio = width / height;
  
  // Parse target ratio (e.g., "16:9", "1.91:1", "9:16")
  let target;
  if (targetRatio.includes(':')) {
    const [w, h] = targetRatio.split(':').map(Number);
    target = w / h;
  } else {
    target = parseFloat(targetRatio);
  }
  
  const tolerance = 0.01;
  return Math.abs(actualRatio - target) <= tolerance;
};
