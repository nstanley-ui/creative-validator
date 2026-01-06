import React, { useState } from 'react';
import { validateCreative } from './validator';
import { detectPlatforms, getPlatformName } from './autoDetection';
import { createDemoFiles } from './demoCreatives';
import './App.css';

function App() {
  const [validationResults, setValidationResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState({});
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Process files: detect + validate
  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    await processFiles(selectedFiles);
  };

  const processFiles = async (files) => {
    setIsProcessing(true);
    setValidationResults([]);

    const results = [];

    for (const file of files) {
      // Extract metadata
      const metadata = await extractMetadata(file);
      
      // Auto-detect platforms
      const detections = detectPlatforms(file, metadata);
      const platformsToValidate = detections
        .filter(d => d.confidence >= 0.75)
        .map(d => d.platform);

      // Validate against detected platforms
      const validation = await validateCreative(file, platformsToValidate);
      
      // Categorize by readiness
      const readyFor = [];
      const issuesFor = [];

      validation.platforms.forEach(result => {
        const hasErrors = result.issues.some(i => i.severity === 'error');
        if (!hasErrors) {
          readyFor.push({
            platform: result.platformName,
            issues: result.issues.filter(i => i.severity === 'warning')
          });
        } else {
          issuesFor.push({
            platform: result.platformName,
            issues: result.issues
          });
        }
      });

      results.push({
        filename: file.name,
        fileSize: (file.size / 1024).toFixed(0) + 'KB',
        dimensions: metadata.width && metadata.height 
          ? `${metadata.width}x${metadata.height}`
          : null,
        duration: metadata.duration ? `${metadata.duration}s` : null,
        detections,
        readyFor,
        issuesFor,
        allPlatforms: validation.platforms
      });
    }

    setValidationResults(results);
    setIsProcessing(false);
  };

  // Extract metadata from file
  const extractMetadata = async (file) => {
    // Check if it's a demo file with pre-attached metadata
    if (file.__demoMetadata) {
      return file.__demoMetadata;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      try {
        return await getImageDimensions(file);
      } catch (error) {
        return {};
      }
    }
    
    if (['mp4', 'mov'].includes(ext)) {
      try {
        return await getVideoMetadata(file);
      } catch (error) {
        return {};
      }
    }
    
    return {};
  };

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

  const toggleFileExpand = (filename) => {
    setExpandedFiles(prev => ({
      ...prev,
      [filename]: !prev[filename]
    }));
  };

  const loadDemoFiles = async () => {
    const demoFiles = createDemoFiles();
    await processFiles(demoFiles);
    setShowDemoModal(false);
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <h1 className="title">
          <span className="emoji">🎨</span>
          Creative Validator
        </h1>
        <p className="subtitle">
          AI-powered multi-platform validation
        </p>
      </div>

      {/* Upload Section - TOP OF PAGE */}
      <div className="upload-hero">
        <label className="file-upload-hero-label">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            accept=".zip,.html,.jpg,.jpeg,.png,.gif,.mp4,.mov,.pdf"
            style={{ display: 'none' }}
          />
          <div className="file-upload-hero-box">
            <div className="upload-hero-icon">📤</div>
            <h2 className="upload-hero-title">Drop files here or click to upload</h2>
            <p className="upload-hero-subtitle">
              AI will auto-detect platforms and validate instantly
            </p>
            <div className="upload-hero-formats">
              Supports: HTML5, Images, Videos, PDFs
            </div>
          </div>
        </label>

        <button onClick={() => setShowDemoModal(true)} className="demo-btn">
          🎭 Try Demo Files
        </button>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="processing-section">
          <div className="processing-spinner"></div>
          <div className="processing-text">
            🧠 Analyzing files and detecting platforms...
          </div>
        </div>
      )}

      {/* Compact Results */}
      {validationResults.length > 0 && !isProcessing && (
        <div className="results-compact">
          <div className="results-header">
            <h2>Validation Results</h2>
            <div className="results-stats">
              {validationResults.length} file(s) analyzed
            </div>
          </div>

          {validationResults.map((result, index) => (
            <div key={index} className="result-card-compact">
              {/* Compact Header */}
              <div 
                className="result-compact-header"
                onClick={() => toggleFileExpand(result.filename)}
              >
                <div className="result-compact-info">
                  <div className="result-compact-filename">
                    {result.filename}
                  </div>
                  <div className="result-compact-meta">
                    {result.fileSize}
                    {result.dimensions && ` • ${result.dimensions}`}
                    {result.duration && ` • ${result.duration}`}
                  </div>
                </div>

                {result.readyFor.length > 0 ? (
                  <div className="result-compact-status ready">
                    <span className="status-icon">✓</span>
                    <span className="status-text">
                      Ready for: {result.readyFor.map(r => r.platform).join(', ')}
                    </span>
                  </div>
                ) : (
                  <div className="result-compact-status issues">
                    <span className="status-icon">⚠</span>
                    <span className="status-text">
                      Issues found • {result.issuesFor.length} platform(s)
                    </span>
                  </div>
                )}

                <button className="expand-toggle">
                  {expandedFiles[result.filename] ? '▲' : '▼'}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedFiles[result.filename] && (
                <div className="result-compact-expanded">
                  {/* Detection Info */}
                  <div className="expanded-section">
                    <h4 className="expanded-section-title">
                      🧠 AI Detection Results
                    </h4>
                    <div className="detection-badges">
                      {result.detections.slice(0, 5).map((det, i) => (
                        <div key={i} className="detection-badge">
                          <span className="badge-platform">{getPlatformName(det.platform)}</span>
                          <span className="badge-confidence">{Math.round(det.confidence * 100)}%</span>
                          <span className="badge-reason">{det.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ready Platforms */}
                  {result.readyFor.length > 0 && (
                    <div className="expanded-section">
                      <h4 className="expanded-section-title ready-title">
                        ✓ Ready to Deploy ({result.readyFor.length})
                      </h4>
                      <div className="ready-platforms">
                        {result.readyFor.map((platform, i) => (
                          <div key={i} className="platform-ready-card">
                            <div className="platform-ready-name">
                              {platform.platform}
                            </div>
                            {platform.issues.length > 0 && (
                              <div className="platform-ready-warnings">
                                {platform.issues.map((issue, j) => (
                                  <div key={j} className="warning-item">
                                    ⚠️ {issue.message}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Issues Platforms */}
                  {result.issuesFor.length > 0 && (
                    <div className="expanded-section">
                      <h4 className="expanded-section-title issues-title">
                        ⚠ Needs Fixes ({result.issuesFor.length})
                      </h4>
                      <div className="issues-platforms">
                        {result.issuesFor.map((platform, i) => (
                          <div key={i} className="platform-issues-card">
                            <div className="platform-issues-name">
                              {platform.platform}
                            </div>
                            <div className="platform-issues-list">
                              {platform.issues
                                .filter(issue => issue.severity === 'error')
                                .map((issue, j) => (
                                  <div key={j} className="issue-item error">
                                    <div className="issue-message">❌ {issue.message}</div>
                                    {issue.fix && (
                                      <div className="issue-fix">💡 {issue.fix}</div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🎭 Demo Creative Files</h2>
            <p className="modal-subtitle">
              Try these pre-made files to see how the validator works
            </p>
            
            <div className="demo-files-list">
              <div className="demo-file-item">
                <span className="demo-file-icon">📱</span>
                <div className="demo-file-info">
                  <div className="demo-file-name">tiktok-vertical.mp4</div>
                  <div className="demo-file-specs">1080x1920, 15s • Vertical video</div>
                </div>
              </div>
              
              <div className="demo-file-item">
                <span className="demo-file-icon">🖼️</span>
                <div className="demo-file-info">
                  <div className="demo-file-name">banner-300x250.jpg</div>
                  <div className="demo-file-specs">300x250 • IAB Standard</div>
                </div>
              </div>
              
              <div className="demo-file-item">
                <span className="demo-file-icon">📺</span>
                <div className="demo-file-info">
                  <div className="demo-file-name">netflix-1080p.mp4</div>
                  <div className="demo-file-specs">1920x1080, 30s • Streaming</div>
                </div>
              </div>
              
              <div className="demo-file-item">
                <span className="demo-file-icon">💼</span>
                <div className="demo-file-info">
                  <div className="demo-file-name">linkedin-post.jpg</div>
                  <div className="demo-file-specs">1200x628 • Professional</div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={loadDemoFiles} className="modal-btn-primary">
                Load Demo Files
              </button>
              <button onClick={() => setShowDemoModal(false)} className="modal-btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
