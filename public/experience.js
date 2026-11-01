(() => {
  'use strict';
  const stages = [
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
  document.querySelectorAll('[data-experience]').forEach((root) => {
    if (root.classList.contains('ax-ready')) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion = root.querySelector('[data-motion]');
    const stageButtons = [...root.querySelectorAll('[data-stage-button]')];
    const partButtons = [...root.querySelectorAll('[data-part-button]')];
    const setText = (selector, value) => { root.querySelector(selector).textContent = value; };
    let paused = reduced.matches;
    const updateMotion = () => { root.dataset.paused = String(paused || reduced.matches); motion.textContent = reduced.matches ? 'Reduzierte Bewegung aktiv' : paused ? 'Animation fortsetzen' : 'Animation pausieren'; motion.disabled = reduced.matches; };
    const selectStage = (index) => {
      const entry = stages[index];
      root.dataset.stage = String(index);
      delete root.dataset.selectedPart;
      stageButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      setText('[data-story-title]', entry[0]); setText('[data-story-text]', entry[1]); setText('[data-story-result]', entry[2]); setText('[data-scene-label]', `0${index + 1} / ${entry[3]}`);
    };
    stageButtons.forEach((button) => button.addEventListener('click', () => selectStage(Number(button.dataset.stageButton))));
    partButtons.forEach((button) => button.addEventListener('click', () => {
      const key = button.dataset.partButton;
      selectStage(4);
      root.dataset.selectedPart = key;
      partButtons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      const entry = parts[key]; setText('[data-part-title]', entry[0]); setText('[data-part-text]', entry[1]); setText('[data-part-question]', entry[2]);
    }));
    [stageButtons, partButtons].forEach((buttons) => buttons.forEach((button, index) => button.addEventListener('keydown', (event) => {
      let target;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % buttons.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = buttons.length - 1;
      if (target !== undefined) { event.preventDefault(); buttons[target].focus(); buttons[target].click(); }
    })));
    const hotspots = [...root.querySelectorAll('[data-part-hotspot]')];
    hotspots.forEach((hotspot) => {
      const activate = () => {
        const target = partButtons.find((button) => button.dataset.partButton === hotspot.dataset.partHotspot);
        target.click();

      };
      hotspot.addEventListener('click', activate);
      hotspot.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
      });
    });

    const cycleButtons = [...root.querySelectorAll('[data-cycle]')];
    const labels = ['Bauteil bereit · geordnete Zuführung', 'Greifer geschlossen · Teil wird übernommen', 'Teil in der Aufnahme · Greifer zieht zurück', 'Optische Prüfung · Teil liegt ruhig in der Aufnahme', 'Gutteil übernehmen und zur Ablage führen'];
    const checkpoints = [0, 2, 5, 7, 11];
    let cycleTime=0, lastTime=0, visible=true, lastPhase=-1;
    const mix=(a,b,t)=>a+(b-a)*t;
    const smooth=t=>t*t*(3-2*t);
    function point(t,a,b){const u=smooth(Math.max(0,Math.min(1,t)));return [mix(a[0],b[0],u),mix(a[1],b[1],u)];}
    function drawCycle(time){
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
      if(lastPhase!==phase){root.querySelector('[data-cycle-status]').textContent=labels[phase];cycleButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===phase)));lastPhase=phase;}
    }
    cycleButtons.forEach(b=>b.addEventListener('click',()=>{selectStage(4);paused=true;updateMotion();cycleTime=checkpoints[Number(b.dataset.cycle)];drawCycle(cycleTime);}));
    function tick(now){const dt=lastTime?Math.min((now-lastTime)/1000,.05):0;lastTime=now;if(visible&&!paused&&!reduced.matches&&root.dataset.stage==='4'){cycleTime=(cycleTime+dt)%13;drawCycle(cycleTime);}requestAnimationFrame(tick);}
    if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;}).observe(root);
    drawCycle(0);requestAnimationFrame(tick);selectStage(0);
    motion.hidden = false;
    motion.addEventListener('click', () => { paused = !paused; updateMotion(); });
    reduced.addEventListener('change', updateMotion);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { root.classList.toggle('ax-offscreen', !entry.isIntersecting); }, {threshold: 0}).observe(root);
    }
    root.classList.add('ax-ready'); updateMotion();
  });
})();
