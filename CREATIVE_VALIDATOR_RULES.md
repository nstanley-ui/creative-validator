# 📋 Creative Validator - Validation Rules Reference

Complete reference for all platform validation rules implemented in the Creative Validator.

## 🎯 Validation Severity Levels

### 🔴 ERROR (Major Problems)
Issues that will **prevent the creative from working** or cause **immediate rejection**.
- Must be fixed before launch
- Ad will not serve or will be rejected

### 🟡 WARNING (Minor Adjustments)
Issues that **should be fixed** but may not prevent delivery.
- May impact performance
- May cause approval delays
- Best practice violations

### 🟢 SUCCESS (Passed)
All validation checks passed for the platform.

---

## 📊 Platform-Specific Rules

### IAB Standards (Global Baseline)

**When to use**: Default fallback when specific platform not listed

#### Display Banner
| Check | Type | Rule |
|-------|------|------|
| File Size | ERROR | Max 150 KB (initial load) |
| Subload Size | WARNING | Max 2.2 MB (polite load) |
| HTTP Requests | WARNING | Max 10 calls on initial load |
| HTTPS | ERROR | All assets must be HTTPS |
| Animation | WARNING | Max 30 seconds, must auto-stop |
| Dimensions | ERROR | Must match standard sizes |

**Standard Sizes**: 300x250, 728x90, 160x600, 300x600, 320x50, 970x250

#### Video
| Check | Type | Rule |
|-------|------|------|
| Protocol | WARNING | VAST 4.0 required |
| Bitrate | WARNING | Min 2,000 kbps |
| Audio | WARNING | -24 LKFS (±2dB) |

---

### Demandbase (B2B Account-Based Marketing)

**Critical Platform for**: B2B campaigns, ABM, lead generation

#### HTML5 Display
| Check | Type | Rule | Fix |
|-------|------|------|-----|
| Zip Size | ERROR | Max 200 KB | Compress images, remove unused files |
| Unzipped Size | ERROR | Max 1,000 KB (1 MB) | Optimize all assets |
| Retina Images | ERROR | No @2x or @3x files | Use exact pixel dimensions |
| HTTPS | ERROR | All URLs must be HTTPS | Replace http:// with https:// |
| clickTag | ERROR | Must include clickTag | Add clickTag variable |

**Retina Check**: Scans for `@2x.`, `@3x.` in filenames and validates actual vs. declared dimensions

#### Native Ads
| Element | Limit | Rule |
|---------|-------|------|
| Main Image | 1200x627, Max 1200 KB | No text/branding on image |
| Logo | 128x128 (strict) | Square aspect ratio |
| Headline | 25 characters | Hard limit |
| Body Text | 90 characters | Hard limit |
| CTA | 15 characters | Hard limit |

#### CTV (Connected TV)
| Check | Type | Rule |
|-------|------|------|
| Duration | ERROR | Exactly 15s OR 30s (no other values) |
| Bitrate | ERROR | 15,000-30,000 kbps |
| Bitrate Mode | ERROR | CBR (Constant Bit Rate) required |
| Pixels | ERROR | BlueKai, Marketo, Rubicon forbidden |
| Pixels | SUCCESS | IAS, DoubleVerify allowed |

---

### Netflix (Premium Streaming)

**Critical Platform for**: High-quality video campaigns, premium inventory

#### Video
| Check | Type | Rule | Why It Matters |
|-------|------|------|----------------|
| Resolution | ERROR | Exactly 1920x1080 | Pixel-perfect requirement |
| Audio Loudness | ERROR | -24 LKFS (±2dB) | Consistent volume |
| True Peak | ERROR | -2 dBTP max | Prevent clipping |
| Letterboxing | ERROR | No black bars allowed | Instant rejection |

**Letterbox Detection**: Checks if top-left pixel (0,0) is black (RGB 0,0,0)

---

### Amazon DSP

**Critical Platform for**: Amazon advertising, e-commerce campaigns

#### HTML5 Code Validation
| Check | Type | Rule | Fix |
|-------|------|------|-----|
| SDKLoader.js | ERROR | Must be included | Add script tag |
| SDK.clickThrough() | ERROR | Must use SDK method | Replace clickTag |
| Forbidden | ERROR | Cannot use `var clickTag` | Use SDK API instead |

