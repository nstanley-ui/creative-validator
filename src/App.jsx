import React, { useState } from 'react';
import { PLATFORMS, AD_TYPES, getPlatformsByAdType } from './platformSpecs';
import { validateCreative, groupBySeverity, SEVERITY } from './validator';
import './App.css';

function App() {
  const [selectedAdTypes, setSelectedAdTypes] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [files, setFiles] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    errors: true,
    warnings: false,
    success: false
  });
  const [expandedPlatforms, setExpandedPlatforms] = useState({});

  // Get platforms filtered by selected ad types
  const availablePlatforms = selectedAdTypes.length > 0
    ? Object.entries(PLATFORMS)
        .filter(([_, platform]) => 
          platform.adTypes.some(type => selectedAdTypes.includes(type))
        )
        .map(([id, platform]) => ({ id, ...platform }))
    : Object.entries(PLATFORMS).map(([id, platform]) => ({ id, ...platform }));

  const handleAdTypeToggle = (adType) => {
    setSelectedAdTypes(prev => 
      prev.includes(adType)
        ? prev.filter(t => t !== adType)
        : [...prev, adType]
    );
    // Reset platform selection when ad types change
    setSelectedPlatforms([]);
  };

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  const handleValidate = async () => {
    if (files.length === 0 || selectedPlatforms.length === 0) {
      alert('Please select files and at least one platform');
      return;
    }

    setIsValidating(true);
    setValidationResults([]);

    const results = [];
    for (const file of files) {
      const result = await validateCreative(file, selectedPlatforms);
      results.push(result);
    }

    setValidationResults(results);
    setIsValidating(false);
    
    // Expand errors by default
    setExpandedSections({ errors: true, warnings: false, success: false });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const togglePlatform = (fileIndex, platformId) => {
    const key = `${fileIndex}-${platformId}`;
    setExpandedPlatforms(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAllAdTypes = () => {
    setSelectedAdTypes(Object.values(AD_TYPES));
  };

  const clearAdTypes = () => {
    setSelectedAdTypes([]);
    setSelectedPlatforms([]);
  };

  const selectAllPlatforms = () => {
    setSelectedPlatforms(availablePlatforms.map(p => p.id));
  };

  const clearPlatforms = () => {
    setSelectedPlatforms([]);
  };

  // Group all results by severity
  const allGrouped = {
    errors: [],
    warnings: [],
    success: []
  };

  validationResults.forEach((result, fileIndex) => {
    const grouped = groupBySeverity(result);
    
    grouped.errors.forEach(platform => {
      allGrouped.errors.push({ ...platform, fileIndex, filename: result.filename });
    });
    grouped.warnings.forEach(platform => {
      allGrouped.warnings.push({ ...platform, fileIndex, filename: result.filename });
    });
    grouped.success.forEach(platform => {
      allGrouped.success.push({ ...platform, fileIndex, filename: result.filename });
    });
  });

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <h1 className="title">
          <span className="emoji">🎨</span>
          Creative Validator
        </h1>
        <p className="subtitle">
          Multi-platform ad creative validation
        </p>
      </div>

      {/* Ad Type Selection */}
      <div className="selection-section">
        <div className="section-header">
          <h2>1. Select Ad Type(s)</h2>
          <div className="quick-actions">
            <button onClick={selectAllAdTypes} className="quick-btn">Select All</button>
            <button onClick={clearAdTypes} className="quick-btn">Clear</button>
          </div>
        </div>
        <div className="checkbox-grid">
          {Object.values(AD_TYPES).map(adType => (
            <label key={adType} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedAdTypes.includes(adType)}
                onChange={() => handleAdTypeToggle(adType)}
              />
              <span>{adType}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Platform Selection */}
      <div className="selection-section">
        <div className="section-header">
          <h2>2. Select Platform(s)</h2>
          <div className="quick-actions">
            <button onClick={selectAllPlatforms} className="quick-btn" disabled={availablePlatforms.length === 0}>
              Select All {availablePlatforms.length > 0 && `(${availablePlatforms.length})`}
            </button>
            <button onClick={clearPlatforms} className="quick-btn">Clear</button>
          </div>
        </div>
        {selectedAdTypes.length === 0 && (
          <p className="helper-text">💡 Select ad type(s) above to filter platforms</p>
        )}
        <div className="checkbox-grid">
          {availablePlatforms.map(platform => (
            <label key={platform.id} className="checkbox-item platform-item">
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(platform.id)}
                onChange={() => handlePlatformToggle(platform.id)}
              />
              <div>
                <span className="platform-name">{platform.name}</span>
                <span className="platform-desc">{platform.description}</span>
              </div>
            </label>
          ))}
        </div>
        {availablePlatforms.length === 0 && selectedAdTypes.length > 0 && (
          <p className="no-platforms">No platforms support the selected ad types</p>
        )}
      </div>

      {/* File Upload */}
      <div className="upload-section">
        <h2>3. Upload Creative(s)</h2>
        <label className="file-upload-label">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".zip,.html,.jpg,.jpeg,.png,.gif,.mp4,.mov,.pdf"
            style={{ display: 'none' }}
          />
          <div className="file-upload-box">
            <span className="upload-icon">📁</span>
            <span className="upload-text">
              {files.length === 0
                ? 'Click to select files or drag and drop'
                : `${files.length} file(s) selected`}
            </span>
            {files.length > 0 && (
              <div className="file-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    {file.name} ({(file.size / 1024).toFixed(0)}KB)
                  </div>
                ))}
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Validate Button */}
      <div className="action-section">
        <button
          className="validate-button"
          onClick={handleValidate}
          disabled={files.length === 0 || selectedPlatforms.length === 0 || isValidating}
        >
          {isValidating ? 'Validating...' : `Validate ${files.length} Creative(s) Against ${selectedPlatforms.length} Platform(s)`}
        </button>
      </div>

      {/* Results */}
      {validationResults.length > 0 && (
        <div className="results-section">
          <h2 className="results-title">Validation Results</h2>

          {/* ERRORS Section (Red) */}
          {allGrouped.errors.length > 0 && (
            <div className="severity-section error-section">
              <div
                className="severity-header"
                onClick={() => toggleSection('errors')}
              >
                <span className="severity-icon">❌</span>
                <span className="severity-title">Major Problems</span>
                <span className="severity-count">{allGrouped.errors.length}</span>
                <span className="expand-icon">{expandedSections.errors ? '▼' : '▶'}</span>
              </div>
              {expandedSections.errors && (
                <div className="severity-content">
                  {allGrouped.errors.map((platform, idx) => {
                    const key = `${platform.fileIndex}-${platform.platformId}`;
                    const isExpanded = expandedPlatforms[key];
                    const errorIssues = platform.issues.filter(i => i.severity === SEVERITY.ERROR);

                    return (
                      <div key={idx} className="result-item">
                        <div
                          className="result-header"
                          onClick={() => togglePlatform(platform.fileIndex, platform.platformId)}
                        >
                          <div>
                            <span className="file-name">{platform.filename}</span>
                            <span className="platform-badge error-badge">{platform.platformName}</span>
                          </div>
                          <span className="issue-count">{errorIssues.length} issue(s)</span>
                          <span className="expand-icon-small">{isExpanded ? '▼' : '▶'}</span>
                        </div>
                        {isExpanded && (
                          <div className="issues-list">
                            {errorIssues.map((issue, issueIdx) => (
                              <div key={issueIdx} className="issue-item error-issue">
                                <div className="issue-message">{issue.message}</div>
                                {issue.fix && <div className="issue-fix">💡 {issue.fix}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* WARNINGS Section (Yellow) */}
          {allGrouped.warnings.length > 0 && (
            <div className="severity-section warning-section">
              <div
                className="severity-header"
                onClick={() => toggleSection('warnings')}
              >
                <span className="severity-icon">⚠️</span>
                <span className="severity-title">Minor Adjustments</span>
                <span className="severity-count">{allGrouped.warnings.length}</span>
                <span className="expand-icon">{expandedSections.warnings ? '▼' : '▶'}</span>
              </div>
              {expandedSections.warnings && (
                <div className="severity-content">
                  {allGrouped.warnings.map((platform, idx) => {
                    const key = `${platform.fileIndex}-${platform.platformId}`;
                    const isExpanded = expandedPlatforms[key];
                    const warningIssues = platform.issues.filter(i => i.severity === SEVERITY.WARNING);

                    return (
                      <div key={idx} className="result-item">
                        <div
                          className="result-header"
                          onClick={() => togglePlatform(platform.fileIndex, platform.platformId)}
                        >
                          <div>
                            <span className="file-name">{platform.filename}</span>
                            <span className="platform-badge warning-badge">{platform.platformName}</span>
                          </div>
                          <span className="issue-count">{warningIssues.length} issue(s)</span>
                          <span className="expand-icon-small">{isExpanded ? '▼' : '▶'}</span>
                        </div>
                        {isExpanded && (
                          <div className="issues-list">
                            {warningIssues.map((issue, issueIdx) => (
                              <div key={issueIdx} className="issue-item warning-issue">
                                <div className="issue-message">{issue.message}</div>
                                {issue.fix && <div className="issue-fix">💡 {issue.fix}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SUCCESS Section (Green) */}
          {allGrouped.success.length > 0 && (
            <div className="severity-section success-section">
              <div
                className="severity-header"
                onClick={() => toggleSection('success')}
              >
                <span className="severity-icon">✅</span>
                <span className="severity-title">Passed / OK</span>
                <span className="severity-count">{allGrouped.success.length}</span>
                <span className="expand-icon">{expandedSections.success ? '▼' : '▶'}</span>
              </div>
              {expandedSections.success && (
                <div className="severity-content">
                  {allGrouped.success.map((platform, idx) => (
                    <div key={idx} className="result-item success-item">
                      <span className="file-name">{platform.filename}</span>
                      <span className="platform-badge success-badge">{platform.platformName}</span>
                      <span className="success-message">All checks passed ✓</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
