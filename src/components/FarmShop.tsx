"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CROPS, Crop, ANIMALS, Animal, ANIMAL_PRODUCTS, getAnimalProductById, FERTILIZERS, Fertilizer } from '@/lib/game-data';
import { DollarSign, ShoppingCart, Package, ArrowRight, PawPrint, Clock, Leaf, Info, Droplet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ItemDetailsDialog from './ItemDetailsDialog';

interface FarmShopProps {
  cash: number;
  inventory: Record<string, number>;
  fertilizerInventory: Record<string, number>;
  ownedAnimals: Animal[];
  selectedCropId: string | null;
  selectedFertilizerId: string | null;
  onSelectCrop: (cropId: string | null) => void;
  onSelectFertilizer: (fertId: string | null) => void;
  onOpenPurchaseModal: (item: Crop | Animal | Fertilizer) => void; 
  onSellItem: (itemId: string, quantity: number) => void;
  onSellAnimal: (animalId: string, quantity: number) => void; 
}

const FarmShop: React.FC<FarmShopProps> = ({ cash, inventory, fertilizerInventory, ownedAnimals, selectedCropId, selectedFertilizerId, onSelectCrop, onSelectFertilizer, onOpenPurchaseModal, onSellItem, onSellAnimal }) => {
  
  const [detailsItem, setDetailsItem] = useState<Crop | Animal | Fertilizer | null>(null);

  // Filter inventory into crops and animal products
  const inventoryItems = Object.entries(inventory).map(([itemId, quantity]) => {
    const crop = CROPS.find(c => c.id === itemId);
    const product = ANIMAL_PRODUCTS.find(p => p.id === itemId);
    
    if (crop) {
      return { id: itemId, name: crop.name, quantity, basePrice: crop.basePrice, type: 'crop' };
    }
    if (product) {
      return { id: itemId, name: product.name, quantity, basePrice: product.basePrice, type: 'product' };
    }
    return null;
  }).filter(item => item !== null);

  const totalInventoryValue = inventoryItems.reduce((total, item) => {
    if (item) {
      return total + item.quantity * item.basePrice;
    }
    return total;
  }, 0);

  const totalOwnedAnimals = ownedAnimals.reduce((sum, a) => sum + a.quantity, 0);

  const handleOpenDetails = (item: Crop | Animal | Fertilizer) => {
    setDetailsItem(item);
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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger value="buy-seeds">Seeds</TabsTrigger>
              <TabsTrigger value="buy-animals">Animals</TabsTrigger>
              <TabsTrigger value="buy-fertilizer">Fertilizer</TabsTrigger>
              <TabsTrigger value="sell-harvest">Sell</TabsTrigger>
            </TabsList>
            
            {/* Buy Seeds Tab */}
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
            <TabsContent value="buy-animals" className="mt-4 space-y-3">
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
            </TabsContent>
            
            {/* Buy Fertilizer Tab */}
            <TabsContent value="buy-fertilizer" className="mt-4 space-y-3">
              {FERTILIZERS.map((fert) => {
                const canAfford = cash >= fert.cost;
                const isSelected = selectedFertilizerId === fert.id;
                const quantityOwned = fertilizerInventory[fert.id] || 0;
                
                return (
                  <div 
                    key={fert.id} 
                    className={cn(
                      "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg transition-colors space-y-2 sm:space-y-0",
                      isSelected ? "bg-blue-100 border-blue-500 dark:bg-blue-900/30" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Droplet className="w-6 h-6 text-blue-500" />
                      <div>
                        <h4 className="font-semibold">{fert.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Cost: ${fert.cost} | Coverage: {fert.coverage} tiles | Owned: {quantityOwned}
                        </p>
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
                        disabled={quantityOwned === 0}
                        className="h-8 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {isSelected ? "Selected" : "Use"}
                      </Button>
                      <Button
                        onClick={() => onOpenPurchaseModal(fert)}
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

            {/* Sell Tab Container */}
            <TabsContent value="sell-harvest" className="mt-4 space-y-6">
              
              {/* Sub-section: Sell Harvest/Products */}
              <div className="space-y-3 border p-3 rounded-lg">
                <h4 className="text-lg font-semibold flex items-center">
                  <Package className="w-5 h-5 mr-2" /> Harvest & Products
                </h4>
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
                      const value = item.quantity * item.basePrice;

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
                                Sell Price: ${item.basePrice} per unit. Total: ${value.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => onSellItem(item.id, item.quantity)}
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

              {/* Sub-section: Sell Animals */}
              <div className="space-y-3 border p-3 rounded-lg">
                <h4 className="text-lg font-semibold flex items-center">
                  <PawPrint className="w-5 h-5 mr-2" /> Livestock
                </h4>
                {ownedAnimals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-2">You don't own any animals to sell.</p>
                ) : (
                  ownedAnimals.map((animal) => {
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