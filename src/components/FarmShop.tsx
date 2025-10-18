"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CROPS, Crop, ANIMALS, Animal, ANIMAL_PRODUCTS, AnimalProduct, getAnimalProductById } from '@/lib/game-data';
import { DollarSign, ShoppingCart, Package, ArrowRight, PawPrint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FarmShopProps {
  cash: number;
  inventory: Record<string, number>;
  selectedCropId: string | null;
  onSelectCrop: (cropId: string | null) => void;
  onBuySeed: (crop: Crop) => void;
  onSellItem: (itemId: string, quantity: number) => void;
  onBuyAnimal: (animal: Animal) => void;
}

const FarmShop: React.FC<FarmShopProps> = ({ cash, inventory, selectedCropId, onSelectCrop, onBuySeed, onSellItem, onBuyAnimal }) => {
  
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

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <ShoppingCart className="w-6 h-6 mr-2" />
          Marketplace
        </CardTitle>
        <CardDescription>Manage your resources and trade goods.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy-seeds">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="buy-seeds">Buy Seeds</TabsTrigger>
            <TabsTrigger value="buy-animals">Buy Animals</TabsTrigger>
            <TabsTrigger value="sell">Sell Harvest ({inventoryItems.length})</TabsTrigger>
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
                    "flex items-center justify-between p-3 border rounded-lg transition-colors",
                    isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <crop.icon className="w-6 h-6 text-green-700" />
                    <div>
                      <h4 className="font-semibold">{crop.name} Seeds</h4>
                      <p className="text-xs text-muted-foreground">
                        Grows in {crop.growthTime} days. Yields {crop.baseYield} units.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => onSelectCrop(isSelected ? null : crop.id)}
                      className="h-8"
                    >
                      {isSelected ? "Selected" : "Select for Planting"}
                    </Button>
                    <Button
                      onClick={() => onBuySeed(crop)}
                      disabled={!canAfford}
                      className="h-8 flex items-center space-x-1"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Buy ({crop.seedCost})</span>
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
                    "flex items-center justify-between p-3 border rounded-lg transition-colors hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <animal.icon className="w-6 h-6 text-amber-700" />
                    <div>
                      <h4 className="font-semibold">{animal.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Produces {animal.product.name} every {animal.productionTime} days.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => onBuyAnimal(animal)}
                      disabled={!canAfford}
                      className="h-8 flex items-center space-x-1"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Buy ({animal.purchaseCost})</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </TabsContent>
          
          {/* Sell Inventory Tab */}
          <TabsContent value="sell" className="mt-4 space-y-3">
            {inventoryItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Inventory is empty. Harvest crops or collect products!</p>
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FarmShop;