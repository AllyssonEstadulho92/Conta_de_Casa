'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

const pkg = JSON.parse(read('package.json'));
const manifest = JSON.parse(read('release-manifest.json'));
const swSource = read('sw.js');
const prepareSource = read('scripts/prepare-pages.cjs');

assert.equal(pkg.version, '0.76.0', 'stable application version must be 0.76.0');
assert.equal(manifest.schemaVersion, 1);
assert.equal(manifest.channel, 'stable');
assert.equal(manifest.latestVersion, 'v76');
assert.equal(manifest.releases[0]?.version, 'v76');
assert.ok(manifest.releases[0]?.items?.length >= 10, 'v76 release notes must describe the release');
assert.match(prepareSource, /const BUILD = 'v76'/);
assert.match(swSource, /conta-de-casa-public-v76-release1/);
assert.doesNotMatch(pkg.version, /dev|alpha|beta|rc/i, 'stable package version must not carry a prerelease tag');

function meta(html, name) {
  return new RegExp(`<meta name="${name}" content="([^"]+)"`).exec(html)?.[1] || '';
}

function localAssetRefs(html) {
  const refs = new Set();
  const regex = /(?:src|href)="(\.\/[^"#]+)"/g;
  for (const match of html.matchAll(regex)) {
    const clean = match[1].split('?')[0];
    if (clean && clean !== './') refs.add(clean.slice(2));
  }
  return [...refs];
}

try {
  execFileSync(process.execPath, ['scripts/prepare-pages.cjs'], {
    cwd: ROOT,
    env: { ...process.env },
    stdio: 'pipe'
  });

  const index = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const distManifest = JSON.parse(fs.readFileSync(path.join(DIST, 'release-manifest.json'), 'utf8'));
  const distSw = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8');

  assert.equal(meta(index, 'app-version'), '0.76.0');
  assert.equal(meta(index, 'app-build'), 'v76');
  assert.match(meta(index, 'app-build-id'), /^(?:[0-9a-f]{7}|local)$/);
  assert.ok(!Number.isNaN(Date.parse(meta(index, 'app-build-date'))), 'build date must be valid ISO');
  assert.equal(distManifest.latestVersion, 'v76');
  assert.equal(distManifest.releases[0]?.version, 'v76');
  assert.match(distSw, /conta-de-casa-public-v76-release1/);
  assert.doesNotMatch(index, /0\.76\.0-dev|\?v=53/);
  assert.ok(index.includes('id="appBuildVersion">0.76.0 · v76</strong>'));

  for (const asset of localAssetRefs(index)) {
    assert.ok(fs.existsSync(path.join(DIST, asset)), `dist is missing referenced local asset: ${asset}`);
  }

  const publicAssetsBlock = /const PUBLIC_ASSETS = \[([\s\S]*?)\n\];/.exec(distSw)?.[1] || '';
  const assetRegex = /'\.\/(.*?)'/g;
  for (const match of publicAssetsBlock.matchAll(assetRegex)) {
    const relative = match[1];
    if (!relative) continue;
    assert.ok(fs.existsSync(path.join(DIST, relative)), `Service Worker references missing dist asset: ${relative}`);
  }

  for (const forbidden of ['README.md','SECURITY.md','PRIVACY.md','SPEC.md','CHANGELOG.md','tests','scripts','.github']) {
    assert.ok(!fs.existsSync(path.join(DIST, forbidden)), `forbidden development asset in dist: ${forbidden}`);
  }

  console.log('Release readiness: version, manifest, bundle references, PWA cache and public allowlist are coherent.');
} finally {
  fs.rmSync(DIST, { recursive: true, force: true });
}
