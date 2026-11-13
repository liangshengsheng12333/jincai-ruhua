import http from 'node:http';
import {spawn} from 'node:child_process';
import {readFile,stat,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const project=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const args=process.argv.slice(2),value=(k,d)=>{const i=args.indexOf(k);return i<0?d:args[i+1];};
const root=path.resolve(project,value('--root','.'));
if(root!==project && !root.startsWith(project+path.sep))throw new Error('root must be inside project');
const port=Number(value('--port','4173')),host=value('--host','127.0.0.1');
if(!Number.isInteger(port)||port<0||port>65535)throw new Error('invalid port');
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let target=path.resolve(root,'.'+rel);
    if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    if((await stat(target)).isDirectory())target=path.join(target,'index.html');
    const actual=await realpath(target),actualRoot=await realpath(root);
    if(actual!==actualRoot&&!actual.startsWith(actualRoot+path.sep)){res.writeHead(403);res.end();return;}
    const body=await readFile(actual);res.writeHead(200,{'Content-Type':mime[path.extname(actual)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:body);
  }catch(error){res.writeHead(error instanceof URIError?400:404);res.end('Not available');}
});
server.on('error',error => {
  const message = error.code === 'EADDRINUSE'
    ? `端口 ${port} 已被占用。关闭之前启动的服务，或用 node tools/start.mjs --port ${port === 65535 ? 4173 : port + 1} 换一个端口。`
    : '本机服务未启动：' + (error.code || error.message);
  console.error(message);
  process.exitCode = 1;
});
server.listen(port,host,() => {
  const url = `http://${host}:${server.address().port}`;
  console.log(`READY ${url} ROOT ${root}\n请在浏览器打开 ${url}/ ，保持本窗口开启。按 Ctrl+C 可停止服务。`);
  if (args.includes('--open') && host === '127.0.0.1') {
    const [program,...launchArgs] = process.platform === 'darwin' ? ['open',url] :
      process.platform === 'win32' ? ['rundll32.exe','url.dll,FileProtocolHandler',url] : ['xdg-open',url];
    const browser = spawn(program,launchArgs,{stdio:'ignore',detached:true});
    browser.on('error',() => console.error('请手动打开 ' + url));
    browser.unref();
  }
});
