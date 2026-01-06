# 🎨 Creative Validator

Multi-platform ad creative validation tool for advertising professionals. Validate your creatives against specifications from 11+ major ad platforms including Google, Meta, TikTok, Netflix, Amazon, and more.

## ✨ Features

### 🎯 Smart Platform Filtering
- **Ad Type Selection**: Choose from Display Banner, CTV/Streaming, Native Ads, Social Media, Video, and Document types
- **Dynamic Platform Filtering**: Platforms automatically filter based on selected ad types
- **Batch Validation**: Validate multiple files against multiple platforms simultaneously

### 🔍 Comprehensive Validation

**Supported File Types:**
- HTML5 Display (.zip, .html)
- Images (.jpg, .png, .gif)
- Videos (.mp4, .mov)
- Documents (.pdf)

**Validation Checks:**
- ✅ File size limits (zipped and unzipped)
- ✅ Dimensions and aspect ratios
- ✅ Video duration constraints
- ✅ HTTPS enforcement
- ✅ Code validation (clickTag, SDK requirements)
- ✅ Platform-specific rules (retina images, safe zones, etc.)

### 📊 Smart Results Display

**Severity-Based Grouping:**
- 🔴 **Major Problems** (Errors) - Won't work, needs immediate fix
- 🟡 **Minor Adjustments** (Warnings) - Should be fixed
- 🟢 **Passed/OK** - All checks passed

**Features:**
- Expandable sections (errors auto-expanded)
- Per-platform issue breakdown
- Actionable fix suggestions
- Issue counts at a glance

## 🚀 Supported Platforms

### Industry Standards
- **IAB Standards** - Global baseline for all digital ads

### B2B & ABM
- **Demandbase** - B2B Account-Based Marketing
- **LinkedIn** - Professional network

### Social Media
- **Meta** (Facebook & Instagram)
- **TikTok** - Short-form video
- **Snapchat** - Ephemeral content
- **Pinterest** - Visual discovery

### Streaming & CTV
- **Netflix** - Premium streaming
- **Hulu/Disney+** - Major streaming platforms

### Programmatic DSPs
- **The Trade Desk / DV360** - Programmatic buying
- **Amazon DSP** - Amazon advertising platform

## 📋 Platform Specifications

### IAB Standards (Default Baseline)
```
Display Banner:
- Sizes: 300x250, 728x90, 160x600, 300x600, 320x50, 970x250
- Max File: 150 KB (initial load), 2.2 MB (subload)
- Max Requests: 10 HTTP calls
- Animation: Max 30s, auto-stop
- HTTPS: Required

Video:
- Protocol: VAST 4.0
- Bitrate: Min 2,000 kbps
- Audio: -24 LKFS (±2dB)
```

### Demandbase (B2B)
```
HTML5 Display:
- Max Zip: 200 KB (strict)
- Max Unzipped: 1,000 KB (1 MB)
- No Retina Images (@2x, @3x forbidden)
- HTTPS Required
- clickTag Required

Native Ads:
- Main Image: 1200x627 (Max 1200 KB)
- Logo: 128x128
- Headline: Max 25 chars
- Body: Max 90 chars
- CTA: Max 15 chars

CTV:
- Duration: Exactly 15s or 30s
- Bitrate: 15,000-30,000 kbps (CBR)
- Forbidden Pixels: BlueKai, Marketo
- Allowed: IAS, DoubleVerify
```

### Netflix
```
Video:
- Resolution: 1920x1080 (STRICT)
- Audio: -24 LKFS (±2dB), Peak -2 dBTP
- No Letterboxing: Black bars = instant fail
```

### TikTok
```
Video:
- Aspect Ratio: 9:16 (STRICT)
- Resolution: 1080x1920
- Safe Zone: Bottom 150px, Right 64px must be clear
- Duration: 5-60s
```

### Amazon DSP
```
HTML5:
- Must include: SDKLoader.js, SDK.clickThrough()
- Forbidden: var clickTag = (use SDK instead)
- Code validation enforced
```

### Meta (Facebook & Instagram)
```
Image:
- Feed: 1:1 (1080x1080), 4:5 (1080x1350)
- Stories: 9:16 (1080x1920)
- Max File: 30 MB

Video:
- Codec: H.264, Stereo AAC
- Max File: 4 GB
- Rejection: Text covering top/bottom 15%
```

### LinkedIn
```
Single Image:
- Aspect: 1.91:1 (1200x628)
- Max File: 5 MB

Video:
- Aspect: 16:9, 1:1, or 9:16 (mobile)
- Max File: 200 MB

Document:
- Format: PDF
- Max File: 100 MB
```

## 🛠️ Installation

### Quick Start (Development)
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deploy to Vercel
```bash
npx vercel --prod
```

## 📖 How to Use

### 1. Select Ad Types
Choose the type(s) of ads you're validating:
- Display Banner
- Connected TV / Streaming
- Native Ads
- Social Media
- In-Stream Video
- Document Ads

💡 **Tip**: Platforms will automatically filter to only show those supporting your selected ad types.

### 2. Select Platforms
Choose which platform(s) to validate against. Use:
- **Select All** - Validate against all compatible platforms
- **Clear** - Reset selection

### 3. Upload Creatives
Click the upload box or drag-and-drop files:
- Single file or multiple files
- Supported: .zip, .html, .jpg, .png, .gif, .mp4, .mov, .pdf

