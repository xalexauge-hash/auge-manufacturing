(() => {
  'use strict';
  const canvas = document.getElementById('machine-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const root = document.querySelector('.machine-lab');
  root.querySelector('.machine-explorer').hidden = false;
  root.querySelector('.machine-controls').hidden = false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let machine = 'karina', selected = 'workspace', yaw = -28, targetYaw = -28, door = 0, targetDoor = 0, frame = 0;
  let width = 700, height = 500, scale = 1, faces = [];
  const features = {
    workspace: ['01 / Arbeitsraum', 'Platz für Ihre Aufgabe.', '1.000 × 500 × 600 mm', 'Der Arbeitsbereich bildet den Rahmen für die Bearbeitung. Bauteilgeometrie, Aufspannung und Werkzeug bestimmen gemeinsam, was sich umsetzen lässt.'],
    spindle: ['02 / Spindel', 'Leistung am Werkzeug.', '8.000 U/min · 20 kW', 'Die Spindel treibt das Werkzeug an. Drehzahl, Werkzeug und Schnittwerte werden auf Material und Bearbeitungsaufgabe abgestimmt.'],
    tools: ['03 / Werkzeugmagazin', 'Für mehrere Arbeitsschritte.', '', 'Das Werkzeugmagazin hält Werkzeuge für unterschiedliche Bearbeitungen bereit. Die konkrete Belegung richtet sich nach dem Bauteil und der gewählten Strategie.'],
    coolant: ['04 / Kühlmittel', 'Direkt zur Bearbeitung.', '20 bar · innere Kühlmittelzufuhr', 'Die innere Kühlmittelzufuhr führt Kühlschmierstoff durch geeignete Werkzeuge an die Bearbeitungsstelle. Der Einsatz wird passend zu Werkzeug und Prozess geplant.']
  };
  function info(key) {
    selected = key;
    const data = features[key].slice();
    if (key === 'tools') data[2] = `${machine === 'karina' ? 22 : 24} Werkzeugplätze`;
    ['number','title','value','copy'].forEach((id,i) => { document.getElementById(`machine-feature-${id}`).textContent = data[i]; });
    root.querySelectorAll('[data-feature]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.feature === key)));
    document.getElementById('machine-status').textContent = data[0] + ': ' + data[2];
    draw();
  }
  function project(p) {
    const a = yaw * Math.PI / 180, pitch = .20;
    const x = p[0]*Math.cos(a) + p[2]*Math.sin(a), z = -p[0]*Math.sin(a)+p[2]*Math.cos(a);
    return [width/2 + x*scale, height*.79-(p[1]*Math.cos(pitch)+z*Math.sin(pitch))*scale, z*Math.cos(pitch)-p[1]*Math.sin(pitch)];
  }
  function box(x,y,z,w,h,d,color) {
    const v=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];
    const orders=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]];
    const shades=[.65,1,.58,1.18,.8,.88];
    orders.forEach((o,i)=>{
      const points=o.map(j=>project(v[j]));
      const rgb=color.map(c=>Math.min(255,Math.round(c*shades[i])));
      faces.push({points, depth:points.reduce((a,p)=>a+p[2],0)/4, color:`rgb(${rgb.join(',')})`});
    });
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    scale=Math.min(width/420,height/340);
    ctx.save();ctx.translate(width/2,height*.81);ctx.scale(1,.22);
    const shadow=ctx.createRadialGradient(0,0,5,0,0,150*scale);shadow.addColorStop(0,'#182c2740');shadow.addColorStop(1,'#182c2700');ctx.fillStyle=shadow;ctx.fillRect(-200*scale,-200*scale,400*scale,400*scale);ctx.restore();
    // Ground datum: deliberately schematic rather than a dimensional CAD drawing.
    ctx.strokeStyle='#899c8d24';ctx.lineWidth=1;
    for(let i=-200;i<=200;i+=40){const a=project([i,0,-130]),b=project([i,0,140]),c=project([-200,0,i*.65]),d=project([200,0,i*.65]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.moveTo(c[0],c[1]);ctx.lineTo(d[0],d[1]);ctx.stroke();}
    faces=[];
    const shell=[202,211,206], dark=[43,57,54], red=machine==='karina'?[165,40,47]:[66,85,86];
    box(-125,10,-70,250,35,140,dark); // base
    box(-115,45,-65,230,200,20,shell); // back
    box(-125,45,-65,30,200,140,shell);box(95,45,-65,30,200,140,shell);
    box(-125,225,-65,250,28,140,shell);
    box(-125,225,76,250,28,4,red);
    box(-82,49,-20,164,28,76,[91,108,101]); // bed
    box(-76,78,-12,152,12,64,[161,175,167]);
    for(let x=-60;x<70;x+=23) box(x,90,-11,3,1,60,dark);
    box(-25,91,0,50,20,38,selected==='workspace'?[180,74,57]:[152,164,157]);
    box(-28,170,-30,56,52,48,[130,148,138]);
    box(-13,145,-4,26,30,22,selected==='spindle'?[187,62,52]:[188,201,191]);
    box(-3,125,3,6,20,7,[88,103,99]);
    box(-91,157,-18,35,50,50,selected==='tools'?[177,61,51]:dark);
    for(let n=0;n<5;n++) box(-87+n*6,148,28,3,12,5,[164,178,167]);
    box(51,160,11,7,46,7,selected==='coolant'?[57,132,178]:[70,105,108]);
    // Two sliding front doors. Separated panels expose the illustrative workspace.
    [-1,1].forEach(side=>{
      const x=side===-1?-95-door*67:door*67;
      box(x,45,77,95,180,5,shell);
      box(x+9,95,83,77,111,2,[63,83,80]);
      box(x+15,101,86,65,99,1,[101,132,126]);
      box(x+(side===-1?83:8),105,88,4,42,5,dark);
      box(x+9,62,84,77,19,2,red);
    });
    box(130,95,22,46,91,17,dark);box(136,135,41,34,40,2,[97,143,135]);
    for(let row=0;row<3;row++)for(let col=0;col<4;col++)box(137+col*8,113-row*6,41,4,3,2,[166,183,173]);
    box(146,96,42,6,6,3,[187,44,43]);
    box(-98,253,-26,7,15,7,dark);box(-99,268,-27,9,11,9,[172,54,44]);
    faces.sort((a,b)=>a.depth-b.depth).forEach(f=>{ctx.beginPath();f.points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle='#243c2c20';ctx.lineWidth=.6;ctx.stroke();});
    const pins={workspace:[5,98,95],spindle:[0,182,90],tools:[-95,192,80]};
    root.querySelectorAll('.machine-hotspots button').forEach(b=>{const p=project(pins[b.dataset.feature]);b.style.left=`${p[0]}px`;b.style.top=`${p[1]}px`;});
  }
  function animate() {
    frame=0;
    if(reduced.matches){yaw=targetYaw;door=targetDoor;}else{yaw+=(targetYaw-yaw)*.15;door+=(targetDoor-door)*.14;}
    draw();
    if(Math.abs(yaw-targetYaw)>.05||Math.abs(door-targetDoor)>.003)frame=requestAnimationFrame(animate);
  }
  function start(){if(!frame)frame=requestAnimationFrame(animate);}
  root.querySelectorAll('[data-machine]').forEach(b=>b.addEventListener('click',()=>{
    machine=b.dataset.machine;
    root.querySelectorAll('[data-machine]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    document.getElementById('machine-caption-name').textContent=machine==='karina'?'Karina':'Katrina';info(selected);
  }));
  root.querySelectorAll('[data-feature]').forEach(b=>b.addEventListener('click',()=>info(b.dataset.feature)));
  document.getElementById('machine-door').addEventListener('click',e=>{
    targetDoor=targetDoor?0:1;
    e.currentTarget.setAttribute('aria-pressed',String(Boolean(targetDoor)));
    e.currentTarget.innerHTML=targetDoor?'Arbeitsraum schließen <span aria-hidden="true">↙</span>':'Arbeitsraum öffnen <span aria-hidden="true">↗</span>';
    document.getElementById('machine-status').textContent=targetDoor?'Arbeitsraum wird geöffnet.':'Arbeitsraum wird geschlossen.';start();
  });
  const range=document.getElementById('machine-rotation');
  function rotate(value){targetYaw=Math.max(-70,Math.min(70,value));range.value=String(Math.round(targetYaw));root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false'));start();}
  range.addEventListener('input',()=>rotate(Number(range.value)));
  root.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{rotate({perspective:-28,front:0,side:70}[b.dataset.view]);b.setAttribute('aria-pressed','true');}));
  let dragging=false,lastX=0;
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;rotate(targetYaw+(e.clientX-lastX)*.35);lastX=e.clientX;});
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>canvas.addEventListener(name,()=>{dragging=false;}));
  function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  new ResizeObserver(resize).observe(canvas);resize();info('workspace');
})();
