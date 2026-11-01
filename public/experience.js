(() => {
  'use strict';
  const inspectionStages = [
    ['Gehäuseteile zuverlässig prüfen.', 'Ein gefrästes Gehäuseteil kommt in definierter Lage an. Die Aufgabe: entnehmen, in einer Prüfaufnahme positionieren, ein optisches Merkmal erfassen und das geprüfte Teil ablegen. Teilevarianten, Prüfmerkmal und Fehlerreaktion werden zuerst festgelegt.', 'Ein klar abgegrenzter Prüf- und Handhabungsauftrag.', 'ANFORDERUNGEN'],
    ['Drei Stationen. Ein Materialfluss.', 'Eine geordnete Zuführung, eine definierte Prüfaufnahme und eine getrennte Ablage bilden den Ablauf. Die Draufsicht zeigt, warum Reichweite, Zugänglichkeit und Freiraum für Greifer und Kamera gemeinsam geplant werden.', 'Ein Stationslayout mit eindeutigen Übergaben.', 'KONZEPT'],
    ['Greifer und Aufnahme aufeinander abstimmen.', 'Formangepasste Greiferbacken halten das Gehäuse an geeigneten Außenflächen. Die Aufnahme legt seine Position zur Kamera fest. Befestigungen, Bezugspunkte und Freiräume werden so konstruiert, dass Greifen und Prüfen sich nicht behindern.', 'Ausgearbeitete Greiferbacken und Werkstückaufnahme.', 'KONSTRUKTION'],
    ['Die Schnittstelle wird ein reales Bauteil.', 'Greiferbacken, Adapter und Aufnahme können als CNC-gefertigte Komponenten entstehen. Bezugselemente und funktionsrelevante Maße werden abgestimmt; anschließend wird das Zusammenspiel mit dem realen Musterteil erprobt.', 'Mechanische Komponenten für Montage und Erprobung.', 'FERTIGUNG'],
    ['Greifen. Positionieren. Prüfen. Ablegen.', 'Das Teil bewegt sich mit dem Greifer zur Aufnahme. Erst nach dem Ablegen und Zurückziehen wird die optische Prüfung ausgelöst. Nach der Freigabe übernimmt der Roboter das Teil erneut und legt es im Ausgang ab. Die Darstellung zeigt den Gutteilpfad.', 'Ein aufeinander abgestimmter Ablauf mit klaren Freigaben.', 'ZUSAMMENSPIEL']
  ];
  const parts = {
    gripper: ['Das Werkstück sicher handhaben.', 'Geometrie, Gewicht und Oberfläche bestimmen die Greifaufgabe. Zugänglichkeit, Teilevarianten und die Übergabe an die nächste Station fließen in das Konzept ein.', 'Welche Flächen dürfen berührt werden – und in welcher Lage kommt das Teil an?'],
    fixture: ['Die richtige Lage ist kein Zufall.', 'Eine passende Werkstückaufnahme stellt Bezüge her und macht den Prozess wiederholbar. Einlegen, Entnehmen, Bauteilvarianten und Fertigbarkeit werden zusammen betrachtet.', 'Welche Bezugspunkte braucht der Prozess, und wie wird das Werkstück gehalten?'],
    sensor: ['Der Prozess braucht Rückmeldung.', 'Sensorik kann Anwesenheit, Lage oder einen Prozesszustand erfassen. Wir klären, welche Information benötigt wird und wie sie sich in den Ablauf einbinden lässt.', 'Was muss vor dem nächsten Schritt zuverlässig erkannt werden?'],
    software: ['Aus Bewegung wird ein Ablauf.', 'Zustände, Freigaben und Schnittstellen verbinden die einzelnen Funktionen. Neben dem Normalablauf gehören verständliche Rückmeldungen und der Umgang mit Unterbrechungen zur Aufgabenklärung.', 'Wie reagiert der Prozess, wenn ein Teil fehlt oder ein Schritt unterbrochen wird?']
  };

  const packagingStages = [
    ['Vom Kistenstapel zur vollen Palette.', 'Mitarbeitende stellen Stapel zusammengefalteter Kisten auf der unteren Förderebene bereit. Fertigteile kommen über eine separate Zuführung. Ziel ist ein durchgängiger Ablauf bis zur beladenen Palette.', 'Kistenformat, Teilezahl und Übergabepunkte festlegen.', 'AUFGABE'],
    ['Zwei Ebenen organisieren den Materialfluss.', 'Die untere Ebene führt Kistenstapel zum Aufrichtroboter. Oben laufen die aufgerichteten Kisten in Gegenrichtung: zuerst zur Befüllung, anschließend zur Palettierung. Die Teilezuführung bleibt separat.', 'Ein Anlagenlayout mit drei Roboterstationen.', 'KONZEPT'],
    ['Übergaben bis zum Greifer durchdenken.', 'Vereinzelung, Aufrichtgreifer, Kistenanschläge und Teilegreifer werden auf die Geometrien abgestimmt. Für die Palettierung sind Greifzugang, Lagenbild und Traglast maßgeblich.', 'Abgestimmte Baugruppen und klare Schnittstellen.', 'KONSTRUKTION'],
    ['Die passenden Komponenten fertigen.', 'Adapterplatten, Greiferfinger, Führungen und Halter werden konstruiert, gefertigt und mit realen Kisten und Musterteilen erprobt. Die Fördertechnik und Roboter werden zu einer Anlage montiert.', 'Geprüfte Komponenten für Montage und Integration.', 'FERTIGUNG'],
    ['Drei Roboter arbeiten zusammen.', 'Die Steuerung gibt Kisten und Teile stationsweise frei. Der Befüllroboter zählt die eingelegten Teile; erst die volle Kiste fährt weiter. Der Palettierroboter übernimmt sie am definierten Übergabepunkt.', 'Ein abgestimmter Ablauf vom Stapel bis zur Palette.', 'ZUSAMMENSPIEL']
  ];
  const inspectionLabels=['Bauteil bereit · geordnete Zuführung','Greifer geschlossen · Teil wird übernommen','Teil in der Aufnahme · Greifer zieht zurück','Optische Prüfung · Teil liegt ruhig in der Aufnahme','Gutteil übernehmen und zur Ablage führen'];
  const packagingLabels=['Kistenstapel bereitstellen und unten zuführen','Eine Kiste vereinzeln, aufrichten und nach oben übergeben','Leere Kiste zur Befüllstation fördern','Vier Fertigteile nacheinander in die Kiste einlegen','Volle Kiste zur Palettierstation fördern','Volle Kiste übernehmen und auf der Palette absetzen'];
  const operationCopy={
    inspection:[['Bereitstellen','Ein Gehäuseteil liegt definiert in der Zuführung. Der Roboter fährt zur Greifposition.'],['Greifen und transportieren','Die Greiferbacken schließen. Das Teil wird übernommen und zur Prüfaufnahme geführt.'],['Positionieren','Das Teil wird in der Aufnahme abgelegt. Der Roboter zieht sich aus dem Prüfbereich zurück.'],['Prüfen','Das Werkstück liegt ruhig. Die Kamera erfasst das vorgesehene Merkmal.'],['Ablegen','Nach der Freigabe übernimmt der Roboter das Gutteil und legt es in der Ausgangsaufnahme ab.']],
    packaging:[['Kistenstapel zuführen','Mitarbeitende geben den Stapel auf die untere Ebene. Das Förderband bringt ihn zum ersten Roboter.'],['Kiste aufrichten','Roboter 01 nimmt die oberste gefaltete Kiste, richtet sie auf und setzt sie auf der oberen Förderebene ab.'],['Zur Befüllung fördern','Die leere Kiste fährt auf der oberen Ebene zur zweiten Station und wird dort angehalten.'],['Kiste befüllen','Roboter 02 übernimmt nacheinander vier Musterteile vom separaten Teileband. Die Kiste bleibt während der Befüllung stehen.'],['Volle Kiste freigeben','Nach dem vierten Teil gibt die Steuerung die Kiste frei. Sie fährt zur Palettierstation.'],['Palettieren','Roboter 03 hebt die volle Kiste vom oberen Band und setzt sie auf der Palette ab. Danach folgt das nächste Anwendungsbeispiel.']]
  };
  const packagingParts = {
    gripper: ['Drei Aufgaben. Drei passende Greifer.', 'Aufrichten, Teile einlegen und volle Kisten palettieren stellen unterschiedliche Anforderungen an Greifflächen, Traglast und Freiraum.', 'Wie werden gefaltete Kisten vereinzelt und volle Kisten sicher gehalten?'],
    fixture: ['Zwei Ebenen mit definierten Übergaben.', 'Führungen und Anschläge positionieren die Kiste an jeder Station. Die separate Teilezuführung wird mit dem Befüllablauf abgestimmt.', 'Wo braucht es Puffer, Positionierung und eine eindeutige Freigabe?'],
    sensor: ['Jede Übergabe bestätigen.', 'Kistenanwesenheit, Aufrichtzustand, Teilezahl und Palettenposition liefern die Rückmeldungen für den nächsten Schritt.', 'Welche Zustände müssen vor dem Weitertransport bestätigt sein?'],
    software: ['Drei Roboter zu einem Ablauf verbinden.', 'Stationsfreigaben, Teilezählung und das Palettiermuster werden zusammengeführt. Auch fehlende Kisten und Unterbrechungen gehören zum Ablauf.', 'Wie läuft die Anlage nach einer Unterbrechung kontrolliert weiter?']
  };
  document.querySelectorAll('[data-experience]').forEach(root=>{
    if(root.classList.contains('ax-ready'))return;
    const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const motion=q('[data-motion]'),stageButtons=all('[data-stage-button]'),cycleButtons=all('[data-cycle]');
    let currentCase='inspection',mode='development',stage=0,elapsed=0,lastTime=0,lastPhase=-1,visible=false,paused=reduced.matches,raf=0;
    const stageDuration=4,operationDuration=()=>currentCase==='inspection'?13:29;
    const setText=(s,v)=>{q(s).textContent=v;};
    const mix=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
    function point(t,a,b){const u=smooth(Math.max(0,Math.min(1,t)));return [mix(a[0],b[0],u),mix(a[1],b[1],u)];}
    function updateMotion(){root.dataset.paused=String(paused||reduced.matches);motion.textContent=reduced.matches?'Reduzierte Bewegung aktiv':paused?'Animation fortsetzen':'Animation pausieren';motion.disabled=reduced.matches;}
    function updateOperationStory(index){
      if(mode!=='operation')return;
      const entry=operationCopy[currentCase][index];
      setText('[data-story-title]',entry[0]);setText('[data-story-text]',entry[1]);
      setText('[data-story-result]',`${index+1} / ${operationCopy[currentCase].length} · ${currentCase==='inspection'?'Bauteile prüfen':'Kisten aufrichten, befüllen & palettieren'}`);
      setText('[data-scene-label]',`B / ${entry[0].toUpperCase()}`);
    }
    function showStage(index){
      stage=index;root.dataset.stage=String(index);delete root.dataset.selectedPart;
      stageButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
      const entry=(currentCase==='inspection'?inspectionStages:packagingStages)[index];
      setText('[data-story-title]',entry[0]);setText('[data-story-text]',entry[1]);setText('[data-story-result]',entry[2]);setText('[data-scene-label]',`A / 0${index+1} · ${entry[3]}`);
    }
    function setMode(next){
      mode=next;root.dataset.mode=mode;elapsed=0;lastPhase=-1;delete root.dataset.selectedPart;
      all('[data-mode-button]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.modeButton===mode)));
      q('.ax-stages').hidden=mode==='operation';
      setText('[data-mode-label]',mode==='development'?'Entwicklung in fünf Schritten':'Die Lösung im Betrieb');
      setText('[data-result-label]',mode==='development'?'Ergebnis dieser Phase':'Funktionsschritt');
      if(mode==='development')showStage(0);else{root.dataset.stage='4';stageButtons.forEach(b=>b.setAttribute('aria-pressed','false'));}
      drawCurrent(0);progress();
    }
    function setCase(next){
      currentCase=next;root.dataset.case=next;
      q('[data-inspection-scene]').toggleAttribute('hidden',next!=='inspection');q('[data-packaging-scene]').toggleAttribute('hidden',next!=='packaging');
      const names=next==='inspection'?['01 Greifer','02 Aufnahme','03 Sensorik','04 Software']:['01 Greifer','02 Fördertechnik','03 Sensorik','04 Steuerung'];
      all('[data-part-button]').forEach((b,i)=>{b.textContent=names[i];b.setAttribute('aria-pressed',String(i===0));});
      const partEntry=(next==='inspection'?parts:packagingParts).gripper;
      setText('[data-part-title]',partEntry[0]);setText('[data-part-text]',partEntry[1]);setText('[data-part-question]',partEntry[2]);
      all('[data-case-button]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.caseButton===next)));
      setText('[data-case-label]',next==='inspection'?'BAUTEILHANDHABUNG / OPTISCHE PRÜFUNG':'FÖRDERTECHNIK / VERPACKUNG / PALETTIERUNG');
      const labels=next==='inspection'?['Bereit','Greifen','Positionieren','Prüfen','Ablegen']:['Bereit','Aufrichten','Fördern','Befüllen','Weiterfördern','Palettieren'];
      cycleButtons.forEach((b,i)=>{b.hidden=i>=labels.length;if(i<labels.length)b.textContent=`${i+1} ${labels[i]}`;});
      setMode('development');
    }

    function drawCycle(time){
      const labels=inspectionLabels;
      const source=[230,340],fixture=[600,340],output=[389,428],park=[470,290],clear=[570,265];
      let tcp=source,part=source,grip=false,checking=false,phase=0;
      if(time<1){tcp=point(time,park,source);}
      else if(time<2){tcp=source;grip=true;phase=1;}
      else if(time<4){tcp=point((time-2)/2,source,fixture);tcp[1]-=Math.sin(Math.PI*(time-2)/2)*55;part=tcp;grip=true;phase=1;}
      else if(time<5){tcp=fixture;part=fixture;phase=2;}
      else if(time<6){tcp=point(time-5,fixture,clear);part=fixture;phase=2;}
      else if(time<8){tcp=clear;part=fixture;checking=true;phase=3;}
      else if(time<9){tcp=point(time-8,clear,fixture);part=fixture;phase=3;}
      else if(time<11){tcp=point((time-9)/2,fixture,output);tcp[1]-=Math.sin(Math.PI*(time-9)/2)*35;part=tcp;grip=true;phase=4;}
      else if(time<12){tcp=output;part=output;phase=4;}
      else{tcp=point((time-12),output,park);part=output;phase=4;}
      const dx=tcp[0]-440,dy=tcp[1]-245,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx)-Math.acos(Math.max(-1,Math.min(1,(160*160+d*d-150*150)/(320*d))));
      const elbow=[440+160*Math.cos(a),245+160*Math.sin(a)];
      root.querySelectorAll('[data-link-a]').forEach(e=>e.setAttribute('d','M440 245L'+elbow.join(' ')));
      root.querySelectorAll('[data-link-b]').forEach(e=>e.setAttribute('d','M'+elbow.join(' ')+'L'+tcp.join(' ')));
      root.querySelector('[data-elbow]').setAttribute('cx',elbow[0]);root.querySelector('[data-elbow]').setAttribute('cy',elbow[1]);
      root.querySelector('[data-tool]').setAttribute('transform','translate('+tcp.join(' ')+')');
      root.querySelector('[data-jaws]').setAttribute('d',grip?'M-18 -15V17H-14M18 -15V17H14':'M-27 -15V17H-21M27 -15V17H21');
      root.querySelector('[data-piece]').setAttribute('transform','translate('+part.join(' ')+')');
      root.querySelector('[data-check-beam]').setAttribute('opacity',checking?'.45':'0');
      if(lastPhase!==phase){root.querySelector('[data-cycle-status]').textContent=labels[phase];cycleButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===phase)));lastPhase=phase;updateOperationStory(phase);}
    }

    function drawPackaging(time){
      let box=[745,262],stack=[220,388],r1=[755,220],r2=[548,202],r3=[220,205],part=[481,166],boxVisible=time>=6,open=1,filled=0,carried=false,phase=0;
      if(time<2)stack=point(time/2,[155,388],[220,388]);
      else if(time<5)stack=point((time-2)/3,[220,388],[745,388]);
      else stack=[745,388];
      if(time>=5&&time<10){
        phase=1;
        if(time<6)r1=point(time-5,[755,220],[745,359]);
        else if(time<7){r1=[745,359];box=r1;open=.08;}
        else{r1=point((time-7)/3,[745,359],[745,262]);r1[0]-=Math.sin(Math.PI*(time-7)/3)*38;box=r1;open=.08+.92*Math.min(1,(time-7)/2.5);}
      }
      if(time>=6&&time<10)r1=[box[0],box[1]-26*open];
      if(time>=10){r1=point(Math.min(1,time-10),[745,236],[755,220]);}
      if(time>=10&&time<13){phase=2;box=point((time-10)/3,[745,262],[480,262]);}
      if(time>=13&&time<21){
        phase=3;box=[480,262];const slot=Math.min(3,Math.floor((time-13)/2)),t=(time-13)%2;
        const source=[481,166],dest=[480+(slot%2?9:-9),239-(slot<2?5:0)];
        filled=slot+(t>=1.2?1:0);
        if(t<.4)r2=point(t/.4,[548,202],source);
        else if(t<1.2){r2=point((t-.4)/.8,source,dest);r2[0]-=Math.sin(Math.PI*(t-.4)/.8)*20;part=r2;carried=true;}
        else if(t<1.4)r2=dest;
        else r2=point((t-1.4)/.6,dest,[548,202]);
      }
      if(time>=21&&time<24){phase=4;filled=4;box=point((time-21)/3,[480,262],[250,262]);}
      if(time>=24){
        phase=5;filled=4;box=[250,262];
        if(time<25)r3=point(time-24,[220,205],[250,236]);
        else if(time<28){r3=point((time-25)/3,[250,236],[88,194]);r3[1]-=Math.sin(Math.PI*(time-25)/3)*55;box=[r3[0],r3[1]+26];}
        else{box=[88,220];r3=point(time-28,[88,194],[220,205]);}
      }
      function robot(id,base,tcp,lengths){
        const el=q(`[data-pack-robot="${id}"]`),dx=tcp[0]-base[0],dy=tcp[1]-base[1],d=Math.max(.001,Math.hypot(dx,dy));
        const [a,b]=lengths,angle=Math.atan2(dy,dx)+Math.acos(Math.max(-1,Math.min(1,(a*a+d*d-b*b)/(2*a*d))));
        const elbow=[base[0]+a*Math.cos(angle),base[1]+a*Math.sin(angle)];
        el.querySelectorAll('[data-pack-arm]').forEach(e=>e.setAttribute('d',`M${base.join(' ')}L${elbow.join(' ')}L${tcp.join(' ')}`));
        el.querySelector('[data-pack-elbow]').setAttribute('cx',elbow[0]);el.querySelector('[data-pack-elbow]').setAttribute('cy',elbow[1]);
        el.querySelector('[data-pack-tool]').setAttribute('transform',`translate(${tcp.join(' ')})`);
      }
      robot('erect',[799,195],r1,[120,115]);robot('fill',[594,155],r2,[90,85]);robot('pallet',[235,148],r3,[110,100]);
      q('[data-pack-stack]').setAttribute('transform',`translate(${stack.join(' ')})`);
      q('[data-pack-stack]').querySelectorAll('path').forEach((e,i)=>e.setAttribute('opacity',time>=6&&i>=8?'0':'1'));
      q('[data-pack-box]').setAttribute('transform',`translate(${box.join(' ')})`);q('[data-pack-box]').setAttribute('opacity',boxVisible?'1':'0');
      q('[data-box-shape]').setAttribute('transform',`scale(1 ${open})`);
      all('[data-filled-part]').forEach((e,i)=>e.setAttribute('opacity',i<filled?'1':'0'));
      q('[data-pack-part]').setAttribute('transform',`translate(${part.join(' ')})`);q('[data-pack-part]').setAttribute('opacity',carried?'1':'0');
      q('[data-feed-parts]').setAttribute('transform',`translate(0 ${time>=13&&time<21?((time-13)%2)*7:0})`);
      q('[data-worker-arm]').setAttribute('d',time<2?`M105 380L128 397L${149+Math.sin(time*Math.PI/2)*12} 390`:'M105 380L119 402L112 415');
      if(lastPhase!==phase){setText('[data-cycle-status]',packagingLabels[phase]);cycleButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===phase)));lastPhase=phase;updateOperationStory(phase);}
    }
    function drawCurrent(time){if(currentCase==='inspection')drawCycle(time);else drawPackaging(time);}
    function progress(){const total=5*stageDuration+operationDuration(),done=mode==='development'?elapsed:5*stageDuration+elapsed;q('[data-timeline]').style.transform=`scaleX(${done/total})`;}
    function stop(){if(raf)cancelAnimationFrame(raf);raf=0;lastTime=0;}
    function run(){if(!raf&&visible&&!document.hidden&&!paused&&!reduced.matches)raf=requestAnimationFrame(tick);}
    function tick(now){
      raf=0;const dt=lastTime?Math.min((now-lastTime)/1000,.1):0;lastTime=now;elapsed+=dt;
      if(mode==='development'){
        if(elapsed>=5*stageDuration)setMode('operation');
        else{const next=Math.floor(elapsed/stageDuration);if(next!==stage)showStage(next);}
      }else if(elapsed>=operationDuration())setCase(currentCase==='inspection'?'packaging':'inspection');
      else drawCurrent(elapsed);
      progress();run();
    }
    function pause(){paused=true;stop();updateMotion();setText('.ax-autoplay-label','Manuelle Ansicht · Fortsetzen startet den Ablauf');}
    function resume(){paused=false;updateMotion();setText('.ax-autoplay-label','Automatischer Wechsel');run();}
    stageButtons.forEach(b=>b.addEventListener('click',()=>{pause();setMode('development');elapsed=Number(b.dataset.stageButton)*stageDuration;showStage(Number(b.dataset.stageButton));progress();}));
    cycleButtons.forEach(b=>b.addEventListener('click',()=>{pause();setMode('operation');elapsed=(currentCase==='inspection'?[0,2,5,7,11]:[0,7.8,11.5,17.5,22.5,27])[Number(b.dataset.cycle)];lastPhase=-1;drawCurrent(elapsed);progress();}));
    all('[data-case-button]').forEach(b=>b.addEventListener('click',()=>{setCase(b.dataset.caseButton);resume();}));
    all('[data-mode-button]').forEach(b=>b.addEventListener('click',()=>{setMode(b.dataset.modeButton);resume();}));
    const partButtons=all('[data-part-button]');
    partButtons.forEach(button=>button.addEventListener('click',()=>{
      pause();setMode('operation');root.dataset.selectedPart=button.dataset.partButton;
      partButtons.forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
      const entry=(currentCase==='inspection'?parts:packagingParts)[button.dataset.partButton];setText('[data-part-title]',entry[0]);setText('[data-part-text]',entry[1]);setText('[data-part-question]',entry[2]);
    }));
    all('[data-part-hotspot]').forEach(h=>{
      const activate=()=>partButtons.find(b=>b.dataset.partButton===h.dataset.partHotspot).click();
      h.addEventListener('click',activate);h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
    });
    [stageButtons,cycleButtons,partButtons,all('[data-case-button]'),all('[data-mode-button]')].forEach(buttons=>buttons.forEach(b=>b.addEventListener('keydown',e=>{
      const available=buttons.filter(x=>!x.hidden),i=available.indexOf(b);let next;
      if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(i+1)%available.length;
      if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(i-1+available.length)%available.length;
      if(e.key==='Home')next=0;if(e.key==='End')next=available.length-1;
      if(next!==undefined){e.preventDefault();available[next].focus();available[next].click();}
    })));
    motion.hidden=false;motion.addEventListener('click',()=>{if(paused)resume();else pause();});
    reduced.addEventListener('change',()=>{if(reduced.matches)pause();updateMotion();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else run();});
    if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;root.classList.toggle('ax-offscreen',!visible);if(visible)run();else stop();},{threshold:.08}).observe(q('.ax-workspace'));
    else visible=true;
    root.classList.add('ax-ready');setCase('inspection');updateMotion();run();
  });
})();
