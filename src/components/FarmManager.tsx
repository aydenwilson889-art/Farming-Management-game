"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_GAME_STATE, LandPlot, Crop, getCropById, INITIAL_LAND_PLOTS, Animal, getAnimalProductById, SEASONS, DAYS_PER_SEASON, TAX_RATE, TAX_DAY_INTERVAL, GREENHOUSE_COST } from '@/lib/game-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, LandPlot as LandPlotIcon, Tractor, PawPrint, Sun, Snowflake, Leaf, Cloud } from 'lucide-react';
import FarmMap from './FarmMap';
import FarmShop from './FarmShop';
import AnimalPen from './AnimalPen';
import FarmConstruction from './FarmConstruction'; // Import the new component
import { showSuccess, showError } from '@/utils/toast';

const FarmManager: React.FC = () => {
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [availableLand, setAvailableLand] = useState(INITIAL_LAND_PLOTS);

  const getSeasonIcon = (season: typeof SEASONS[number]) => {
    switch (season) {
      case 'Spring': return Leaf;
      case 'Summer': return Sun;
      case 'Autumn': return Cloud;
      case 'Winter': return Snowflake;
      default: return Clock;
    }
  };

  // --- Game Loop (Time Progression) ---
  useEffect(() => {
    // Advance time every 30 seconds (representing one game day)
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
        const canGrowInWinter = prev.hasGreenhouse;

        const newOwnedLand = prev.ownedLand.map(plot => ({
          ...plot,
          tiles: plot.tiles.map(tile => {
            if (tile.cropId && !tile.isReadyToHarvest) {
              const crop = getCropById(tile.cropId);
              if (crop) {
                
                // Check for seasonal growth restriction
                if (isWinter && !canGrowInWinter) {
                    // Crop growth stops in winter without a greenhouse
                    return tile;
                }

                // Calculate growth increment based on 100% / growthTime
                let growthIncrement = (1 / crop.growthTime) * 100;
                
                // Apply optimal season bonus (e.g., 20% faster growth)
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
        }));
        
        // 4. Advance Animal Production
        let newInventory = { ...prev.inventory };
        const newOwnedAnimals = prev.ownedAnimals.map(animal => {
          const daysLeft = animal.daysUntilProduction - 1;
          
          if (daysLeft <= 0) {
            // Production complete!
            const product = animal.product;
            const yieldAmount = animal.quantity; // 1 unit of product per animal
            
            newInventory[product.id] = (newInventory[product.id] || 0) + yieldAmount;
            showSuccess(`Collected ${yieldAmount} unit(s) of ${product.name} from the ${animal.name}s!`);
            
            // Reset production timer
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
          ownedAnimals: newOwnedAnimals,
          inventory: newInventory,
        };
      });
    }, 30000); // 30 seconds per day

    return () => clearInterval(interval);
  }, []);

  // --- Handlers ---

  const handleBuySeed = useCallback((crop: Crop) => {
    if (gameState.cash >= crop.seedCost) {
      setGameState(prev => ({
        ...prev,
        cash: prev.cash - crop.seedCost,
        inventory: {
          ...prev.inventory,
          [crop.id]: (prev.inventory[crop.id] || 0) + 1,
        }
      }));
      showSuccess(`Purchased 1 unit of ${crop.name} seed.`);
    } else {
      showError("Insufficient funds to buy seeds.");
    }
  }, [gameState.cash]);

  const handleBuyAnimal = useCallback((animal: Animal) => {
    if (gameState.cash >= animal.purchaseCost) {
      setGameState(prev => {
        const existingAnimalIndex = prev.ownedAnimals.findIndex(a => a.id === animal.id);
        let newOwnedAnimals;

        if (existingAnimalIndex !== -1) {
          // If animal type already exists, increase quantity
          newOwnedAnimals = prev.ownedAnimals.map((a, index) => 
            index === existingAnimalIndex ? { ...a, quantity: a.quantity + 1 } : a
          );
        } else {
          // If new animal type, add it
          newOwnedAnimals = [...prev.ownedAnimals, { ...animal, quantity: 1, daysUntilProduction: animal.productionTime }];
        }

        return {
          ...prev,
          cash: prev.cash - animal.purchaseCost,
          ownedAnimals: newOwnedAnimals,
        };
      });
      showSuccess(`Purchased 1 ${animal.name} for $${animal.purchaseCost}.`);
    } else {
      showError("Insufficient funds to buy this animal.");
    }
  }, [gameState.cash]);


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
      delete newInventory[itemId]; // Sell all of this item type
      
      return {
        ...prev,
        cash: prev.cash + value,
        inventory: newInventory,
      };
    });
    showSuccess(`Sold ${quantity.toLocaleString()} units of ${itemName} for $${value.toLocaleString()}.`);
  }, []);

  const handleTileAction = useCallback((plotId: string, tileId: string, action: 'plant' | 'harvest') => {
    setGameState(prev => {
      const plotIndex = prev.ownedLand.findIndex(p => p.id === plotId);
      if (plotIndex === -1) return prev;

      const newOwnedLand = [...prev.ownedLand];
      const plot = { ...newOwnedLand[plotIndex] };
      const tileIndex = plot.tiles.findIndex(t => t.id === tileId);
      if (tileIndex === -1) return prev;
      
      const tile = { ...plot.tiles[tileIndex] };
      const isWinter = prev.currentSeason === 'Winter';
      const canPlantInWinter = prev.hasGreenhouse;

      if (action === 'plant' && selectedCropId) {
        const crop = getCropById(selectedCropId);
        if (!crop) return prev;
        
        if (isWinter && !canPlantInWinter) {
            showError("Cannot plant during Winter without a Greenhouse!");
            return prev;
        }

        const seedCount = prev.inventory[selectedCropId] || 0;
        
        if (seedCount > 0) {
          // Plant the seed
          tile.cropId = selectedCropId;
          tile.growthStage = 0;
          tile.isReadyToHarvest = false;
          
          plot.tiles[tileIndex] = tile;
          newOwnedLand[plotIndex] = plot;
          
          // Consume seed from inventory
          const newInventory = { ...prev.inventory, [selectedCropId]: seedCount - 1 };
          if (newInventory[selectedCropId] === 0) delete newInventory[selectedCropId];
          
          showSuccess(`Planted ${crop.name} seed.`);
          
          return { ...prev, ownedLand: newOwnedLand, inventory: newInventory };
        } else {
          showError(`You need to buy ${crop.name} seeds first!`);
          return prev;
        }
      } 
      
      if (action === 'harvest' && tile.isReadyToHarvest && tile.cropId) {
        const crop = getCropById(tile.cropId);
        if (!crop) return prev;
        
        // Calculate yield (simplified: base yield)
        const yieldAmount = crop.baseYield; 
        
        // Reset tile
        tile.cropId = null;
        tile.growthStage = 0;
        tile.isReadyToHarvest = false;
        
        plot.tiles[tileIndex] = tile;
        newOwnedLand[plotIndex] = plot;
        
        // Add to inventory
        const newInventory = { 
          ...prev.inventory, 
          [crop.id]: (prev.inventory[crop.id] || 0) + yieldAmount 
        };
        
        showSuccess(`Harvested ${yieldAmount} units of ${crop.name}!`);
        
        return { ...prev, ownedLand: newOwnedLand, inventory: newInventory };
      }

      return prev;
    });
  }, [selectedCropId, gameState.currentSeason, gameState.hasGreenhouse]);
  
  const handleBuyLand = useCallback((plot: LandPlot) => {
    if (gameState.cash >= plot.basePrice) {
      setGameState(prev => {
        const newPlot = { ...plot, isOwned: true };
        
        // Add to owned land
        const newOwnedLand = [...prev.ownedLand, newPlot];
        
        // Update available land list
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
            hasGreenhouse: true,
        }));
        showSuccess("Greenhouse purchased! You can now grow crops year-round.");
    } else {
        showError("Insufficient funds to purchase the Greenhouse.");
    }
  }, [gameState.cash]);

  // --- Story Introduction ---
  useEffect(() => {
    showSuccess("Welcome to the farm. Your Grandpa's legacy starts now. You have $100 to buy seeds.");
  }, []);


  const SeasonIcon = getSeasonIcon(gameState.currentSeason);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 p-4">
      
      {/* Header and Stats */}
      <Card className="shadow-xl bg-primary text-primary-foreground">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Tractor className="w-8 h-8 mr-3" />
            Grandpa's Legacy Farm Simulator
          </CardTitle>
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-xl font-semibold">Cash: ${gameState.cash.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <SeasonIcon className="w-5 h-5" />
              <span className="text-xl font-semibold">Season: {gameState.currentSeason}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-semibold">Day: {gameState.day}</span>
            </div>
            <div className="flex items-center space-x-2">
              <LandPlotIcon className="w-5 h-5" />
              <span className="text-xl font-semibold">Plots: {gameState.ownedLand.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <PawPrint className="w-5 h-5" />
              <span className="text-xl font-semibold">Animals: {gameState.ownedAnimals.reduce((sum, a) => sum + a.quantity, 0)}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Map and Land Acquisition */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold border-b pb-2">Owned Farmland</h2>
          <FarmMap 
            ownedLand={gameState.ownedLand} 
            selectedCropId={selectedCropId}
            currentSeason={gameState.currentSeason}
            hasGreenhouse={gameState.hasGreenhouse}
            onTileAction={handleTileAction}
          />
          
          <h2 className="text-2xl font-bold border-b pb-2">Livestock</h2>
          <AnimalPen ownedAnimals={gameState.ownedAnimals} />
        </div>
        
        {/* Column 2: Shop, Inventory, and Construction */}
        <div className="lg:col-span-1 space-y-8">
          <FarmShop 
            cash={gameState.cash}
            inventory={gameState.inventory}
            selectedCropId={selectedCropId}
            onSelectCrop={setSelectedCropId}
            onBuySeed={handleBuySeed}
            onSellItem={handleSellItem}
            onBuyAnimal={handleBuyAnimal}
          />
          
          <FarmConstruction
            cash={gameState.cash}
            availableLand={availableLand}
            hasGreenhouse={gameState.hasGreenhouse}
            onBuyLand={handleBuyLand}
            onBuyGreenhouse={handleBuyGreenhouse}
          />
        </div>
      </div>
    </div>
  );
};

export default FarmManager;