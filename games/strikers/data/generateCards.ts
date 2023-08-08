import { generateUUID } from '@explorers-club/utils';

import type { StrikersCard } from '@schema/types';

function randomRosterPosition(): StrikersCard['rosterPosition'] {
  const positions = ['GK', 'DEF', 'MID', 'FWD'] as const;
  return positions[Math.floor(Math.random() * positions.length)];
}

function randomPossession(position: StrikersCard['rosterPosition']) {
  const mapping = {
    GK: [0, 14],
    DEF: [4, 12],
    MID: [4, 13],
    FWD: [4, 14],
  } as const;
  const [min, max] = mapping[position];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSpeed(): StrikersCard['speed'] {
  const speeds = ['S', 'A', 'B', 'C'] as const;
  return speeds[Math.floor(Math.random() * speeds.length)];
}

function randomEndurance() {
  return Math.floor(Math.random() * (10 - 5 + 1)) + 5;
}

function randomSalary() {
  return Math.floor(Math.random() * (13000 - 5000 + 1)) + 5000;
}

function randomPossessionChartWeights() {
  return {
    plusOneAction: { orderWeight: 1, rollWeight: 1 },
    // ... other attributes
  };
}

function randomShotChartWeights() {
  return {
    save: 1,
    corner: 1,
    deflect: 1,
    goal: 1,
  };
}

let cardSerialNum = 1;

import { faker } from '@faker-js/faker';

export function generateCard(): StrikersCard {
  const position = randomRosterPosition();
  const id = generateUUID();

  const fullName = faker.person.fullName();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id,
    name: fullName,
    abbreviation: abbreviateName(firstName, lastName),
    team: `Team ${Math.ceil(Math.random() * 10)}`,
    rosterPosition: position,
    league: `League ${Math.ceil(Math.random() * 5)}`,
    year: 2023,
    jerseyNum: generateJerseyNumber(),
    possession: randomPossession(position),
    speed: randomSpeed(),
    endurance: randomEndurance(),
    salary: randomSalary(),
    possessionChartWeights: randomPossessionChartWeights(),
    shotChartWeights: randomShotChartWeights(),
  };
}

function abbreviateName(firstName: string, lastName: string): string {
  return (firstName[0] + '. ' + lastName.slice(0, 3)).toUpperCase();
}

function generateJerseyNumber(): number {
  return Math.floor(Math.random() * 99) + 1;
}
