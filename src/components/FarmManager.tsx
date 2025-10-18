"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { LandPlot, Crop, Animal, SEASONS, getCropById, Fertilizer, getFertilizerById } from '@/lib/game-data';
import { DollarSign, Clock, LandPlot as LandPlotIcon, Tractor, PawPrint, Sun, Snowflake, Leaf, Cloud, ChevronDown, Droplet } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import FarmPlots from './FarmPlots';
import FarmShop from './FarmShop';
import AnimalPen from './AnimalPen';
import FarmConstruction from './FarmConstruction';
import PurchaseModal from './PurchaseModal';
import AdminPanel from './AdminPanel';
import { useFarmGame, PurchaseDetails } from '@/hooks/use-farm-game';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

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
    handleApplyFertilizer, // New handler
    adjustCash,
    adjustDay,
    adjustSeason,
  } = useFarmGame();

  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedFertilizerId, setSelectedFertilizerId] = useState<string | null>(null); // New state for fertilizer
  const [modalItem, setModalItem] = useState<Crop | Animal | Fertilizer | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const isModalOpen = !!modalItem;

  // --- Modal Handlers ---
  const handleOpenPurchaseModal = useCallback((item: Crop | Animal | Fertilizer) => {
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
        setSelectedFertilizerId(null); // Deselect fertilizer
        showSuccess(`Selected ${details.item.name} for planting.`);
    }
    if (success && details.type === 'fertilizer') {
        // Automatically select the purchased fertilizer for application
        setSelectedFertilizerId(details.item.id);
        setSelectedCropId(null); // Deselect crop
        showSuccess(`Selected ${details.item.name} for application.`);
    }
  }, [executePurchase]);

  // --- Fertilizer Selection Handler ---
  const handleSelectFertilizer = useCallback((fertId: string | null) => {
    setSelectedFertilizerId(fertId);
    if (fertId) {
        setSelectedCropId(null); // Deselect crop when selecting fertilizer
        const fert = getFertilizerById(fertId);
        if (fert) {
            showSuccess(`Selected ${fert.name} for application.`);
        }
    }
  }, []);

  // --- Crop Selection Handler (Modified to deselect fertilizer) ---
  const handleSelectCrop = useCallback((cropId: string | null) => {
    setSelectedCropId(cropId);
    if (cropId) {
        setSelectedFertilizerId(null); // Deselect fertilizer when selecting crop
    }
  }, []);


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
        <CardHeader className="flex flex-row items-center justify-between p-4 flex-wrap gap-4">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Tractor className="w-8 h-8 mr-3" />
            Grandpa's Legacy Farm Simulator
          </CardTitle>
          <div className="flex space-x-6 flex-wrap gap-4">
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

      {/* Current Action Indicator */}
      {(selectedCropId || selectedFertilizerId) && (
        <Card className="p-3 border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/30">
            <div className="flex items-center justify-center space-x-3 text-blue-700 dark:text-blue-300 font-medium">
                {selectedCropId && (
                    <>
                        <Leaf className="w-5 h-5" />
                        <span>Action: Planting {getCropById(selectedCropId)?.name} Seeds</span>
                    </>
                )}
                {selectedFertilizerId && (
                    <>
                        <Droplet className="w-5 h-5" />
                        <span>Action: Applying {getFertilizerById(selectedFertilizerId)?.name}</span>
                    </>
                )}
                <Button variant="ghost" size="sm" onClick={() => { setSelectedCropId(null); setSelectedFertilizerId(null); }} className="text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800">
                    Cancel
                </Button>
            </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Map and Livestock */}
        <div className="lg:col-span-2 space-y-8">
          <FarmPlots 
            plots={allOwnedPlots} 
            selectedCropId={selectedCropId}
            selectedFertilizerId={selectedFertilizerId} // Pass selected fertilizer
            currentSeason={gameState.currentSeason}
            onTileAction={(plotId, tileId, action) => handleTileAction(plotId, tileId, action, selectedCropId)}
            onApplyFertilizer={handleApplyFertilizer} // Pass fertilizer handler
          />
          
          <h2 className="text-2xl font-bold border-b pb-2">Livestock</h2>
          <AnimalPen ownedAnimals={gameState.ownedAnimals} />
        </div>
        
        {/* Column 2: Shop and Construction */}
        <div className="lg:col-span-1 space-y-8">
          
          <FarmShop 
            cash={gameState.cash}
            inventory={gameState.inventory}
            fertilizerInventory={gameState.fertilizerInventory} // Pass fertilizer inventory
            ownedAnimals={gameState.ownedAnimals}
            selectedCropId={selectedCropId}
            onSelectCrop={handleSelectCrop} // Use new handler
            onSelectFertilizer={handleSelectFertilizer} // New handler for selecting fertilizer
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
      
      {/* Collapsible Admin Panel (Moved to the bottom of the main container) */}
      <Collapsible open={isAdminOpen} onOpenChange={setIsAdminOpen} className="w-full">
        <div className="flex items-center justify-between space-x-4 px-4 py-2 border rounded-md bg-destructive/10">
          <h4 className="text-lg font-semibold text-destructive">
            Admin Controls
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0 text-destructive hover:bg-destructive/20">
              <ChevronDown className={cn("h-4 w-4 transition-transform", isAdminOpen && "rotate-180")} />
              <span className="sr-only">Toggle Admin Panel</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-4 pt-4">
          <AdminPanel
            currentCash={gameState.cash}
            currentDay={gameState.day}
            currentSeason={gameState.currentSeason}
            onAdjustCash={adjustCash}
            onAdjustDay={adjustDay}
            onAdjustSeason={adjustSeason}
          />
        </CollapsibleContent>
      </Collapsible>

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