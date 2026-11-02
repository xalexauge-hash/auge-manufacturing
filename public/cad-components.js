import * as THREE from './vendor/three.module.js';

// Shared geometries keep repeated machine details inexpensive on mobile GPUs.
const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 24),
  hex: new THREE.CylinderGeometry(1, 1, 1, 6),
  sphere: new THREE.SphereGeometry(1, 16, 10),
  ring: new THREE.TorusGeometry(1, .045, 6, 32),
  bore: new THREE.TorusGeometry(.015,.004,6,16)
};
const UP = new THREE.Vector3(0, 1, 0);
const clamp = THREE.MathUtils.clamp;

export function createMaterials() {
  const material = (color, metalness, roughness) => new THREE.MeshStandardMaterial({color, metalness, roughness});
  return {
    aluminum: material(0xbac5cd, .78, .28),
    steel: material(0x6f8290, .82, .25),
    bright: material(0xe2e8e9, .72, .2),
    dark: material(0x142b38, .55, .36),
    navy: material(0x213d4e, .38, .31),
    red: material(0xc53035, .24, .3),
    rubber: material(0x242b30, .02, .83),
    black: material(0x101820, .3, .4),
    plastic: material(0x668b9e, .08, .43),
    crate: material(0x447984, .08, .48),
    wood: material(0xa58861, .02, .84),
    woodLight: material(0xc0a075, .02, .8),
    amber: material(0xe9ac3b, .18, .3),
    green: new THREE.MeshStandardMaterial({color:0x7de2ba,emissive:0x2ea279,emissiveIntensity:.65,roughness:.3}),
    display: new THREE.MeshStandardMaterial({color:0x173f51,emissive:0x0c3448,emissiveIntensity:.45,metalness:.1,roughness:.35}),
    glass: new THREE.MeshPhysicalMaterial({color:0xadd2df,metalness:0,roughness:.1,transparent:true,opacity:.15,depthWrite:false,side:THREE.DoubleSide})
  };
}

function mesh(parent, geometry, material, x, y, z, sx, sy, sz) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x,y,z); object.scale.set(sx,sy,sz);
  object.castShadow = true; object.receiveShadow = true;
  parent.add(object); return object;
}
export function box(parent, material, x,y,z,w,h,d) { return mesh(parent,GEO.box,material,x,y,z,w,h,d); }
function cylinder(parent, material, x,y,z,r,h,axis='y') {
  const object=mesh(parent,GEO.cylinder,material,x,y,z,r,h,r);
  if(axis==='z')object.rotation.x=Math.PI/2;
  if(axis==='x')object.rotation.z=Math.PI/2;
  return object;
}
export function fastener(parent, materials, x,y,z,r=.014,axis='y') {
  const washer=cylinder(parent,materials.steel,x,y,z,r*1.4,r*.18,axis);
  const offset = r*.34;
  const bolt=mesh(parent,GEO.hex,materials.bright,x+(axis==='x'?offset:0),y+(axis==='y'?offset:0),z+(axis==='z'?offset:0),r,r*.5,r);
  if(axis==='x')bolt.rotation.z=Math.PI/2;
  if(axis==='z')bolt.rotation.x=Math.PI/2;
  return washer;
}
function link(parent, material, a,b,r) {
  const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);
  const object=mesh(parent,GEO.cylinder,material,...av.add(bv).multiplyScalar(.5).toArray(),r,delta.length(),r);
  object.quaternion.setFromUnitVectors(UP,delta.normalize());return object;
}
function cable(parent, material, points, radius=.012) {
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const object=new THREE.Mesh(new THREE.TubeGeometry(curve,18,radius,6,false),material);
  parent.add(object);return object;
}

export function extrusion(materials,length=1) {
  const group=new THREE.Group();
  box(group,materials.aluminum,0,length/2,0,.068,length,.068);
  // Four T-slot channels, kept open at the top and bottom of each extrusion.
  box(group,materials.dark,.0343,length/2,0,.001,length,.012);
  box(group,materials.dark,-.0343,length/2,0,.001,length,.012);
  box(group,materials.dark,0,length/2,.0343,.012,length,.001);
  box(group,materials.dark,0,length/2,-.0343,.012,length,.001);
  return group;
}

