import { LucideIcon, Wheat, DollarSign, LandPlot as LandPlotIcon, Tractor, Carrot, Apple, PiggyBank, Egg, Milk, Feather, Fish, Rabbit, Bird, Droplet, Beef, Drumstick, Factory, Utensils, ChefHat, Soup, UtensilsCrossed, Warehouse, Waves } from 'lucide-react';

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

export interface PlotTile {
  id: string;
  cropId: string | null;
  growthStage: number; // 0 to 100 (percentage)
  isReadyToHarvest: boolean;
  fertilizerId: string | null; // Tracks applied fertilizer
}

export interface LandPlot {
  id: string;
  name: string;
  size: number; // Number of tiles/units
  basePrice: number; // Cost to purchase the land
  isOwned: boolean;
  description: string; // New property
  soilType: string[]; // Array of crop IDs that thrive here
  tiles: PlotTile[];
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
  
  // Meat Animal Properties (if isMeatAnimal is true)
  isMeatAnimal: boolean;
  weight: number; // Current weight (kg)
  minWeight: number; // Minimum weight for butchering
  maxWeight: number; // Maximum weight before quality drops significantly
  optimalWeight: number; // Target weight for best price
  feedCost: number; // Cost to feed one unit of this animal
  isFed: boolean; // Tracks if the animal was fed today
}

export interface Fertilizer {
  id: string;
  name: string;
  icon: LucideIcon;
  cost: number;
  coverage: number; // Number of tiles it affects
  growthBoost: number; // Percentage boost applied instantly (e.g., 0.25 for 25%)
}

export interface Restaurant {
    id: string;
    name: string;
    icon: LucideIcon;
    demand: Record<string, number>; // ProductId -> Price Multiplier (e.g., pork_meat: 1.2)
    description: string;
}

export interface GameState {
  cash: number;
  day: number;
  currentSeason: Season; // New property
  greenhousePlot: LandPlot | null; // The dedicated greenhouse plot
  inventory: Record<string, number>; // CropId/AnimalProductId -> Quantity (Default market/Butcher Shop sales)
  freezerInventory: Record<string, number>; // Meat ProductId -> Quantity (Personal Butcher Stand sales, ready for restaurants)
  fertilizerInventory: Record<string, number>; // FertilizerId -> Quantity
  ownedLand: LandPlot[];
  ownedAnimals: Animal[];
  hasButcherStand: boolean; // New property for Personal Butcher Stand
  hasSilo: boolean; // New property for Silo
  hasWaterPump: boolean; // New property for Water Pump
}

// --- Constants ---

export const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
export const DAYS_PER_SEASON = 7;
export const TAX_RATE = 0.10; // 10% tax
export const TAX_DAY_INTERVAL = DAYS_PER_SEASON; // Tax collected at the end of every season (Day 7, 14, 21, etc.)
export const GREENHOUSE_COST = 5000;
export const GREENHOUSE_SIZE = 6; // 3x2 grid
export const BUTCHER_STAND_COST = 10000; // Cost for the Personal Butcher Stand
export const SILO_COST = 7500; // Cost for the Silo
export const WATER_PUMP_COST = 12000; // Cost for the Water Pump
export const BASE_INVENTORY_CAPACITY = 500; // Base capacity for crops/products
export const SILO_CAPACITY_INCREASE = 5000; // Silo adds 5000 capacity

export const FERTILIZERS: Fertilizer[] = [
  {
    id: 'weak_fert',
    name: 'Weak Fertilizer',
    icon: Droplet,
    cost: 10,
    coverage: 1,
    growthBoost: 0.15, // 15% instant growth boost
  },
  {
    id: 'normal_fert',
    name: 'Normal Fertilizer',
    icon: Droplet,
    cost: 30,
    coverage: 4,
    growthBoost: 0.20, // 20% instant growth boost
  },
  {
    id: 'strong_fert',
    name: 'Strong Fertilizer',
    icon: Droplet,
    cost: 60,
    coverage: 6,
    growthBoost: 0.30, // 30% instant growth boost
  },
];

