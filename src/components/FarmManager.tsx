"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { LandPlot, Crop, Animal, SEASONS, getCropById, Fertilizer, getFertilizerById, BASE_INVENTORY_CAPACITY, SILO_CAPACITY_INCREASE } from '@/lib/game-data';
import { DollarSign, Clock, LandPlot as LandPlotIcon, Tractor, PawPrint, Sun, Snowflake, Leaf, Cloud, ChevronDown, Droplet, Egg, Drumstick, Store, Warehouse, Waves } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import FarmPlots from './FarmPlots';
import FarmShop from './FarmShop';
import AnimalPen from './AnimalPen';
import AnimalFeeding from './AnimalFeeding';
import MeatSales from './MeatSales';
import PurchaseModal from './PurchaseModal';
import AdminPanel from './AdminPanel';
import MassActionPanel from './MassActionPanel'; // Import new component
import { useFarmGame, PurchaseDetails } from '@/hooks/use-farm-game';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const FarmManager: React.FC = () => {
  const {
    gameState,
    availableLand,
    executePurchase,
    handleSellAnimal,
    handleButcherAnimal,
    handleFeedAnimal,
    handleSellItem,
    handleSellMeatToRestaurant,
    handleTileAction,
    handlePlantAll, // New handler
    handleHarvestAll, // New handler
    handleBuyLand,
    handleBuyGreenhouse,
    handleBuyButcherStand,
    handleBuySmallSilo, // Updated handler
    handleBuyLargeSilo, // Updated handler
    handleBuyWaterPump,
    handleApplyFertilizer,
    adjustCash,
    adjustDay,
    adjustSeason,
    calculateInventoryCapacity, // New utility function
  } = useFarmGame();

  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedFertilizerId, setSelectedFertilizerId] = useState<string | null>(null);
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
  
  const meatAnimals = gameState.ownedAnimals.filter(a => a.isMeatAnimal);
  const producerAnimals = gameState.ownedAnimals.filter(a => !a.isMeatAnimal);
  
  const currentInventoryCount = Object.values(gameState.inventory).reduce((sum, q) => sum + q, 0);
  const maxInventoryCapacity = calculateInventoryCapacity();

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
              <Warehouse className="w-5 h-5" />
              <span className="text-xl font-semibold">Storage: {currentInventoryCount.toLocaleString()}/{maxInventoryCapacity.toLocaleString()}</span>
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
      
      {/* Mass Action Panel */}
      <MassActionPanel
        cash={gameState.cash}
        selectedCropId={selectedCropId}
        onPlantAll={handlePlantAll}
        onHarvestAll={handleHarvestAll}
      />

      {/* 1. Farm Plots */}
      <FarmPlots 
        plots={allOwnedPlots} 
        selectedCropId={selectedCropId}
        selectedFertilizerId={selectedFertilizerId}
        currentSeason={gameState.currentSeason}
        onTileAction={(plotId, tileId, action) => handleTileAction(plotId, tileId, action, selectedCropId)}
        onApplyFertilizer={handleApplyFertilizer}
      />
      
      {/* 2. Livestock Management Tabs Card */}
      <Card className="w-full shadow-lg">
        <CardHeader>
            <CardTitle className="text-2xl flex items-center">
                <PawPrint className="w-6 h-6 mr-2" />
                Livestock Management
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <Tabs defaultValue="production">
                <TabsList className="grid w-full grid-cols-3 h-auto">
                    <TabsTrigger value="production" className="flex items-center space-x-1">
                        <Egg className="w-4 h-4" />
                        <span>Product Production</span>
                    </TabsTrigger>
                    <TabsTrigger value="meat" className="flex items-center space-x-1">
                        <Drumstick className="w-4 h-4" />
                        <span>Meat Management</span>
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="flex items-center space-x-1" disabled={!gameState.hasButcherStand}>
                        <Store className="w-4 h-4" />
                        <span>Meat Sales</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="production" className="p-4 pt-4">
                    <AnimalPen ownedAnimals={producerAnimals} />
                </TabsContent>

                <TabsContent value="meat" className="p-4 pt-4">
                    <AnimalFeeding 
                        meatAnimals={meatAnimals}
                        cash={gameState.cash}
                        onFeedAnimal={handleFeedAnimal}
                        onButcherAnimal={handleButcherAnimal}
                    />
                </TabsContent>

                <TabsContent value="sales" className="p-4 pt-4">
                    {gameState.hasButcherStand ? (
                        <MeatSales
                            freezerInventory={gameState.freezerInventory}
                            onSellMeatToRestaurant={handleSellMeatToRestaurant}
                        />
                    ) : (
                        <p className="text-center text-muted-foreground py-4">Purchase the Personal Butcher Stand in the Marketplace (Construction tab) to unlock meat sales.</p>
                    )}
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      
      {/* 3. Farm Shop (Marketplace) */}
      <FarmShop 
        cash={gameState.cash}
        inventory={gameState.inventory}
        freezerInventory={gameState.freezerInventory}
        fertilizerInventory={gameState.fertilizerInventory} 
        ownedAnimals={gameState.ownedAnimals}
        availableLand={availableLand} 
        isGreenhouseOwned={!!gameState.greenhousePlot} 
        hasButcherStand={gameState.hasButcherStand}
        hasSmallSilo={gameState.hasSmallSilo} // Pass updated prop
        hasLargeSilo={gameState.hasLargeSilo} // Pass updated prop
        hasWaterPump={gameState.hasWaterPump} 
        onBuyLand={handleBuyLand} 
        onBuyGreenhouse={handleBuyGreenhouse} 
        onBuyButcherStand={handleBuyButcherStand}
        onBuySmallSilo={handleBuySmallSilo} // Pass updated handler
        onBuyLargeSilo={handleBuyLargeSilo} // Pass updated handler
        onBuyWaterPump={handleBuyWaterPump} 
        selectedCropId={selectedCropId}
        selectedFertilizerId={selectedFertilizerId}
        onSelectCrop={handleSelectCrop} 
        onSelectFertilizer={handleSelectFertilizer} 
        onOpenPurchaseModal={handleOpenPurchaseModal}
        onSellItem={handleSellItem}
        onSellAnimal={handleSellAnimal}
      />
      
      {/* 4. Collapsible Admin Panel */}
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