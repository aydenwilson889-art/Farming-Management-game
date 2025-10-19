import { useState, useEffect, useCallback } from 'react';
import { 
  INITIAL_GAME_STATE, LandPlot, Crop, getCropById, INITIAL_LAND_PLOTS, Animal, ANIMALS, getAnimalProductById, 
  SEASONS, DAYS_PER_SEASON, TAX_RATE, INITIAL_GREENHOUSE_PLOT, GREENHOUSE_COST, Season, Fertilizer, getFertilizerById,
  calculateMeatPriceMultiplier, BUTCHER_STAND_COST, MEAT_PRODUCT_IDS, getRestaurantById, Restaurant, GameState
} from '@/lib/game-data';
import { RNG_EVENTS, RNGEvent } from '@/lib/rng-events';
import { showSuccess, showError } from '@/utils/toast';

const BULK_DISCOUNT = 0.05; // 5% discount

export interface PurchaseDetails {
    type: 'seed' | 'animal' | 'fertilizer';
    item: Crop | Animal | Fertilizer;
    quantity: number;
    costPerUnit: number;
    discountRate: number;
    taxRate: number;
    totalCost: number;
    taxAmount: number;
}

export const calculatePurchaseDetails = (item: Crop | Animal | Fertilizer, quantity: number): PurchaseDetails => {
    let costPerUnit: number;
    let type: 'seed' | 'animal' | 'fertilizer';

    if ('seedCost' in item) {
        costPerUnit = (item as Crop).seedCost;
        type = 'seed';
    } else if ('purchaseCost' in item) {
        costPerUnit = (item as Animal).purchaseCost;
        type = 'animal';
    } else {
        costPerUnit = (item as Fertilizer).cost;
        type = 'fertilizer';
    }
    
    // Apply bulk discount if quantity > 1
    const discountRate = quantity > 1 ? BULK_DISCOUNT : 0;
    const subtotal = costPerUnit * quantity;
    const discountAmount = subtotal * discountRate;
    const discountedSubtotal = subtotal - discountAmount;

    // Apply tax (e.g., 5% sales tax on purchases)
    const purchaseTaxRate = 0.05; 
    const taxAmount = discountedSubtotal * purchaseTaxRate;
    const totalCost = discountedSubtotal + taxAmount;

    return {
        type: type,
        item: item,
        quantity: quantity,
        costPerUnit: costPerUnit,
        discountRate: discountRate,
        taxRate: purchaseTaxRate,
        totalCost: Math.ceil(totalCost), // Round up total cost
        taxAmount: Math.ceil(taxAmount),
    };
};

/**
 * Checks for and applies a random event.
 * @param state Current GameState
 * @returns Updated GameState and a boolean indicating if an event occurred.
 */
const handleRandomEvent = (state: GameState): { newState: GameState, eventOccurred: boolean } => {
    const availableEvents = RNG_EVENTS.filter(event => {
        // Filter out negative cost events if the player cannot afford them (based on minCashRequired)
        if (event.type === 'cost' && event.minCashRequired !== undefined) {
            return state.cash >= event.minCashRequired;
        }
        return true;
    });

    for (const event of availableEvents) {
        if (Math.random() < event.probability) {
            const { newState, message } = event.applyEffect(state);
            
            // Use the appropriate toast based on event type
            if (event.type === 'bonus') {
                showSuccess(`${event.name}: ${message}`);
            } else if (event.type === 'cost') {
                showError(`${event.name}: ${message}`);
            } else {
                showSuccess(`${event.name}: ${message}`);
            }
            
            return { newState, eventOccurred: true };
        }
    }

    return { newState: state, eventOccurred: false };
};


