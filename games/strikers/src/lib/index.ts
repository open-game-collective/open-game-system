// client/server shared code here

import {
  StrikersPossessionChartWeights,
  StrikersShotChartWeights,
} from '@schema/types';

export function generateShotChart(weights: StrikersShotChartWeights) {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const abilities = Object.entries(weights);

  const shotChart: { [key: number]: string } = {};
  let currentRoll = 1;

  for (const [ability, weight] of abilities) {
    const rollsForAbility = Math.round((weight / totalWeight) * 20);

    for (let i = 0; i < rollsForAbility; i++) {
      if (currentRoll <= 20) {
        shotChart[currentRoll] = ability;
        currentRoll++;
      }
    }
  }

  while (currentRoll <= 20) {
    shotChart[currentRoll] = 'goal';
    currentRoll++;
  }

  return shotChart;
}

export function generatePossessionChart(
  weights: StrikersPossessionChartWeights
) {
  // Create an array of all abilities with their weights
  const abilities = Object.entries(weights).map(([ability, weights]) => ({
    ability,
    ...weights
  }));

  // Sort the abilities by their orderWeight
  abilities.sort((a, b) => a.orderWeight - b.orderWeight);

  const possessionChart: { [key: number]: string } = {};

  let currentRoll = 1;
  let totalWeight = 0;

  // Assign abilities to rolls based on their weight
  for (const { ability, rollWeight } of abilities) {
    const rollsForAbility = Math.round((rollWeight / totalWeight) * 20);

    for (let i = 0; i < rollsForAbility; i++) {
      if (currentRoll <= 20) {
        possessionChart[currentRoll] = ability;
        currentRoll++;
      }
    }
  }

  // If there are any rolls left, assign them to the ability with the highest weight
  while (currentRoll <= 20) {
    possessionChart[currentRoll] = abilities[abilities.length - 1].ability;
    currentRoll++;
  }

  return possessionChart;
}