export const ANIMAL_PRODUCTS: AnimalProduct[] = [
  { id: 'egg', name: 'Egg', icon: Egg, basePrice: 4 },
  { id: 'milk', name: 'Milk', icon: Milk, basePrice: 8 },
  { id: 'pork_meat', name: 'Pork Meat', icon: PiggyBank, basePrice: 12 },
  { id: 'wool', name: 'Wool', icon: Feather, basePrice: 15 },
  { id: 'fish_meat', name: 'Fish Meat', icon: Fish, basePrice: 10 },
  { id: 'beef_meat', name: 'Beef Meat', icon: Beef, basePrice: 18 },
  { id: 'chicken_meat', name: 'Chicken Meat', icon: Drumstick, basePrice: 6 },
  { id: 'honey', name: 'Honey', icon: Bird, basePrice: 6 },
];

// List of meat product IDs
export const MEAT_PRODUCT_IDS = ANIMAL_PRODUCTS.filter(p => p.id.endsWith('_meat') || p.id === 'pork_meat').map(p => p.id);


export const RESTAURANTS: Restaurant[] = [
    {
        id: 'local_diner',
        name: 'The Local Diner',
        icon: Soup,
        description: 'Buys large quantities of cheaper meats for daily specials.',
        demand: {
            'chicken_meat': 1.1, // 10% bonus
            'pork_meat': 1.05, // 5% bonus
            'beef_meat': 0.9, // 10% penalty
        }
    },
    {
        id: 'steakhouse',
        name: 'Prime Steakhouse',
        icon: UtensilsCrossed,
        description: 'Demands high-quality beef, pays a premium for it.',
        demand: {
            'beef_meat': 1.3, // 30% bonus
            'pork_meat': 0.8, // 20% penalty
            'fish_meat': 1.1, // 10% bonus
        }
    },
    {
        id: 'seafood_shack',
        name: 'Seafood Shack',
        icon: Fish,
        description: 'Specializes in fish and poultry.',
        demand: {
            'fish_meat': 1.2, // 20% bonus
            'chicken_meat': 1.15, // 15% bonus
        }
    }
];


