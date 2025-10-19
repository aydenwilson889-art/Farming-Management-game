import { LucideIcon, Wrench, AlertTriangle, Droplet, Leaf, DollarSign } from 'lucide-react';
import { GameState } from './game-data';

export type EventType = 'cost' | 'bonus' | 'status';

export interface RNGEvent {
    id: string;
    name: string;
    icon: LucideIcon;
    description: string;
    type: EventType;
    probability: number; // 0.0 to 1.0 (e.g., 0.05 for 5% chance per day)
    minCashRequired?: number; // Minimum cash needed to trigger a negative cost event
    
    // Effect properties
    cashChange?: number; // Positive for bonus, negative for cost
    inventoryChange?: Record<string, number>; // { itemId: quantityChange }
    
    // Custom logic handler (optional, for complex effects like crop damage)
    applyEffect: (state: GameState) => { newState: GameState, message: string };
}

// --- Event Definitions ---

const TRACTOR_BREAKDOWN_COST = 2000;
const MIN_CASH_FOR_TRACTOR_BREAKDOWN = 4000; // Must have at least double the cost

export const RNG_EVENTS: RNGEvent[] = [
    {
        id: 'tractor_breakdown',
        name: 'Tractor Breakdown',
        icon: Wrench,
        description: 'Your main tractor broke down and requires immediate repair.',
        type: 'cost',
        probability: 0.03, // 3% chance per day
        minCashRequired: MIN_CASH_FOR_TRACTOR_BREAKDOWN,
        cashChange: -TRACTOR_BREAKDOWN_COST,
        applyEffect: (state) => {
            const cost = TRACTOR_BREAKDOWN_COST;
            const newCash = state.cash - cost;
            
            return {
                newState: { ...state, cash: newCash },
                message: `Tractor repair cost: $${cost.toLocaleString()}.`,
            };
        }
    },
    {
        id: 'market_boom',
        name: 'Local Market Boom',
        icon: DollarSign,
        description: 'A sudden surge in demand boosts your cash reserves.',
        type: 'bonus',
        probability: 0.02, // 2% chance per day
        cashChange: 1000,
        applyEffect: (state) => {
            const bonus = 1000;
            const newCash = state.cash + bonus;
            
            return {
                newState: { ...state, cash: newCash },
                message: `Received $${bonus.toLocaleString()} market bonus!`,
            };
        }
    },
    {
        id: 'heavy_rain',
        name: 'Heavy Rain',
        icon: Droplet,
        description: 'Unexpected heavy rain provides free watering for all crops.',
        type: 'status',
        probability: 0.05, // 5% chance per day
        applyEffect: (state) => {
            // No state change needed for this simple status effect, just a message
            return {
                newState: state,
                message: 'All crops received extra watering today!',
            };
        }
    },
    {
        id: 'pest_infestation',
        name: 'Pest Infestation',
        icon: AlertTriangle,
        description: 'A small pest outbreak damages some crops.',
        type: 'cost',
        probability: 0.01, // 1% chance per day
        minCashRequired: 0, // Can happen regardless of cash
        applyEffect: (state) => {
            let tilesDamaged = 0;
            
            const damagePlot = (plot: GameState['ownedLand'][0]): GameState['ownedLand'][0] => {
                return {
                    ...plot,
                    tiles: plot.tiles.map(tile => {
                        // 10% chance to damage any growing crop
                        if (tile.cropId && !tile.isReadyToHarvest && Math.random() < 0.10) {
                            tilesDamaged++;
                            // Reduce growth by 20%
                            return { ...tile, growthStage: Math.max(0, tile.growthStage - 20) };
                        }
                        return tile;
                    })
                };
            };
            
            const newOwnedLand = state.ownedLand.map(damagePlot);
            const newGreenhousePlot = state.greenhousePlot ? damagePlot(state.greenhousePlot) : null;
            
            const message = tilesDamaged > 0 
                ? `Pests damaged ${tilesDamaged} crop(s), reducing growth by 20%.`
                : 'Pests were spotted but caused no damage today.';
            
            return {
                newState: { ...state, ownedLand: newOwnedLand, greenhousePlot: newGreenhousePlot },
                message: message,
            };
        }
    }
];