### 4. Validate
Click the "Validate" button. Results will be grouped by severity:

**🔴 Major Problems** (Auto-expanded)
- Critical issues that prevent the creative from working
- Must be fixed before launch
- Click to expand and see detailed issues + fixes

**🟡 Minor Adjustments**
- Non-critical but recommended fixes
- May impact performance or approval
- Click to expand for details

**🟢 Passed/OK** (Collapsed)
- All checks passed for these platforms
- Click to expand to see which platforms passed

### 5. Review & Fix
Each issue includes:
- Clear description of the problem
- 💡 Actionable fix suggestion
- Platform-specific requirements

## 🎯 Validation Examples

### Example 1: HTML5 Banner for Demandbase
```
✅ File: banner-300x250.zip
🔴 ERRORS:
   - Zip file too large: 250KB (max 200KB)
   💡 Reduce file size by 50KB
   
   - Found @2x image: image@2x.png
   💡 Use exact pixel dimensions (no retina)

🟡 WARNINGS:
   - Found 3 HTTP URLs - must use HTTPS
   💡 Replace all http:// with https://
```

### Example 2: Video for Netflix
```
✅ File: commercial.mp4
🔴 ERRORS:
   - Resolution 1920x1088 must be exactly 1920x1080
   💡 Re-encode video to 1920x1080
   
   - Duration 31s must be exactly 15s or 30s
   💡 Trim video to 30s
```

### Example 3: Image for TikTok
```
✅ File: tiktok-ad.mp4
🟢 SUCCESS:
   ✓ All checks passed for TikTok
```

## 🔧 Technical Details

### Built With
- **React 18** - UI framework
- **Vite 5** - Build tool & dev server
- **JSZip** - HTML5 zip validation
- **Native Web APIs** - Image/video metadata extraction

### Browser Requirements
- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- HTML5 video/image support

### File Processing
- All processing happens client-side (no uploads to servers)
- Files are analyzed in-browser using Web APIs
- Privacy-friendly (files never leave your computer)

## 📊 Platform Specifications Reference

### File Size Limits
| Platform | Type | Max Size |
|----------|------|----------|
| IAB Standard | HTML5 | 150 KB |
| Demandbase | HTML5 Zip | 200 KB |
| Demandbase | Unzipped | 1,000 KB |
| LinkedIn | Image | 5 MB |
| LinkedIn | Video | 200 MB |
| LinkedIn | PDF | 100 MB |
| Meta | Image | 30 MB |
| Meta | Video | 4 GB |

### Video Durations
| Platform | Duration |
|----------|----------|
| Demandbase CTV | Exactly 15s or 30s |
| Snapchat | 3-6s (strict) |
| TikTok | 5-60s |

### Aspect Ratios
| Platform | Required Ratio |
|----------|----------------|
| TikTok | 9:16 (strict) |
| Netflix | 16:9 (1920x1080 strict) |
| LinkedIn | 1.91:1 (recommended) |
| Pinterest | 2:3 (1000x1500) |
| Meta Feed | 1:1, 4:5 |
| Meta Stories | 9:16 |

## 🚨 Common Issues & Fixes

### ❌ "Zip file too large"
**Fix**: Compress images, remove unused files, optimize assets

### ❌ "Retina images not allowed"
**Fix**: Use exact pixel dimensions (300x250 not 600x500@2x)

### ❌ "Missing clickTag variable"
**Fix**: Add `var clickTag = "%%CLICK_URL_UNESC%%";` to your HTML

### ❌ "Forbidden code: var clickTag"
**Fix**: For Amazon DSP, use `SDK.clickThrough()` instead

### ❌ "Found HTTP URLs"
**Fix**: Replace all `http://` with `https://`

### ❌ "Aspect ratio doesn't match"
**Fix**: Re-encode video/resize image to required ratio

### ❌ "Duration must be exactly 15s or 30s"
**Fix**: Trim or extend video to exact duration

## 📝 Development

### Project Structure
```
creative-validator/
├── src/
│   ├── App.jsx              # Main component
│   ├── App.css              # Styling
│   ├── platformSpecs.js     # Platform specifications
│   ├── validator.js         # Validation logic
│   └── main.jsx             # Entry point
├── index.html
├── package.json
└── vite.config.js
```

### Adding New Platforms

1. Update `platformSpecs.js`:
```javascript
newplatform: {
  name: 'Platform Name',
  description: 'Description',
  adTypes: [AD_TYPES.BANNER],
  specs: {
    banner: {
      maxFileSize: 150 * 1024,
      requireHTTPS: true,
      // ... other specs
    }
  }
}
```

2. Validation logic will automatically apply

### Adding New Validation Rules

1. Update `validator.js` `validateCreative()` function
2. Add new issue checks with severity level
3. Provide fix suggestions

## 🤝 Contributing

Issues and pull requests welcome!

## 📄 License

MIT License - feel free to use for commercial or personal projects

## 🙏 Credits

Built with specifications from:
- IAB (Interactive Advertising Bureau)
- Google Campaign Manager 360
- Demandbase
- LinkedIn Ads
- Meta Business
- TikTok for Business
- Netflix Advertising
- Amazon Advertising
- The Trade Desk

## 🔗 Related Tools

- **CM360 Tag Validator** - Validate Google CM360 ad tags
- **Creative Pre-Flight Checker** - Pre-launch creative QA

---

**Made with 💜 for advertising professionals**
