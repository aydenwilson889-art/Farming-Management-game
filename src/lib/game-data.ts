export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  type: 'click' | 'passive';
  baseEffect: number;
}

export const UPGRADES: Upgrade[] = [
  {
    id: 'net',
    name: 'Better Net',
    description: 'Increases fish per click by 1.',
    baseCost: 10,
    costMultiplier: 1.15,
    type: 'click',
    baseEffect: 1,
  },
  {
    id: 'boat',
    name: 'Fishing Boat',
    description: 'Generates 1 Fish per second (FPS).',
    baseCost: 100,
    costMultiplier: 1.2,
    type: 'passive',
    baseEffect: 1,
  },
  {
    id: 'factory',
    name: 'Fish Factory',
    description: 'Generates 10 Fish per second (FPS).',
    baseCost: 1000,
    costMultiplier: 1.25,
    type: 'passive',
    baseEffect: 10,
  },
];

export const calculateCost = (baseCost: number, multiplier: number, owned: number): number => {
  return Math.floor(baseCost * Math.pow(multiplier, owned));
};