**Code Scan**: Analyzes all .js and .html files in zip for required/forbidden patterns

**Example - WRONG**:
```javascript
var clickTag = "%%CLICK_URL%%";
```

**Example - CORRECT**:
```javascript
SDK.clickThrough();
```

---

### TikTok

**Critical Platform for**: Short-form video, mobile-first campaigns

#### Video
| Check | Type | Rule |
|-------|------|------|
| Aspect Ratio | ERROR | 9:16 (strict, tolerance 0.01) |
| Resolution | ERROR | 1080x1920 |
| Duration | ERROR | 5-60 seconds |
| Safe Zone | WARNING | Bottom 150px + Right 64px clear |

**Safe Zone**: UI overlays cover these areas - keep text/logos clear

---

### Meta (Facebook & Instagram)

**Critical Platform for**: Social media, feed ads, stories

#### Image
| Placement | Aspect Ratio | Resolution | Max Size |
|-----------|--------------|------------|----------|
| Feed | 1:1 | 1080x1080 | 30 MB |
| Feed | 4:5 | 1080x1350 | 30 MB |
| Stories | 9:16 | 1080x1920 | 30 MB |

#### Video
| Check | Type | Rule |
|-------|------|------|
| Codec | ERROR | H.264 required |
| Audio | ERROR | Stereo AAC required |
| Max Size | ERROR | 4 GB |
| Text Overlay | WARNING | Avoid text on top/bottom 15% |

**Text Overlay Rule**: Stories UI covers top/bottom - text in these areas will be covered

---

### LinkedIn

**Critical Platform for**: B2B, professional audience

#### Single Image
| Check | Type | Rule |
|-------|------|------|
| Aspect Ratio | WARNING | 1.91:1 recommended |
| Resolution | SUCCESS | 1200x628 recommended |
| Max Size | ERROR | 5 MB |

#### Video
| Check | Type | Rule |
|-------|------|------|
| Aspect Ratios | SUCCESS | 16:9, 1:1, or 9:16 (mobile only) |
| Max Size | ERROR | 200 MB |

#### Document Ads
| Check | Type | Rule |
|-------|------|------|
| Format | ERROR | PDF only |
| Max Size | ERROR | 100 MB |
| Orientation | SUCCESS | Any (vertical, square, landscape) |

---

### Snapchat

**Critical Platform for**: Young audience, ephemeral content

#### Commercials
| Check | Type | Rule |
|-------|------|------|
| Duration | ERROR | 3-6 seconds (strict) |
| Resolution | ERROR | 1080x1920 |
| Skippable | INFO | Non-skippable format |

---

### Pinterest

**Critical Platform for**: Visual discovery, shopping

#### Standard Pin
| Check | Type | Rule |
|-------|------|------|
| Aspect Ratio | WARNING | 2:3 recommended |
| Resolution | SUCCESS | 1000x1500 recommended |

---

### Hulu / Disney+

**Critical Platform for**: Premium streaming, family content

#### Video
| Check | Type | Rule |
|-------|------|------|
| Codec | WARNING | Apple ProRes 422 HQ preferred |
| Bitrate | WARNING | Min 15,000 kbps (15 Mbps) |
| Audio | ERROR | -24 LKFS |

---

### The Trade Desk / DV360 (Programmatic)

**Critical Platform for**: Programmatic buying, DSP campaigns

#### HTML5
| Check | Type | Rule |
|-------|------|------|
| Max Size | ERROR | 150 KB |
| clickTag | ERROR | Required |
| ad.size meta tag | ERROR | Required |
| HTTPS | ERROR | Required |

#### Video
| Check | Type | Rule |
|-------|------|------|
| Protocol | WARNING | VAST 4.0 |

---

## 🔍 File Type Validation

### HTML5 (.zip, .html)

**Checks Performed**:
1. Zip file size vs. limit
2. Unzipped total size calculation
3. HTTPS enforcement (scans all HTML/JS)
4. clickTag presence
5. Retina image detection (@2x, @3x)
6. Code validation (Amazon SDK)
7. Forbidden pixels (Demandbase)

**Files Scanned**:
- All .html files
- All .js files
- All .jpg/.png/.gif files (for @2x)

### Images (.jpg, .png, .gif)

