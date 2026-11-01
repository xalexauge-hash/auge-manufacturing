import * as THREE from './vendor/three.module.js';
import {createMaterials,createRobot,conveyor,extrusion,housingPart,crate,pallet,cabinet,box,fastener} from './cad-components.js';
import {inspectionState,packagingState,INPUTS,OUTPUTS,NEST,INSPECTION_BASE,PACK_BASES,PACK_PARKS,INSPECTION_DURATION,PACKAGING_DURATION} from './cad-timeline.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const put=(o,p)=>{o.position.set(...p);return o;};
function cylinder(parent,mat,p,r,h,axis='y'){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),mat);m.position.set(...p);if(axis==='z')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.z=Math.PI/2;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function label(parent,text,p,w=1.3){
  const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');x.fillStyle='#edf1ef';x.fillRect(0,0,512,96);x.fillStyle='#233a45';x.font='600 26px Arial';x.textAlign='center';x.fillText(text,256,59);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:true,transparent:false}));sprite.position.set(...p);sprite.scale.set(w,w*96/512,1);parent.add(sprite);return sprite;
}
// Instance repeated fasteners and profiles inside each rigid link, leaving joints movable.
function batchRigid(group){
  [...group.children].filter(c=>c.isGroup).forEach(batchRigid);
  const buckets=new Map();
  group.children.forEach(c=>{if(!c.isMesh||c.isInstancedMesh||c.userData.dynamic||Array.isArray(c.material)||c.material.transparent)return;const k=c.geometry.uuid+c.material.uuid;if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(c);});
  buckets.forEach(items=>{if(items.length<3)return;const b=new THREE.InstancedMesh(items[0].geometry,items[0].material,items.length);b.castShadow=true;b.receiveShadow=true;items.forEach((o,i)=>{o.updateMatrix();b.setMatrixAt(i,o.matrix);group.remove(o);});b.instanceMatrix.needsUpdate=true;group.add(b);});
}
function table(m,w,d,h){
  const g=new THREE.Group();box(g,m.bright,0,h-.035,0,w,.07,d);
  for(const x of [-w/2+.1,w/2-.1])for(const z of [-d/2+.1,d/2-.1]){const leg=extrusion(m,h-.1);put(leg,[x,.05,z]);g.add(leg);cylinder(g,m.rubber,[x,.025,z],.07,.05);fastener(g,m,x,h+.006,z,.018);}
  for(const z of [-d/2+.1,d/2-.1])box(g,m.aluminum,0,.4,z,w-.2,.06,.06);return g;
}
function inspectionScene(m){
  const group=new THREE.Group(),structure=new THREE.Group(),mechanics=new THREE.Group(),robots=new THREE.Group(),controls=new THREE.Group();group.add(structure,mechanics,robots,controls);
  const tableTop=.985;structure.add(table(m,3.8,2.9,tableTop));
  box(structure,m.navy,0,.82,-1.48,3.8,.25,.035);
  const tray=(positions,name)=>{
    const g=new THREE.Group();box(g,m.dark,positions[0][0]+.18,tableTop+.004,.75,.77,.012,.79);
    positions.forEach((p,i)=>{box(g,m.plastic,p[0],tableTop+.014,p[2],.29,.025,.25);box(g,m.dark,p[0],tableTop+.029,p[2],.24,.005,.19);for(const dx of [-.145,.145])box(g,m.bright,p[0]+dx,tableTop+.04,p[2],.016,.04,.25);});
    mechanics.add(g);label(group,name,[positions[0][0]+.18,1.0,1.3],1.0);return g;
  };
  tray(INPUTS,'01 / EINGANG · 4 TEILE');tray(OUTPUTS,'03 / GEPRÜFTE TEILE');
  const fixture=new THREE.Group();put(fixture,[0,tableTop,-.95]);mechanics.add(fixture);
  box(fixture,m.steel,0,.015,0,.56,.03,.49);box(fixture,m.aluminum,0,.033,0,.43,.016,.36);
  for(const x of [-.21,.21])for(const z of [-.18,.18])fastener(fixture,m,x,.04,z,.016);
  for(const x of [-.105,.105])for(const z of [-.075,.075])cylinder(fixture,m.bright,[x,.044,z],.014,.035);
  const clamps=[-1,1].map(side=>{const g=new THREE.Group();fixture.add(g);box(g,m.navy,0,.06,0,.12,.09,.2);box(g,m.bright,-side*.05,.085,0,.055,.035,.12);cylinder(g,m.amber,[side*.04,.08,.07],.012,.025,'z');return g;});
  const gantry=new THREE.Group();mechanics.add(gantry);
  for(const x of [-.48,.48]){const upright=extrusion(m,2.95);put(upright,[x,tableTop,-1.32]);gantry.add(upright);box(gantry,m.steel,x,tableTop,-1.32,.18,.015,.18);}
  box(gantry,m.aluminum,0,3.93,-1.32,1.04,.08,.08);box(gantry,m.steel,0,3.93,-1.12,.12,.04,.4);
  box(gantry,m.navy,0,3.81,-.95,.21,.19,.2);for(const x of [-.07,.07])fastener(gantry,m,x,3.91,-.95,.012);
  cylinder(gantry,m.black,[0,3.67,-.95],.075,.12);const light=cylinder(gantry,m.green,[0,3.60,-.95],.12,.025);
  const lens=cylinder(gantry,m.display,[0,3.58,-.95],.065,.025);
  const beamMat=new THREE.MeshBasicMaterial({color:0x56e2bc,transparent:true,opacity:.08,depthWrite:false});const beam=new THREE.Mesh(new THREE.CylinderGeometry(.06,.17,2.5,32,1,true),beamMat);put(beam,[0,2.32,-.95]);mechanics.add(beam);
  label(group,'02 / PRÜFNEST + KAMERA',[0,4.13,-1.1],1.25);
  const robot=createRobot(m,{reach:1.25});put(robot.group,INSPECTION_BASE);robots.add(robot.group);
  const parts=INPUTS.map((p,i)=>{const g=housingPart(m);put(g,[p[0],p[1]-.075,p[2]]);group.add(g);label(g,String(i+1).padStart(2,'0'),[0,.14,0],.085);return g;});
  const cab=cabinet(m);put(cab,[-2.25,0,-1.05]);controls.add(cab);
  // Rear guarding and an accessible front; translucent panels keep the mechanism legible.
  for(const x of [-1.88,1.88]){const post=extrusion(m,1.65);put(post,[x,.98,-1.4]);structure.add(post);}
  box(structure,m.glass,0,1.83,-1.43,3.75,1.65,.015);box(structure,m.aluminum,0,2.65,-1.43,3.85,.035,.04);
  function update(time){
    const s=inspectionState(time);robot.setTarget(s.tcp[0],s.tcp[1]-INSPECTION_BASE[1],s.tcp[2],s.grip);parts.forEach((p,i)=>put(p,[s.parts[i].position[0],s.parts[i].position[1]-.075,s.parts[i].position[2]]));
    clamps.forEach((c,i)=>c.position.x=(i?1:-1)*(.23-s.clampAmount*.0275));beam.visible=s.capture;light.material=s.capture?m.green:m.bright;lens.material=s.capture?m.green:m.display;
    return {...s,caption:s.complete?'Charge vollständig · 4 / 4 geprüft':`Teil ${s.index+1} / 4 · ${s.processed} abgelegt`,clamped:robot.clamped};
  }
  batchRigid(structure);batchRigid(controls);batchRigid(robots);parts.forEach(batchRigid);batchRigid(fixture);batchRigid(gantry);
  return {group,structure,mechanics,robots,controls,update,camera:[6.2,5.4,7.4],target:[0,1.7,0],span:5.8,focus:fixture};
}
function packagingScene(m){
  const group=new THREE.Group(),structure=new THREE.Group(),mechanics=new THREE.Group(),robots=new THREE.Group(),controls=new THREE.Group();group.add(structure,mechanics,robots,controls);
  const lower=conveyor(m,{length:6.8,width:.78,height:.65}),upper=conveyor(m,{length:5.8,width:.78,height:1.65});lower.group.position.x=.5;structure.add(lower.group,upper.group);
  const feed=conveyor(m,{length:3.6,width:.48,height:1.65});feed.group.rotation.y=Math.PI/2;put(feed.group,[0,0,-3.95]);structure.add(feed.group);
  const robotModels=PACK_BASES.map((p,i)=>{const r=createRobot(m,{reach:[1.3,1.4,1.5][i],gripWidth:i===1?.145:.5,gripTravel:i===1?.012:.036,color:i===1?0xd2dce0:0xc53035});put(r.group,p);robots.add(r.group);return r;});
  const palletObject=pallet(m);put(palletObject,[-3,0,1.3]);mechanics.add(palletObject);
  const crates=Array.from({length:4},()=>{const c=crate(m);group.add(c.group);const cargo=Array.from({length:4},(_,i)=>{const part=housingPart(m);part.scale.setScalar(.65);put(part,[(i%2?1:-1)*.10,.04,(i<2?-1:1)*.075]);c.group.add(part);batchRigid(part);return part;});return {...c,cargo};});
  const feedParts=Array.from({length:16},()=>{const p=housingPart(m);p.scale.setScalar(.65);group.add(p);batchRigid(p);return p;});
  const moving=housingPart(m);moving.scale.setScalar(.65);group.add(moving);batchRigid(moving);
  const cab=cabinet(m);put(cab,[1.55,0,-1.4]);controls.add(cab);
  // Station stops, pneumatic cylinders and mounting plates.
  for(const x of [-2.4,0,2.4]){box(mechanics,m.steel,x,1.55,.48,.18,.12,.18);cylinder(mechanics,m.navy,[x,1.63,.42],.04,.17,'z');box(mechanics,m.amber,x,1.72,.36,.05,.08,.08);}
  // Operator loading area: defined platform, hand trolley, stacked delivery footprint.
  box(structure,m.rubber,-3.3,.012,.35,.7,.025,1.2);box(mechanics,m.steel,-3.4,.15,.35,.55,.055,.55);
  for(const x of [-3.63,-3.17])for(const z of [.12,.58])cylinder(mechanics,m.rubber,[x,.08,z],.075,.04,'x');
  for(const x of [-3.6,-3.2])box(mechanics,m.aluminum,x,.7,.64,.025,1.1,.025);box(mechanics,m.aluminum,-3.4,1.25,.64,.43,.025,.025);
  const operator=new THREE.Group();put(operator,[-3.35,0,.55]);mechanics.add(operator);
  const coat=new THREE.MeshStandardMaterial({color:0x3d6477,roughness:.8}),skin=new THREE.MeshStandardMaterial({color:0xc1a58b,roughness:.9});
  box(operator,coat,0,1.18,0,.34,.46,.22);box(operator,m.dark,0,.9,0,.3,.14,.21);
  for(const x of [-.09,.09]){cylinder(operator,m.dark,[x,.48,0],.07,.75);box(operator,m.rubber,x,.08,-.045,.14,.12,.27);}
  const head=new THREE.Mesh(new THREE.SphereGeometry(.115,20,14),skin);put(head,[0,1.56,0]);operator.add(head);
  const helmet=new THREE.Mesh(new THREE.SphereGeometry(.135,24,12,0,Math.PI*2,0,Math.PI/2),m.amber);put(helmet,[0,1.58,0]);operator.add(helmet);cylinder(operator,m.amber,[0,1.58,0],.15,.018);
  const arms=[-1,1].map(side=>{const upper=cylinder(operator,coat,[0,0,0],.055,1),lower=cylinder(operator,coat,[0,0,0],.045,1),hand=new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),m.rubber);operator.add(hand);return {upper,lower,hand,side};});
  function operatorPose(t){const f=Math.max(0,1-t/3);arms.forEach(({upper,lower,hand,side})=>{const a=V(side*.2,1.34,0),b=V(side*.22+.18*f,1.08,-.12*f),c=V(side*.18+.36*f,.84,-.28*f);for(const [mesh,from,to] of [[upper,a,b],[lower,b,c]]){mesh.position.copy(from).add(to).multiplyScalar(.5);mesh.scale.y=from.distanceTo(to);mesh.quaternion.setFromUnitVectors(V(0,1,0),to.clone().sub(from).normalize());}hand.position.copy(c);});}
  // Arm meshes change pose during the initial manual loading action.
  arms.forEach(a=>{a.upper.userData.dynamic=true;a.lower.userData.dynamic=true;});
  label(group,'BEREITSTELLUNG',[-3.4,1.4,.6],1.35);label(group,'01 / AUFRICHTEN',[4,2.85,0],1.4);label(group,'02 / BEFÜLLEN',[.25,3,-1.4],1.3);label(group,'03 / PALETTIEREN',[-3.45,3,-.3],1.5);
  label(group,'FERTIGTEILE',[0,1.95,-5.65],1.1);
  // Long cable ladder linking the three stations.
  box(structure,m.dark,0,.3,-.65,6.4,.07,.12);for(let x=-3;x<=3;x+=.24)box(structure,m.aluminum,x,.34,-.65,.015,.01,.16);
  function update(time){
    const s=packagingState(time);operatorPose(time);
    robotModels.forEach((r,i)=>{const p=s.robots[i],b=PACK_BASES[i];r.setTarget(p[0]-b[0],p[1]-b[1],p[2]-b[2],s.grips[i]);});
    crates.forEach((c,i)=>{const state=s.crates[i];put(c.group,state.position);c.setFold(state.fold);c.cargo.forEach((p,j)=>p.visible=j<state.filled);});
    const pairCount=Math.floor(s.consumed/2),cycle=Math.min(26,Math.max(0,time-3)-s.index*26),fillTime=cycle-8,slotTime=fillTime%2.4,advance=s.consumed%2===0&&s.movingPart?Math.max(0,Math.min(1,(slotTime-.55)/.65)):1,rows=pairCount-(pairCount>0&&s.movingPart&&s.consumed%2===0?1-advance:0);
    feedParts.forEach((p,i)=>{p.visible=i>=s.consumed;if(p.visible)put(p,[(i%2?1:-1)*.115,1.65,-2.35-(Math.floor(i/2)-rows)*.36]);});
    moving.visible=!!s.movingPart;if(s.movingPart)put(moving,[s.movingPart.position[0],s.movingPart.position[1]-.04875,s.movingPart.position[2]]);
    const unit=v=>Math.max(0,Math.min(1,v)),lowerProgress=unit(time/3);lower.animate(5.8*(lowerProgress*lowerProgress*(3-2*lowerProgress))/.45);
    const traveled=s.index*4.8+2.4*unit((cycle-6.4)/1.6)+2.4*unit((cycle-17.6)/1.8);upper.animate(-traveled/.45);feed.animate(-rows*.36/.45);
    return {...s,caption:s.complete?'Charge vollständig · 4 volle Kisten auf der Palette':`${s.stackRemaining} im Stapel · ${s.loaded} / 16 Teile verpackt · ${s.palletized} / 4 palettiert`,clamped:robotModels.some(r=>r.clamped)};
  }
  [structure,mechanics,robots,controls].forEach(batchRigid);crates.forEach(c=>batchRigid(c.group));
  return {group,structure,mechanics,robots,controls,update,camera:[9,7.2,10],target:[0,1,-1.2],span:10.6,focus:upper.group};
}
function fabricationScene(m){
  const group=new THREE.Group();group.add(table(m,2.1,1.6,.65));
  box(group,m.navy,0,.98,-.62,.65,.66,.3);box(group,m.aluminum,0,1.45,-.62,.42,1.2,.22);
  for(let y=.85;y<1.95;y+=.08)box(group,m.steel,0,y,-.49,.36,.014,.015);
  box(group,m.steel,0,.72,0,1.65,.14,1.0);
  for(let z=-.4;z<.5;z+=.12)box(group,m.dark,0,.795,z,1.6,.012,.02);
  box(group,m.navy,0,.85,0,.85,.11,.65);
  for(const x of [-.31,.31]){box(group,m.steel,x,.97,0,.13,.15,.6);for(const z of [-.23,.23])fastener(group,m,x,1.05,z,.024);}
  const part=housingPart(m);part.scale.setScalar(2);put(part,[0,.91,0]);group.add(part);
  const spindle=new THREE.Group();group.add(spindle);box(spindle,m.red,0,1.66,0,.38,.56,.34);box(spindle,m.navy,0,1.99,0,.25,.15,.26);
  cylinder(spindle,m.bright,[0,1.34,0],.13,.1);cylinder(spindle,m.dark,[0,1.25,0],.075,.08);const tool=cylinder(spindle,m.bright,[0,1.17,0],.025,.1);
  for(let y=1.13;y<1.21;y+=.015){const ring=new THREE.Mesh(new THREE.TorusGeometry(.026,.003,5,20),m.steel);ring.rotation.x=Math.PI/2;ring.position.set(0,y,0);spindle.add(ring);}
  for(const x of [-.15,.15]){cylinder(spindle,m.navy,[x,1.29,.15],.015,.16);cylinder(spindle,m.amber,[x,1.21,.15],.018,.025);}
  label(group,'FERTIGUNG / AUFNAHME + GREIFER',[0,2.24,0],1.55);batchRigid(group);
  return {group,camera:[2.7,2.5,3.3],target:[0,1.05,0],update(progress){spindle.position.x=Math.sin(progress*Math.PI*2)*.15;spindle.position.z=Math.cos(progress*Math.PI*2)*.09;tool.rotation.y=progress*60;}};
}
export function createCadExperience(root){
  const host=root.querySelector('[data-cad-host]'),canvas=root.querySelector('[data-cad-canvas]');
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});}catch(e){host.classList.add('cad-unavailable');root.querySelector('[data-cad-status]').textContent='Die 3D-Ansicht ist auf diesem Gerät nicht verfügbar. Die Prozessschritte können Sie weiterhin unten auswählen.';return {update:()=>null,reset:()=>{}};}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xdfe5e7);scene.fog=new THREE.Fog(0xdfe5e7,24,65);
  scene.add(new THREE.HemisphereLight(0xf2f8ff,0x687580,2.4));
  const key=new THREE.DirectionalLight(0xfff5e8,4.2);key.position.set(4,9,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:25});key.shadow.bias=-.0003;key.shadow.normalBias=.025;scene.add(key);
  const fill=new THREE.DirectionalLight(0xcce4ff,2);fill.position.set(-6,4,0);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xffffff,2.6);rim.position.set(1,6,-7);scene.add(rim);
  const m=createMaterials();const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xd8e0e2,roughness:.85,metalness:.05}));floor.rotation.x=-Math.PI/2;floor.position.y=-.025;floor.receiveShadow=true;scene.add(floor);
  const grid=new THREE.GridHelper(30,60,0xaebdc4,0xc7d1d5);grid.position.y=-.02;scene.add(grid);
  const studio=new THREE.Scene();studio.background=new THREE.Color(0x788591);for(const [p,scale] of [[[0,5,0],[8,.1,8]],[[5,2,0],[.1,4,5]],[[-4,3,-3],[.1,4,4]]]){const panel=new THREE.Mesh(new THREE.BoxGeometry(...scale),new THREE.MeshBasicMaterial({color:0xffffff}));put(panel,p);studio.add(panel);}const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(studio,.05).texture;pmrem.dispose();
  const factory=fabricationScene(m);scene.add(factory.group);
  const camera=new THREE.PerspectiveCamera(36,1,.05,100);const examples={inspection:inspectionScene(m),packaging:packagingScene(m)};Object.values(examples).forEach(s=>scene.add(s.group));
  let current='inspection',view=null,orbitX=0,orbitY=0,drag=null,last=null,renderState=null;
  function resize(){const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();if(last)update(last);}
  function pose(s){
    const target=V(...s.target),offset=V(...s.camera).sub(target);offset.applyAxisAngle(V(0,1,0),orbitX);const sph=new THREE.Spherical().setFromVector3(offset);sph.phi=THREE.MathUtils.clamp(sph.phi+orbitY,.25,1.35);offset.setFromSpherical(sph);
    if(camera.aspect<1.25)offset.multiplyScalar(1.25/camera.aspect);camera.position.copy(target).add(offset);camera.lookAt(target);
  }
  function update(state){
    last=state;current=state.example;const s=examples[current];Object.entries(examples).forEach(([k,v])=>v.group.visible=k===current);
    const development=state.mode==='development',step=state.stage,progress=Math.max(0,Math.min(1,state.stageProgress||0));
    s.structure.visible=true;s.mechanics.visible=!development||step>0;s.robots.visible=!development||step>0;s.controls.visible=!development||step>1;
    s.robots.position.y=development&&step===2?.55:development&&step===4?.55*(1-progress):0;
    s.mechanics.position.y=development&&step===2?.18:development&&step===4?.18*(1-progress):0;
    s.controls.position.x=development&&step===2?.35:0;
    s.group.traverse(o=>{if(o.isMesh&&o.material&&o.material.wireframe!==undefined)o.material.wireframe=development&&step===1;});
    const testTime=current==='inspection'?8:18;
    renderState=s.update(development?(step===5?testTime:0):state.time);
    factory.group.visible=development&&step===3;if(factory.group.visible){s.group.visible=false;factory.update(progress);pose(factory);}else{pose(s);if(state.selectedPart){const positions=current==='inspection'?{gripper:[0,1.7,.45],fixture:[0,1.15,-.95],sensor:[0,3.6,-.95],software:[-2.25,1,-1.05]}:{gripper:[3.4,1.9,0],fixture:[0,1.6,0],sensor:[0,1.7,.4],software:[1.55,1,-1.4]};const focus=V(...positions[state.selectedPart]);camera.position.copy(focus).add(V(2.4,1.8,2.7));camera.lookAt(focus);}}renderer.render(scene,camera);
    host.dataset.example=current;host.dataset.completed=String(!!renderState.complete);host.dataset.clamped=String(!!renderState.clamped);
    root.querySelector('[data-cad-status]').textContent=development?['Anforderung · Material und Ziel','Konzept · Anlagenlayout','Konstruktion · Baugruppen und Schnittstellen','Fertigung · Komponenten im Detail','Montage · Baugruppen zusammenführen','Inbetriebnahme · Funktionen prüfen','Deployment · Bereit für den Betrieb'][step]:renderState.caption;
    return renderState;
  }
  canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY,orbitX,orbitY];canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;orbitX=drag[2]-(e.clientX-drag[0])*.006;orbitY=drag[3]-(e.clientY-drag[1])*.004;if(last)update(last);});
  canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.add('cad-unavailable');});
  canvas.addEventListener('webglcontextrestored',()=>{host.classList.remove('cad-unavailable');if(last)update(last);});
  new ResizeObserver(resize).observe(host);resize();host.classList.add('cad-ready');
  return {update,reset(){orbitX=orbitY=0;if(last)update(last);},getState:()=>renderState};
}
