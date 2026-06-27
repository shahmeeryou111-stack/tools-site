/* ToolHub — shared scripts. Each tool guards on element presence. */
(function(){
  const $ = (id)=>document.getElementById(id);
  const toast = (msg)=>{const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),1800);};
  // year
  const y=$('year'); if(y) y.textContent=new Date().getFullYear();
  // copy buttons
  document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>{
    const el=$(b.dataset.copy); if(!el) return;
    el.select?.(); navigator.clipboard.writeText(el.value||el.textContent||'').then(()=>toast('Copied!'));
  }));

  /* 1 Password */
  if($('pwGen')){
    const lenR=$('pwLen'), lenV=$('pwLenVal'), out=$('pwOutput'), bar=$('pwBar'), lab=$('pwLabel');
    const sets={up:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',low:'abcdefghijklmnopqrstuvwxyz',num:'0123456789',sym:'!@#$%^&*()-_=+[]{};:,.<>?'};
    const score=(p)=>{let s=0;if(p.length>=8)s++;if(p.length>=12)s++;if(p.length>=16)s++;if(/[A-Z]/.test(p))s++;if(/[a-z]/.test(p))s++;if(/\d/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;return Math.min(s,6);};
    const render=(p)=>{out.value=p;const s=score(p);const pct=(s/6)*100;bar.style.width=pct+'%';const c=s<=2?'#ef4444':s<=4?'#f59e0b':'#22c55e';bar.style.background=c;lab.textContent='Strength: '+(s<=2?'Weak':s<=4?'Medium':'Strong');};
    const gen=()=>{let pool='';if($('pwUp').checked)pool+=sets.up;if($('pwLow').checked)pool+=sets.low;if($('pwNum').checked)pool+=sets.num;if($('pwSym').checked)pool+=sets.sym;if(!pool){toast('Pick at least one character set');return;}const n=+lenR.value;const arr=new Uint32Array(n);crypto.getRandomValues(arr);let p='';for(let i=0;i<n;i++)p+=pool[arr[i]%pool.length];render(p);};
    lenR.addEventListener('input',()=>lenV.textContent=lenR.value);
    $('pwGen').addEventListener('click',gen);
    $('pwCheck').addEventListener('input',e=>render(e.target.value));
    gen();
  }

  /* 2 QR */
  if($('qrGen')){
    const upd=()=>{const t=encodeURIComponent($('qrInput').value||' ');const s=$('qrSize').value;const url=`https://api.qrserver.com/v1/create-qr-code/?size=${s}x${s}&data=${t}`;$('qrImg').src=url;$('qrDownload').href=url;};
    $('qrSize').addEventListener('input',()=>{$('qrSizeVal').textContent=$('qrSize').value;upd();});
    $('qrGen').addEventListener('click',upd); upd();
  }

  /* 3 Image */
  if($('imgFile')){
    const f=$('imgFile'),c=$('imgCanvas'),info=$('imgInfo'),dl=$('imgDownload'),q=$('imgQ'),qv=$('imgQVal'),fmt=$('imgFmt');
    let src=null;
    q.addEventListener('input',()=>{qv.textContent=q.value;if(src)process();});
    fmt.addEventListener('change',()=>{if(src)process();});
    f.addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>{const img=new Image();img.onload=()=>{src=img;info.textContent=`Original: ${(file.size/1024).toFixed(1)} KB • ${img.width}×${img.height}`;process();};img.src=ev.target.result;};r.readAsDataURL(file);});
    function process(){c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);c.toBlob(b=>{const url=URL.createObjectURL(b);dl.href=url;dl.download='compressed.'+(fmt.value.split('/')[1]);dl.classList.remove('disabled');info.textContent+=` • Compressed: ${(b.size/1024).toFixed(1)} KB`;},fmt.value,+q.value);}
  }

  /* 4 JSON */
  if($('jsonFormat')){
    const i=$('jsonIn'),o=$('jsonOut'),st=$('jsonStatus');
    const run=(min)=>{try{const v=JSON.parse(i.value);o.textContent=JSON.stringify(v,null,min?0:2);st.textContent='✓ Valid JSON';st.style.color='var(--good)';}catch(e){st.textContent='✗ '+e.message;st.style.color='var(--bad)';o.textContent='';}};
    $('jsonFormat').addEventListener('click',()=>run(false));
    $('jsonMin').addEventListener('click',()=>run(true));
    $('jsonClear').addEventListener('click',()=>{i.value='';o.textContent='';st.textContent='Ready';st.style.color='';});
  }

  /* 5 Color */
  if($('colorGen')){
    const hexToHsl=(h)=>{h=h.replace('#','');const r=parseInt(h.substr(0,2),16)/255,g=parseInt(h.substr(2,2),16)/255,b=parseInt(h.substr(4,2),16)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let H,S,L=(mx+mn)/2;if(mx===mn){H=S=0;}else{const d=mx-mn;S=L>.5?d/(2-mx-mn):d/(mx+mn);switch(mx){case r:H=(g-b)/d+(g<b?6:0);break;case g:H=(b-r)/d+2;break;case b:H=(r-g)/d+4;}H*=60;}return[H,S*100,L*100];};
    const hslToHex=(h,s,l)=>{s/=100;l/=100;const k=n=>(n+h/30)%12;const a=s*Math.min(l,1-l);const f=n=>{const c=l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return Math.round(255*c).toString(16).padStart(2,'0');};return'#'+f(0)+f(8)+f(4);};
    const gen=()=>{const [h,s,l]=hexToHsl($('colorBase').value);const m=$('colorMode').value;let arr=[];if(m==='analogous')arr=[-30,-15,0,15,30].map(d=>[(h+d+360)%360,s,l]);else if(m==='complementary')arr=[0,30,60,180,210].map(d=>[(h+d)%360,s,l]);else if(m==='triadic')arr=[0,60,120,180,240].map(d=>[(h+d)%360,s,l]);else arr=[20,40,50,70,85].map(L=>[h,s,L]);const p=$('palette');p.innerHTML='';arr.forEach(([H,S,L])=>{const hex=hslToHex(H,S,L);const d=document.createElement('div');d.className='swatch';d.style.background=hex;d.textContent=hex;d.title='Click to copy';d.onclick=()=>{navigator.clipboard.writeText(hex);toast(hex+' copied');};p.appendChild(d);});};
    $('colorGen').addEventListener('click',gen);gen();
  }

  /* 6 Units */
  if($('unitCat')){
    const data={length:{m:1,km:1000,cm:.01,mm:.001,mi:1609.34,yd:.9144,ft:.3048,in:.0254},weight:{kg:1,g:.001,lb:.453592,oz:.0283495,t:1000},time:{s:1,min:60,h:3600,day:86400,wk:604800},temperature:'temp'};
    const fill=()=>{const cat=$('unitCat').value;const opts=cat==='temperature'?['C','F','K']:Object.keys(data[cat]);$('unitFrom').innerHTML='';$('unitTo').innerHTML='';opts.forEach(o=>{$('unitFrom').appendChild(new Option(o,o));$('unitTo').appendChild(new Option(o,o));});$('unitTo').selectedIndex=1;calc();};
    const calc=()=>{const cat=$('unitCat').value;const v=+$('unitVal').value;const f=$('unitFrom').value,t=$('unitTo').value;let r;if(cat==='temperature'){let c=f==='C'?v:f==='F'?(v-32)*5/9:v-273.15;r=t==='C'?c:t==='F'?c*9/5+32:c+273.15;}else{r=v*data[cat][f]/data[cat][t];}$('unitOut').textContent=(Math.round(r*1e6)/1e6)+' '+t;};
    ['change','input'].forEach(ev=>{$('unitCat').addEventListener(ev,fill);$('unitVal').addEventListener(ev,calc);$('unitFrom').addEventListener(ev,calc);$('unitTo').addEventListener(ev,calc);});
    fill();
  }

  /* 7 Case */
  if(document.querySelector('[data-case]')){
    const i=$('caseIn'),o=$('caseOut');
    const fns={upper:t=>t.toUpperCase(),lower:t=>t.toLowerCase(),title:t=>t.replace(/\w\S*/g,w=>w[0].toUpperCase()+w.slice(1).toLowerCase()),sentence:t=>t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g,c=>c.toUpperCase()),camel:t=>t.toLowerCase().replace(/[^a-z0-9]+(.)/g,(_,c)=>c.toUpperCase()),snake:t=>t.trim().toLowerCase().replace(/[^a-z0-9]+/g,'_'),kebab:t=>t.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-')};
    document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{o.value=fns[b.dataset.case](i.value);}));
  }

  /* 8 Lorem */
  if($('loremGen')){
    const words='lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
    const w=(n)=>{let r=[];for(let i=0;i<n;i++)r.push(words[Math.floor(Math.random()*words.length)]);return r.join(' ');};
    const s=()=>{const n=5+Math.floor(Math.random()*10);return w(n).replace(/^./,c=>c.toUpperCase())+'.';};
    const p=()=>{const n=3+Math.floor(Math.random()*4);let r=[];for(let i=0;i<n;i++)r.push(s());return r.join(' ');};
    $('loremGen').addEventListener('click',()=>{const n=+$('loremCount').value;const t=$('loremType').value;let out='';if(t==='words')out=w(n);else if(t==='sentences'){for(let i=0;i<n;i++)out+=s()+' ';}else{for(let i=0;i<n;i++)out+=p()+'\n\n';}$('loremOut').value=out.trim();});
  }

  /* 9 Base64 */
  if($('b64Enc')){
    $('b64Enc').addEventListener('click',()=>{try{$('b64Out').value=btoa(unescape(encodeURIComponent($('b64In').value)));}catch(e){$('b64Out').value='Error: '+e.message;}});
    $('b64Dec').addEventListener('click',()=>{try{$('b64Out').value=decodeURIComponent(escape(atob($('b64In').value)));}catch(e){$('b64Out').value='Error: invalid Base64';}});
  }

  /* 10 URL analyzer */
  if($('urlAnalyze')){
    $('urlAnalyze').addEventListener('click',()=>{try{const u=new URL($('urlIn').value);const params=[...u.searchParams.entries()].map(([k,v])=>`${k} = ${v}`).join('<br>')||'(none)';$('urlReport').innerHTML=`<div>Protocol: <b>${u.protocol}</b></div><div>Host: <b>${u.hostname}</b></div><div>Port: <b>${u.port||'(default)'}</b></div><div>Path: <b>${u.pathname}</b></div><div>Query params:<br><b>${params}</b></div><div>Hash: <b>${u.hash||'(none)'}</b></div>`;}catch(e){$('urlReport').innerHTML='<div style="color:var(--bad)">Invalid URL</div>';}});
  }
})();
