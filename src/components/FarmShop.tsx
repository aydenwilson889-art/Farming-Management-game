"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CROPS, Crop, ANIMALS, Animal, ANIMAL_PRODUCTS, FERTILIZERS, Fertilizer, LandPlot, GREENHOUSE_COST, BUTCHER_STAND_COST, MEAT_PRODUCT_IDS, WATER_PUMP_COST, SMALL_SILO_COST, LARGE_SILO_COST, SMALL_SILO_CAPACITY_INCREASE, LARGE_SILO_CAPACITY_INCREASE, INITIAL_LAND_PLOTS, PETS, Pet } from '@/lib/game-data';
import { DollarSign, ShoppingCart, Package, ArrowRight, PawPrint, Clock, Leaf, Info, Droplet, LandPlot as LandPlotIcon, CheckCircle, Factory, Store, Zap, Warehouse, Waves, Gem, Diamond, Shield, Dog, Horse, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ItemDetailsDialog from './ItemDetailsDialog';

interface FarmShopProps {
  cash: number;
  inventory: Record<string, number>;
  freezerInventory: Record<string, number>; // New prop
  fertilizerInventory: Record<string, number>;
  ownedAnimals: Animal[];
  ownedPets: Pet[]; // New prop
  availableLand: LandPlot[]; 
  isGreenhouseOwned: boolean; 
  hasButcherStand: boolean;
  hasSmallSilo: boolean; // Updated prop
  hasLargeSilo: boolean; // Updated prop
  hasWaterPump: boolean; // New prop
  selectedCropId: string | null;
  selectedFertilizerId: string | null;
  onSelectCrop: (cropId: string | null) => void;
  onSelectFertilizer: (fertId: string | null) => void;
  onOpenPurchaseModal: (item: Crop | Animal | Fertilizer | Pet) => void; // Updated type
  onSellItem: (itemId: string, quantity: number) => void;
  onSellAnimal: (animalId: string, quantity: number) => void; 
  onBuyLand: (plot: LandPlot) => void; 
  onBuyGreenhouse: () => void; 
  onBuyButcherStand: () => void;
  onBuySmallSilo: () => void;
  onBuyLargeSilo: () => void;
  onBuyWaterPump: () => void;
}

const FarmShop: React.FC<FarmShopProps> = ({ 
  cash, 
  inventory, 
  freezerInventory,
  fertilizerInventory, 
  ownedAnimals, 
  ownedPets, // Destructure new prop
  availableLand,
  isGreenhouseOwned,
  hasButcherStand,
  hasSmallSilo,
  hasLargeSilo,
  hasWaterPump,
  selectedCropId, 
  selectedFertilizerId, 
  onSelectCrop, 
  onSelectFertilizer, 
  onOpenPurchaseModal, 
  onSellItem, 
  onSellAnimal,
  onBuyLand,
  onBuyGreenhouse,
  onBuyButcherStand,
  onBuySmallSilo,
  onBuyLargeSilo,
  onBuyWaterPump,
}) => {
  
  const [detailsItem, setDetailsItem] = useState<Crop | Animal | Fertilizer | Pet | null>(null); // Updated state type

  // Filter inventory into crops and animal products (excluding meat if the stand is owned, as that goes to the freezer)
  const inventoryItems = Object.entries(inventory).map(([itemId, quantity]) => {
    const crop = CROPS.find(c => c.id === itemId);
    const product = ANIMAL_PRODUCTS.find(p => p.id === itemId);
    
    if (crop) {
      return { id: itemId, name: crop.name, quantity, basePrice: crop.basePrice, type: 'crop' };
    }
    if (product) {
      const isMeat = MEAT_PRODUCT_IDS.includes(itemId);
      
      if (isMeat && hasButcherStand) {
          // If the stand is owned, meat in the regular inventory shouldn't exist (or shouldn't be sold here).
      }
      
      return { id: itemId, name: product.name, quantity, basePrice: product.basePrice, type: 'product', isMeat };
    }
    return null;
  }).filter(item => item !== null);

  const totalInventoryValue = inventoryItems.reduce((total, item) => {
    if (item) {
      const value = item.quantity * item.basePrice;
      // Apply 50% tax reduction if it's meat sold via the default market (which is what this inventory represents if meat is present)
      return total + (item.isMeat ? Math.floor(value * 0.5) : value);
    }
    return total;
  }, 0);
  
  const unownedLand = availableLand.filter(p => !p.isOwned);
  const canAffordGreenhouse = cash >= GREENHOUSE_COST;
  const canAffordButcherStand = cash >= BUTCHER_STAND_COST;
  const canAffordWaterPump = cash >= WATER_PUMP_COST;
  
  const canAffordSmallSilo = cash >= SMALL_SILO_COST;
  const canAffordLargeSilo = cash >= LARGE_SILO_COST;

  const handleOpenDetails = (item: Crop | Animal | Fertilizer | Pet) => {
    setDetailsItem(item);
  };
  
  const handleSellRegularItem = (itemId: string, quantity: number) => {
      onSellItem(itemId, quantity);
  };
  
  const getSoilTypeDisplay = (soilType: string[]) => {
      if (soilType.length === 0) return "N/A";
      if (soilType.length >= 10) return "Ultimate Mixed (All Crops)";
      if (soilType.length >= 4) return "Mixed (Multiple Crops)";
      
      const cropNames = soilType.map(id => CROPS.find(c => c.id === id)?.name || id);
      return cropNames.join(', ');
  };
  
  const checkLandRequirement = (fert: Fertilizer): { meetsRequirement: boolean, requiredPlotName: string | null } => {
      if (!fert.minLandRequirement) {
          return { meetsRequirement: true, requiredPlotName: null };
      }
      const requiredPlot = INITIAL_LAND_PLOTS.find(p => p.id === fert.minLandRequirement);
      const meetsRequirement = requiredPlot ? ownedAnimals.some(a => a.id === requiredPlot.id) || availableLand.some(p => p.id === requiredPlot.id && p.isOwned) : false;
      
      return { 
          meetsRequirement: meetsRequirement, 
          requiredPlotName: requiredPlot?.name || null 
      };
  };


  return (
    <>
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2" />
            Marketplace
          </CardTitle>
          <CardDescription>Manage your resources and trade goods. Use the 'Buy Online' button for custom quantities and tax breakdown.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="buy-seeds">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="buy-seeds">Seeds</TabsTrigger>
              <TabsTrigger value="buy-animals">Animals</TabsTrigger>
              <TabsTrigger value="buy-fertilizer">Fertilizer</TabsTrigger>
              <TabsTrigger value="construction">Construction</TabsTrigger>
              <TabsTrigger value="sell-harvest">Sell</TabsTrigger>
            </TabsList>
            
            {/* Buy Seeds Tab (omitted for brevity) */}
            <TabsContent value="buy-seeds" className="mt-4 space-y-3">
              {CROPS.map((crop) => {
                const canAfford = cash >= crop.seedCost;
                const isSelected = selectedCropId === crop.id;
                
                return (
                  <div 
                    key={crop.id} 
                    className={cn(
                      "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg transition-colors space-y-2 sm:space-y-0",
                      isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <crop.icon className="w-6 h-6 text-green-700" />
                      <div>
                        <h4 className="font-semibold">{crop.name} Seeds</h4>
                        <p className="text-xs text-muted-foreground">
                          Cost: ${crop.seedCost} | Yield: {crop.baseYield} units.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenDetails(crop)}
                        className="h-8 text-xs flex items-center space-x-1"
                      >
                        <Info className="w-3 h-3" />
                        <span>Details</span>
                      </Button>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => onSelectCrop(isSelected ? null : crop.id)}
                        className="h-8 text-xs"
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                      <Button
                        onClick={() => onOpenPurchaseModal(crop)}
                        disabled={!canAfford}
                        className="h-8 flex items-center space-x-1 text-xs bg-green-600 hover:bg-green-700"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Buy Online</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            {/* Buy Animals Tab */}
            <TabsContent value="buy-animals" className="mt-4 space-y-6">
                <h3 className="text-xl font-semibold border-b pb-1 flex items-center">
                    <PawPrint className="w-5 h-5 mr-2 text-amber-700" /> Livestock
                </h3>
                {ANIMALS.map((animal) => {
                    const canAfford = cash >= animal.purchaseCost;
                    
                    return (
                    <div 
                        key={animal.id} 
                        className={cn(
                        "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg transition-colors space-y-2 sm:space-y-0 hover:bg-muted/50"
                        )}
                    >
                        <div className="flex items-center space-x-3">
                        <animal.icon className="w-6 h-6 text-amber-700" />
                        <div>
                            <h4 className="font-semibold">{animal.name}</h4>
                            <p className="text-xs text-muted-foreground">
                            Cost: ${animal.purchaseCost} | Produces {animal.product.name} every {animal.productionTime} days.
                            </p>
                        </div>
                        </div>
                        <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => handleOpenDetails(animal)}
                            className="h-8 text-xs flex items-center space-x-1"
                        >
                            <Info className="w-3 h-3" />
                            <span>Details</span>
                        </Button>
                        <Button
                            onClick={() => onOpenPurchaseModal(animal)}
                            disabled={!canAfford}
                            className="h-8 flex items-center space-x-1 text-xs bg-green-600 hover:bg-green-700"
                        >
                            <DollarSign className="w-3 h-3" />
                            <span>Buy Online</span>
                        </Button>
                        </div>
                    </div>
                    );
                })}
                
                <h3 className="text-xl font-semibold border-b pb-1 flex items-center pt-4">
                    <Dog className="w-5 h-5 mr-2 text-indigo-600" /> Pets
                </h3>
                {PETS.map((pet) => {
                    const canAfford = cash >= pet.purchaseCost;
                    const isOwned = ownedPets.some(p => p.id === pet.id);
                    
                    return (
                    <div 
                        key={pet.id} 
                        className={cn(
                        "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg transition-colors space-y-2 sm:space-y-0",
                        isOwned ? "bg-green-50 dark:bg-green-900/20" : "hover:bg-muted/50"
                        )}
                    >
                        <div className="flex items-center space-x-3">
                        <pet.icon className="w-6 h-6 text-indigo-600" />
                        <div>
                            <h4 className="font-semibold">{pet.name}</h4>
                            <p className="text-xs text-muted-foreground">
                            Cost: ${pet.purchaseCost} | Happiness Boost: +{pet.happinessBoost} | Herding Boost: {(pet.herdingBoost * 100).toFixed(0)}%
                            </p>
                        </div>
                        </div>
                        <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => handleOpenDetails(pet)}
                            className="h-8 text-xs flex items-center space-x-1"
                        >
                            <Info className="w-3 h-3" />
                            <span>Details</span>
                        </Button>
                        {isOwned ? (
                            <Badge className="bg-green-600">Owned</Badge>
                        ) : (
                            <Button
                                onClick={() => onOpenPurchaseModal(pet)}
                                disabled={!canAfford}
                                className="h-8 flex items-center space-x-1 text-xs bg-green-600 hover:bg-green-700"
                            >
                                <DollarSign className="w-3 h-3" />
                                <span>Buy Online</span>
                            </Button>
                        )}
                        </div>
                    </div>
                    );
                })}
            </TabsContent>
            
            {/* Buy Fertilizer Tab (omitted for brevity) */}
            <TabsContent value="buy-fertilizer" className="mt-4 space-y-3">
              {FERTILIZERS.map((fert) => {
                const canAfford = cash >= fert.cost;
                const isSelected = selectedFertilizerId === fert.id;
                const quantityOwned = fertilizerInventory[fert.id] || 0;
                const { meetsRequirement, requiredPlotName } = checkLandRequirement(fert);
                const isDisabled = !canAfford || !meetsRequirement;
                
                let Icon = Droplet;
                if (fert.id === 'super_fert') Icon = Gem;
                if (fert.id === 'mega_fert') Icon = Diamond;
                if (fert.id === 'ultimate_fert') Icon = Shield;

                return (
                  <div 
                    key={fert.id} 
                    className={cn(
                      "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg transition-colors space-y-2 sm:space-y-0",
                      isSelected ? "bg-blue-100 border-blue-500 dark:bg-blue-900/30" : "hover:bg-muted/50",
                      !meetsRequirement && "opacity-60"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-6 h-6 text-blue-500" />
                      <div>
                        <h4 className="font-semibold">{fert.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Cost: ${fert.cost} | Coverage: {fert.coverage} tiles | Owned: {quantityOwned}
                        </p>
                        {!meetsRequirement && requiredPlotName && (
                            <Badge variant="destructive" className="mt-1 text-xs">
                                Requires: {requiredPlotName}
                            </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenDetails(fert)}
                        className="h-8 text-xs flex items-center space-x-1"
                      >
                        <Info className="w-3 h-3" />
                        <span>Details</span>
                      </Button>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => onSelectFertilizer(isSelected ? null : fert.id)}
                        disabled={quantityOwned === 0 || !meetsRequirement}
                        className="h-8 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {isSelected ? "Selected" : "Use"}
                      </Button>
                      <Button
                        onClick={() => onOpenPurchaseModal(fert)}
                        disabled={isDisabled}
                        className="h-8 flex items-center space-x-1 text-xs bg-green-600 hover:bg-green-700"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Buy Online</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
            
            {/* Construction Tab (omitted for brevity) */}
            <TabsContent value="construction" className="mt-4 space-y-6">
                <h3 className="text-xl font-semibold border-b pb-1 flex items-center">
                    <Factory className="w-5 h-5 mr-2 text-green-600" /> Infrastructure
                </h3>
                
                {/* Small Silo Section */}
                <div className="p-3 border rounded-lg bg-card shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="font-semibold flex items-center">
                                <Warehouse className="w-4 h-4 mr-1 text-amber-700" /> Small Silo
                            </h4>
                            <p className="text-xs text-muted-foreground">Increases crop/product storage capacity by {SMALL_SILO_CAPACITY_INCREASE.toLocaleString()} units.</p>
                        </div>
                        
                        {hasSmallSilo ? (
                            <div className="flex items-center space-x-2 text-green-600 font-semibold">
                                <CheckCircle className="w-5 h-5" />
                                <span>Owned</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium mr-2">Cost: ${SMALL_SILO_COST.toLocaleString()}</p>
                                <Button
                                    onClick={onBuySmallSilo}
                                    disabled={!canAffordSmallSilo}
                                    className="h-8 flex items-center space-x-1"
                                >
                                    <DollarSign className="w-4 h-4" />
                                    <span>{canAffordSmallSilo ? 'Purchase' : 'Cannot Afford'}</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Large Silo Section */}
                <div className="p-3 border rounded-lg bg-card shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="font-semibold flex items-center">
                                <Warehouse className="w-4 h-4 mr-1 text-amber-700" /> Large Silo
                            </h4>
                            <p className="text-xs text-muted-foreground">Massively increases crop/product storage capacity by {LARGE_SILO_CAPACITY_INCREASE.toLocaleString()} units.</p>
                        </div>
                        
                        {hasLargeSilo ? (
                            <div className="flex items-center space-x-2 text-green-600 font-semibold">
                                <CheckCircle className="w-5 h-5" />
                                <span>Owned</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium mr-2">Cost: ${LARGE_SILO_COST.toLocaleString()}</p>
                                <Button
                                    onClick={onBuyLargeSilo}
                                    disabled={!canAffordLargeSilo || !hasSmallSilo}
                                    className="h-8 flex items-center space-x-1"
                                    title={!hasSmallSilo ? "Requires Small Silo first." : ""}
                                >
                                    <DollarSign className="w-4 h-4" />
                                    <span>{canAffordLargeSilo ? (hasSmallSilo ? 'Purchase' : 'Requires Small Silo') : 'Cannot Afford'}</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Water Pump Section */}
                <div className="p-3 border rounded-lg bg-card shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="font-semibold flex items-center">
                                <Waves className="w-4 h-4 mr-1 text-blue-500" /> Automated Water Pump
                            </h4>
                            <p className="text-xs text-muted-foreground">Provides a daily 10% growth boost to all crops.</p>
                        </div>
                        
                        {hasWaterPump ? (
                            <div className="flex items-center space-x-2 text-green-600 font-semibold">
                                <CheckCircle className="w-5 h-5" />
                                <span>Owned</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium mr-2">Cost: ${WATER_PUMP_COST.toLocaleString()}</p>
                                <Button
                                    onClick={onBuyWaterPump}
                                    disabled={!canAffordWaterPump}
                                    className="h-8 flex items-center space-x-1"
                                >
                                    <DollarSign className="w-4 h-4" />
                                    <span>{canAffordWaterPump ? 'Purchase' : 'Cannot Afford'}</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Personal Butcher Stand Section */}
                <div className="p-3 border rounded-lg bg-card shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="font-semibold flex items-center">
                                <Store className="w-4 h-4 mr-1 text-red-600" /> Personal Butcher Stand
                            </h4>
                            <p className="text-xs text-muted-foreground">Process meat for freezer storage and restaurant sales.</p>
                        </div>
                        
                        {hasButcherStand ? (
                            <div className="flex items-center space-x-2 text-green-600 font-semibold">
                                <CheckCircle className="w-5 h-5" />
                                <span>Owned</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-space-x-2">
                                <p className="text-sm font-medium mr-2">Cost: ${BUTCHER_STAND_COST.toLocaleString()}</p>
                                <Button
                                    onClick={onBuyButcherStand}
                                    disabled={!canAffordButcherStand}
                                    className="h-8 flex items-center space-x-1"
                                >
                                    <DollarSign className="w-4 h-4" />
                                    <span>{canAffordButcherStand ? 'Purchase' : 'Cannot Afford'}</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Greenhouse Section */}
                <div className="p-3 border rounded-lg bg-card shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="font-semibold flex items-center">
                                <Leaf className="w-4 h-4 mr-1 text-green-600" /> Greenhouse
                            </h4>
                            <p className="text-xs text-muted-foreground">Allows planting year-round (6 tiles).</p>
                        </div>
                        
                        {isGreenhouseOwned ? (
                            <div className="flex items-center space-x-2 text-green-600 font-semibold">
                                <CheckCircle className="w-5 h-5" />
                                <span>Operational</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium mr-2">Cost: ${GREENHOUSE_COST.toLocaleString()}</p>
                                <Button
                                    onClick={onBuyGreenhouse}
                                    disabled={!canAffordGreenhouse}
                                    className="h-8 flex items-center space-x-1"
                                >
                                    <DollarSign className="w-4 h-4" />
                                    <span>{canAffordGreenhouse ? 'Purchase' : 'Cannot Afford'}</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Land Acquisition Section (omitted for brevity) */}
                <h3 className="text-xl font-semibold border-b pb-1 flex items-center">
                    <LandPlotIcon className="w-5 h-5 mr-2 text-amber-700" /> Land Acquisition
                </h3>
                {unownedLand.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">All available land plots have been purchased!</p>
                ) : (
                    unownedLand.map(plot => {
                        const canAfford = cash >= plot.basePrice;
                        return (
                            <div key={plot.id} className="flex flex-col p-3 border rounded-lg bg-card shadow-sm space-y-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold">{plot.name} ({plot.size} tiles)</h4>
                                        <p className="text-sm text-muted-foreground">Cost: ${plot.basePrice.toLocaleString()}</p>
                                    </div>
                                    <Button 
                                        onClick={() => onBuyLand(plot)}
                                        disabled={!canAfford}
                                        className="h-8"
                                    >
                                        <DollarSign className="w-4 h-4 mr-1" />
                                        Buy Land
                                    </Button>
                                </div>
                                <div className="text-xs space-y-1 pt-2 border-t">
                                    <p className="text-muted-foreground italic">{plot.description}</p>
                                    <div className="flex items-center space-x-2">
                                        <Zap className="w-3 h-3 text-yellow-500" />
                                        <span className="font-medium">Optimal Soil For:</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {getSoilTypeDisplay(plot.soilType)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </TabsContent>

            {/* Sell Tab Container (omitted for brevity) */}
            <TabsContent value="sell-harvest" className="mt-4 space-y-6">
              
              {/* Sub-section: Sell Harvest/Products */}
              <div className="space-y-3 border p-3 rounded-lg">
                <h4 className="text-lg font-semibold flex items-center">
                  <Package className="w-5 h-5 mr-2" /> Harvest & Products
                </h4>
                
                {/* Butcher Shop Status */}
                <div className="flex justify-between items-center p-2 border-b mb-3 bg-muted/50 rounded-md">
                    <span className="font-semibold flex items-center">
                        <Store className="w-4 h-4 mr-2 text-red-600" />
                        Meat Sales Method:
                    </span>
                    <Badge variant={hasButcherStand ? "default" : "destructive"} className="text-sm">
                        {hasButcherStand ? "Restaurant Sales (via Freezer)" : "Butcher Shop (50% Tax)"}
                    </Badge>
                </div>
                
                {inventoryItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-2">Inventory is empty. Harvest crops or collect products!</p>
                ) : (
                  <>
                    <div className="flex justify-between items-center p-2 border-b mb-3">
                      <span className="font-semibold">Total Estimated Value:</span>
                      <Badge variant="secondary" className="text-lg">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {totalInventoryValue.toLocaleString()}
                      </Badge>
                    </div>
                    
                    {inventoryItems.map((item) => {
                      const isMeat = item.type === 'product' && item.isMeat;
                      const sellMethod = isMeat ? 'Butcher Shop' : 'Market';
                      const sellValue = isMeat ? Math.floor(item.quantity * item.basePrice * 0.5) : item.quantity * item.basePrice;

                      return (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-3 border rounded-lg bg-card"
                        >
                          <div className="flex items-center space-x-3">
                            <Package className="w-6 h-6 text-blue-500" />
                            <div>
                              <h4 className="font-semibold">{item.name} ({item.quantity.toLocaleString()} units)</h4>
                              <p className="text-xs text-muted-foreground">
                                Sell Price: ${item.basePrice} per unit. | Value: ${sellValue.toLocaleString()} ({sellMethod})
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleSellRegularItem(item.id, item.quantity)}
                            variant="destructive"
                            className="h-8 flex items-center space-x-1"
                          >
                            <ArrowRight className="w-4 h-4" />
                            <span>Sell All</span>
                          </Button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Sub-section: Sell Animals (Direct Sale) */}
              <div className="space-y-3 border p-3 rounded-lg">
                <h4 className="text-lg font-semibold flex items-center">
                  <PawPrint className="w-5 h-5 mr-2" /> Livestock (Direct Sale)
                </h4>
                <p className="text-sm text-muted-foreground">
                    Only non-meat animals (Layer Hens, Milk Cows, Sheep, Bee Hives, Dairy Goats, Rabbits) can be sold directly. Meat animals must be butchered.
                </p>
                {ownedAnimals.filter(a => !a.isMeatAnimal).length === 0 ? (
                  <p className="text-center text-muted-foreground py-2">No non-meat animals available for direct sale.</p>
                ) : (
                  ownedAnimals.filter(a => !a.isMeatAnimal).map((animal) => {
                    // Use a reduced selling price, e.g., 75% of purchase cost
                    const sellPricePerUnit = Math.floor(animal.purchaseCost * 0.75);
                    const totalSellValue = animal.quantity * sellPricePerUnit;

                    return (
                      <div 
                        key={animal.id} 
                        className="flex items-center justify-between p-3 border rounded-lg bg-card"
                      >
                        <div className="flex items-center space-x-3">
                          <animal.icon className="w-6 h-6 text-amber-700" />
                          <div>
                            <h4 className="font-semibold">{animal.name} ({animal.quantity} units)</h4>
                            <p className="text-xs text-muted-foreground">
                              Sell Price: ${sellPricePerUnit} per unit. Total: ${totalSellValue.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => onSellAnimal(animal.id, animal.quantity)}
                          variant="destructive"
                          className="h-8 flex items-center space-x-1"
                        >
                          <ArrowRight className="w-4 h-4" />
                          <span>Sell All</span>
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Item Details Dialog */}
      <ItemDetailsDialog
        isOpen={!!detailsItem}
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
      />
    </>
  );
};

export default FarmShop;