export const ANIMALS: Animal[] = [
  // Layer Hen (Egg Producer)
  {
    id: 'layer_hen',
    name: 'Layer Hen',
    icon: Egg,
    purchaseCost: 50,
    productionTime: 2, // Produces every 2 days
    product: ANIMAL_PRODUCTS.find(p => p.id === 'egg')!,
    quantity: 0,
    daysUntilProduction: 2,
    isMeatAnimal: false,
    weight: 0, minWeight: 0, maxWeight: 0, optimalWeight: 0, feedCost: 0, isFed: false,
  },
  // Meat Chicken (Meat Producer)
  {
    id: 'meat_chicken',
    name: 'Meat Chicken',
    icon: Drumstick,
    purchaseCost: 70,
    productionTime: 5, // Ready to butcher every 5 days
    product: ANIMAL_PRODUCTS.find(p => p.id === 'chicken_meat')!,
    quantity: 0,
    daysUntilProduction: 5,
    isMeatAnimal: true,
    weight: 1.0, minWeight: 0.5, maxWeight: 3.0, optimalWeight: 1.5, feedCost: 5, isFed: false,
  },
  // Milk Cow (Milk Producer)
  {
    id: 'milk_cow',
    name: 'Milk Cow',
    icon: Milk,
    purchaseCost: 200,
    productionTime: 3, // Produces every 3 days
    product: ANIMAL_PRODUCTS.find(p => p.id === 'milk')!,
    quantity: 0,
    daysUntilProduction: 3,
    isMeatAnimal: false,
    weight: 0, minWeight: 0, maxWeight: 0, optimalWeight: 0, feedCost: 0, isFed: false,
  },
  // Beef Cow (Meat Producer)
  {
    id: 'beef_cow',
    name: 'Beef Cow',
    icon: Beef,
    purchaseCost: 350,
    productionTime: 10, // Ready to butcher every 10 days
    product: ANIMAL_PRODUCTS.find(p => p.id === 'beef_meat')!,
    quantity: 0,
    daysUntilProduction: 10,
    isMeatAnimal: true,
    weight: 500, minWeight: 400, maxWeight: 800, optimalWeight: 600, feedCost: 50, isFed: false,
  },
  // Pig (Meat Producer)
  {
    id: 'pig',
    name: 'Pig',
    icon: PiggyBank,
    purchaseCost: 150,
    productionTime: 4, // Ready to butcher every 4 days
    product: ANIMAL_PRODUCTS.find(p => p.id === 'pork_meat')!,
    quantity: 0,
    daysUntilProduction: 4,
    isMeatAnimal: true,
    weight: 50, minWeight: 40, maxWeight: 100, optimalWeight: 70, feedCost: 15, isFed: false,
  },
  // Sheep (Wool Producer)
  {
    id: 'sheep',
    name: 'Sheep',
    icon: Feather, 
    purchaseCost: 100,
    productionTime: 5,
    product: ANIMAL_PRODUCTS.find(p => p.id === 'wool')!,
    quantity: 0,
    daysUntilProduction: 5,
    isMeatAnimal: false,
    weight: 0, minWeight: 0, maxWeight: 0, optimalWeight: 0, feedCost: 0, isFed: false,
  },
  // Fish Farm (Meat Producer)
  {
    id: 'fish_farm',
    name: 'Fish Farm',
    icon: Fish,
    purchaseCost: 500,
    productionTime: 7, // Ready to butcher every 7 days
    product: ANIMAL_PRODUCTS.find(p => p.id === 'fish_meat')!,
    quantity: 0,
    daysUntilProduction: 7,
    isMeatAnimal: true,
    weight: 5, minWeight: 3, maxWeight: 10, optimalWeight: 6, feedCost: 20, isFed: false,
  },
  // Bee Hive (Honey Producer)
  {
    id: 'bee_hive',
    name: 'Bee Hive',
    icon: Bird, 
    purchaseCost: 120,
    productionTime: 6,
    product: ANIMAL_PRODUCTS.find(p => p.id === 'honey')!,
    quantity: 0,
    daysUntilProduction: 6,
    isMeatAnimal: false,
    weight: 0, minWeight: 0, maxWeight: 0, optimalWeight: 0, feedCost: 0, isFed: false,
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

// --- Utility Functions for Data Generation ---

const createTiles = (size: number, prefix: string): PlotTile[] => {
    return Array.from({ length: size }, (_, i) => ({
        id: `${prefix}-${i}`,
        cropId: null,
        growthStage: 0,
        isReadyToHarvest: false,
        fertilizerId: null,
    }));
};

export const INITIAL_LAND_PLOTS: LandPlot[] = [
  {
    id: 'grandpas_field',
    name: "Grandpa's Field",
    size: 9, // 3x3 grid for simplicity
    basePrice: 0, // Inherited
    isOwned: true,
    description: "The original plot. Well-balanced soil, perfect for starting out.",
    soilType: ['wheat', 'corn', 'carrot', 'tomato'], // Mixed
    tiles: createTiles(9, 'tile'),
  },
  {
    id: 'north_acre',
    name: 'North Acre',
    size: 16, // 4x4 grid
    basePrice: 500,
    isOwned: false,
    description: "Rich, loamy soil that retains moisture well. Ideal for root vegetables.",
    soilType: ['carrot'],
    tiles: createTiles(16, 'tile-n'),
  },
  {
    id: 'south_pasture',
    name: 'South Pasture',
    size: 25, // 5x5 grid
    basePrice: 1500,
    isOwned: false,
    description: "Dry, sandy soil that drains quickly. Best suited for grains.",
    soilType: ['wheat'],
    tiles: createTiles(25, 'tile-s'),
  },
  {
    id: 'east_valley',
    name: 'East Valley',
    size: 36, // 6x6 grid
    basePrice: 4000,
    isOwned: false,
    description: "Volcanic soil, high in nutrients. Excellent for fruit-bearing plants.",
    soilType: ['tomato', 'corn'],
    tiles: createTiles(36, 'tile-e'),
  },
  // 15 new plots start here
  {
    id: 'plot_5',
    name: 'The Orchard',
    size: 49, // 7x7 grid
    basePrice: 8000,
    isOwned: false,
    description: "Deep, fertile soil. Great for Wheat and Carrots.",
    soilType: ['wheat', 'carrot'],
    tiles: createTiles(49, 'tile-p5'),
  },
  {
    id: 'plot_6',
    name: 'Willow Creek',
    size: 64, // 8x8 grid
    basePrice: 15000,
    isOwned: false,
    description: "Moist, clay-heavy soil near the river. Favors Corn and Tomatoes.",
    soilType: ['corn', 'tomato'],
    tiles: createTiles(64, 'tile-p6'),
  },
  {
    id: 'plot_7',
    name: 'Sunken Meadow',
    size: 81, // 9x9 grid
    basePrice: 25000,
    isOwned: false,
    description: "A balanced mix of all soil types, offering a slight boost to all crops.",
    soilType: ['wheat', 'corn', 'carrot', 'tomato'], // Mixed
    tiles: createTiles(81, 'tile-p7'),
  },
  {
    id: 'plot_8',
    name: 'Rocky Plateau',
    size: 100, // 10x10 grid
    basePrice: 40000,
    isOwned: false,
    description: "Thin, rocky soil. Only the hardiest crops, like Wheat, thrive here.",
    soilType: ['wheat'],
    tiles: createTiles(100, 'tile-p8'),
  },
  {
    id: 'plot_9',
    name: 'The Flats',
    size: 121, // 11x11 grid
    basePrice: 60000,
    isOwned: false,
    description: "Excellent drainage, perfect for Carrots and Tomatoes.",
    soilType: ['carrot', 'tomato'],
    tiles: createTiles(121, 'tile-p9'),
  },
  {
    id: 'plot_10',
    name: 'Old Quarry',
    size: 144, // 12x12 grid
    basePrice: 90000,
    isOwned: false,
    description: "Mineral-rich soil, highly beneficial for Corn.",
    soilType: ['corn'],
    tiles: createTiles(144, 'tile-p10'),
  },
  {
    id: 'plot_11',
    name: 'The Delta',
    size: 169, // 13x13 grid
    basePrice: 130000,
    isOwned: false,
    description: "Silt deposits make this soil highly fertile for all crops.",
    soilType: ['wheat', 'corn', 'carrot', 'tomato'], // Mixed
    tiles: createTiles(169, 'tile-p11'),
  },
  {
    id: 'plot_12',
    name: 'High Ridge',
    size: 196, // 14x14 grid
    basePrice: 180000,
    isOwned: false,
    description: "Exposed to sun and wind. Best for Wheat and Corn.",
    soilType: ['wheat', 'corn'],
    tiles: createTiles(196, 'tile-p12'),
  },
  {
    id: 'plot_13',
    name: 'South Marsh',
    size: 225, // 15x15 grid
    basePrice: 250000,
    isOwned: false,
    description: "Very wet soil, ideal for moisture-loving Tomatoes.",
    soilType: ['tomato'],
    tiles: createTiles(225, 'tile-p13'),
  },
  {
    id: 'plot_14',
    name: 'North Tundra',
    size: 256, // 16x16 grid
    basePrice: 350000,
    isOwned: false,
    description: "Cold, dense soil. Only Carrots can handle the conditions.",
    soilType: ['carrot'],
    tiles: createTiles(256, 'tile-p14'),
  },
  {
    id: 'plot_15',
    name: 'The Mesa',
    size: 289, // 17x17 grid
    basePrice: 500000,
    isOwned: false,
    description: "High altitude, dry air. Favors Wheat and Carrots.",
    soilType: ['wheat', 'carrot'],
    tiles: createTiles(289, 'tile-p15'),
  },
  {
    id: 'plot_16',
    name: 'Hidden Spring',
    size: 324, // 18x18 grid
    basePrice: 750000,
    isOwned: false,
    description: "Perfectly balanced, highly fertile soil. Excellent for all crops.",
    soilType: ['wheat', 'corn', 'carrot', 'tomato'], // Mixed
    tiles: createTiles(324, 'tile-p16'),
  },
  {
    id: 'plot_17',
    name: 'The Summit',
    size: 361, // 19x19 grid
    basePrice: 1000000,
    isOwned: false,
    description: "Extremely rich, dark soil. Best for Corn and Tomatoes.",
    soilType: ['corn', 'tomato'],
    tiles: createTiles(361, 'tile-p17'),
  },
  {
    id: 'plot_18',
    name: 'Grand Valley',
    size: 400, // 20x20 grid
    basePrice: 1500000,
    isOwned: false,
    description: "Vast, open land with deep, reliable soil. Good for Wheat.",
    soilType: ['wheat'],
    tiles: createTiles(400, 'tile-p18'),
  },
  {
    id: 'plot_19',
    name: 'The Frontier',
    size: 441, // 21x21 grid
    basePrice: 2500000,
    isOwned: false,
    description: "Untamed, but incredibly rich soil, boosting all crops significantly.",
    soilType: ['wheat', 'corn', 'carrot', 'tomato'], // Mixed
    tiles: createTiles(441, 'tile-p19'),
  },
];

export const INITIAL_GREENHOUSE_PLOT: LandPlot = {
    id: 'greenhouse',
    name: 'Greenhouse',
    size: GREENHOUSE_SIZE, // 3x2 grid
    basePrice: GREENHOUSE_COST,
    isOwned: false,
    description: "Climate-controlled environment. Soil type is irrelevant here.",
    soilType: [], // Soil type irrelevant in greenhouse
    tiles: createTiles(GREENHOUSE_SIZE, 'gh-tile'),
};

export const INITIAL_GAME_STATE: GameState = {
// ... (rest of state remains the same)
  cash: 100, // Starting profit
  day: 1,
  currentSeason: 'Spring',
  greenhousePlot: null, // Starts unowned
  inventory: {},
  freezerInventory: {}, // New inventory for meat processed via Personal Butcher Stand
  fertilizerInventory: {}, // New inventory for fertilizer
  ownedLand: INITIAL_LAND_PLOTS.filter(p => p.isOwned),
  ownedAnimals: [],
  hasButcherStand: false, // Initialize new property
  hasSilo: false, // Initialize new property
  hasWaterPump: false, // Initialize new property
};

// --- Utility Functions ---

export const getCropById = (id: string): Crop | undefined => {
// ... (rest of utilities remain the same)
  return CROPS.find(c => c.id === id);
};

export const getAnimalProductById = (id: string): AnimalProduct | undefined => {
  return ANIMAL_PRODUCTS.find(p => p.id === id);
};

export const getFertilizerById = (id: string): Fertilizer | undefined => {
  return FERTILIZERS.find(f => f.id === id);
};

export const getRestaurantById = (id: string): Restaurant | undefined => {
    return RESTAURANTS.find(r => r.id === id);
};

/**
 * Calculates the price multiplier for meat based on weight deviation from optimal.
 * 1.0 multiplier at optimal weight.
 * Decreases linearly to 0.5 at min/max weight.
 * @param weight Current weight
 * @param optimalWeight Target weight
 * @param minWeight Minimum acceptable weight
 * @param maxWeight Maximum acceptable weight
 * @returns Price multiplier (0.5 to 1.0)
 */
export const calculateMeatPriceMultiplier = (weight: number, optimalWeight: number, minWeight: number, maxWeight: number): number => {
    if (weight === optimalWeight) return 1.0;

    let deviation: number;
    let maxDeviation: number;

    if (weight < optimalWeight) {
        deviation = optimalWeight - weight;
        maxDeviation = optimalWeight - minWeight;
    } else { // weight > optimalWeight
        deviation = weight - optimalWeight;
        maxDeviation = maxWeight - optimalWeight;
    }
    
    // If maxDeviation is zero (shouldn't happen with current data, but safety check)
    if (maxDeviation <= 0) return 1.0;

    // Calculate how far the deviation is from the maximum possible deviation (0 to 1)
    const normalizedDeviation = Math.min(1, deviation / maxDeviation);

    // Multiplier ranges from 1.0 (at 0 deviation) down to 0.5 (at max deviation)
    return 1.0 - (normalizedDeviation * 0.5);
};