export function createRobot(materials,{color,reach=1,gripWidth=.22,gripTravel=.036}={}) {
  reach=Math.max(.2,reach);
  const group=new THREE.Group(),body=new THREE.Group();group.add(body);body.scale.setScalar(reach);
  const paint=color!==undefined?new THREE.MeshStandardMaterial({color,metalness:.24,roughness:.3}):materials.red;
  box(body,materials.dark,0,.045,0,.53,.09,.48);
  for(const x of [-.21,.21])for(const z of [-.185,.185])fastener(body,materials,x,.095,z,.021);
  cylinder(body,materials.navy,0,.17,0,.2,.25);
  cylinder(body,materials.steel,0,.305,0,.22,.025);
  const yaw=new THREE.Group();yaw.position.y=.32;body.add(yaw);
  cylinder(yaw,paint,0,.11,0,.18,.21);
  box(yaw,paint,0,.225,0,.28,.17,.28);
  box(yaw,materials.navy,-.2,.07,0,.17,.19,.22);
  for(let i=0;i<5;i++)box(yaw,materials.black,-.29,.018+i*.027,0,.009,.012,.17);
  const shoulder=new THREE.Group();shoulder.position.y=.28;yaw.add(shoulder);
  const joint=(parent,x,r=.14)=>{
    cylinder(parent,paint,x,0,0,r,.3,'z');
    cylinder(parent,materials.aluminum,x,0,.163,r*.82,.028,'z');
    cylinder(parent,materials.dark,x,0,.183,r*.42,.018,'z');
    for(let i=0;i<6;i++){const a=i*Math.PI/3;fastener(parent,materials,x+Math.cos(a)*r*.64,Math.sin(a)*r*.64,.184,.009,'z');}
  };
  joint(shoulder,0,.17);
  const upper=new THREE.Group();shoulder.add(upper);
  box(upper,paint,.52,0,0,.9,.19,.2);
  box(upper,materials.navy,.51,-.105,0,.74,.024,.14);
  box(upper,materials.aluminum,.52,0,.104,.62,.09,.012);
  for(const x of [.24,.8])for(const y of [-.055,.055])fastener(upper,materials,x,y,.119,.009,'z');
  cylinder(upper,materials.navy,.11,.14,-.08,.055,.14,'z');
  cable(upper,materials.rubber,[[.03,.16,-.08],[.28,.2,-.08],[.84,.17,-.08],[1.04,.09,-.08]],.022);
  const elbow=new THREE.Group();elbow.position.x=1.05;upper.add(elbow);joint(elbow,0,.14);
  const forearm=new THREE.Group();elbow.add(forearm);
  box(forearm,paint,.435,0,0,.77,.14,.145);
  box(forearm,materials.aluminum,.44,0,.075,.57,.082,.016);
  for(const x of [.2,.68])fastener(forearm,materials,x,0,.087,.01,'z');
  cable(forearm,materials.rubber,[[0,.13,-.07],[.22,.15,-.07],[.65,.13,-.07],[.9,.06,-.07]],.018);
  cylinder(forearm,materials.dark,.83,0,0,.09,.15,'x');
  cylinder(forearm,paint,.91,0,0,.095,.08,'x');
  const wrist=new THREE.Group();wrist.position.x=.95;forearm.add(wrist);
  cylinder(wrist,materials.steel,0,-.045,0,.075,.085);
  cylinder(wrist,materials.dark,0,-.09,0,.067,.025);
  cylinder(wrist,materials.aluminum,0,-.112,0,.072,.016);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;fastener(wrist,materials,Math.cos(a)*.054,-.122,Math.sin(a)*.054,.007);}
  const tool=new THREE.Group();tool.position.y=-.23;tool.scale.setScalar(1/reach);wrist.add(tool);
  box(tool,materials.navy,0,.085,0,gripWidth+.04,.08,.14);
  box(tool,materials.aluminum,0,.039,0,gripWidth+.065,.015,.11);
  cylinder(tool,materials.amber,.09,.1,.08,.014,.03,'z');
  const jaws=[-1,1].map(side=>{
    const jaw=new THREE.Group();tool.add(jaw);jaw.userData.side=side;
    box(jaw,materials.steel,0,.005,0,.025,.095,.075);
    box(jaw,materials.rubber,-side*.016,-.008,0,.009,.052,.062);
    fastener(jaw,materials,side*.017,.026,0,.009,'x');return jaw;
  });
  const actualTCP=new THREE.Vector3();
  const result={group,tool,actualTCP,clamped:false,setTarget};
  function setTarget(x,y,z,grip=0) {
    if(![x,y,z,grip].every(Number.isFinite))return actualTCP;
    const targetX=x/reach,targetY=y/reach,targetZ=z/reach;
    const radial=Math.hypot(targetX,targetZ),dy=targetY+.23-.6;
    yaw.rotation.y=-Math.atan2(targetZ,targetX);
    // Wrist-axis compensation keeps a carried part aligned with its fixture/crate.
    tool.rotation.y=-yaw.rotation.y;
    const rawD=Math.hypot(radial,dy),d=clamp(rawD,.10001,1.99999);
    result.clamped=Math.abs(d-rawD)>.0001;
    const angle=Math.atan2(dy,radial),a=angle+Math.acos(clamp((1.05*1.05+d*d-.95*.95)/(2*1.05*d),-1,1));
    const b=-Math.acos(clamp((d*d-1.05*1.05-.95*.95)/(2*1.05*.95),-1,1));
    upper.rotation.z=a;forearm.rotation.z=b;wrist.rotation.z=-(a+b);
    jaws.forEach(j=>{j.position.x=j.userData.side*(gripWidth/2+.02+gripTravel*(1-clamp(grip,0,1)));});
    group.updateMatrixWorld(true);tool.getWorldPosition(actualTCP);return actualTCP;
  }
  setTarget(1,.9,0,0);return result;
}

