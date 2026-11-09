'use strict';
// Tĩnh Tâm Launcher: Node.js standard library only. Bind loopback; never expose secrets.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const https = require('node:https');
const { spawn, execFile } = require('node:child_process');
const crypto = require('node:crypto');

const argAt = process.argv.indexOf('--game');
const gameRoot = argAt >= 0 && process.argv[argAt + 1] ? path.resolve(process.argv[argAt + 1]) : path.resolve(__dirname, '..', '..');
const portAt = process.argv.indexOf('--port');
const port = portAt >= 0 ? Number(process.argv[portAt+1]) : 3388;
if (!fs.existsSync(path.join(gameRoot, 'package.json'))) {
  console.error('Không thấy package.json trong thư mục game:', gameRoot); process.exit(2);
}
if (!Number.isInteger(port) || port < 1024 || port > 65535) { console.error('Cổng Launcher không hợp lệ'); process.exit(2); }
const localDataDir = process.platform === 'win32'
 ? path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'TinhTamLauncher')
 : path.join(os.homedir(), '.tinh-tam-launcher');
fs.mkdirSync(localDataDir, {recursive:true, mode:0o700});
const azurePath = path.join(localDataDir, 'azure.local.json');
const preferencesPath = path.join(localDataDir, 'launcher.preferences.json');
const accessToken = crypto.randomBytes(24).toString('hex');
let gameChild=null, vieneuChild=null;
let gameLogs=[], vieneuLogs=[];
let gameStartedAt=null, vieneuStartedAt=null;
let pendingAction = false;
let azureTestBusy = false;
const maxLogs=200;
const defaultVoice='vi-VN-HoaiMyNeural';
const allowedVoices=['vi-VN-HoaiMyNeural','vi-VN-NamMinhNeural'];
let lastTestTime=0;
function parseJsonFile(p, fallback) {try{return JSON.parse(fs.readFileSync(p,'utf8'));}catch{return fallback;}}
function atomicPrivateWrite(p,obj) {
 const name=p+'.tmp-'+process.pid;
 fs.writeFileSync(name,JSON.stringify(obj,null,2)+'\n',{encoding:'utf8',mode:0o600,flag:'wx'});
 fs.renameSync(name,p);
 if (process.platform !== 'win32') fs.chmodSync(p,0o600);
}
let azure=parseJsonFile(azurePath,{region:'southeastasia',key:''});
if (!/^[a-z0-9-]{2,30}$/.test(azure.region||'')) azure.region='southeastasia';
let prefs=parseJsonFile(preferencesPath,{vieneuDir:path.join(os.homedir(),'vieneu-official-api')});
function appendLog(arr,source,piece) {
 const lines=String(piece).split(/\r?\n/u);
 for (const line of lines) if (line.trim()) {
   // Avoid accidental credential output; redact known keys.
   let clean=line;
   if (azure.key) clean=clean.split(azure.key).join('[AZURE_KEY_REDACTED]');
   arr.push(`[${new Date().toLocaleTimeString('vi-VN')}] ${source}: ${clean.slice(0,700)}`);
 }
 if(arr.length>maxLogs)arr.splice(0,arr.length-maxLogs);
}
function childInfo(child){return !!(child && child.exitCode===null && !child.killed);}
function addStreams(child, name, arr, onClose){
 child.stdout?.on('data',d=>appendLog(arr,name,d));
 child.stderr?.on('data',d=>appendLog(arr,name,d));
 child.on('error',e=>appendLog(arr,name,e.message));
 child.on('exit',(code,signal)=>{appendLog(arr,name,`Đã dừng (code=${code}, signal=${signal})`);onClose();});
}
function spawnGame(){
 if(childInfo(gameChild)) return {ok:true,message:'Game đã chạy rồi.'};
 if(!fs.existsSync(path.join(gameRoot,'node_modules'))) return {ok:false,message:'Chưa có node_modules. Mở Terminal/PowerShell tại thư mục game và chạy npm install một lần.'};
 const env={...process.env};
 if(azure.key){
   env.AZURE_SPEECH_KEY=azure.key;
   env.AZURE_SPEECH_REGION=azure.region;
   env.SPEECH_KEY=azure.key;
   env.SPEECH_REGION=azure.region;
   env.AZURE_KEY=azure.key;
   env.AZURE_REGION=azure.region;
 }
 const win=process.platform==='win32';
 const cmd=win?'cmd.exe':'npm';
 const argv=win?['/d','/s','/c','npm run dev']:['run','dev'];
 try {
   gameChild=spawn(cmd,argv,{cwd:gameRoot,env,windowsHide:true,detached:!win,stdio:['ignore','pipe','pipe']});
   gameStartedAt=new Date().toISOString();
   appendLog(gameLogs,'LAUNCHER',`Đã gửi lệnh npm run dev (cwd=${gameRoot})`);
   const current=gameChild;
   addStreams(current,'GAME',gameLogs,()=>{if(gameChild===current){gameChild=null;gameStartedAt=null;}});
   return {ok:true,message:'Đã gửi lệnh khởi động game. Xem nhật ký để biết khi nào server sẵn sàng.'};
 }catch(err){return {ok:false,message:String(err.message||err)};}
}
function killTracked(child, label,arr){
 if(!childInfo(child)) return {ok:true,message:label+' chưa chạy từ Launcher.'};
 const pid=child.pid;
 try {
   if(process.platform==='win32') execFile('taskkill',['/PID',String(pid),'/T','/F'],{windowsHide:true},()=>{});
   else process.kill(-pid,'SIGTERM');
   appendLog(arr,'LAUNCHER',`Đã gửi yêu cầu dừng ${label} (PID ${pid})`);
   return {ok:true,message:'Đã gửi lệnh dừng '+label+'.'};
 }catch(err){return {ok:false,message:String(err.message||err)};}
}
function stopGame(){return killTracked(gameChild,'game',gameLogs)}
function stopVieNeu(){return killTracked(vieneuChild,'VieNeu',vieneuLogs)}
function startVieNeu(input){
 if(childInfo(vieneuChild))return {ok:true,message:'VieNeu đã chạy từ Launcher.'};
 const dir=path.resolve(input||prefs.vieneuDir);
 if(!fs.existsSync(dir))return {ok:false,message:'Không thấy thư mục VieNeu: '+dir};
 if(!fs.existsSync(path.join(dir,'pyproject.toml')) && !fs.existsSync(path.join(dir,'apps','openai_speech.py')))return {ok:false,message:'Đây không giống thư mục vieneu-official-api.'};
 try{
   prefs.vieneuDir=dir;atomicPrivateWrite(preferencesPath,prefs);
   const win=process.platform==='win32';
   const cmd=win?'cmd.exe':'uv';
   const argv=win?['/d','/s','/c','uv run python -m apps.openai_speech']:['run','python','-m','apps.openai_speech'];
   vieneuChild=spawn(cmd,argv,{cwd:dir,env:process.env,detached:!win,stdio:['ignore','pipe','pipe'],windowsHide:true});
   vieneuStartedAt=new Date().toISOString();
   const current=vieneuChild;
   addStreams(current,'VIENEU',vieneuLogs,()=>{if(vieneuChild===current){vieneuChild=null;vieneuStartedAt=null;}});
   return {ok:true,message:'Đã gửi lệnh khởi động VieNeu. Cần cài uv và môi trường VieNeu sẵn trên máy.'};
 }catch(err){return {ok:false,message:String(err.message||err)};}
}
async function probe(url,method='GET',body=null){
 const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),5000);
 try {return await fetch(url,{method,headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:ctrl.signal});}
 finally{clearTimeout(timer)}
}
function escapeXml(s){return s.replace(/[<>&"']/g,ch=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[ch]));}
async function azureTestDirect(voice){
 if(!azure.key) return {ok:false,error:'Chưa lưu Azure Speech API key.'};
 const region=azure.region;
 const selected=allowedVoices.includes(voice)?voice:defaultVoice;
 const ssml=`<speak version="1.0" xml:lang="vi-VN"><voice name="${selected}">${escapeXml('Nam mô A Di Đà Phật. Kính chúc quý Phật tử bình an.')}</voice></speak>`;
 const url=`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
 const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),25000);
 try{
  const res=await fetch(url,{method:'POST',headers:{'Ocp-Apim-Subscription-Key':azure.key,'X-Microsoft-OutputFormat':'audio-16khz-32kbitrate-mono-mp3','Content-Type':'application/ssml+xml','User-Agent':'TinhTamOnlineLauncher'},body:ssml,signal:ctrl.signal});
  if(!res.ok){let reason=await res.text();return {ok:false,error:`Azure HTTP ${res.status}: ${reason.slice(0,190)}`}}
  const arr=Buffer.from(await res.arrayBuffer());
  if(!arr.length||arr.length>3*1024*1024)return {ok:false,error:'Âm thanh trống hoặc quá lớn.'};
  return {ok:true,voice:selected,mimeType:'audio/mpeg',audioBase64:arr.toString('base64')};
 }catch(err){return {ok:false,error:'Không thể gọi Azure: '+(err.name==='AbortError'?'quá thời gian':String(err.message||err))}}
 finally{clearTimeout(timer)}
}
async function azureTestInGame(voice){
 try {
  const res=await probe('http://127.0.0.1:3000/api/tts/test','POST',{
   provider:'azure',voiceId:allowedVoices.includes(voice)?voice:defaultVoice,speed:0.96,
   text:'Nam mô A Di Đà Phật. Xin chúc quý Phật tử thân tâm an lạc.'
  });
  const data=await res.json();
  if(!res.ok || !data.ok || !data.audioBase64)return {ok:false,error:data.error||'Backend game không hỗ trợ Azure hoặc thiếu cấu hình.'};
  return {ok:true,voice:voice,mimeType:data.mimeType||'audio/mpeg',audioBase64:data.audioBase64};
 }catch(err){return {ok:false,error:'Game chưa chạy ở cổng 3000 hoặc API TTS chưa hoạt động: '+String(err.message||err)}}
}
function json(res,status,obj){const body=JSON.stringify(obj);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Content-Length':Buffer.byteLength(body),'X-Content-Type-Options':'nosniff'});res.end(body)}
function readBody(req,max=8192){return new Promise((resolve,reject)=>{let size=0,data='';req.on('data',chunk=>{size+=chunk.length;if(size>max){reject(new Error('Dữ liệu gửi quá lớn.'));req.destroy();return;}data+=chunk;});req.on('end',()=>{try{resolve(JSON.parse(data||'{}'));}catch{reject(new Error('JSON không hợp lệ'));}});req.on('error',reject);});}
const html=fs.readFileSync(path.join(__dirname,'interface.html'),'utf8').replace('LAUNCHER_TOKEN_PLACEHOLDER',accessToken);
const server=http.createServer(async(req,res)=>{
 const hostname=(req.headers.host||'').split(':')[0].toLowerCase();
 if(!['localhost','127.0.0.1','[::1]'].includes(hostname)){json(res,403,{ok:false,error:'Chỉ truy cập localhost.'});return;}
 const route=(req.url||'').split('?')[0];
 if(req.method==='GET' && route==='/'){
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src 'self' data:; object-src 'none'; frame-ancestors 'none'",'X-Frame-Options':'DENY','X-Content-Type-Options':'nosniff'});res.end(html);return;
 }
 if(req.method==='GET' && route==='/api/state'){
  json(res,200,{ok:true,game:{running:childInfo(gameChild),pid:gameChild?.pid||null,startedAt:gameStartedAt,logs:gameLogs.slice(-95)},vieneu:{running:childInfo(vieneuChild),pid:vieneuChild?.pid||null,dir:prefs.vieneuDir,logs:vieneuLogs.slice(-40)},azure:{configured:!!azure.key,region:azure.region,regionHint:'Nhập KEY 1/KEY 2 từ tài nguyên Speech của Azure; không lưu trong GitHub.'},platform:process.platform,gameRoot});return;
 }
 if(req.method!=='POST'||!route.startsWith('/api/')){json(res,404,{ok:false,error:'Không tìm thấy'});return;}
 const origin=req.headers.origin;
 if((origin&&origin!==`http://127.0.0.1:${port}`&&origin!==`http://localhost:${port}`)||req.headers['x-launcher-token']!==accessToken){json(res,403,{ok:false,error:'Không đủ quyền thao tác trên Launcher.'});return;}
 let body={};try{body=await readBody(req);}catch(err){json(res,400,{ok:false,error:String(err.message)});return;}
 try{
  if(route==='/api/game/start')return json(res,200,spawnGame());
  if(route==='/api/game/stop')return json(res,200,stopGame());
  if(route==='/api/game/restart'){const result=stopGame(); if(!result.ok)return json(res,400,result); setTimeout(spawnGame,1400);return json(res,200,{ok:true,message:'Đã gửi lệnh dừng; game sẽ tự khởi động lại.'});}
  if(route==='/api/vieneu/start')return json(res,200,startVieNeu(body.dir));
  if(route==='/api/vieneu/stop')return json(res,200,stopVieNeu());
  if(route==='/api/azure/save'){
    if(typeof body.region!=='string'|| !/^[a-z0-9-]{2,30}$/.test(body.region))return json(res,400,{ok:false,error:'Region không hợp lệ.'});
    if(body.key!==undefined && (typeof body.key!=='string'||body.key.length>350))return json(res,400,{ok:false,error:'API key không hợp lệ.'});
    const nextKey=body.key?.trim()||azure.key;
    if(!nextKey)return json(res,400,{ok:false,error:'Bạn cần nhập API key lần đầu.'});
    azure={key:nextKey,region:body.region};
    atomicPrivateWrite(azurePath,azure);
    return json(res,200,{ok:true,message:'Đã lưu thông tin Azure trên máy này, nằm ngoài thư mục GitHub. Nếu game đang chạy, hãy khởi động lại game để nhận khóa mới.'});
  }
  if(route==='/api/azure/test'||route==='/api/azure/test-game'){
    if(azureTestBusy || Date.now()-lastTestTime<2500)return json(res,429,{ok:false,error:'Đang kiểm tra hoặc thao tác quá nhanh.'});
    lastTestTime=Date.now();azureTestBusy=true;
    try{return json(res,200,route==='/api/azure/test'?await azureTestDirect(body.voice):await azureTestInGame(body.voice));}
    finally{azureTestBusy=false;}
  }
  return json(res,404,{ok:false,error:'Không có thao tác này.'});
 }catch(err){return json(res,500,{ok:false,error:String(err.message||err)});}
});
server.on('error',err=>{console.error('Launcher không mở được cổng',port,err.message);process.exit(1)});
server.listen(port,'127.0.0.1',()=>{
 const url=`http://127.0.0.1:${port}`;
 console.log('TĨNH TÂM LAUNCHER ĐÃ MỞ:',url);
 console.log('Game:',gameRoot);
 console.log('Azure key được lưu riêng tại:',localDataDir);
 if(!process.argv.includes('--no-open')){
  if(process.platform==='darwin')spawn('open',[url],{stdio:'ignore',detached:true}).unref();
  else if(process.platform==='win32')spawn('cmd.exe',['/c','start','',url],{stdio:'ignore',detached:true,windowsHide:true}).unref();
 }
});
function shutdown(){stopGame();stopVieNeu();server.close();setTimeout(()=>process.exit(0),600).unref()}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
