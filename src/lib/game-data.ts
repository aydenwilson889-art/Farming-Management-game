import { LucideIcon, Wheat, DollarSign, LandPlot as LandPlotIcon, Tractor, Carrot, Apple, PiggyBank, Egg, Milk, Sheep, Feather, Fish, Rabbit, Bird } from 'lucide-react';

// --- Types ---

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface Crop {
  id: string;
  name: string;
  icon: LucideIcon;
  seedCost: number; // Cost to buy one unit of seed
  growthTime: number; // Time in game days
  baseYield: number; // Base units harvested per plot
  basePrice: number; // Base selling price per unit
  optimalSeason: Season; // New property
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

export interface AnimalProduct {
  id: string;
  name: string;
  icon: LucideIcon;
  basePrice: number;
}

export interface Animal {
  id: string;
  name: string;
  icon: LucideIcon;
  purchaseCost: number;
  productionTime: number; // Time in game days to produce one unit of product
  product: AnimalProduct;
  quantity: number; // How many units of this animal are owned
  daysUntilProduction: number; // Counter for production
}

export interface GameState {
  cash: number;
  day: number;
  currentSeason: Season; // New property
  hasGreenhouse: boolean; // New property
  inventory: Record<string, number>; // CropId/AnimalProductId -> Quantity
  ownedLand: LandPlot[];
  ownedAnimals: Animal[];
}

// --- Constants ---

export const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
export const DAYS_PER_SEASON = 7;
export const TAX_RATE = 0.10; // 10% tax
export const TAX_DAY_INTERVAL = DAYS_PER_SEASON; // Tax collected at the end of every season (Day 7, 14, 21, etc.)
export const GREENHOUSE_COST = 5000;

export const ANIMAL_PRODUCTS: AnimalProduct[] = [
  { id: 'egg', name: 'Egg', icon: Egg, basePrice: 4 },
  { id: 'milk', name: 'Milk', icon: Milk, basePrice: 8 },
  { id: 'pork', name: 'Pork', icon: PiggyBank, basePrice: 12 },
  { id: 'wool', name: 'Wool', icon: Feather, basePrice: 15 },
  { id: 'fish', name: 'Fish', icon: Fish, basePrice: 10 },
  { id: 'rabbit_fur', name: 'Rabbit Fur', icon: Rabbit, basePrice: 7 },
  { id: 'honey', name: 'Honey', icon: Bird, basePrice: 6 },
];

export const ANIMALS: Animal[] = [
  {
    id: 'chicken',
    name: 'Chicken',
    icon: Egg,
    purchaseCost: 50,
    productionTime: 2, // Produces every 2 days
    product: ANIMAL_PRODUCTS.find(p => p.id === 'egg')!,
    quantity: 0,
    daysUntilProduction: 2,
  },
  {
    id: 'cow',
    name: 'Cow',
    icon: Milk,
    purchaseCost: 200,
    productionTime: 3, // Produces every 3 days
    product: ANIMAL_PRODUCTS.find(p => p.id === 'milk')!,
    quantity: 0,
    daysUntilProduction: 3,
  },
  {
    id: 'pig',
    name: 'Pig',
    icon: PiggyBank,
    purchaseCost: 150,
    productionTime: 4,
    product: ANIMAL_PRODUCTS.find(p => p.id === 'pork')!,
    quantity: 0,
    daysUntilProduction: 4,
  },
  {
    id: 'sheep',
    name: 'Sheep',
    icon: Sheep,
    purchaseCost: 100,
    productionTime: 5,
    product: ANIMAL_PRODUCTS.find(p => p.id === 'wool')!,
    quantity: 0,
    daysUntilProduction: 5,
  },
  {
    id: 'fish_farm',
    name: 'Fish Farm',
    icon: Fish,
    purchaseCost: 500,
    productionTime: 7,
    product: ANIMAL_PRODUCTS.find(p => p.id === 'fish')!,
    quantity: 0,
    daysUntilProduction: 7,
  },
  {
    id: 'rabbit',
    name: 'Rabbit',
    icon: Rabbit,
    purchaseCost: 75,
    productionTime: 3,
    product: ANIMAL_PRODUCTS.find(p => p.id === 'rabbit_fur')!,
    quantity: 0,
    daysUntilProduction: 3,
  },
  {
    id: 'bee_hive',
    name: 'Bee Hive',
    icon: Bird, // Using Bird as a placeholder for Bee/Honey
    purchaseCost: 120,
    productionTime: 6,
    product: ANIMAL_PRODUCTS.find(p => p.id === 'honey')!,
    quantity: 0,
    daysUntilProduction: 6,
  },
];


export const CROPS: Crop[] = [
  {
    id: 'wheat',
    name: 'Wheat',
    icon: Wheat,
    seedCost: 1,
    growthTime: 5, // 5 days
    baseYield: 10,
    basePrice: 2,
    optimalSeason: 'Spring',
  },
  {
    id: 'corn',
    name: 'Corn',
    icon: Wheat, // Placeholder icon
    seedCost: 3,
    growthTime: 8, // 8 days
    baseYield: 15,
    basePrice: 3,
    optimalSeason: 'Summer',
  },
  {
    id: 'carrot',
    name: 'Carrot',
    icon: Carrot,
    seedCost: 5,
    growthTime: 6, // 6 days
    baseYield: 12,
    basePrice: 4,
    optimalSeason: 'Autumn',
  },
  {
    id: 'tomato',
    name: 'Tomato',
    icon: Apple, // Using Apple as a placeholder for Tomato
    seedCost: 10,
    growthTime: 10, // 10 days
    baseYield: 20,
    basePrice: 5,
    optimalSeason: 'Summer',
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
  {
    id: 'east_valley',
    name: 'East Valley',
    size: 36, // 6x6 grid
    basePrice: 4000,
    isOwned: false,
    tiles: Array.from({ length: 36 }, (_, i) => ({
      id: `tile-e-${i}`,
      cropId: null,
      growthStage: 0,
      isReadyToHarvest: false,
    })),
  },
];

export const INITIAL_GAME_STATE: GameState = {
  cash: 100, // Starting profit
  day: 1,
  currentSeason: 'Spring',
  hasGreenhouse: false,
  inventory: {},
  ownedLand: INITIAL_LAND_PLOTS.filter(p => p.isOwned),
  ownedAnimals: [],
};

// --- Utility Functions ---

export const getCropById = (id: string): Crop | undefined => {
  return CROPS.find(c => c.id === id);
};

export const getAnimalProductById = (id: string): AnimalProduct | undefined => {
  return ANIMAL_PRODUCTS.find(p => p.id === id);
};