import {lstat,readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {CURRENT_BUILD_ID,verifyBuild} from './build-files.mjs';

const project = fileURLToPath(new URL('../',import.meta.url));
const args = process.argv.slice(2);

async function start() {
  if (Number(process.versions.node.split('.')[0]) < 20)
    throw new Error('请先准备 Node.js 20 或更高版本。');
  const id = args.includes('--build') ? args[args.indexOf('--build')+1] : CURRENT_BUILD_ID;
  if (typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(id))
    throw new Error('构建编号无效。');
  const relative = path.join('builds',id);
  const folder = path.join(project,relative);
  try {
    const entry = await lstat(folder);
    if (!entry.isDirectory()) throw new Error('预览构建路径不是目录。');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    throw new Error('缺少 '+id+' 静态包。请完整解压交付包后重试。');
  }
  const manifest = JSON.parse(await readFile(path.join(folder,'BUILD.json'),'utf8'));
  if (!['full','b-preview'].includes(manifest.mode)) throw new Error('构建模式无效。');
  const build = await verifyBuild(folder,id,manifest.mode);
  console.log(`已校验 ${build.id}，${build.files.length} 个文件；${build.artworks?.length ?? 1} 幅画稿。`);
  if (args.includes('--verify-only')) return;
  const port = args.includes('--port') ? args[args.indexOf('--port')+1] : '4173';
  if (!port || !/^\d+$/.test(port) || Number(port) > 65535) throw new Error('端口须为 0 至 65535 的整数。');
  const childArgs = ['tools/serve.mjs','--root',relative,'--port',port];
  if (args.includes('--open')) childArgs.push('--open');
  const child = spawn(process.execPath,childArgs,{cwd:project,stdio:'inherit',windowsHide:true});
  child.on('error',error => {console.error(error.message);process.exitCode=1;});
  child.on('exit',(code,signal) => {process.exitCode = signal === 'SIGINT' ? 0 : code ?? 1;});
  process.once('SIGINT',() => child.kill('SIGINT'));
  process.once('SIGTERM',() => child.kill('SIGTERM'));
}

start().catch(error => {
  console.error('工作台未启动：' + error.message + '\n请重新解压完整交付包，重试后仍有问题请保留本提示。');
  process.exitCode = 1;
});
