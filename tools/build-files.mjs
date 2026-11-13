import {createHash} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';

export const PREVIEW_ID = 'B-PREVIEW-002';
export const CURRENT_BUILD_ID = 'B-TRIO-007-UX01';
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export async function listFiles(folder,relative = '') {
  const files = [];
  const entries = await readdir(path.join(folder,relative),{withFileTypes:true});
  for (const entry of entries) {
    const item = path.posix.join(relative,entry.name);
    if (entry.isSymbolicLink()) throw new Error('构建目录含符号链接：' + item);
    if (entry.isDirectory()) files.push(...await listFiles(folder,item));
    else if (entry.isFile()) files.push(item);
    else throw new Error('构建目录含特殊文件：' + item);
  }
  return files.sort();
}

export async function verifyBuild(folder,expectedId,expectedMode) {
  const manifest = JSON.parse(await readFile(path.join(folder,'BUILD.json'),'utf8'));
  if (manifest.id !== expectedId || manifest.mode !== expectedMode ||
      manifest.schemaVersion !== 1 || !Array.isArray(manifest.files))
    throw new Error('BUILD.json 的编号、模式或格式与预期不符。');
  const hashes = new Map(manifest.files.map(item => [item.path,item.sha256]));
  if (hashes.size !== manifest.files.length) throw new Error('BUILD.json 内有重复条目。');
  const files = (await listFiles(folder)).filter(file => file !== 'BUILD.json');
  for (const file of files) {
    if (!hashes.has(file)) throw new Error('构建中有未登记文件：' + file);
    if (sha256(await readFile(path.join(folder,file))) !== hashes.get(file))
      throw new Error('构建文件校验失败：' + file);
    hashes.delete(file);
  }
  if (hashes.size) throw new Error('构建文件缺失：' + [...hashes.keys()].join('、'));
  if (!files.includes('index.html')) throw new Error('构建缺少首页 index.html。');
  return manifest;
}

export async function verifyArtworkCatalog(folder,artworks) {
  if (!Array.isArray(artworks) || artworks.length === 0) throw new Error('画作目录为空。');
  const ids = new Set();
  const entries = [];
  for (const work of artworks) {
    if (!work.artworkId || ids.has(work.artworkId)) throw new Error('画作 ID 缺失或重复。');
    ids.add(work.artworkId);
    const files = new Set(work.assetLedger.map(asset => asset.file));
    const references = [work.overviewSrc,work.art.line,...work.art.plates,...work.art.paint.flat(),
      ...work.preparation.map(item => item.imageSrc)];
    for (const file of references) {
      if (!files.has(file)) throw new Error(work.artworkId+' 引用了未登记素材：'+file);
    }
    for (const file of files) {
      if (typeof file !== 'string' || !file.startsWith('/assets/') ||
          file.split('/').some(part => ['.','..'].includes(part)) || file.includes('\\'))
        throw new Error(work.artworkId+' 素材路径无效：'+file);
      await readFile(path.join(folder,file.slice(1)));
    }
    entries.push({artworkId:work.artworkId,contentVersion:work.contentVersion,
      assetVersion:work.art.version,files:[...files]});
  }
  return entries;
}