export function conveyor(materials,{length=5,width=.9,height=1.1}={}) {
  const group=new THREE.Group(),moving=[];
  box(group,materials.rubber,0,height-.026,0,length,.052,width-.1);
  for(const side of [-1,1]) {
    box(group,materials.aluminum,0,height-.08,side*width/2,length+.14,.17,.055);
    box(group,materials.dark,0,height+.009,side*(width/2-.014),length+.08,.023,.03);
    for(let x=-length/2+.12;x<length/2;x+=.4)fastener(group,materials,x,height-.08,side*(width/2+.033),.012,'z');
  }
  for(const x of [-length/2,length/2]) {
    cylinder(group,materials.steel,x,height-.05,0,.065,width+.04,'z');
    for(const side of [-1,1]){
      box(group,materials.navy,x,height-.05,side*(width/2+.03),.12,.12,.055);
      cylinder(group,materials.bright,x,height-.05,side*(width/2+.065),.025,.018,'z');
    }
  }
  const legCount=Math.max(2,Math.ceil(length/2));
  for(let i=0;i<legCount;i++){
    const x=-length/2+.2+(length-.4)*i/(legCount-1);
    for(const side of [-1,1]){
      const leg=extrusion(materials,Math.max(.1,height-.15));leg.position.set(x,.07,side*(width/2-.04));group.add(leg);
      cylinder(group,materials.steel,x,.045,side*(width/2-.04),.013,.07);
      cylinder(group,materials.rubber,x,.012,side*(width/2-.04),.045,.024);
    }
    box(group,materials.aluminum,x,.26,0,.052,.052,width-.08);
  }
  // Gear motor, drive shaft, cable channel and discrete presence sensors.
  box(group,materials.navy,length/2-.08,height-.19,width/2+.13,.19,.2,.2);
  cylinder(group,materials.steel,length/2-.08,height-.19,width/2+.31,.075,.2,'z');
  for(let i=0;i<6;i++)cylinder(group,materials.navy,length/2-.08,height-.19,width/2+.23+i*.026,.082,.008,'z');
  box(group,materials.dark,0,height-.25,-width/2-.025,length-.1,.07,.08);
  for(const x of [-length*.38,length*.32]){
    box(group,materials.amber,x,height+.075,width/2,.055,.07,.04);
    cylinder(group,materials.green,x,height+.075,width/2-.024,.012,.006,'z');
    link(group,materials.steel,[x,height-.12,width/2],[x,height+.075,width/2],.012);
  }
  const count=Math.max(4,Math.ceil(length/.26));
  for(let i=0;i<count;i++){const strip=box(group,materials.steel,0,height+.002,0,.006,.003,width-.12);strip.userData.dynamic=true;moving.push(strip);}
  function animate(t){moving.forEach((m,i)=>{m.position.x=((i/count*length+t*.45)%length+length)%length-length/2;});}
  animate(0);return {group,animate};
}

export function housingPart(materials) {
  const group=new THREE.Group();
  // An actual hollow tray: floor, four pocket walls, two drilled mounting ears.
  box(group,materials.aluminum,0,.015,0,.22,.03,.18);
  box(group,materials.bright,-.101,.075,0,.018,.12,.18);
  box(group,materials.bright,.101,.075,0,.018,.12,.18);
  box(group,materials.aluminum,0,.075,-.081,.184,.12,.018);
  box(group,materials.aluminum,0,.075,.081,.184,.12,.018);
  box(group,materials.steel,0,.032,0,.178,.004,.138);
  for(const x of [-.067,.067])for(const z of [-.048,.048]){
    const washer=new THREE.Mesh(GEO.bore,materials.bright);
    washer.rotation.x=Math.PI/2;washer.position.set(x,.036,z);group.add(washer);
    cylinder(group,materials.dark,x,.035,z,.01,.003);
  }
  for(const x of [-.105,.105])for(const z of [-.06,.06]){
    box(group,materials.bright,x,.025,z,.04,.015,.044);
    cylinder(group,materials.dark,x,.034,z,.006,.003);
  }
  return group;
}

