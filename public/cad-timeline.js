// Pure deterministic choreography. Positions use metres; Y is vertical.
export const INSPECTION_COUNT=4, CRATE_COUNT=4, PARTS_PER_CRATE=4;
export const INSPECTION_DURATION=74, PACKAGING_DURATION=110;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
export const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*ease(t));
const at=(t,a,b,start,end)=>lerp(a,b,(t-start)/(end-start));
export const INSPECTION_BASE=[0,.985,0];
export const INPUTS=[[-1.35,1.0915,.56],[-.99,1.0915,.56],[-1.35,1.0915,.94],[-.99,1.0915,.94]];
export const OUTPUTS=[[.99,1.0915,.56],[1.35,1.0915,.56],[.99,1.0915,.94],[1.35,1.0915,.94]];
export const NEST=[0,1.1215,-.95], PARK=[0,1.7,.45];
const above=p=>[p[0],1.72,p[2]];
export function inspectionState(time){
  time=clamp(time,0,INSPECTION_DURATION);
  const index=Math.min(3,Math.floor(time/18)),t=Math.min(18,time-index*18),input=INPUTS[index],out=OUTPUTS[index],topIn=above(input),topNest=above(NEST),topOut=above(out);
  let tcp=PARK,grip=0,owner='input',clampAmount=0,capture=false,phase=0;
  if(t<.8)tcp=at(t,PARK,topIn,0,.8);
  else if(t<1.5)tcp=at(t,topIn,input,.8,1.5);
  else if(t<1.9){tcp=input;grip=ease((t-1.5)/.4);phase=1;}
  else if(t<2.7){tcp=at(t,input,topIn,1.9,2.7);grip=1;owner='held';phase=1;}
  else if(t<4.1){tcp=at(t,topIn,topNest,2.7,4.1);grip=1;owner='held';phase=1;}
  else if(t<4.9){tcp=at(t,topNest,NEST,4.1,4.9);grip=1;owner='held';phase=2;}
  else if(t<5.3){tcp=NEST;grip=1-ease((t-4.9)/.4);owner='held';phase=2;}
  else if(t<6.1){tcp=at(t,NEST,topNest,5.3,6.1);owner='nest';phase=2;}
  else if(t<7){tcp=at(t,topNest,PARK,6.1,7);owner='nest';phase=2;}
  else if(t<7.4){owner='nest';clampAmount=ease((t-7)/.4);phase=3;}
  else if(t<9){owner='nest';clampAmount=1;capture=true;phase=3;}
  else if(t<9.4){owner='nest';clampAmount=1-ease((t-9)/.4);phase=3;}
  else if(t<10.3){tcp=at(t,PARK,topNest,9.4,10.3);owner='nest';phase=4;}
  else if(t<11.1){tcp=at(t,topNest,NEST,10.3,11.1);owner='nest';phase=4;}
  else if(t<11.5){tcp=NEST;grip=ease((t-11.1)/.4);owner='nest';phase=4;}
  else if(t<12.3){tcp=at(t,NEST,topNest,11.5,12.3);grip=1;owner='held';phase=4;}
  else if(t<13.8){tcp=at(t,topNest,topOut,12.3,13.8);grip=1;owner='held';phase=4;}
  else if(t<14.6){tcp=at(t,topOut,out,13.8,14.6);grip=1;owner='held';phase=4;}
  else if(t<15){tcp=out;grip=1-ease((t-14.6)/.4);owner='held';phase=4;}
  else if(t<15.8){tcp=at(t,out,topOut,15,15.8);owner='output';phase=4;}
  else if(t<17){tcp=at(t,topOut,PARK,15.8,17);owner='output';phase=4;}
  else{owner='output';phase=4;}
  const parts=INPUTS.map((p,i)=>({id:i,owner:i<index?'output':i>index?'input':owner,position:i<index?OUTPUTS[i]:i>index?p:owner==='held'?tcp:owner==='nest'?NEST:owner==='output'?out:p}));
  return {tcp,grip,parts,clampAmount,capture,phase,index,complete:time>=72,processed:parts.filter(p=>p.owner==='output').length};
}
export const LOWER=.65,UPPER=1.65,CRATE_HEIGHT=.34,FOLDED_HEIGHT=.10;
export const PACK_BASES=[[4,0,-.5],[0,0,-1.4],[-3.4,0,-.3]];
export const PACK_PARKS=[[3.6,2.25,-.5],[.7,2.1,-1.0],[-3.15,2.2,.35]];
export const FEED_PICK=[0,1.69875,-2.35];
export const palletSlot=i=>[-3.28+(i%2)*.56,.14+Math.floor(i/2)*CRATE_HEIGHT,1.3];
const crateTop=p=>[p[0],p[1]+CRATE_HEIGHT,p[2]];
export function packagingState(time){
  time=clamp(time,0,PACKAGING_DURATION);
  const local=Math.max(0,time-3),index=Math.min(3,Math.floor(local/26)),t=Math.min(26,local-index*26),started=time>=3;
  const stackX=time<3?-2.4+5.8*ease(time/3):3.4;
  const stackBase=[stackX,LOWER+.01,0],pick=[3.4,LOWER+.01+(3-index)*FOLDED_HEIGHT+FOLDED_HEIGHT,0],drop=[2.4,UPPER+.01,0],fill=[0,UPPER+.01,0],pickup=[-2.4,UPPER+.01,0],dest=palletSlot(index);
  let r1=PACK_PARKS[0],r2=PACK_PARKS[1],r3=PACK_PARKS[2],g1=0,g2=0,g3=0,phase=0,owner='stack',fold=0,box=[...pick],filled=0,movingPart=null;
  if(started){
    phase=1;
    if(t<1)r1=at(t,PACK_PARKS[0],pick,0,1);
    else if(t<1.4){r1=pick;g1=ease((t-1)/.4);}
    else if(t<2.4){r1=at(t,pick,[3.4,1.45,0],1.4,2.4);g1=1;owner='erector';}
    else if(t<4){r1=at(t,[3.4,1.45,0],[3.4,2.25,0],2.4,4);g1=1;owner='erector';fold=ease((t-2.4)/1.6);}
    else if(t<5.4){r1=at(t,[3.4,2.25,0],crateTop(drop),4,5.4);g1=1;owner='erector';fold=1;}
    else if(t<5.8){r1=crateTop(drop);g1=1-ease((t-5.4)/.4);owner='erector';fold=1;}
    else if(t<6.4){r1=at(t,crateTop(drop),PACK_PARKS[0],5.8,6.4);owner='upper';fold=1;box=drop;}
    else if(t<8){owner='upper';fold=1;box=at(t,drop,fill,6.4,8);phase=2;}
    else if(t<17.6){
      owner='filling';fold=1;box=fill;phase=3;
      const n=Math.min(3,Math.floor((t-8)/2.4)),p=(t-8)-n*2.4,source=[n%2?.115:-.115,FEED_PICK[1],FEED_PICK[2]],target=[(n%2?1:-1)*.10,UPPER+.09875,(n<2?-1:1)*.075],lift=[source[0],2.25,-2.35],over=[target[0],2.25,target[2]];
      filled=n+(p>=1.95?1:0);
      if(p<.35)r2=at(p,PACK_PARKS[1],source,0,.35);
      else if(p<.55){r2=source;g2=ease((p-.35)/.2);}
      else if(p<.9){r2=at(p,source,lift,.55,.9);g2=1;}
      else if(p<1.4){r2=at(p,lift,over,.9,1.4);g2=1;}
      else if(p<1.75){r2=at(p,over,target,1.4,1.75);g2=1;}
      else if(p<1.95){r2=target;g2=1-ease((p-1.75)/.2);}
      else if(p<2.15)r2=at(p,target,over,1.95,2.15);
      else r2=at(p,over,PACK_PARKS[1],2.15,2.4);
      if(p>=.55&&p<1.95)movingPart={id:index*4+n,position:r2};
    }
    else if(t<19.4){owner='upper';fold=1;filled=4;box=at(t,fill,pickup,17.6,19.4);phase=4;}
    else{
      phase=5;owner='upper';fold=1;filled=4;box=pickup;
      const grasp=crateTop(pickup),high=[-2.4,2.5,0],aboveDest=[dest[0],2.5,dest[2]],place=crateTop(dest);
      if(t<20.2)r3=at(t,PACK_PARKS[2],grasp,19.4,20.2);
      else if(t<20.6){r3=grasp;g3=ease((t-20.2)/.4);}
      else if(t<21.3){r3=at(t,grasp,high,20.6,21.3);g3=1;owner='palletizer';}
      else if(t<23){r3=at(t,high,aboveDest,21.3,23);g3=1;owner='palletizer';}
      else if(t<23.6){r3=at(t,aboveDest,place,23,23.6);g3=1;owner='palletizer';}
      else if(t<24){r3=place;g3=1-ease((t-23.6)/.4);owner='palletizer';}
      else if(t<25){r3=at(t,place,aboveDest,24,25);owner='pallet';box=dest;}
      else{r3=at(t,aboveDest,PACK_PARKS[2],25,26);owner='pallet';box=dest;}
    }
  }
  if(owner==='erector')box=[r1[0],r1[1]-(FOLDED_HEIGHT+(CRATE_HEIGHT-FOLDED_HEIGHT)*fold),r1[2]];
  if(owner==='palletizer')box=[r3[0],r3[1]-CRATE_HEIGHT,r3[2]];
  const crates=Array.from({length:4},(_,i)=>i<index?{id:i,owner:'pallet',position:palletSlot(i),fold:1,filled:4}:i===index&&owner!=='stack'?{id:i,owner,position:box,fold,filled}:{id:i,owner:'stack',position:[stackBase[0],stackBase[1]+(3-i)*FOLDED_HEIGHT,0],fold:0,filled:0});
  const loaded=crates.reduce((n,c)=>n+c.filled,0),consumed=loaded+(movingPart?1:0);
  return {robots:[r1,r2,r3],grips:[g1,g2,g3],crates,movingPart,consumed,loaded,index,phase,stackRemaining:crates.filter(c=>c.owner==='stack').length,palletized:crates.filter(c=>c.owner==='pallet').length,complete:time>=107};
}
