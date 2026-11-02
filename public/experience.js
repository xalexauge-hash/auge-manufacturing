import {createCadExperience} from './cad-scenes.js';
import {INSPECTION_DURATION,PACKAGING_DURATION} from './cad-timeline.js';
  const inspectionStages = [
    ['Gehäuseteile zuverlässig prüfen.', 'Vier gefräste Gehäuseteile liegen in einem Eingangstablett bereit. Die Aufgabe: entnehmen, in einer Prüfaufnahme positionieren, ein optisches Merkmal erfassen und das geprüfte Teil ablegen. Teilevarianten, Prüfmerkmal und Fehlerreaktion werden zuerst festgelegt.', 'Ein klar abgegrenzter Prüf- und Handhabungsauftrag.', 'ANFORDERUNG'],
    ['Drei Stationen. Ein Materialfluss.', 'Ein Eingangstablett mit vier Teilen, eine feste Prüfaufnahme und vier getrennte Ablageplätze bilden den Ablauf. Die 3D-Ansicht zeigt, warum Reichweite, Zugänglichkeit und Freiraum für Greifer und Kamera gemeinsam geplant werden.', 'Ein Stationslayout mit eindeutigen Übergaben.', 'KONZEPT'],
    ['Greifer und Aufnahme aufeinander abstimmen.', 'Formangepasste Greiferbacken halten das Gehäuse an geeigneten Außenflächen. Die Aufnahme legt seine Position zur Kamera fest. Befestigungen, Bezugspunkte und Freiräume werden so konstruiert, dass Greifen und Prüfen sich nicht behindern.', 'Ausgearbeitete Greiferbacken und Werkstückaufnahme.', 'KONSTRUKTION'],
    ['Die Schnittstelle wird ein reales Bauteil.', 'Greiferbacken, Adapter und Aufnahme können als CNC-gefertigte Komponenten entstehen. Bezugselemente und funktionsrelevante Maße werden abgestimmt; anschließend wird das Zusammenspiel mit dem realen Musterteil erprobt.', 'Mechanische Komponenten für Montage und Erprobung.', 'FERTIGUNG'],
    ['Aus Komponenten wird eine Prüfzelle.', 'Greifer, Werkstückaufnahme und Kamerahalterung werden montiert und ausgerichtet. Mechanische, elektrische und steuerungstechnische Schnittstellen werden zusammengeführt.', 'Eine montierte Zelle als Grundlage für die Funktionsprüfung.', 'MONTAGE'],
    ['Funktionen prüfen. Abläufe abstimmen.', 'Mit Musterteilen prüfen wir Greifpositionen, Übergaben und die optische Erfassung. Freigaben, Fehlermeldungen und Wiederanlauf werden im vereinbarten Umfang erprobt.', 'Ein erprobter Prüf- und Handhabungsablauf.', 'INBETRIEBNAHME'],
    ['Die Lösung in den Betrieb überführen.', 'Die abgestimmten Programme und Parameter werden für den Betrieb bereitgestellt. Dokumentation, Einweisung und Übergabe schaffen die Grundlage für den Einsatz; für unsere Lösung bleiben wir im Service ansprechbar.', 'Eine übergebene Lösung mit dokumentiertem Betriebsstand.', 'DEPLOYMENT']
  ];
  const parts = {
    gripper: ['Das Werkstück sicher handhaben.', 'Geometrie, Gewicht und Oberfläche bestimmen die Greifaufgabe. Zugänglichkeit, Teilevarianten und die Übergabe an die nächste Station fließen in das Konzept ein.', 'Welche Flächen dürfen berührt werden – und in welcher Lage kommt das Teil an?'],
    fixture: ['Die richtige Lage ist kein Zufall.', 'Eine passende Werkstückaufnahme stellt Bezüge her und macht den Prozess wiederholbar. Einlegen, Entnehmen, Bauteilvarianten und Fertigbarkeit werden zusammen betrachtet.', 'Welche Bezugspunkte braucht der Prozess, und wie wird das Werkstück gehalten?'],
    sensor: ['Der Prozess braucht Rückmeldung.', 'Sensorik kann Anwesenheit, Lage oder einen Prozesszustand erfassen. Wir klären, welche Information benötigt wird und wie sie sich in den Ablauf einbinden lässt.', 'Was muss vor dem nächsten Schritt zuverlässig erkannt werden?'],
    software: ['Aus Bewegung wird ein Ablauf.', 'Zustände, Freigaben und Schnittstellen verbinden die einzelnen Funktionen. Neben dem Normalablauf gehören verständliche Rückmeldungen und der Umgang mit Unterbrechungen zur Aufgabenklärung.', 'Wie reagiert der Prozess, wenn ein Teil fehlt oder ein Schritt unterbrochen wird?']
  };

  const packagingStages = [
    ['Vom Kistenstapel zur vollen Palette.', 'Mitarbeitende stellen Stapel zusammengefalteter Kisten auf der unteren Förderebene bereit. Fertigteile kommen über eine separate Zuführung. Ziel ist ein durchgängiger Ablauf bis zur beladenen Palette.', 'Kistenformat, Teilezahl und Übergabepunkte festlegen.', 'ANFORDERUNG'],
    ['Zwei Ebenen organisieren den Materialfluss.', 'Die untere Ebene führt Kistenstapel zum Aufrichtroboter. Oben laufen die aufgerichteten Kisten in Gegenrichtung: zuerst zur Befüllung, anschließend zur Palettierung. Die Teilezuführung bleibt separat.', 'Ein Anlagenlayout mit drei Roboterstationen.', 'KONZEPT'],
    ['Übergaben bis zum Greifer durchdenken.', 'Vereinzelung, Aufrichtgreifer, Kistenanschläge und Teilegreifer werden auf die Geometrien abgestimmt. Für die Palettierung sind Greifzugang, Lagenbild und Traglast maßgeblich.', 'Abgestimmte Baugruppen und klare Schnittstellen.', 'KONSTRUKTION'],
    ['Die passenden Komponenten fertigen.', 'Adapterplatten, Greiferfinger, Führungen und Halter werden konstruiert, gefertigt und mit realen Kisten und Musterteilen erprobt. Die gefertigten Komponenten werden für die anschließende Montage vorbereitet.', 'Geprüfte Komponenten für Montage und Integration.', 'FERTIGUNG'],
    ['Fördertechnik und Roboter zusammenführen.', 'Die beiden Förderebenen, die Teilezuführung und die drei Roboterstationen werden montiert. Greifer, Anschläge und Sensoren werden ausgerichtet und mit der Steuerung verbunden.', 'Eine montierte Anlage mit abgestimmten Übergabepunkten.', 'MONTAGE'],
    ['Jede Übergabe im Ablauf erproben.', 'Wir prüfen die Kistenvereinzelung, das Aufrichten, die Teilezählung und das Palettiermuster. Stationsfreigaben und Reaktionen auf Unterbrechungen werden mit realen Kisten und Musterteilen erprobt.', 'Ein erprobter Ablauf vom Kistenstapel bis zur Palette.', 'INBETRIEBNAHME'],
    ['Die Anlage in den Betrieb übergeben.', 'Die abgestimmten Roboterprogramme, Kistenformate und Palettierparameter werden für den Betrieb bereitgestellt. Einweisung und Dokumentation begleiten die Übergabe; Service und Anpassungen bleiben Teil der Zusammenarbeit.', 'Eine übergebene Anlage mit dokumentierten Programmen und Parametern.', 'DEPLOYMENT']
  ];
  const inspectionLabels=['Bauteil bereit · Eingangstablett','Greifer geschlossen · Teil wird übernommen','Teil in der Aufnahme · Greifer zieht zurück','Optische Prüfung · Teil liegt ruhig in der Aufnahme','Gutteil übernehmen und zur Ablage führen'];
  const packagingLabels=['Kistenstapel bereitstellen und unten zuführen','Eine Kiste vereinzeln, aufrichten und nach oben übergeben','Leere Kiste zur Befüllstation fördern','Vier Fertigteile nacheinander in die Kiste einlegen','Volle Kiste zur Palettierstation fördern','Volle Kiste übernehmen und auf der Palette absetzen'];
  const operationCopy={
    inspection:[['Bereitstellen','Das nächste Gehäuseteil liegt in seinem definierten Platz im Eingangstablett. Der Roboter fährt zur Greifposition.'],['Greifen und transportieren','Die Greiferbacken schließen. Das Teil wird übernommen und zur Prüfaufnahme geführt.'],['Positionieren','Das Teil wird in der Aufnahme abgelegt. Der Roboter zieht sich aus dem Prüfbereich zurück.'],['Prüfen','Das Werkstück liegt ruhig. Die Kamera erfasst das vorgesehene Merkmal.'],['Ablegen','Nach der Freigabe übernimmt der Roboter das Gutteil und legt es in seinem eigenen Platz im Ausgangstablett ab. Die Charge endet nach vier abgelegten Teilen.']],
    packaging:[['Kistenstapel zuführen','Mitarbeitende geben den Stapel auf die untere Ebene. Das Förderband bringt ihn zum ersten Roboter.'],['Kiste aufrichten','Roboter 01 nimmt die oberste gefaltete Kiste, richtet sie auf und setzt sie auf der oberen Förderebene ab.'],['Zur Befüllung fördern','Die leere Kiste fährt auf der oberen Ebene zur zweiten Station und wird dort angehalten.'],['Kiste befüllen','Roboter 02 übernimmt nacheinander vier Musterteile vom separaten Teileband. Die Kiste bleibt während der Befüllung stehen.'],['Volle Kiste freigeben','Nach dem vierten Teil gibt die Steuerung die Kiste frei. Sie fährt zur Palettierstation.'],['Palettieren','Roboter 03 hebt die volle Kiste vom oberen Band und setzt sie auf der Palette ab. Erst nach vier vollständig befüllten Kisten und leerem Eingangsstapel folgt das nächste Anwendungsbeispiel.']]
  };
  const packagingParts = {
    gripper: ['Drei Aufgaben. Drei passende Greifer.', 'Aufrichten, Teile einlegen und volle Kisten palettieren stellen unterschiedliche Anforderungen an Greifflächen, Traglast und Freiraum.', 'Wie werden gefaltete Kisten vereinzelt und volle Kisten sicher gehalten?'],
    fixture: ['Zwei Ebenen mit definierten Übergaben.', 'Führungen und Anschläge positionieren die Kiste an jeder Station. Die separate Teilezuführung wird mit dem Befüllablauf abgestimmt.', 'Wo braucht es Puffer, Positionierung und eine eindeutige Freigabe?'],
    sensor: ['Jede Übergabe bestätigen.', 'Kistenanwesenheit, Aufrichtzustand, Teilezahl und Palettenposition liefern die Rückmeldungen für den nächsten Schritt.', 'Welche Zustände müssen vor dem Weitertransport bestätigt sein?'],
    software: ['Drei Roboter zu einem Ablauf verbinden.', 'Stationsfreigaben, Teilezählung und das Palettiermuster werden zusammengeführt. Auch fehlende Kisten und Unterbrechungen gehören zum Ablauf.', 'Wie läuft die Anlage nach einer Unterbrechung kontrolliert weiter?']
  };
  document.querySelectorAll('[data-experience]').forEach(root=>{
    const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),viewer=createCadExperience(root);
    const motion=q('[data-motion]'),stageButtons=all('[data-stage-button]'),cycleButtons=all('[data-cycle]'),partButtons=all('[data-part-button]');
    let currentCase='inspection',mode='development',stage=0,elapsed=0,lastTime=0,lastPhase=-1,visible=false,paused=reduced.matches,raf=0,speed=1,lastRender=0;
    const stageDuration=4,stageCount=inspectionStages.length,operationDuration=()=>currentCase==='inspection'?INSPECTION_DURATION:PACKAGING_DURATION;
    const setText=(s,v)=>{q(s).textContent=v;};
    function updateMotion(){root.dataset.paused=String(paused||reduced.matches);motion.textContent=reduced.matches?'Reduzierte Bewegung aktiv':paused?'Animation fortsetzen':'Animation pausieren';motion.disabled=reduced.matches;}
    function render(){
      const state=viewer.update({example:currentCase,mode,stage,time:elapsed,stageProgress:mode==='development'?(elapsed%stageDuration)/stageDuration:1,selectedPart:root.dataset.selectedPart});
      if(mode==='operation'&&state){
        cycleButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===state.phase)));
        setText('[data-cycle-status]',state.caption);
        if(lastPhase!==state.phase||state.complete){
          const entry=operationCopy[currentCase][state.phase];
          setText('[data-story-title]',state.complete?'Charge abgeschlossen.':entry[0]);setText('[data-story-text]',state.complete?(currentCase==='inspection'?'Alle vier Teile liegen geprüft im Ausgangstablett. Die Aufnahme ist leer, der Greifer offen und der Roboter in Parkposition.':'Der Eingangsstapel ist leer. Alle vier Kisten enthalten jeweils vier Teile und stehen in zwei Lagen auf der Palette. Die Roboter stehen in Parkposition.'):entry[1]);
          setText('[data-story-result]',state.caption);setText('[data-scene-label]',state.complete?'B / CHARGE VOLLSTÄNDIG':`B / ${entry[0].toUpperCase()}`);lastPhase=state.phase;
        }
      }
      q('[data-cycle-scrub]').max=operationDuration();q('[data-cycle-scrub]').value=mode==='operation'?elapsed:0;setText('[data-cycle-time]',`${Math.floor(mode==='operation'?elapsed:0)} / ${operationDuration()} s`);
      const total=stageCount*stageDuration+operationDuration(),done=mode==='development'?elapsed:stageCount*stageDuration+elapsed;q('[data-timeline]').style.transform=`scaleX(${done/total})`;
    }
    function showStage(index){
      stage=index;root.dataset.stage=String(index);delete root.dataset.selectedPart;stageButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
      const entry=(currentCase==='inspection'?inspectionStages:packagingStages)[index];setText('[data-story-title]',entry[0]);setText('[data-story-text]',entry[1]);setText('[data-story-result]',entry[2]);setText('[data-scene-label]',`A / 0${index+1} · ${entry[3]}`);
    }
    function setMode(next){
      mode=next;root.dataset.mode=mode;elapsed=0;lastPhase=-1;delete root.dataset.selectedPart;all('[data-mode-button]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.modeButton===mode)));q('.ax-stages').hidden=mode==='operation';
      setText('[data-mode-label]',mode==='development'?'Entwicklung in sieben Schritten':'Die vollständige Charge im Betrieb');setText('[data-result-label]',mode==='development'?'Ergebnis dieser Phase':'Chargenfortschritt');
      if(mode==='development'){showStage(0);setText('[data-cycle-status]','Nach der Entwicklung folgt der vollständige Funktionsablauf.');cycleButtons.forEach(b=>b.setAttribute('aria-pressed','false'));}else{stage=6;root.dataset.stage='6';stageButtons.forEach(b=>b.setAttribute('aria-pressed','false'));}render();
    }
    function setCase(next){
      currentCase=next;root.dataset.case=next;viewer.reset();
      all('[data-case-button]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.caseButton===next)));
      const names=next==='inspection'?['01 Greifer','02 Prüfaufnahme','03 Sensorik','04 Software']:['01 Greifer','02 Fördertechnik','03 Sensorik','04 Steuerung'];partButtons.forEach((b,i)=>{b.textContent=names[i];b.setAttribute('aria-pressed',String(i===0));});
      const entry=(next==='inspection'?parts:packagingParts).gripper;setText('[data-part-title]',entry[0]);setText('[data-part-text]',entry[1]);setText('[data-part-question]',entry[2]);
      setText('[data-case-label]',next==='inspection'?'PRÜFZELLE / VIER GEHÄUSETEILE':'VERPACKUNGSLINIE / VIER KISTEN');
      const labels=next==='inspection'?['Bereit','Greifen','Positionieren','Prüfen','Ablegen']:['Bereit','Aufrichten','Fördern','Befüllen','Weiterfördern','Palettieren'];cycleButtons.forEach((b,i)=>{b.hidden=i>=labels.length;if(!b.hidden)b.textContent=`${i+1} ${labels[i]}`;});
      setMode('development');
    }
    function stop(){if(raf)cancelAnimationFrame(raf);raf=0;lastTime=0;}
    function run(){if(!raf&&visible&&!document.hidden&&!paused&&!reduced.matches)raf=requestAnimationFrame(tick);}
    function tick(now){
      raf=0;const dt=lastTime?Math.min((now-lastTime)/1000,.1)*speed:0;lastTime=now;elapsed+=dt;
      if(mode==='development'){if(elapsed>=stageCount*stageDuration)setMode('operation');else{const next=Math.floor(elapsed/stageDuration);if(next!==stage)showStage(next);}}
      else if(elapsed>=operationDuration())setCase(currentCase==='inspection'?'packaging':'inspection');
      if(now-lastRender>32){render();lastRender=now;}run();
    }
    function pause(){paused=true;stop();updateMotion();setText('.ax-autoplay-label','Manuelle Ansicht · Fortsetzen startet den Ablauf');}
    function resume(){paused=false;updateMotion();setText('.ax-autoplay-label','Automatischer Wechsel nach vollständiger Charge');run();}
    stageButtons.forEach(b=>b.addEventListener('click',()=>{pause();setMode('development');elapsed=Number(b.dataset.stageButton)*stageDuration;showStage(Number(b.dataset.stageButton));render();}));
    cycleButtons.forEach(b=>b.addEventListener('click',()=>{pause();setMode('operation');elapsed=(currentCase==='inspection'?[0,2.3,5.6,8,14.8]:[0,6.3,10.2,16.2,21.5,26.5])[Number(b.dataset.cycle)];lastPhase=-1;render();}));
    all('[data-case-button]').forEach(b=>b.addEventListener('click',()=>{setCase(b.dataset.caseButton);resume();}));all('[data-mode-button]').forEach(b=>b.addEventListener('click',()=>{setMode(b.dataset.modeButton);resume();}));
    partButtons.forEach(button=>button.addEventListener('click',()=>{pause();setMode('operation');root.dataset.selectedPart=button.dataset.partButton;partButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const entry=(currentCase==='inspection'?parts:packagingParts)[button.dataset.partButton];setText('[data-part-title]',entry[0]);setText('[data-part-text]',entry[1]);setText('[data-part-question]',entry[2]);render();}));
    [stageButtons,cycleButtons,partButtons,all('[data-case-button]'),all('[data-mode-button]')].forEach(buttons=>buttons.forEach(b=>b.addEventListener('keydown',e=>{const available=buttons.filter(x=>!x.hidden),i=available.indexOf(b);let next;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(i+1)%available.length;if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(i-1+available.length)%available.length;if(e.key==='Home')next=0;if(e.key==='End')next=available.length-1;if(next!==undefined){e.preventDefault();available[next].focus();available[next].click();}})));
    q('[data-cycle-scrub]').addEventListener('input',e=>{const value=Number(e.target.value);pause();if(mode!=='operation')setMode('operation');elapsed=value;lastPhase=-1;render();});
    q('[data-speed]').addEventListener('click',()=>{speed=speed===1?2:1;q('[data-speed]').textContent=`Tempo ${speed}×`;});q('[data-view-reset]').addEventListener('click',()=>{delete root.dataset.selectedPart;viewer.reset();render();});
    motion.hidden=false;motion.addEventListener('click',()=>paused?resume():pause());reduced.addEventListener('change',()=>{if(reduced.matches)pause();updateMotion();});document.addEventListener('visibilitychange',()=>document.hidden?stop():run());
    if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;root.classList.toggle('ax-offscreen',!visible);if(visible)run();else stop();},{threshold:.08}).observe(q('[data-cad-host]'));else visible=true;
    root.classList.add('ax-ready');setCase('inspection');updateMotion();run();
  });
