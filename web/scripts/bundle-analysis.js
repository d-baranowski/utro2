#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const THRESHOLDS = {
  totalSize: 1024 * 1024 * 2, // 2MB total
  mainBundle: 1024 * 200, // 200KB for main bundle
  chunkSize: 1024 * 250, // 250KB per chunk
  increaseWarning: 0.1, // 10% increase warning
  increaseCritical: 0.25, // 25% increase critical
};

const BASELINE_FILE = '.bundle-baseline.json';

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  const files = {};

  function walkDir(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && /\.(js|css)$/.test(entry.name)) {
        const stats = fs.statSync(fullPath);
        const relativePath = path.relative(dirPath, fullPath);
        files[relativePath] = stats.size;
        totalSize += stats.size;
      }
    }
  }

  walkDir(dirPath);
  return { totalSize, files };
}

function analyzeBundleSize() {
  console.log('🔍 Analyzing bundle size...\n');

  const buildDir = path.join(process.cwd(), '.next');

  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run "pnpm build" first.');
    process.exit(1);
  }

  // Get current bundle sizes
  const staticDir = path.join(buildDir, 'static');
  const { totalSize, files } = getDirectorySize(staticDir);

  // Load baseline if exists
  let baseline = null;
  if (fs.existsSync(BASELINE_FILE)) {
    baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  }

  // Analyze results
  const results = {
    timestamp: new Date().toISOString(),
    totalSize,
    files,
    chunks: {},
  };

  // Group files by type
  for (const [filePath, size] of Object.entries(files)) {
    if (filePath.includes('chunks/pages/')) {
      results.chunks.pages = (results.chunks.pages || 0) + size;
    } else if (filePath.includes('chunks/') && filePath.endsWith('.js')) {
      const chunkName = path.basename(filePath);
      if (chunkName.startsWith('main')) {
        results.chunks.main = size;
      } else if (chunkName.startsWith('framework')) {
        results.chunks.framework = size;
      } else if (chunkName.startsWith('webpack')) {
        results.chunks.webpack = size;
      }
    }
  }

  // Print current stats
  console.log('📊 Current Bundle Analysis:');
  console.log('─'.repeat(50));
  console.log(`Total Size: ${formatBytes(totalSize)}`);
  console.log(`Main Bundle: ${formatBytes(results.chunks.main || 0)}`);
  console.log(`Framework: ${formatBytes(results.chunks.framework || 0)}`);
  console.log(`Pages: ${formatBytes(results.chunks.pages || 0)}`);
  console.log(`Webpack Runtime: ${formatBytes(results.chunks.webpack || 0)}`);
  console.log('─'.repeat(50));

  // Check thresholds
  let hasErrors = false;
  let hasWarnings = false;

  if (totalSize > THRESHOLDS.totalSize) {
    console.error(
      `❌ Total size (${formatBytes(totalSize)}) exceeds limit (${formatBytes(THRESHOLDS.totalSize)})`
    );
    hasErrors = true;
  }

  if (results.chunks.main > THRESHOLDS.mainBundle) {
    console.error(
      `❌ Main bundle (${formatBytes(results.chunks.main)}) exceeds limit (${formatBytes(THRESHOLDS.mainBundle)})`
    );
    hasErrors = true;
  }

  // Compare with baseline
  if (baseline) {
    console.log('\n📈 Comparison with baseline:');
    console.log('─'.repeat(50));

    const sizeDiff = totalSize - baseline.totalSize;
    const percentChange = (sizeDiff / baseline.totalSize) * 100;

    console.log(`Previous: ${formatBytes(baseline.totalSize)}`);
    console.log(`Current:  ${formatBytes(totalSize)}`);
    console.log(
      `Change:   ${sizeDiff > 0 ? '+' : ''}${formatBytes(sizeDiff)} (${percentChange.toFixed(2)}%)`
    );

    if (percentChange > THRESHOLDS.increaseCritical * 100) {
      console.error(`\n❌ Critical: Bundle size increased by ${percentChange.toFixed(2)}%`);
      hasErrors = true;
    } else if (percentChange > THRESHOLDS.increaseWarning * 100) {
      console.warn(`\n⚠️  Warning: Bundle size increased by ${percentChange.toFixed(2)}%`);
      hasWarnings = true;
    } else if (percentChange < 0) {
      console.log(`\n✅ Great! Bundle size decreased by ${Math.abs(percentChange).toFixed(2)}%`);
    }

    // Show largest file changes
    console.log('\n📁 Significant file changes:');
    const fileChanges = [];

    for (const [file, size] of Object.entries(files)) {
      const oldSize = baseline.files[file] || 0;
      const diff = size - oldSize;

      if (Math.abs(diff) > 1024) {
        // Only show changes > 1KB
        fileChanges.push({ file, oldSize, size, diff });
      }
    }

    fileChanges
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .slice(0, 5)
      .forEach(({ file, oldSize, size, diff }) => {
        const symbol = diff > 0 ? '📈' : '📉';
        console.log(
          `  ${symbol} ${file}: ${formatBytes(oldSize)} → ${formatBytes(size)} (${diff > 0 ? '+' : ''}${formatBytes(diff)})`
        );
      });
  }

  // Save current as baseline if requested
  if (process.argv.includes('--save-baseline')) {
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(results, null, 2));
    console.log('\n✅ Baseline saved for future comparisons');
  }

  // Generate detailed report if requested
  if (process.argv.includes('--detailed')) {
    const reportPath = 'bundle-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Detailed report saved to ${reportPath}`);
  }

  // Exit with appropriate code
  if (hasErrors) {
    console.log('\n❌ Bundle analysis failed - size limits exceeded');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  Bundle analysis completed with warnings');
    process.exit(0);
  } else {
    console.log('\n✅ Bundle analysis passed');
    process.exit(0);
  }
}

// Run analysis
analyzeBundleSize();