export function useFarmGame() {
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [availableLand, setAvailableLand] = useState(INITIAL_LAND_PLOTS);

  // --- Admin/External Adjustment Functions ---

  const adjustCash = useCallback((newCash: number) => {
    setGameState(prev => ({ ...prev, cash: newCash }));
  }, []);

  const adjustDay = useCallback((newDay: number) => {
    // Calculate new season based on the new day
    const dayInSeason = (newDay - 1) % DAYS_PER_SEASON;
    const currentSeasonIndex = Math.floor((newDay - 1) / DAYS_PER_SEASON) % SEASONS.length;
    const newSeason = SEASONS[currentSeasonIndex];

    setGameState(prev => ({ 
        ...prev, 
        day: newDay,
        currentSeason: newSeason,
    }));
  }, []);
  
  const adjustSeason = useCallback((newSeason: Season) => {
    setGameState(prev => ({
        ...prev,
        currentSeason: newSeason,
    }));
    showSuccess(`Season manually set to ${newSeason}.`);
  }, []);


  // --- Game Loop (Time Progression) ---
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        let currentState = prev;
        const newDay = currentState.day + 1;
        
        // 0. Handle Random Events
        const eventResult = handleRandomEvent(currentState);
        currentState = eventResult.newState;

        // 1. Season Progression
        const dayInSeason = (newDay - 1) % DAYS_PER_SEASON;
        const currentSeasonIndex = Math.floor((newDay - 1) / DAYS_PER_SEASON) % SEASONS.length;
        const newSeason = SEASONS[currentSeasonIndex];
        
        if (newSeason !== currentState.currentSeason) {
            showSuccess(`It is now ${newSeason}!`);
        }

        // 2. Tax Collection (End of Season)
        let newCash = currentState.cash;
        if (dayInSeason === DAYS_PER_SEASON - 1) { // Check if it's the last day of the season
            const taxAmount = Math.floor(currentState.cash * TAX_RATE);
            newCash = currentState.cash - taxAmount;
            showError(`Taxes collected! Paid $${taxAmount.toLocaleString()} (10% of cash).`);
        }
        
        // 3. Advance Crop Growth Stages
        const isWinter = newSeason === 'Winter';

        const processPlotGrowth = (plot: LandPlot): LandPlot => {
            const isGreenhouse = plot.id === 'greenhouse';
            
            return {
                ...plot,
                tiles: plot.tiles.map(tile => {
                    if (tile.cropId && !tile.isReadyToHarvest) {
                        const crop = getCropById(tile.cropId);
                        if (crop) {
                            
                            let growthMultiplier = 1;
                            
                            if (isGreenhouse) {
                                // Greenhouse logic: 1.5x speed in Spring/Summer, 1.0x in Autumn/Winter
                                if (newSeason === 'Spring' || newSeason === 'Summer') {
                                    growthMultiplier = 1.5;
                                } else {
                                    growthMultiplier = 1.0; // Normal speed in Autumn/Winter
                                }
                            } else if (isWinter) {
                                // Regular plot freezes in Winter
                                return tile;
                            }

                            // Optimal season bonus applies on top of base/greenhouse multiplier
                            if (crop.optimalSeason === newSeason) {
                                growthMultiplier *= 1.2;
                            }
                            
                            let growthIncrement = (1 / crop.growthTime) * 100 * growthMultiplier;
                            
                            let newGrowthStage = tile.growthStage + growthIncrement;
                            
                            if (newGrowthStage >= 100) {
                                newGrowthStage = 100;
                                return { ...tile, growthStage: newGrowthStage, isReadyToHarvest: true };
                            }
                            return { ...tile, growthStage: newGrowthStage };
                        }
                    }
                    return tile;
                })
            };
        };

        const newOwnedLand = currentState.ownedLand.map(processPlotGrowth);
        const newGreenhousePlot = currentState.greenhousePlot ? processPlotGrowth(currentState.greenhousePlot) : null;
        
        // 4. Advance Animal Production & Weight Management
        let newInventory = { ...currentState.inventory };
        const newOwnedAnimals = currentState.ownedAnimals.map(animal => {
          
          // Handle Meat Animal Weight Change
          if (animal.isMeatAnimal) {
            let newWeight = animal.weight;
            const weightChangeFactor = (animal.maxWeight - animal.minWeight) * 0.05; // 5% of total range
            
            if (animal.isFed) {
                // Fed: Weight increases towards optimal weight, or slightly past it
                const targetWeight = animal.optimalWeight + weightChangeFactor;
                newWeight = Math.min(animal.maxWeight, newWeight + (Math.random() * weightChangeFactor * 0.5) + (targetWeight - newWeight) * 0.1);
            } else {
                // Not Fed: Weight decreases towards min weight
                const targetWeight = animal.minWeight;
                newWeight = Math.max(animal.minWeight, newWeight - (Math.random() * weightChangeFactor * 0.5) - (newWeight - targetWeight) * 0.05);
            }
            
            // Reset isFed status for the next day
            return { 
                ...animal, 
                weight: parseFloat(newWeight.toFixed(2)), 
                isFed: false,
                daysUntilProduction: animal.daysUntilProduction - 1,
            };
          }
          
          // Handle Regular Animal Production
          const daysLeft = animal.daysUntilProduction - 1;
          
          if (daysLeft <= 0) {
            const product = animal.product;
            const yieldAmount = animal.quantity;
            
            newInventory[product.id] = (newInventory[product.id] || 0) + yieldAmount;
            showSuccess(`Collected ${yieldAmount} unit(s) of ${product.name} from the ${animal.name}s!`);
            
            return { ...animal, daysUntilProduction: animal.productionTime };
          }
          
          return { ...animal, daysUntilProduction: daysLeft };
        });

        return {
          ...currentState,
          day: newDay,
          currentSeason: newSeason,
          cash: newCash,
          ownedLand: newOwnedLand,
          greenhousePlot: newGreenhousePlot,
          ownedAnimals: newOwnedAnimals.map(a => a.isMeatAnimal ? a : { ...a, daysUntilProduction: a.daysUntilProduction }), // Ensure non-meat animals update daysUntilProduction correctly
          inventory: newInventory,
        };
      });
    }, 30000); // 30 seconds per day

    return () => clearInterval(interval);
  }, []);
  
  // --- New Animal Handlers ---
  
  const handleFeedAnimal = useCallback((animalId: string) => {
    setGameState(prev => {
        const animalIndex = prev.ownedAnimals.findIndex(a => a.id === animalId);
        if (animalIndex === -1) return prev;
        
        const animal = prev.ownedAnimals[animalIndex];
        if (!animal.isMeatAnimal) return prev;
        
        const totalFeedCost = animal.feedCost * animal.quantity;
        
        if (prev.cash < totalFeedCost) {
            showError(`Cannot afford to feed ${animal.name}s. Cost: $${totalFeedCost}.`);
            return prev;
        }
        
        if (animal.isFed) {
            showError(`${animal.name}s have already been fed today.`);
            return prev;
        }
        
        const newOwnedAnimals = prev.ownedAnimals.map((a, index) => 
            index === animalIndex ? { ...a, isFed: true } : a
        );
        
        showSuccess(`Fed ${animal.quantity} ${animal.name}(s) for $${totalFeedCost}.`);
        
        return {
            ...prev,
            cash: prev.cash - totalFeedCost,
            ownedAnimals: newOwnedAnimals,
        };
    });
  }, []);

  // --- Purchase Handlers ---

  const executePurchase = useCallback((details: PurchaseDetails) => {
    if (gameState.cash < details.totalCost) {
        showError("Insufficient funds for this purchase.");
        return false;
    }

    setGameState(prev => {
        let newCash = prev.cash - details.totalCost;
        let newInventory = { ...prev.inventory };
        let newFertilizerInventory = { ...prev.fertilizerInventory };
        let newOwnedAnimals = [...prev.ownedAnimals];

        if (details.type === 'seed') {
            const crop = details.item as Crop;
            newInventory[crop.id] = (newInventory[crop.id] || 0) + details.quantity;
            showSuccess(`Purchased ${details.quantity} unit(s) of ${crop.name} seed for $${details.totalCost}. Tax paid: $${details.taxAmount}.`);
        } else if (details.type === 'animal') {
            const animalTemplate = details.item as Animal;
            const existingAnimalIndex = prev.ownedAnimals.findIndex(a => a.id === animalTemplate.id);

            // When buying, initialize meat animals with their optimal weight
            const newAnimalUnit = { 
                ...animalTemplate, 
                quantity: details.quantity, 
                daysUntilProduction: animalTemplate.productionTime,
                weight: animalTemplate.isMeatAnimal ? animalTemplate.optimalWeight : 0,
                isFed: false,
            };

            if (existingAnimalIndex !== -1) {
                newOwnedAnimals = prev.ownedAnimals.map((a, index) => 
                    index === existingAnimalIndex ? { ...a, quantity: a.quantity + details.quantity } : a
                );
            } else {
                newOwnedAnimals = [...prev.ownedAnimals, newAnimalUnit];
            }
            showSuccess(`Purchased ${details.quantity} ${animalTemplate.name}(s) for $${details.totalCost}. Tax paid: $${details.taxAmount}.`);
        } else if (details.type === 'fertilizer') {
            const fertilizer = details.item as Fertilizer;
            newFertilizerInventory[fertilizer.id] = (newFertilizerInventory[fertilizer.id] || 0) + details.quantity;
            showSuccess(`Purchased ${details.quantity} unit(s) of ${fertilizer.name} for $${details.totalCost}. Tax paid: $${details.taxAmount}.`);
        }

        return {
            ...prev,
            cash: newCash,
            inventory: newInventory,
            fertilizerInventory: newFertilizerInventory,
            ownedAnimals: newOwnedAnimals,
        };
    });
    return true;
  }, [gameState.cash]);


  // --- Fertilizer Handler (Omitted for brevity, assuming existing logic is fine) ---

  const handleApplyFertilizer = useCallback((plotId: string, tileId: string, fertilizerId: string) => {
    const fertilizer = getFertilizerById(fertilizerId);
    if (!fertilizer) {
        showError("Invalid fertilizer type.");
        return;
    }

    setGameState(prev => {
        if ((prev.fertilizerInventory[fertilizerId] || 0) < 1) {
            showError(`You need to buy ${fertilizer.name} first!`);
            return prev;
        }

        let targetPlot: LandPlot | null = null;
        let plotIndex = -1;
        
        if (plotId === 'greenhouse' && prev.greenhousePlot) {
            targetPlot = prev.greenhousePlot;
        } else {
            plotIndex = prev.ownedLand.findIndex(p => p.id === plotId);
            if (plotIndex !== -1) {
                targetPlot = prev.ownedLand[plotIndex];
            }
        }

        if (!targetPlot) return prev;

        const tileIndex = targetPlot.tiles.findIndex(t => t.id === tileId);
        if (tileIndex === -1) return prev;
        
        const tiles = [...targetPlot.tiles];
        const tile = tiles[tileIndex];

        if (!tile.cropId) {
            showError("Fertilizer can only be applied to planted crops.");
            return prev;
        }
        if (tile.fertilizerId) {
            showError("This tile already has fertilizer applied.");
            return prev;
        }
        
        // 1. Calculate affected tiles (simple square coverage centered on tileId)
        const plotSize = Math.sqrt(targetPlot.size);
        const centerRow = Math.floor(tileIndex / plotSize);
        const centerCol = tileIndex % plotSize;
        
        const affectedIndices: number[] = [];
        
        // Weak (1 tile)
        if (fertilizer.coverage === 1) {
            affectedIndices.push(tileIndex);
        } 
        // Normal (4 tiles, 2x2)
        else if (fertilizer.coverage === 4) {
            // Try to center 2x2 block on the tile, prioritizing top-left corner
            const startRow = Math.max(0, Math.min(plotSize - 2, centerRow));
            const startCol = Math.max(0, Math.min(plotSize - 2, centerCol));
            
            for (let r = startRow; r < startRow + 2; r++) {
                for (let c = startCol; c < startCol + 2; c++) {
                    affectedIndices.push(r * plotSize + c);
                }
            }
        }
        // Strong (6 tiles, 3x2 or 2x3, prioritizing 3x2 horizontal spread)
        else if (fertilizer.coverage === 6) {
            // Determine if the plot is wide enough for 3 columns (e.g., 3x3, 4x4, 5x5 plots)
            const isWideEnough = plotSize >= 3;
            
            if (isWideEnough) {
                // Prioritize 3x2 horizontal spread
                const startRow = Math.max(0, Math.min(plotSize - 2, centerRow));
                const startCol = Math.max(0, Math.min(plotSize - 3, centerCol));
                
                for (let r = startRow; r < startRow + 2; r++) {
                    for (let c = startCol; c < startCol + 3; c++) {
                        affectedIndices.push(r * plotSize + c);
                    }
                }
            } else {
                // Fallback for narrow plots (e.g., 3x2 greenhouse) - use 2x3 vertical spread if possible
                const startRow = Math.max(0, Math.min(plotSize - 3, centerRow));
                const startCol = Math.max(0, Math.min(plotSize - 2, centerCol));
                
                for (let r = startRow; r < startRow + 3; r++) {
                    for (let c = startCol; c < startCol + 2; c++) {
                        affectedIndices.push(r * plotSize + c);
                    }
                }
            }
        }
        
        let tilesFertilizedCount = 0;
        
        // 2. Apply boost and mark tiles as fertilized
        const updatedTiles = tiles.map((t, index) => {
            if (affectedIndices.includes(index) && t.cropId && !t.fertilizerId && !t.isReadyToHarvest) {
                tilesFertilizedCount++;
                
                // Apply instant growth boost
                let newGrowthStage = t.growthStage + (fertilizer.growthBoost * 100);
                let isReadyToHarvest = false;
                if (newGrowthStage >= 100) {
                    newGrowthStage = 100;
                    isReadyToHarvest = true;
                }
                
                return {
                    ...t,
                    growthStage: newGrowthStage,
                    isReadyToHarvest: isReadyToHarvest,
                    fertilizerId: fertilizerId,
                };
            }
            return t;
        });

        if (tilesFertilizedCount === 0) {
            showError("Fertilizer could not be applied to any valid, unfertilized crops in the area.");
            return prev;
        }

        // 3. Consume fertilizer and update plot
        const newFertilizerInventory = { ...prev.fertilizerInventory, [fertilizerId]: prev.fertilizerInventory[fertilizerId] - 1 };
        if (newFertilizerInventory[fertilizerId] === 0) delete newFertilizerInventory[fertilizerId];

        const updatedPlot = { ...targetPlot, tiles: updatedTiles };

        let newOwnedLand = [...prev.ownedLand];
        let newGreenhousePlot = prev.greenhousePlot;

        if (targetPlot.id === 'greenhouse') {
            newGreenhousePlot = updatedPlot;
        } else {
            newOwnedLand[plotIndex] = updatedPlot;
        }

        showSuccess(`Applied ${fertilizer.name}! Boosted ${tilesFertilizedCount} crop(s).`);

        return { 
            ...prev, 
            ownedLand: newOwnedLand, 
            greenhousePlot: newGreenhousePlot,
            fertilizerInventory: newFertilizerInventory,
        };
    });
  }, []);


  // --- Sell/Butcher Handlers ---

  const handleButcherAnimal = useCallback((animalId: string) => {
    setGameState(prev => {
        const animalIndex = prev.ownedAnimals.findIndex(a => a.id === animalId);
        if (animalIndex === -1) return prev;
        
        const animal = prev.ownedAnimals[animalIndex];
        if (!animal.isMeatAnimal) {
            showError("Only meat animals can be butchered.");
            return prev;
        }
        
        if (animal.daysUntilProduction > 1) {
            showError(`${animal.name}s are not ready to butcher yet.`);
            return prev;
        }

        // 1. Calculate meat yield and price multiplier
        const multiplier = calculateMeatPriceMultiplier(animal.weight, animal.optimalWeight, animal.minWeight, animal.maxWeight);
        const meatYield = animal.quantity; 
        
        // 2. Determine where the meat goes (Inventory or Freezer)
        let newInventory = { ...prev.inventory };
        let newFreezerInventory = { ...prev.freezerInventory };
        const productId = animal.product.id;
        
        if (prev.hasButcherStand) {
            // Meat goes into the freezer (ready for restaurant sales)
            newFreezerInventory[productId] = (newFreezerInventory[productId] || 0) + meatYield;
            showSuccess(`Butchered ${animal.quantity} ${animal.name}(s) via Personal Stand. ${meatYield} units of ${animal.product.name} stored in freezer.`);
        } else {
            // Meat goes directly to regular inventory (ready for immediate sale at Butcher Shop tax rate)
            newInventory[productId] = (newInventory[productId] || 0) + meatYield;
            showSuccess(`Butchered ${animal.quantity} ${animal.name}(s) via Butcher Shop. ${meatYield} units of ${animal.product.name} added to inventory.`);
        }
        
        // 3. Remove animal from ownedAnimals (since they are butchered)
        const newOwnedAnimals = prev.ownedAnimals.filter(a => a.id !== animalId);
        
        return {
            ...prev,
            inventory: newInventory,
            freezerInventory: newFreezerInventory,
            ownedAnimals: newOwnedAnimals,
        };
    });
  }, []);
  
  // Handles selling non-meat animals directly (deprecated but kept for structure)
  const handleSellAnimal = useCallback((animalId: string, quantity: number) => {
    const animalType = ANIMALS.find(a => a.id === animalId);
    if (!animalType || animalType.isMeatAnimal) {
        showError("Meat animals must be butchered first.");
        return;
    }
    
    const sellPricePerUnit = Math.floor(animalType.purchaseCost * 0.75);
    const totalSellValue = quantity * sellPricePerUnit;

    setGameState(prev => {
      const existingAnimalIndex = prev.ownedAnimals.findIndex(a => a.id === animalId);
      
      if (existingAnimalIndex === -1 || prev.ownedAnimals[existingAnimalIndex].quantity < quantity) {
        showError("Error selling animals: Quantity mismatch.");
        return prev;
      }

      const newOwnedAnimals = prev.ownedAnimals.filter(a => a.id !== animalId);
      
      return {
        ...prev,
        cash: prev.cash + totalSellValue,
        ownedAnimals: newOwnedAnimals,
      };
    });
    showSuccess(`Sold ${quantity} ${animalType.name}(s) for $${totalSellValue.toLocaleString()}.`);
  }, []);


  // Handles selling crops and non-meat products (eggs, milk, wool, honey) AND meat products processed by the external Butcher Shop (i.e., those in regular inventory)
  const handleSellItem = useCallback((itemId: string, quantity: number) => {
    const crop = getCropById(itemId);
    const product = getAnimalProductById(itemId);
    
    let basePrice = 0;
    let itemName = "";

    if (crop) {
      basePrice = crop.basePrice;
      itemName = crop.name;
    } else if (product) {
      basePrice = product.basePrice;
      itemName = product.name;
    } else {
      showError("Item not found in market.");
      return;
    }

    let value = quantity * basePrice;
    
    // Check if this is a meat product sold via the default market (which implies the 50% tax)
    const isMeatProduct = MEAT_PRODUCT_IDS.includes(itemId);
    
    if (isMeatProduct) {
        // Butcher Shop tax: takes away half the price (50% reduction)
        value = Math.floor(value * 0.5);
        showSuccess(`Butcher Shop tax applied. Sold ${quantity.toLocaleString()} units of ${itemName} for $${value.toLocaleString()}.`);
    } else {
        // Selling non-meat items (crops, eggs, milk, wool, honey)
        showSuccess(`Sold ${quantity.toLocaleString()} units of ${itemName} for $${value.toLocaleString()}.`);
    }
    
    setGameState(prev => {
      const newInventory = { ...prev.inventory };
      // Ensure we only remove the quantity sold, although currently FarmShop sells all.
      // Since FarmShop currently sells ALL, we delete the entry.
      delete newInventory[itemId];
      
      return {
        ...prev,
        cash: prev.cash + value,
        inventory: newInventory,
      };
    });
  }, []);
  
  
  // New handler for selling meat from the freezer to restaurants
  const handleSellMeatToRestaurant = useCallback((restaurantId: string, productId: string, quantity: number) => {
      const restaurant = getRestaurantById(restaurantId);
      const product = getAnimalProductById(productId);
      
      if (!restaurant || !product || !MEAT_PRODUCT_IDS.includes(productId)) {
          showError("Invalid sale attempt.");
          return;
      }
      
      setGameState(prev => {
          const availableQuantity = prev.freezerInventory[productId] || 0;
          if (availableQuantity < quantity) {
              showError(`Insufficient ${product.name} in the freezer.`);
              return prev;
          }
          
          const basePrice = product.basePrice;
          const multiplier = restaurant.demand[productId] || 1.0; // Default multiplier is 1.0
          
          const unitValue = Math.floor(basePrice * multiplier);
          const totalValue = quantity * unitValue;
          
          const newFreezerInventory = { ...prev.freezerInventory };
          newFreezerInventory[productId] -= quantity;
          if (newFreezerInventory[productId] <= 0) {
              delete newFreezerInventory[productId];
          }
          
          showSuccess(`Sold ${quantity} units of ${product.name} to ${restaurant.name} for $${totalValue.toLocaleString()} (${(multiplier * 100).toFixed(0)}% price).`);
          
          return {
              ...prev,
              cash: prev.cash + totalValue,
              freezerInventory: newFreezerInventory,
          };
      });
  }, []);


  const handleTileAction = useCallback((plotId: string, tileId: string, action: 'plant' | 'harvest', selectedCropId: string | null) => {
    setGameState(prev => {
      
      let targetPlot: LandPlot | null = null;
      let plotIndex = -1;
      
      if (plotId === 'greenhouse' && prev.greenhousePlot) {
          targetPlot = prev.greenhousePlot;
      } else {
          plotIndex = prev.ownedLand.findIndex(p => p.id === plotId);
          if (plotIndex !== -1) {
              targetPlot = prev.ownedLand[plotIndex];
          }
      }

      if (!targetPlot) return prev;

      const isGreenhouse = targetPlot.id === 'greenhouse';
      const isWinter = prev.currentSeason === 'Winter';
      
      const tileIndex = targetPlot.tiles.findIndex(t => t.id === tileId);
      if (tileIndex === -1) return prev;
      
      const tile = { ...targetPlot.tiles[tileIndex] };
      
      let newInventory = { ...prev.inventory };
      let newOwnedLand = [...prev.ownedLand];
      let newGreenhousePlot = prev.greenhousePlot;


      if (action === 'plant' && selectedCropId) {
        const crop = getCropById(selectedCropId);
        if (!crop) return prev;
        
        if (isWinter && !isGreenhouse) {
            showError("Cannot plant during Winter outside of the Greenhouse!");
            return prev;
        }

        const seedCount = prev.inventory[selectedCropId] || 0;
        
        if (seedCount > 0) {
          tile.cropId = selectedCropId;
          tile.growthStage = 0;
          tile.isReadyToHarvest = false;
          tile.fertilizerId = null; // Reset fertilizer status on planting
          
          newInventory[selectedCropId] = seedCount - 1;
          if (newInventory[selectedCropId] === 0) delete newInventory[selectedCropId];
          
          showSuccess(`Planted ${crop.name} seed in ${targetPlot.name}.`);
          
        } else {
          showError(`You need to buy ${crop.name} seeds first!`);
          return prev;
        }
      } 
      
      if (action === 'harvest' && tile.isReadyToHarvest && tile.cropId) {
        const crop = getCropById(tile.cropId);
        if (!crop) return prev;
        
        const yieldAmount = crop.baseYield; 
        
        tile.cropId = null;
        tile.growthStage = 0;
        tile.isReadyToHarvest = false;
        tile.fertilizerId = null; // Clear fertilizer status on harvest
        
        newInventory = { 
          ...prev.inventory, 
          [crop.id]: (prev.inventory[crop.id] || 0) + yieldAmount 
        };
        
        showSuccess(`Harvested ${yieldAmount} units of ${crop.name} from ${targetPlot.name}!`);
      }
      
      const updatedPlot = { ...targetPlot, tiles: targetPlot.tiles.map((t, i) => i === tileIndex ? tile : t) };

      if (isGreenhouse) {
          newGreenhousePlot = updatedPlot;
      } else {
          newOwnedLand[plotIndex] = updatedPlot;
      }

      return { 
          ...prev, 
          ownedLand: newOwnedLand, 
          greenhousePlot: newGreenhousePlot,
          inventory: newInventory 
      };
    });
  }, [gameState.currentSeason]);
  
  const handleBuyLand = useCallback((plot: LandPlot) => {
    if (gameState.cash >= plot.basePrice) {
      setGameState(prev => {
        const newPlot = { ...plot, isOwned: true };
        
        const newOwnedLand = [...prev.ownedLand, newPlot];
        
        setAvailableLand(prevAvailable => prevAvailable.map(p => p.id === plot.id ? newPlot : p));
        
        return {
          ...prev,
          cash: prev.cash - plot.basePrice,
          ownedLand: newOwnedLand,
        };
      });
      showSuccess(`Successfully purchased ${plot.name} for $${plot.basePrice.toLocaleString()}.`);
    } else {
      showError("Insufficient funds to purchase this land plot.");
    }
  }, [gameState.cash]);

  const handleBuyGreenhouse = useCallback(() => {
    if (gameState.cash >= GREENHOUSE_COST) {
        setGameState(prev => ({
            ...prev,
            cash: prev.cash - GREENHOUSE_COST,
            greenhousePlot: { ...INITIAL_GREENHOUSE_PLOT, isOwned: true },
        }));
        showSuccess("Greenhouse purchased! You can now grow crops year-round in the dedicated plot.");
    } else {
        showError("Insufficient funds to purchase the Greenhouse.");
    }
  }, [gameState.cash]);
  
  const handleBuyButcherStand = useCallback(() => {
    if (gameState.cash >= BUTCHER_STAND_COST) {
        setGameState(prev => ({
            ...prev,
            cash: prev.cash - BUTCHER_STAND_COST,
            hasButcherStand: true,
        }));
        showSuccess("Personal Butcher Stand purchased! You can now process meat products for restaurant sales.");
    } else {
        showError("Insufficient funds to purchase the Personal Butcher Stand.");
    }
  }, [gameState.cash]);


  return {
    gameState,
    availableLand,
    executePurchase,
    handleSellAnimal,
    handleButcherAnimal,
    handleFeedAnimal,
    handleSellItem,
    handleSellMeatToRestaurant, // Export new handler
    handleTileAction,
    handleBuyLand,
    handleBuyGreenhouse,
    handleBuyButcherStand,
    handleApplyFertilizer,
    adjustCash,
    adjustDay,
    adjustSeason,
  };
}