import { LucideIcon, Wheat, DollarSign, LandPlot, Tractor } from 'lucide-react';

// --- Types ---

export interface Crop {
  id: string;
  name: string;
  icon: LucideIcon;
  seedCost: number; // Cost to buy one unit of seed
  growthTime: number; // Time in game days
  baseYield: number; // Base units harvested per plot
  basePrice: number; // Base selling price per unit
}

export interface LandPlot {
  id: string;
  name: string;
  size: number; // Number of tiles/units
  basePrice: number; // Cost to purchase the land
  isOwned: boolean;
  tiles: PlotTile[];
}

export interface PlotTile {
  id: string;
  cropId: string | null;
  growthStage: number; // 0 to 100 (percentage)
  isReadyToHarvest: boolean;
}

export interface GameState {
  cash: number;
  day: number;
  inventory: Record<string, number>; // CropId -> Quantity
  ownedLand: LandPlot[];
}

// --- Constants ---

export const CROPS: Crop[] = [
  {
    id: 'wheat',
    name: 'Wheat',
    icon: Wheat,
    seedCost: 1,
    growthTime: 5, // 5 days
    baseYield: 10,
    basePrice: 2,
  },
  {
    id: 'corn',
    name: 'Corn',
    icon: Wheat, // Placeholder icon
    seedCost: 3,
    growthTime: 8, // 8 days
    baseYield: 15,
    basePrice: 3,
  },
];

export const INITIAL_LAND_PLOTS: LandPlot[] = [
  {
    id: 'grandpas_field',
    name: "Grandpa's Field",
    size: 9, // 3x3 grid for simplicity
    basePrice: 0, // Inherited
    isOwned: true,
    tiles: Array.from({ length: 9 }, (_, i) => ({
      id: `tile-${i}`,
      cropId: null,
      growthStage: 0,
      isReadyToHarvest: false,
    })),
  },
  {
    id: 'north_acre',
    name: 'North Acre',
    size: 16, // 4x4 grid
    basePrice: 500,
    isOwned: false,
    tiles: Array.from({ length: 16 }, (_, i) => ({
      id: `tile-n-${i}`,
      cropId: null,
      growthStage: 0,
      isReadyToHarvest: false,
    })),
  },
  {
    id: 'south_pasture',
    name: 'South Pasture',
    size: 25, // 5x5 grid
    basePrice: 1500,
    isOwned: false,
    tiles: Array.from({ length: 25 }, (_, i) => ({
      id: `tile-s-${i}`,
      cropId: null,
      growthStage: 0,
      isReadyToHarvest: false,
    })),
  },
];

export const INITIAL_GAME_STATE: GameState = {
  cash: 100, // Starting profit
  day: 1,
  inventory: {},
  ownedLand: INITIAL_LAND_PLOTS.filter(p => p.isOwned),
};

// --- Utility Functions ---

export const getCropById = (id: string): Crop | undefined => {
  return CROPS.find(c => c.id === id);
};