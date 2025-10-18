import { useState, useEffect, useCallback } from 'react';
import { 
  INITIAL_GAME_STATE, LandPlot, Crop, getCropById, INITIAL_LAND_PLOTS, Animal, ANIMALS, getAnimalProductById, 
  SEASONS, DAYS_PER_SEASON, TAX_RATE, INITIAL_GREENHOUSE_PLOT, GREENHOUSE_COST 
} from '@/lib/game-data';
import { showSuccess, showError } from '@/utils/toast';

const BULK_DISCOUNT = 0.05; // 5% discount

export interface PurchaseDetails {
    type: 'seed' | 'animal';
    item: Crop | Animal;
    quantity: number;
    costPerUnit: number;
    discountRate: number;
    taxRate: number;
    totalCost: number;
    taxAmount: number;
}

export const calculatePurchaseDetails = (item: Crop | Animal, quantity: number): PurchaseDetails => {
    const isSeed = 'seedCost' in item;
    const costPerUnit = isSeed ? (item as Crop).seedCost : (item as Animal).purchaseCost;
    
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
        type: isSeed ? 'seed' : 'animal',
        item: item,
        quantity: quantity,
        costPerUnit: costPerUnit,
        discountRate: discountRate,
        taxRate: purchaseTaxRate,
        totalCost: Math.ceil(totalCost), // Round up total cost
        taxAmount: Math.ceil(taxAmount),
    };
};


export function useFarmGame() {
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [availableLand, setAvailableLand] = useState(INITIAL_LAND_PLOTS);

  // --- Game Loop (Time Progression) ---
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const newDay = prev.day + 1;
        
        // 1. Season Progression
        const dayInSeason = (newDay - 1) % DAYS_PER_SEASON;
        const currentSeasonIndex = Math.floor((newDay - 1) / DAYS_PER_SEASON) % SEASONS.length;
        const newSeason = SEASONS[currentSeasonIndex];
        
        if (newSeason !== prev.currentSeason) {
            showSuccess(`It is now ${newSeason}!`);
        }

        // 2. Tax Collection (End of Season)
        let newCash = prev.cash;
        if (dayInSeason === DAYS_PER_SEASON - 1) { // Check if it's the last day of the season
            const taxAmount = Math.floor(prev.cash * TAX_RATE);
            newCash = prev.cash - taxAmount;
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
                            
                            if (isWinter && !isGreenhouse) {
                                return tile;
                            }

                            let growthIncrement = (1 / crop.growthTime) * 100;
                            
                            if (crop.optimalSeason === newSeason) {
                                growthIncrement *= 1.2;
                            }
                            
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

        const newOwnedLand = prev.ownedLand.map(processPlotGrowth);
        const newGreenhousePlot = prev.greenhousePlot ? processPlotGrowth(prev.greenhousePlot) : null;
        
        // 4. Advance Animal Production
        let newInventory = { ...prev.inventory };
        const newOwnedAnimals = prev.ownedAnimals.map(animal => {
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
          ...prev,
          day: newDay,
          currentSeason: newSeason,
          cash: newCash,
          ownedLand: newOwnedLand,
          greenhousePlot: newGreenhousePlot,
          ownedAnimals: newOwnedAnimals,
          inventory: newInventory,
        };
      });
    }, 30000); // 30 seconds per day

    return () => clearInterval(interval);
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
        let newOwnedAnimals = [...prev.ownedAnimals];

        if (details.type === 'seed') {
            const crop = details.item as Crop;
            newInventory[crop.id] = (newInventory[crop.id] || 0) + details.quantity;
            showSuccess(`Purchased ${details.quantity} unit(s) of ${crop.name} seed for $${details.totalCost}. Tax paid: $${details.taxAmount}.`);
        } else if (details.type === 'animal') {
            const animal = details.item as Animal;
            const existingAnimalIndex = prev.ownedAnimals.findIndex(a => a.id === animal.id);

            if (existingAnimalIndex !== -1) {
                newOwnedAnimals = prev.ownedAnimals.map((a, index) => 
                    index === existingAnimalIndex ? { ...a, quantity: a.quantity + details.quantity } : a
                );
            } else {
                newOwnedAnimals = [...prev.ownedAnimals, { ...animal, quantity: details.quantity, daysUntilProduction: animal.productionTime }];
            }
            showSuccess(`Purchased ${details.quantity} ${animal.name}(s) for $${details.totalCost}. Tax paid: $${details.taxAmount}.`);
        }

        return {
            ...prev,
            cash: newCash,
            inventory: newInventory,
            ownedAnimals: newOwnedAnimals,
        };
    });
    return true;
  }, [gameState.cash]);


  // --- Other Handlers (Extracted from FarmManager) ---

  const handleSellAnimal = useCallback((animalId: string, quantity: number) => {
    const animalType = ANIMALS.find(a => a.id === animalId);
    if (!animalType) {
      showError("Animal type not found.");
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

    const value = quantity * basePrice;
    
    setGameState(prev => {
      const newInventory = { ...prev.inventory };
      delete newInventory[itemId];
      
      return {
        ...prev,
        cash: prev.cash + value,
        inventory: newInventory,
      };
    });
    showSuccess(`Sold ${quantity.toLocaleString()} units of ${itemName} for $${value.toLocaleString()}.`);
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

  return {
    gameState,
    availableLand,
    executePurchase,
    handleSellAnimal,
    handleSellItem,
    handleTileAction,
    handleBuyLand,
    handleBuyGreenhouse,
  };
}