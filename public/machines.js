(() => {
  'use strict';
  const canvas = document.getElementById('machine-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const root = document.querySelector('.machine-lab');
  root.querySelector('.machine-explorer').hidden = false;
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
    if (key === 'tools') { data[2] = machine === 'karina' ? 'Tellerwechsler · 22 Werkzeugplätze' : 'Revolverwechsler · 24 Werkzeugplätze'; }
    ['number','title','value','copy'].forEach((id,i) => { document.getElementById(`machine-feature-${id}`).textContent = data[i]; });
    root.querySelectorAll('[data-feature]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.feature === key)));
    document.getElementById('machine-status').textContent = data[0] + ': ' + data[2];
    draw();
  }
  function project(p) {
    const a = yaw * Math.PI / 180, pitch = -.28;
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
  function pane(vertices,color) {
    const points=vertices.map(project);
    faces.push({points,depth:points.reduce((sum,p)=>sum+p[2],0)/points.length,color});
  }
  function cylinder(x,y,z,r,h,color) {
    const n=12, bottom=[],top=[];
    for(let i=0;i<n;i++){const a=i*Math.PI*2/n;bottom.push([x+Math.cos(a)*r,y,z+Math.sin(a)*r]);top.push([x+Math.cos(a)*r,y+h,z+Math.sin(a)*r]);}
    for(let i=0;i<n;i++){const j=(i+1)%n;const shade=.78+.2*Math.cos(i*Math.PI*2/n);pane([bottom[i],bottom[j],top[j],top[i]],`rgb(${color.map(c=>Math.round(c*shade)).join(',')})`);}
    pane(top,`rgb(${color.join(',')})`);
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    scale=Math.min(width/490,height/390);
    ctx.save();ctx.translate(width/2,height*.81);ctx.scale(1,.22);
    const shadow=ctx.createRadialGradient(0,0,5,0,0,150*scale);shadow.addColorStop(0,'#182c2740');shadow.addColorStop(1,'#182c2700');ctx.fillStyle=shadow;ctx.fillRect(-200*scale,-200*scale,400*scale,400*scale);ctx.restore();
    // Ground datum: deliberately schematic rather than a dimensional CAD drawing.
    ctx.strokeStyle='#899c8d24';ctx.lineWidth=1;
    for(let i=-200;i<=200;i+=40){const a=project([i,0,-130]),b=project([i,0,140]),c=project([-200,0,i*.65]),d=project([200,0,i*.65]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.moveTo(c[0],c[1]);ctx.lineTo(d[0],d[1]);ctx.stroke();}
    faces=[];
    // Proportions traced from the two supplied photographs, not manufacturer CAD.
    // Red door frames belong to Karina; dark frames and blue-grey head to Katrina.
    const shell=[220,224,221], dark=[45,51,53], metal=[156,168,171];
    const accent=machine==='karina'?[188,32,39]:[65,76,82];
    const head=machine==='karina'?[191,35,39]:[65,76,82];
    // Cast base, levelling feet and white fixed splash apron.
    box(-127,12,-88,254,24,166,dark);
    [-111,106].forEach(x=>[-68,60].forEach(z=>{cylinder(x,5,z,7,7,metal);cylinder(x,0,z,10,4,dark);}));
    box(-123,35,-80,246,20,154,[68,77,79]);
    box(-128,40,72,256,36,8,shell);
    box(-127,38,80,254,3,3,[29,34,36]);
    // Rear column and cabinet; seams, side ventilation and access panel fasteners.
    box(-119,56,-82,238,171,13,[204,209,205]);
    box(-30,54,-74,61,211,54,[91,104,108]);
    box(-125,76,-76,30,151,151,shell);box(95,76,-76,30,151,151,shell);
    box(-124,227,-75,248,13,150,shell);
    box(-120,239,-65,106,22,85,shell);
    box(94,86,-63,32,126,109,[207,213,209]);
    for(let y=113;y<180;y+=5)box(126,y,-45,1,1.5,64,[102,115,116]);
    for(let y of [92,205])for(let z of [-56,35])box(127,y,z,1,2,2,metal);
    // Telescoping axis covers, saddle and finely slotted worktable.
    box(-91,64,-54,182,13,105,[92,101,104]);
    for(let i=0;i<8;i++)box(-89,77+i*.75,-54+i*8,178,1.4,8,[144+i*5,153+i*4,157+i*3]);
    box(-77,80,-17,154,11,70,[104,117,121]);
    box(-83,91,-22,166,9,76,[185,195,197]);
    // T-slots run across the table in X, not front-to-back.
    for(let z=-16;z<54;z+=14){box(-83,100,z,166,.7,2.3,[44,54,58]);box(-83,100,z+2.3,166,.7,.7,[222,227,228]);}
    for(let x=-78;x<84;x+=14)box(x,92,54,1,6,.6,[91,108,113]);
    // Peaked stainless front way cover and drainage channels below the saddle.
    for(let i=0;i<6;i++){
      const z=25+i*8,y=54-i*2;
      pane([[-49,y,z],[0,y+5,z],[0,y+3,z+8],[-49,y-2,z+8]],'#b9c3c5');
      pane([[0,y+5,z],[49,y,z],[49,y-2,z+8],[0,y+3,z+8]],'#929fa3');
    }
    // Vertical guideway cover and exposed characteristic narrow spindle head.
    for(let y=105;y<232;y+=6)box(-26,y,-18,52,3,5,[60,69,73]);
    box(-23,156,-12,46,94,43,head);
    box(-18,250,-15,36,47,40,head);
    box(18,254,-24,16,31,25,dark);
    for(let y=257;y<283;y+=4)box(34,y,-21,1,1,20,[111,121,123]);
    box(-14,184,32,28,25,2,[188,194,190]);
    box(-10,187,35,20,18,1,[108,119,121]);
    cylinder(0,144,9,17,12,[138,152,157]);
    cylinder(0,131,9,12,13,[62,73,79]);
    cylinder(0,124,9,8,7,[187,199,201]);
    cylinder(0,114,9,4,10,[113,130,139]);
    for(let y=115;y<124;y+=2)cylinder(0,y,9,4.2,.7,[209,217,219]);
    // User-confirmed tool changer types, illustrated with simplified pocket geometry.
    if(machine==='karina'){
      cylinder(-62,178,7,35,25,[221,222,211]); cylinder(-62,177,7,33,2,dark);
      for(let i=0;i<22;i++){const a=i*Math.PI*2/22;const tx=-62+28*Math.cos(a),tz=7+28*Math.sin(a);cylinder(tx,170,tz,3.5,8,dark);cylinder(tx,163-(i%3)*2,tz,1.6,7+(i%3)*2,metal);}
    }else{
      for(let i=0;i<24;i++){const a=i*Math.PI*2/24;box(-65+26*Math.cos(a),185+26*Math.sin(a),18,3,5,9,metal);}
      box(-79,176,12,28,26,10,dark);
    }
    // Upper changer shroud.
    if(machine==='katrina')box(-89,184,-42,53,43,50,[210,214,208]);
    box(-48,192,9,13,24,1,[28,36,39]);
    box(-91,181,-42,55,3,51,[121,132,133]);
    // Articulated coolant nozzles, steel end tips and conduit behind head.
    for(let side of [-1,1])for(let i=0;i<6;i++)cylinder(side*(17+i*1.1),147-i*2,17+i*1.7,2.2,2.4,[43,85,122]);
    cylinder(-24,133,26,1.7,3,[196,156,62]);cylinder(24,133,26,1.7,3,[196,156,62]);
    // Front rail, jambs and two real framed sliding windows. Opening retracts frames.
    box(-98,224,77,196,5,6,metal);box(-98,74,77,196,4,6,metal);
    [-1,1].forEach(side=>{
      const x=side===-1?-94-door*67:door*67;
      box(x,78,79,94,9,6,accent);box(x,215,79,94,12,6,accent);
      // Deep pressed-sheet bevels around the tall inset glazing, visible in supplied listings.
      const ac='rgb('+accent.join(',')+')';
      pane([[x,78,87],[x+94,78,87],[x+81,101,92],[x+14,101,92]],ac);
      pane([[x,78,87],[x+14,101,92],[x+14,214,92],[x,227,87]],ac);
      pane([[x+94,78,87],[x+94,227,87],[x+81,214,92],[x+81,101,92]],ac);
      box(x+13,101,92,2,113,1,[29,33,34]);box(x+80,101,92,2,113,1,[29,33,34]);
      box(x,87,79,10,128,6,accent);box(x+84,87,79,10,128,6,accent);
      // Muted glazing remains translucent, allowing depth and the spindle behind it.
      pane([[x+10,87,82],[x+84,87,82],[x+84,215,82],[x+10,215,82]],'rgba(166,193,198,.22)');
      box(x+10,87,85,2,128,1,metal);box(x+82,87,85,2,128,1,metal);
      box(x+12,211,85,70,2,1,[228,233,232]);
      const hx=x+(side===-1?83:9);
      box(hx,119,87,3,5,7,metal);box(hx,176,87,3,5,7,metal);box(hx,111,93,3,77,3,[24,28,29]);
      for(let xx of [x+5,x+89])for(let yy of [82,221])cylinder(xx,yy,86,1,1,metal);
    });
    // Controller support, console chassis, screen bezel, soft keys and keyboard.
    box(116,12,30,51,7,30,dark);box(145,19,39,9,74,12,dark);
    box(137,80,32,27,8,16,metal);box(135,72,36,53,139,15,metal);
    box(138,89,52,42,119,2,[191,200,199]);
    box(140,165,55,38,39,2,[48,58,63]);box(144,169,58,30,30,1,[28,91,124]);
    box(147,194,60,17,2,.5,[212,187,68]);
    for(let y=174;y<190;y+=4)box(147,y,60,21,1,.5,[119,184,195]);
    for(let n=0;n<7;n++)box(141+n*5.2,159,56,3,3,1,dark);
    box(138,147,55,42,8,2,[182,37,43]);
    for(let row=0;row<6;row++)for(let col=0;col<10;col++)box(140+col*3.8,141-row*3.7,56,2.8,2.5,1,[44,58,65]);
    for(let row=0;row<3;row++)for(let col=0;col<5;col++)box(153+col*5,112-row*5.5,56,3.5,3.5,1,[48,62,66]);
    box(140,98,56,9,9,2,[223,182,40]);box(142,100,59,5,5,3,[198,39,39]);
    box(156,92,56,5,4,2,[46,144,103]);box(164,92,56,5,4,2,[188,48,47]);
    // Karina's conveyor is clearly visible in the supplied photograph.
    {
      box(-163,16,-30,36,17,48,dark);
      for(let i=0;i<8;i++){box(-161-i*5,28+i*7,-26,12,7,39,[57,66,70]);box(-161-i*5,35+i*7,-26,2,2,39,metal);}
      box(-201,79,-27,34,8,42,dark);box(-204,61,-27,7,24,42,dark);
      cylinder(-167,5,-11,5,11,metal);
    }
    // Roof signal lamp and fasteners complete the visible enclosure assembly.
    cylinder(89,240,35,2,10,dark);cylinder(89,250,35,4,4,[219,175,40]);cylinder(89,254,35,4,2,dark);
    faces.sort((a,b)=>a.depth-b.depth).forEach(f=>{ctx.beginPath();f.points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle='#243c2c20';ctx.lineWidth=.6;ctx.stroke();});
    const pins={workspace:[0,101,25],spindle:[0,143,20],tools:[-65,181,30],coolant:[24,134,30]};
    root.querySelectorAll('.machine-hotspots button').forEach(b=>{
      let point;
      if(b.dataset.door==='open'){b.hidden=Boolean(targetDoor);point=[0,150,95];}
      else if(b.dataset.door==='close'){b.hidden=!targetDoor;point=[-125,155,95];}
      else{b.hidden=!targetDoor;point=pins[b.dataset.feature];}
      const p=project(point);b.style.left=p[0]+'px';b.style.top=p[1]+'px';
    });
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
    document.getElementById('machine-caption-name').textContent=machine==='karina'?'Karina':'Katrina';setDoor(false);
  }));
  root.querySelectorAll('[data-feature]').forEach(b=>b.addEventListener('click',()=>info(b.dataset.feature)));
  function setDoor(open){
    targetDoor=open?1:0;
    if(open)info('workspace');
    else{
      selected='workspace';
      ['number','title','value','copy'].forEach((id,i)=>{document.getElementById('machine-feature-'+id).textContent=['Kondia A10','Ein Blick in die Maschine.','','Öffnen Sie den Arbeitsraum mit einem Klick auf den Türspalt.'][i];});
    }
    root.querySelector('.machine-drag-hint').textContent=open?'Bauteile anklicken · außen an der Tür schließen':'Türspalt anklicken und Arbeitsraum entdecken';
    document.getElementById('machine-status').textContent=open?'Arbeitsraum geöffnet.':'Türen geschlossen. Ansicht zurückgesetzt.';
    start();
  }
  root.querySelectorAll('[data-door]').forEach(b=>b.addEventListener('click',()=>setDoor(b.dataset.door==='open')));
  function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  new ResizeObserver(resize).observe(canvas);resize();setDoor(false);
})();