export function crate(materials) {
  const group=new THREE.Group(),hinges=[];
  box(group,materials.crate,0,.018,0,.5,.036,.4);
  for(let x=-.21;x<.24;x+=.06)box(group,materials.navy,x,.002,0,.012,.015,.36);
  function wall(side,isLong){
    const g=new THREE.Group(),w=isLong?.5:.36;
    // The lower wall's pivot is at its bottom edge, so folding is geometric.
    g.position.set(isLong?0:side*.235,.035,isLong?side*.185:0);
    const face=new THREE.Group();g.add(face);
    if(!isLong)face.rotation.y=Math.PI/2;
    box(face,materials.crate,0,.115,0,w,.23,.018);
    // Handle opening is built from separate solids instead of a painted rectangle.
    box(face,materials.crate,-w*.36,.26,0,w*.28,.06,.024);
    box(face,materials.crate,w*.36,.26,0,w*.28,.06,.024);
    box(face,materials.crate,0,.298,0,w,.018,.03);
    box(face,materials.navy,0,.226,0,w,.013,.026);
    for(let x=-w/2+.035;x<w/2;x+=.055)box(face,materials.navy,x,.12,side*.013,.009,.2,.009);
    box(face,materials.crate,0,.045,side*.017,w,.014,.018);
    box(face,materials.crate,0,.19,side*.017,w,.014,.018);
    for(const x of [-w*.37,w*.37])cylinder(face,materials.steel,x,0,0,.012,.032,'x');
    group.add(g);hinges.push({g,side,isLong});
  }
  wall(-1,true);wall(1,true);wall(-1,false);wall(1,false);
  function setFold(amount){
    const t=clamp(amount,0,1);
    hinges.forEach(({g,side,isLong},i)=>{
      // Short end walls unfold first; long walls follow with a short offset.
      const local=clamp((t-(isLong?.18:0))/(isLong?.82:.8),0,1),angle=(1-local)*Math.PI/2;
      if(isLong){g.rotation.x=-side*angle;g.position.y=.035+(1-local)*(side<0?.025:.045);}
      else{g.rotation.z=side*angle;g.position.y=.035+(1-local)*(side<0?.005:.013);}
    });
  }
  setFold(1);return {group,setFold};
}

export function pallet(materials) {
  const group=new THREE.Group();
  for(const z of [-.4,0,.4])box(group,materials.wood,0,.016,z,1.2,.032,.16);
  for(const x of [-.47,0,.47])for(const z of [-.4,0,.4])box(group,materials.wood,x,.07,z,.15,.08,.15);
  for(const x of [-.47,0,.47])box(group,materials.woodLight,x,.115,0,.15,.025,1);
  for(let z=-.44;z<=.45;z+=.22){
    box(group,materials.woodLight,0,.139,z,1.2,.023,.18);
    for(const x of [-.47,0,.47])for(const dz of [-.05,.05])cylinder(group,materials.steel,x,.151,z+dz,.005,.001);
  }
  return group;
}

export function cabinet(materials) {
  const group=new THREE.Group();
  box(group,materials.navy,0,.07,0,.68,.14,.43);
  box(group,materials.aluminum,0,.72,0,.66,1.3,.4);
  box(group,materials.bright,0,.75,.207,.61,1.2,.018);
  box(group,materials.dark,0,1.08,.225,.4,.27,.026);
  box(group,materials.display,0,1.08,.243,.34,.21,.01);
  for(let y=1.02;y<1.16;y+=.035)box(group,materials.green,-.04,y,.251,.18,.007,.002);
  box(group,materials.black,.23,.75,.239,.024,.17,.025);
  for(const x of [-.17,-.06,.05])cylinder(group,x===-.17?materials.green:materials.rubber,x,.85,.239,.023,.014,'z');
  cylinder(group,materials.amber,.18,.85,.239,.04,.014,'z');cylinder(group,materials.red,.18,.85,.253,.025,.025,'z');
  for(let y=.23;y<.49;y+=.035)box(group,materials.dark,0,y,.22,.45,.011,.006);
  for(const x of [-.285,.285])for(const y of [.18,1.32])fastener(group,materials,x,y,.224,.01,'z');
  for(const y of [.37,1.16])box(group,materials.steel,-.315,y,.21,.025,.08,.032);
  cylinder(group,materials.dark,.23,1.47,0,.014,.21);cylinder(group,materials.green,.23,1.59,0,.035,.06);cylinder(group,materials.amber,.23,1.65,0,.035,.06);
  return group;
}
