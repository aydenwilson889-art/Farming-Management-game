"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { LandPlot, Crop, Animal, SEASONS } from '@/lib/game-data';
import { DollarSign, Clock, LandPlot as LandPlotIcon, Tractor, PawPrint, Sun, Snowflake, Leaf, Cloud } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import FarmPlots from './FarmPlots';
import FarmShop from './FarmShop';
import AnimalPen from './AnimalPen';
import FarmConstruction from './FarmConstruction';
import PurchaseModal from './PurchaseModal';
import { useFarmGame, PurchaseDetails } from '@/hooks/use-farm-game';
import { showSuccess } from '@/utils/toast';

const FarmManager: React.FC = () => {
  const {
    gameState,
    availableLand,
    executePurchase,
    handleSellAnimal,
    handleSellItem,
    handleTileAction,
    handleBuyLand,
    handleBuyGreenhouse,
  } = useFarmGame();

  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<Crop | Animal | null>(null);
  const isModalOpen = !!modalItem;

  // --- Modal Handlers ---
  const handleOpenPurchaseModal = useCallback((item: Crop | Animal) => {
    setModalItem(item);
  }, []);

  const handleClosePurchaseModal = useCallback(() => {
    setModalItem(null);
  }, []);

  const handleConfirmPurchase = useCallback((details: PurchaseDetails) => {
    const success = executePurchase(details);
    if (success && details.type === 'seed') {
        // Automatically select the purchased seed for planting if successful
        setSelectedCropId(details.item.id);
        showSuccess(`Selected ${details.item.name} for planting.`);
    }
  }, [executePurchase]);


  // --- Utility ---
  const getSeasonIcon = (season: typeof SEASONS[number]) => {
    switch (season) {
      case 'Spring': return Leaf;
      case 'Summer': return Sun;
      case 'Autumn': return Cloud;
      case 'Winter': return Snowflake;
      default: return Clock;
    }
  };
  
  // Combine regular owned land and greenhouse plot for display
  const allOwnedPlots = [...gameState.ownedLand];
  if (gameState.greenhousePlot) {
      allOwnedPlots.push(gameState.greenhousePlot);
  }

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
              <span className="text-xl font-semibold">Plots: {gameState.ownedLand.length + (gameState.greenhousePlot ? 1 : 0)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <PawPrint className="w-5 h-5" />
              <span className="text-xl font-semibold">Animals: {gameState.ownedAnimals.reduce((sum, a) => sum + a.quantity, 0)}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Map and Livestock */}
        <div className="lg:col-span-2 space-y-8">
          <FarmPlots 
            plots={allOwnedPlots} 
            selectedCropId={selectedCropId}
            currentSeason={gameState.currentSeason}
            onTileAction={(plotId, tileId, action) => handleTileAction(plotId, tileId, action, selectedCropId)}
          />
          
          <h2 className="text-2xl font-bold border-b pb-2">Livestock</h2>
          <AnimalPen ownedAnimals={gameState.ownedAnimals} />
        </div>
        
        {/* Column 2: Shop and Construction */}
        <div className="lg:col-span-1 space-y-8">
          <FarmShop 
            cash={gameState.cash}
            inventory={gameState.inventory}
            ownedAnimals={gameState.ownedAnimals}
            selectedCropId={selectedCropId}
            onSelectCrop={setSelectedCropId}
            onOpenPurchaseModal={handleOpenPurchaseModal}
            onSellItem={handleSellItem}
            onSellAnimal={handleSellAnimal}
          />
          
          <FarmConstruction
            cash={gameState.cash}
            availableLand={availableLand}
            isGreenhouseOwned={!!gameState.greenhousePlot}
            onBuyLand={handleBuyLand}
            onBuyGreenhouse={handleBuyGreenhouse}
          />
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isModalOpen}
        item={modalItem}
        cash={gameState.cash}
        onClose={handleClosePurchaseModal}
        onConfirm={handleConfirmPurchase}
      />
    </div>
  );
};

export default FarmManager;