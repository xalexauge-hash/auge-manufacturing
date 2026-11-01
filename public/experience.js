(() => {
  'use strict';
  const stages = [
    ['Was soll sich verbessern?', 'Werkstück, Prozess und Ziel bilden den Ausgangspunkt. Wir klären Varianten, Schnittstellen und technische Randbedingungen, bevor eine Lösung Gestalt annimmt.', 'Eine gemeinsam eingeordnete Aufgabenstellung.', 'ANFORDERUNGEN'],
    ['Die Lösung nimmt Form an.', 'Wie greifen Bauteil, Bewegung und Prozess ineinander? Wir betrachten die Anordnung, Zugänglichkeit und mechanischen Schnittstellen und stimmen den Lösungsansatz mit Ihnen ab.', 'Ein abgestimmtes Konzept mit klaren nächsten Schritten.', 'KONZEPT'],
    ['Details machen den Unterschied.', 'Aus dem Konzept werden Bauteile und Baugruppen. Greifer, Werkstückaufnahme und Einbausituation werden konstruktiv ausgearbeitet – mit Blick auf Fertigung und Montage.', 'CAD-Modelle und Zeichnungen nach vereinbartem Umfang.', 'KONSTRUKTION'],
    ['Vom Modell zum Bauteil.', 'Fertigungsgerechte Konstruktion und CNC-Bearbeitung greifen ineinander. Material, Toleranzen und Aufspannung werden für das konkrete Bauteil abgestimmt.', 'Die passende mechanische Komponente für Ihre Anwendung.', 'FERTIGUNG'],
    ['Einzelne Funktionen. Ein Ablauf.', 'Mechanik, Robotik und Software müssen zusammenpassen. Programmierung, Funktionsprüfung und Inbetriebnahme werden projektbezogen abgestimmt. Die Bewegung zeigt ein Prinzip, keine geprüfte Simulation.', 'Ein nachvollziehbarer Funktionsablauf als gemeinsames Ziel.', 'ZUSAMMENSPIEL']
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
    motion.hidden = false;
    motion.addEventListener('click', () => { paused = !paused; updateMotion(); });
    reduced.addEventListener('change', updateMotion);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { root.classList.toggle('ax-offscreen', !entry.isIntersecting); }, {threshold: 0}).observe(root);
    }
    root.classList.add('ax-ready'); updateMotion();
  });
})();
