import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CURRENT_BUILD_ID, listFiles, sha256, verifyArtworkCatalog, verifyBuild } from './build-files.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const targetDir = path.join(rootDir, 'builds', CURRENT_BUILD_ID);
const manifestPath = path.join(targetDir, 'BUILD.json');

const catalogUrl = pathToFileURL(path.join(targetDir, 'content', 'catalog.mjs')).href;
const catalog = await import(catalogUrl);
const primary = catalog.artworks[0];

const artworks = await verifyArtworkCatalog(targetDir, catalog.artworks);
const filePaths = (await listFiles(targetDir)).filter(file => file !== 'BUILD.json');
const files = [];
for (const rel of filePaths) {
  const buf = await readFile(path.join(targetDir, rel));
  files.push({
    path: rel,
    bytes: buf.length,
    sha256: sha256(buf),
  });
}

const buildManifest = {
  schemaVersion: 1,
  id: CURRENT_BUILD_ID,
  mode: 'full',
  seed: 'SEED-001',
  contractVersion: 'C1-ESM1',
  artworkId: primary.artworkId,
  assetVersion: primary.art.version,
  contentVersion: primary.contentVersion,
  artworks,
  files,
};

await writeFile(manifestPath, `${JSON.stringify(buildManifest, null, 2)}\n`, 'utf8');
const verified = await verifyBuild(targetDir, CURRENT_BUILD_ID, 'full');
console.log(`Updated and verified ${manifestPath}: id=${verified.id}, files=${verified.files.length}, contentVersion=${verified.contentVersion}`);
