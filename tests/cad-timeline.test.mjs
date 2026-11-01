import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// The site serves this file as an ES module; load it without changing package.json.
const source = await readFile(new URL('../public/cad-timeline.js', import.meta.url), 'utf8');
const timeline = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const {
  inspectionState, packagingState, INSPECTION_COUNT, CRATE_COUNT, PARTS_PER_CRATE,
  INSPECTION_DURATION, PACKAGING_DURATION, INPUTS, OUTPUTS, NEST, PARK, INSPECTION_BASE,
  PACK_PARKS, PACK_BASES, LOWER, UPPER, FOLDED_HEIGHT, CRATE_HEIGHT, palletSlot,
} = timeline;

const distance = (a, b) => Math.hypot(...a.map((value, i) => value - b[i]));
function near(actual, expected, message, tolerance = 1e-8) {
  assert.ok(distance(actual, expected) <= tolerance,
    `${message}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
}
function samples(duration, step = .02) {
  return Array.from({ length: Math.ceil(duration / step) + 1 }, (_, i) => Math.min(duration, i * step));
}
function finitePosition(position, message) {
  assert.equal(position.length, 3, message);
  assert.ok(position.every(Number.isFinite), message);
}

// Whole-batch invariants catch duplicated, disappearing or prematurely counted parts.
test('inspection conserves four distinct housings and fills unique output pockets', () => {
  let processed = 0;
  for (const time of samples(INSPECTION_DURATION)) {
    const state = inspectionState(time);
    assert.equal(state.parts.length, INSPECTION_COUNT);
    assert.deepEqual(state.parts.map(p => p.id).sort(), [0, 1, 2, 3]);
    assert.ok(state.processed >= processed, `output count decreased at ${time}`);
    processed = state.processed;
    assert.equal(processed, state.parts.filter(p => p.owner === 'output').length);
    assert.ok(state.parts.filter(p => p.owner === 'held').length <= 1);
    assert.ok(state.parts.filter(p => p.owner === 'nest').length <= 1);
    finitePosition(state.tcp, `TCP at ${time}`);
    assert.ok(state.grip >= 0 && state.grip <= 1);
    for (const part of state.parts) {
      finitePosition(part.position, `part ${part.id} at ${time}`);
      const targets = { input: INPUTS[part.id], output: OUTPUTS[part.id], nest: NEST, held: state.tcp };
      assert.ok(Object.hasOwn(targets, part.owner), `invalid owner ${part.owner}`);
      near(part.position, targets[part.owner], `part ${part.id}, owner ${part.owner}, time ${time}`);
    }
  }
  assert.equal(processed, INSPECTION_COUNT);
});

test('inspection exposes only a seated, clamped part with the robot withdrawn', () => {
  let exposures = 0, wasExposing = false;
  for (const time of samples(INSPECTION_DURATION, .01)) {
    const state = inspectionState(time);
    assert.ok(state.clampAmount >= 0 && state.clampAmount <= 1);
    if (state.clampAmount > 0) {
      assert.equal(state.parts.filter(p => p.owner === 'nest').length, 1);
      assert.equal(state.parts.filter(p => p.owner === 'held').length, 0);
      near(state.tcp, PARK, `robot clear while clamp moves at ${time}`);
    }
    if (state.capture) {
      assert.equal(state.clampAmount, 1, `exposure before clamping at ${time}`);
      assert.equal(state.grip, 0);
      near(state.tcp, PARK, `robot obscures camera at ${time}`);
      near(state.parts.find(p => p.owner === 'nest').position, NEST, 'stationary inspected part');
      if (!wasExposing) exposures++;
    }
    wasExposing = state.capture;
  }
  assert.equal(exposures, INSPECTION_COUNT);
});

test('inspection has vertical pick/place legs and raised transfer paths', () => {
  for (let index = 0; index < INSPECTION_COUNT; index++) {
    const offset = index * 18;
    for (const [local, station] of [[1.1, INPUTS[index]], [4.5, NEST], [10.7, NEST], [14.2, OUTPUTS[index]]]) {
      const tcp = inspectionState(offset + local).tcp;
      assert.equal(tcp[0], station[0]);
      assert.equal(tcp[2], station[2]);
      assert.ok(tcp[1] > station[1], `missing Z approach at ${offset + local}`);
    }
    for (const local of [3.4, 13]) {
      const state = inspectionState(offset + local);
      assert.equal(state.parts[index].owner, 'held');
      assert.equal(state.grip, 1);
      assert.ok(state.tcp[1] >= NEST[1] + .5, `transfer below clearance at ${offset + local}`);
    }
  }
});

test('inspection TCP, gripper and all part poses are continuous across event and batch boundaries', () => {
  const events = [0, .8, 1.5, 1.9, 2.7, 4.1, 4.9, 5.3, 6.1, 7, 7.4, 9, 9.4, 10.3, 11.1, 11.5, 12.3, 13.8, 14.6, 15, 15.8, 17, 18];
  for (let index = 0; index < INSPECTION_COUNT; index++) {
    for (const event of events) {
      const time = index * 18 + event, before = inspectionState(time - 1e-6), after = inspectionState(time + 1e-6);
      near(before.tcp, after.tcp, `TCP jump at ${time}`, 1e-4);
      assert.ok(Math.abs(before.grip - after.grip) < 1e-4, `gripper jump at ${time}`);
      assert.ok(Math.abs(before.clampAmount - after.clampAmount) < 1e-4, `fixture jump at ${time}`);
      before.parts.forEach((part, i) => near(part.position, after.parts[i].position, `part ${i} jump at ${time}`, 1e-4));
    }
  }
});

test('inspection finishes the full batch and holds it, without resetting inventory', () => {
  const beforeLastRelease = inspectionState(3 * 18 + 14.9);
  assert.equal(beforeLastRelease.processed, INSPECTION_COUNT - 1);
  assert.equal(beforeLastRelease.complete, false);
  for (const time of [72, 73, INSPECTION_DURATION, INSPECTION_DURATION + 20]) {
    const state = inspectionState(time);
    assert.equal(state.complete, true);
    assert.equal(state.processed, INSPECTION_COUNT);
    assert.ok(state.parts.every(p => p.owner === 'output'));
    assert.equal(state.grip, 0);
    assert.equal(state.capture, false);
    assert.equal(state.clampAmount, 0);
    near(state.tcp, PARK, 'completed robot parked');
  }
});

test('packaging consumes all four crates and sixteen parts without duplication or loss', () => {
  let consumed = 0, loaded = 0, palletized = 0, remaining = CRATE_COUNT;
  for (const time of samples(PACKAGING_DURATION)) {
    const state = packagingState(time);
    assert.equal(state.crates.length, CRATE_COUNT);
    assert.deepEqual(state.crates.map(c => c.id).sort(), [0, 1, 2, 3]);
    assert.ok(state.stackRemaining <= remaining, `stack refilled at ${time}`);
    assert.ok(state.palletized >= palletized, `pallet emptied at ${time}`);
    assert.ok(state.consumed >= consumed && state.consumed <= CRATE_COUNT * PARTS_PER_CRATE);
    assert.ok(state.loaded >= loaded);
    assert.equal(state.stackRemaining, state.crates.filter(c => c.owner === 'stack').length);
    assert.equal(state.palletized, state.crates.filter(c => c.owner === 'pallet').length);
    assert.equal(state.loaded, state.crates.reduce((sum, c) => sum + c.filled, 0));
    assert.equal(state.consumed - state.loaded, state.movingPart ? 1 : 0);
    [consumed, loaded, palletized, remaining] = [state.consumed, state.loaded, state.palletized, state.stackRemaining];
    state.robots.forEach(p => finitePosition(p, `robot at ${time}`));
    state.grips.forEach(g => assert.ok(g >= 0 && g <= 1));
    for (const crate of state.crates) {
      finitePosition(crate.position, `crate ${crate.id} at ${time}`);
      assert.ok(['stack', 'erector', 'upper', 'filling', 'palletizer', 'pallet'].includes(crate.owner));
      assert.ok(crate.fold >= 0 && crate.fold <= 1);
      assert.ok(Number.isInteger(crate.filled) && crate.filled >= 0 && crate.filled <= PARTS_PER_CRATE);
      if (crate.owner === 'stack') {
        assert.equal(crate.filled, 0);
        assert.equal(crate.fold, 0);
        assert.ok(Math.abs(crate.position[1] - (LOWER + .01 + (3 - crate.id) * FOLDED_HEIGHT)) < 1e-8);
      }
      if (crate.owner === 'pallet' || crate.owner === 'palletizer') {
        assert.equal(crate.filled, PARTS_PER_CRATE, `unfinished crate palletized at ${time}`);
        assert.equal(crate.fold, 1);
      }
      if (crate.owner === 'pallet') near(crate.position, palletSlot(crate.id), 'unique pallet slot');
      if (crate.owner === 'filling') near(crate.position, [0, UPPER + .01, 0], 'crate remains stationary while filling');
      if (crate.owner === 'palletizer') near(crate.position, [state.robots[2][0], state.robots[2][1] - CRATE_HEIGHT, state.robots[2][2]], 'crate follows palletizer');
    }
    if (state.movingPart) {
      assert.ok(state.movingPart.id >= 0 && state.movingPart.id < CRATE_COUNT * PARTS_PER_CRATE);
      near(state.movingPart.position, state.robots[1], 'part follows filling robot');
    }
  }
  assert.deepEqual([consumed, loaded, palletized, remaining], [16, 16, 4, 0]);
});

test('packaging robot and crate poses remain continuous, including folded crate pickup', () => {
  const events = [0, 1, 1.4, 2.4, 4, 5.4, 5.8, 6.4, 8, 17.6, 19.4, 20.2, 20.6, 21.3, 23, 23.6, 24, 25, 26];
  for (let n = 0; n < PARTS_PER_CRATE; n++) {
    for (const event of [0, .35, .55, .9, 1.4, 1.75, 1.95, 2.15, 2.4]) events.push(8 + n * 2.4 + event);
  }
  for (let index = 0; index < CRATE_COUNT; index++) {
    for (const event of events) {
      const time = 3 + index * 26 + event, before = packagingState(time - 1e-6), after = packagingState(time + 1e-6);
      before.robots.forEach((position, i) => near(position, after.robots[i], `robot ${i} jump at ${time}`, 1e-4));
      before.crates.forEach((crate, i) => {
        near(crate.position, after.crates[i].position, `crate ${i} jump at ${time}`, 1e-4);
        assert.ok(Math.abs(crate.fold - after.crates[i].fold) < 1e-4, `fold jump at ${time}`);
      });
      before.grips.forEach((value, i) => assert.ok(Math.abs(value - after.grips[i]) < 1e-4, `grip ${i} jump at ${time}`));
    }
  }
});

test('packaging ends with two complete layers, empty input and parked robots', () => {
  assert.equal(packagingState(3 + 3 * 26 + 23.9).complete, false);
  for (const time of [107, 108, PACKAGING_DURATION, PACKAGING_DURATION + 20]) {
    const state = packagingState(time);
    assert.equal(state.complete, true);
    assert.equal(state.stackRemaining, 0);
    assert.equal(state.palletized, CRATE_COUNT);
    assert.equal(state.loaded, CRATE_COUNT * PARTS_PER_CRATE);
    assert.equal(state.movingPart, null);
    state.robots.forEach((position, i) => near(position, PACK_PARKS[i], `robot ${i} parked at completion`));
    assert.deepEqual(state.grips, [0, 0, 0]);
    assert.equal(new Set(state.crates.map(c => c.position[1])).size, 2);
    assert.equal(new Set(state.crates.map(c => c.position.join(','))).size, CRATE_COUNT);
  }
});

test('seeking and backwards scrubbing produce deterministic batch states', () => {
  for (const [stateAt, duration] of [[inspectionState, INSPECTION_DURATION], [packagingState, PACKAGING_DURATION]]) {
    const atMiddle = structuredClone(stateAt(duration * .53));
    stateAt(duration);
    stateAt(0);
    assert.deepEqual(stateAt(duration * .53), atMiddle);
    assert.deepEqual(stateAt(-5), stateAt(0));
    assert.deepEqual(stateAt(duration + 5), stateAt(duration));
  }
});

test('filling tool retracts vertically above the crate rim before returning sideways', () => {
  const clearance = UPPER + .01 + CRATE_HEIGHT + .06;
  for (let crate = 0; crate < CRATE_COUNT; crate++) {
    for (let part = 0; part < PARTS_PER_CRATE; part++) {
      const releaseTime = 3 + crate * 26 + 8 + part * 2.4 + 1.95;
      const releasedTCP = packagingState(releaseTime).robots[1];
      const targetXZ = [releasedTCP[0], releasedTCP[2]];
      for (let retreat = 1.95; retreat < 2.4; retreat += .01) {
        const time = 3 + crate * 26 + 8 + part * 2.4 + retreat;
        const tcp = packagingState(time).robots[1];
        if (tcp[1] < clearance) {
          assert.ok(Math.abs(tcp[0] - targetXZ[0]) < 1e-8 && Math.abs(tcp[2] - targetXZ[1]) < 1e-8,
            `tool moves sideways inside crate ${crate}, part ${part}, at ${time}: ${tcp}`);
        }
      }
    }
  }
});


test('rendered robot kinematics reach every sampled target without clamping or tool tilt', async () => {
  const { createRobot, createMaterials } = await import(new URL('../public/cad-components.js', import.meta.url));
  const { Vector3, Quaternion } = await import(new URL('../public/vendor/three.module.js', import.meta.url));
  const materials = createMaterials();
  const inspectionRobot = createRobot(materials, { reach: 1.25 });
  inspectionRobot.group.position.set(...INSPECTION_BASE);
  const packagingRobots = [1.3, 1.4, 1.5].map((reach, i) => {
    const robot = createRobot(materials, { reach, gripWidth: i === 1 ? .145 : .5, gripTravel: i === 1 ? .012 : .036 });
    robot.group.position.set(...PACK_BASES[i]);
    return robot;
  });
  const quaternion = new Quaternion(), up = new Vector3();
  function validate(robot, tcp, base, grip, message) {
    robot.setTarget(...tcp.map((value, i) => value - base[i]), grip);
    assert.equal(robot.clamped, false, `unreachable target: ${message}`);
    near(robot.actualTCP.toArray(), tcp, `rendered tool misses commanded pose: ${message}`, 1e-7);
    robot.tool.getWorldQuaternion(quaternion);
    up.set(0, 1, 0).applyQuaternion(quaternion);
    near(up.toArray(), [0, 1, 0], `tool tilts against fixture/crate: ${message}`, 1e-7);
  }
  for (const time of samples(INSPECTION_DURATION, .1)) {
    const state = inspectionState(time);
    validate(inspectionRobot, state.tcp, INSPECTION_BASE, state.grip, `inspection at ${time}`);
  }
  for (const time of samples(PACKAGING_DURATION, .1)) {
    const state = packagingState(time);
    packagingRobots.forEach((robot, i) => validate(robot, state.robots[i], PACK_BASES[i], state.grips[i], `packaging robot ${i} at ${time}`));
  }
});


test('crates never lift or descend through the upper conveyor deck', () => {
  // Upper conveyor is 5.8 m long, with end rails extending to +/-2.97 m.
  // Include its side rails and the full crate footprint, rather than checking only a TCP.
  const deck = { halfLength: 2.97, halfWidth: .43, bottom: UPPER - .17, top: UPPER };
  const halfCrateWidth = .25, halfCrateDepth = .20;
  for (const time of samples(PACKAGING_DURATION, .01)) {
    for (const crate of packagingState(time).crates) {
      const [x, bottom, z] = crate.position;
      const top = bottom + FOLDED_HEIGHT + (CRATE_HEIGHT - FOLDED_HEIGHT) * crate.fold;
      const overlapsPlan = x - halfCrateWidth < deck.halfLength && x + halfCrateWidth > -deck.halfLength &&
        z - halfCrateDepth < deck.halfWidth && z + halfCrateDepth > -deck.halfWidth;
      if (overlapsPlan) {
        assert.ok(bottom >= deck.top - 1e-8 || top <= deck.bottom + 1e-8,
          `crate ${crate.id} intersects upper deck at ${time}: bottom ${bottom}, top ${top}, x ${x}, z ${z}`);
      }
    }
  }
});
