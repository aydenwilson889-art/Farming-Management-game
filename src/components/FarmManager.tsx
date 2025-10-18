"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_GAME_STATE, LandPlot, Crop, getCropById, INITIAL_LAND_PLOTS } from '@/lib/game-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, LandPlot as LandPlotIcon, Tractor } from 'lucide-react';
import FarmMap from './FarmMap';
import FarmShop from './FarmShop';
import { showSuccess, showError } from '@/utils/toast';

const FarmManager: React.FC = () => {
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [availableLand, setAvailableLand] = useState(INITIAL_LAND_PLOTS);

  // --- Game Loop (Time Progression) ---
  useEffect(() => {
    // Advance time every 5 seconds (representing one game day)
    const interval = setInterval(() => {
      setGameState(prev => {
        const newDay = prev.day + 1;
        
        // 1. Advance Growth Stages
        const newOwnedLand = prev.ownedLand.map(plot => ({
          ...plot,
          tiles: plot.tiles.map(tile => {
            if (tile.cropId && !tile.isReadyToHarvest) {
              const crop = getCropById(tile.cropId);
              if (crop) {
                // Calculate growth increment based on 100% / growthTime
                const growthIncrement = (1 / crop.growthTime) * 100;
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
        
        // 2. Check for events (simplified for now)
        if (newDay === 1) {
            // Initial message handled by separate useEffect
        } else if (newDay % 10 === 0) {
            showSuccess(`Day ${newDay}: A successful harvest season is approaching!`);
        }

        return {
          ...prev,
          day: newDay,
          ownedLand: newOwnedLand,
        };
      });
    }, 5000); // 5 seconds per day

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

  const handleSellCrop = useCallback((crop: Crop, quantity: number) => {
    const value = quantity * crop.basePrice;
    
    setGameState(prev => {
      const newInventory = { ...prev.inventory };
      delete newInventory[crop.id]; // Sell all of this crop type
      
      return {
        ...prev,
        cash: prev.cash + value,
        inventory: newInventory,
      };
    });
    showSuccess(`Sold ${quantity.toLocaleString()} units of ${crop.name} for $${value.toLocaleString()}.`);
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

      if (action === 'plant' && selectedCropId) {
        const crop = getCropById(selectedCropId);
        if (!crop) return prev;
        
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
  }, [selectedCropId]);
  
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

  // --- Story Introduction ---
  useEffect(() => {
    showSuccess("Welcome to the farm. Your Grandpa's legacy starts now. You have $100 to buy seeds.");
  }, []);


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
              <Clock className="w-5 h-5" />
              <span className="text-xl font-semibold">Day: {gameState.day}</span>
            </div>
            <div className="flex items-center space-x-2">
              <LandPlotIcon className="w-5 h-5" />
              <span className="text-xl font-semibold">Plots: {gameState.ownedLand.length}</span>
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
            onTileAction={handleTileAction}
          />
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Land Acquisition</CardTitle>
              <CardDescription>Expand your agricultural empire by purchasing new plots.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableLand.filter(p => !p.isOwned).map(plot => (
                <div key={plot.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <h4 className="font-semibold">{plot.name} ({plot.size} tiles)</h4>
                    <p className="text-sm text-muted-foreground">Cost: ${plot.basePrice.toLocaleString()}</p>
                  </div>
                  <Button 
                    onClick={() => handleBuyLand(plot)}
                    disabled={gameState.cash < plot.basePrice}
                  >
                    Buy Land
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Column 2: Shop and Inventory */}
        <div className="lg:col-span-1">
          <FarmShop 
            cash={gameState.cash}
            inventory={gameState.inventory}
            selectedCropId={selectedCropId}
            onSelectCrop={setSelectedCropId}
            onBuySeed={handleBuySeed}
            onSellCrop={handleSellCrop}
          />
        </div>
      </div>
    </div>
  );
};

export default FarmManager;