**Checks Performed**:
1. File size vs. limit
2. Actual dimensions extraction
3. Aspect ratio calculation
4. Dimension matching vs. spec

**Metadata Extracted**:
- Width (pixels)
- Height (pixels)
- File size (bytes)

### Videos (.mp4, .mov)

**Checks Performed**:
1. File size vs. limit
2. Video dimensions (width x height)
3. Duration (seconds)
4. Aspect ratio calculation
5. Resolution matching (Netflix strict)
6. Duration matching (Demandbase exact, Snapchat range)

**Metadata Extracted**:
- Width (pixels)
- Height (pixels)
- Duration (seconds, rounded)
- File size (bytes)

### PDFs (.pdf)

**Checks Performed**:
1. File size vs. limit

---

## 🎯 Common Validation Patterns

### Dimension Matching

```javascript
// Exact match (Netflix)
Resolution must be EXACTLY 1920x1080

// Size options (IAB)
Must be one of: 300x250, 728x90, 160x600, etc.

// Recommended (LinkedIn)
Recommended 1200x628 (warns if different)
```

### Aspect Ratio Checking

```javascript
// Strict (TikTok)
Aspect ratio 9:16 (tolerance 0.01)
Actual: 1080x1920 = 0.5625:1 ✓

// Flexible (Meta)
Aspect ratio 1:1, 4:5, or 9:16
Actual: 1080x1080 = 1:1 ✓
```

### Duration Validation

```javascript
// Exact (Demandbase)
Duration must be EXACTLY 15s or 30s
Actual: 16s ✗ FAIL

// Range (Snapchat)
Duration must be 3-6s
Actual: 5s ✓ PASS

// Min/Max (TikTok)
Duration 5-60s
Actual: 45s ✓ PASS
```

### File Size Limits

```javascript
// Zipped (Demandbase)
Max 200 KB zipped

// Unzipped (Demandbase)
Max 1,000 KB when extracted
(Sum of all files in zip)

// Video (LinkedIn)
Max 200 MB
```

---

## 💡 Best Practices

### Before Uploading
1. Compress images (use TinyPNG, ImageOptim)
2. Minify HTML/CSS/JS (use build tools)
3. Test video encoding (use HandBrake)
4. Remove unused files from zips

### During Validation
1. Start with most restrictive platform (Demandbase, Netflix)
2. Fix errors before warnings
3. Read fix suggestions carefully
4. Re-validate after each fix

### After Validation
1. Document which platforms passed
2. Note any warnings for QA team
3. Test on actual platform if possible
4. Keep validation report for records

---

## 🚨 Critical Rules Summary

### Never Do This
- ❌ Use HTTP (always HTTPS)
- ❌ Include @2x images for Demandbase
- ❌ Use `var clickTag` for Amazon
- ❌ Letterbox Netflix videos
- ❌ Put text on Demandbase native images
- ❌ Include BlueKai/Marketo pixels in Demandbase
- ❌ Use non-CBR bitrate for Demandbase CTV

### Always Do This
- ✅ Test file sizes before validation
- ✅ Use exact durations for Demandbase (15s or 30s)
- ✅ Check aspect ratios carefully
- ✅ Include clickTag for all HTML5
- ✅ Use SDK.clickThrough() for Amazon
- ✅ Keep safe zones clear (TikTok, Snapchat)
- ✅ Validate audio levels (-24 LKFS)

---

## 📚 Additional Resources

### Official Documentation
- [IAB Standards](https://www.iab.com/guidelines/creative-guidelines/)
- [Demandbase Creative Specs](https://support.demandbase.com)
- [Netflix Ad Specs](https://www.netflix.com/ads)
- [Meta Ad Specs](https://www.facebook.com/business/ads-guide)
- [TikTok Ad Specs](https://ads.tiktok.com/help/article/tiktok-advertising-specifications)
- [LinkedIn Ad Specs](https://business.linkedin.com/marketing-solutions/ads-specs)
- [Amazon DSP](https://advertising.amazon.com/resources)

### Tools
- [TinyPNG](https://tinypng.com) - Image compression
- [HandBrake](https://handbrake.fr) - Video encoding
- [FFmpeg](https://ffmpeg.org) - Audio normalization
- [ImageOptim](https://imageoptim.com) - Mac image optimization

---

**Last Updated**: January 2026
**Version**: 1.0.0
