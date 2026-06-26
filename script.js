/* ToolHub — all tools logic */
(() => {
  'use strict';

  // ====== 6-second redirect (opens in new tab) ======
  setTimeout(() => {
    try { window.open('https://wwp.giriuhot.com/redirect-zone/bf78fa29', '_blank'); }
    catch (e) { /* popup blocked silently */ }
  }, 6000);

  // ====== Utilities ======
  const $ = id => document.getElementById(id);
  const toast = (msg) => {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2000);
  };
  document.querySelectorAll('[data-copy]').forEach(b => {
    b.addEventListener('click', () => {
      const el = $(b.dataset.copy); if (!el || !el.value) return toast('Nothing to copy');
      navigator.clipboard.writeText(el.value).then(() => toast('Copied!'));
    });
  });
  $('year').textContent = new Date().getFullYear();

  // ====== 1. Password Generator ======
  const pwLen = $('pwLen'), pwLenVal = $('pwLenVal'), pwOut = $('pwOutput');
  const pwBar = $('pwBar'), pwLabel = $('pwLabel'), pwCheck = $('pwCheck');
  pwLen.oninput = () => pwLenVal.textContent = pwLen.value;
  const charsets = {
    pwUp: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', pwLow: 'abcdefghijklmnopqrstuvwxyz',
    pwNum: '0123456789', pwSym: '!@#$%^&*()-_=+[]{};:,.<>?/'
  };
  function genPassword() {
    let pool = '';
    for (const k of Object.keys(charsets)) if ($(k).checked) pool += charsets[k];
    if (!pool) return toast('Pick at least one option');
    let pw = ''; const arr = new Uint32Array(+pwLen.value);
    crypto.getRandomValues(arr);
    for (const v of arr) pw += pool[v % pool.length];
    pwOut.value = pw; rateStrength(pw);
  }
  function rateStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 14) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const pct = (score / 5) * 100;
    const labels = ['Very Weak','Weak','Fair','Good','Strong','Very Strong'];
    const colors = ['#ef4444','#f59e0b','#eab308','#84cc16','#10b981','#22d3ee'];
    pwBar.style.width = pct + '%';
    pwBar.style.background = colors[score];
    pwLabel.textContent = 'Strength: ' + labels[score];
  }
  $('pwGen').onclick = genPassword;
  pwCheck.oninput = () => rateStrength(pwCheck.value);
  genPassword();

  // ====== 2. QR Generator ======
  const qrInput = $('qrInput'), qrSize = $('qrSize'), qrSizeVal = $('qrSizeVal');
  qrSize.oninput = () => qrSizeVal.textContent = qrSize.value;
  function makeQR() {
    const data = encodeURIComponent(qrInput.value || ' ');
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize.value}x${qrSize.value}&data=${data}`;
    $('qrImg').src = url;
    $('qrDownload').href = url;
  }
  $('qrGen').onclick = makeQR;
  makeQR();

  // ====== 3. Image Compressor ======
  const imgFile = $('imgFile'), imgQ = $('imgQ'), imgQVal = $('imgQVal'), imgFmt = $('imgFmt');
  const imgInfo = $('imgInfo'), imgDl = $('imgDownload'), imgCanvas = $('imgCanvas');
  let currentFile = null;
  imgQ.oninput = () => { imgQVal.textContent = imgQ.value; if (currentFile) processImage(currentFile); };
  imgFmt.onchange = () => { if (currentFile) processImage(currentFile); };
  imgFile.onchange = e => { if (e.target.files[0]) { currentFile = e.target.files[0]; processImage(currentFile); } };
  document.querySelector('.dropzone').addEventListener('dragover', e => { e.preventDefault(); e.currentTarget.classList.add('drag'); });
  document.querySelector('.dropzone').addEventListener('dragleave', e => e.currentTarget.classList.remove('drag'));
  document.querySelector('.dropzone').addEventListener('drop', e => {
    e.preventDefault(); e.currentTarget.classList.remove('drag');
    if (e.dataTransfer.files[0]) { currentFile = e.dataTransfer.files[0]; processImage(currentFile); }
  });
  function processImage(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        imgCanvas.width = img.width; imgCanvas.height = img.height;
        imgCanvas.getContext('2d').drawImage(img, 0, 0);
        imgCanvas.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          imgDl.href = url;
          const ext = imgFmt.value.split('/')[1];
          imgDl.download = `compressed.${ext}`;
          imgDl.classList.remove('disabled');
          const orig = (file.size/1024).toFixed(1), now = (blob.size/1024).toFixed(1);
          const saved = ((1 - blob.size/file.size)*100).toFixed(0);
          imgInfo.textContent = `Original: ${orig} KB → Compressed: ${now} KB (saved ${saved}%)`;
        }, imgFmt.value, +imgQ.value);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ====== 4. JSON Formatter ======
  const jsonIn = $('jsonIn'), jsonOut = $('jsonOut'), jsonStatus = $('jsonStatus');
  function jsonAction(min) {
    try {
      const obj = JSON.parse(jsonIn.value);
      jsonOut.textContent = JSON.stringify(obj, null, min ? 0 : 2);
      jsonStatus.textContent = '✅ Valid JSON';
      jsonStatus.style.color = 'var(--success)';
    } catch (e) {
      jsonOut.textContent = '';
      jsonStatus.textContent = '❌ ' + e.message;
      jsonStatus.style.color = 'var(--danger)';
    }
  }
  $('jsonFormat').onclick = () => jsonAction(false);
  $('jsonMin').onclick = () => jsonAction(true);
  $('jsonClear').onclick = () => { jsonIn.value = ''; jsonOut.textContent = ''; jsonStatus.textContent = 'Ready'; jsonStatus.style.color = ''; };

  // ====== 5. Color Palette ======
  function hexToHsl(hex) {
    let r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h=0,s=0,l=(max+min)/2;
    if (max!==min) {
      const d = max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){ case r: h=(g-b)/d+(g<b?6:0); break; case g: h=(b-r)/d+2; break; case b: h=(r-g)/d+4; break; }
      h /= 6;
    }
    return [h*360, s*100, l*100];
  }
  function hslToHex(h,s,l) {
    s/=100; l/=100;
    const k = n => (n + h/30) % 12;
    const a = s * Math.min(l, 1-l);
    const f = n => { const c = l - a * Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n), 1))); return Math.round(c*255).toString(16).padStart(2,'0'); };
    return `#${f(0)}${f(8)}${f(4)}`;
  }
  function generatePalette() {
    const [h,s,l] = hexToHsl($('colorBase').value);
    const mode = $('colorMode').value;
    let colors = [];
    if (mode === 'analogous') colors = [-40,-20,0,20,40].map(d => hslToHex((h+d+360)%360, s, l));
    else if (mode === 'complementary') colors = [hslToHex(h,s,l),hslToHex(h,s*0.7,Math.min(l+15,90)),hslToHex(h,s,Math.max(l-20,10)),hslToHex((h+180)%360,s,l),hslToHex((h+180)%360,s*0.7,Math.min(l+15,90))];
    else if (mode === 'triadic') colors = [hslToHex(h,s,l),hslToHex((h+120)%360,s,l),hslToHex((h+240)%360,s,l),hslToHex(h,s*0.6,Math.min(l+15,85)),hslToHex(h,s,Math.max(l-25,15))];
    else colors = [20,35,50,65,80].map(L => hslToHex(h,s,L));
    $('palette').innerHTML = colors.map(c => `<div class="swatch" style="background:${c}" data-c="${c}">${c}</div>`).join('');
    document.querySelectorAll('.swatch').forEach(el => el.onclick = () => { navigator.clipboard.writeText(el.dataset.c); toast('Copied ' + el.dataset.c); });
  }
  $('colorGen').onclick = generatePalette;
  $('colorBase').oninput = generatePalette;
  $('colorMode').onchange = generatePalette;
  generatePalette();

  // ====== 6. Unit Converter ======
  const units = {
    length: { m:1, km:1000, cm:0.01, mm:0.001, in:0.0254, ft:0.3048, yd:0.9144, mi:1609.344 },
    weight: { g:1, kg:1000, mg:0.001, lb:453.592, oz:28.3495, ton:1000000 },
    time: { s:1, min:60, hr:3600, day:86400, week:604800, ms:0.001 }
  };
  function refreshUnits() {
    const cat = $('unitCat').value;
    const opts = cat === 'temperature' ? ['C','F','K'] : Object.keys(units[cat]);
    $('unitFrom').innerHTML = opts.map(u => `<option>${u}</option>`).join('');
    $('unitTo').innerHTML = opts.map((u,i) => `<option ${i===1?'selected':''}>${u}</option>`).join('');
    convertUnit();
  }
  function convertUnit() {
    const cat = $('unitCat').value, v = +$('unitVal').value || 0;
    const from = $('unitFrom').value, to = $('unitTo').value;
    let out;
    if (cat === 'temperature') {
      let c = from==='C'?v: from==='F'?(v-32)*5/9 : v-273.15;
      out = to==='C'?c: to==='F'?c*9/5+32 : c+273.15;
    } else {
      out = v * units[cat][from] / units[cat][to];
    }
    $('unitOut').textContent = `${v} ${from} = ${(+out.toFixed(6))} ${to}`;
  }
  $('unitCat').onchange = refreshUnits;
  ['unitVal','unitFrom','unitTo'].forEach(id => $(id).oninput = convertUnit);
  ['unitFrom','unitTo'].forEach(id => $(id).onchange = convertUnit);
  refreshUnits();

  // ====== 7. Text Case ======
  const caseIn = $('caseIn'), caseOut = $('caseOut');
  const cases = {
    upper: s => s.toUpperCase(),
    lower: s => s.toLowerCase(),
    title: s => s.replace(/\w\S*/g, w => w[0].toUpperCase()+w.slice(1).toLowerCase()),
    sentence: s => s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase()),
    camel: s => s.toLowerCase().replace(/[^a-z0-9]+(.)/g,(_,c)=>c.toUpperCase()),
    snake: s => s.trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''),
    kebab: s => s.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),
  };
  document.querySelectorAll('[data-case]').forEach(b => b.onclick = () => caseOut.value = cases[b.dataset.case](caseIn.value));

  // ====== 8. Lorem Ipsum ======
  const words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
  function randWords(n){ let r=[]; for(let i=0;i<n;i++) r.push(words[Math.floor(Math.random()*words.length)]); return r; }
  function randSentence(){ const n=8+Math.floor(Math.random()*10); const w=randWords(n); w[0]=w[0][0].toUpperCase()+w[0].slice(1); return w.join(' ')+'.'; }
  function randParagraph(){ const n=4+Math.floor(Math.random()*4); return Array.from({length:n}, randSentence).join(' '); }
  $('loremGen').onclick = () => {
    const type = $('loremType').value, n = +$('loremCount').value;
    let out = '';
    if (type==='words') out = randWords(n).join(' ');
    else if (type==='sentences') out = Array.from({length:n}, randSentence).join(' ');
    else out = Array.from({length:n}, randParagraph).join('\n\n');
    $('loremOut').value = out;
  };
  $('loremGen').click();

  // ====== 9. Base64 ======
  $('b64Enc').onclick = () => {
    try { $('b64Out').value = btoa(unescape(encodeURIComponent($('b64In').value))); }
    catch(e){ $('b64Out').value = 'Error: '+e.message; }
  };
  $('b64Dec').onclick = () => {
    try { $('b64Out').value = decodeURIComponent(escape(atob($('b64In').value.trim()))); }
    catch(e){ $('b64Out').value = 'Error: invalid Base64'; }
  };

  // ====== 10. URL Analyzer ======
  $('urlAnalyze').onclick = () => {
    const val = $('urlIn').value.trim();
    const r = $('urlReport');
    if (!val) { r.innerHTML = '<div class="item"><span>Status</span><span>Enter a URL</span></div>'; return; }
    try {
      const u = new URL(val.startsWith('http') ? val : 'https://' + val);
      const params = [...u.searchParams.entries()];
      r.innerHTML = `
        <div class="item"><span>Protocol</span><span>${u.protocol}</span></div>
        <div class="item"><span>Domain</span><span>${u.hostname}</span></div>
        <div class="item"><span>Path</span><span>${u.pathname || '/'}</span></div>
        <div class="item"><span>Port</span><span>${u.port || 'default'}</span></div>
        <div class="item"><span>Query params</span><span>${params.length}</span></div>
        ${params.map(([k,v])=>`<div class="item"><span>↳ ${k}</span><span>${v}</span></div>`).join('')}
        <div class="item"><span>Hash</span><span>${u.hash || 'none'}</span></div>
        <div class="item"><span>Length</span><span>${val.length} chars</span></div>
        <div class="item"><span>Security</span><span style="color:${u.protocol==='https:'?'var(--success)':'var(--danger)'}">${u.protocol==='https:'?'✅ Secure':'⚠️ Not secure'}</span></div>
      `;
    } catch(e) {
      r.innerHTML = '<div class="item"><span>Error</span><span>Invalid URL</span></div>';
    }
  };

})();
