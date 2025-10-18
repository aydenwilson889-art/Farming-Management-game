"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CROPS, Crop } from '@/lib/game-data';
import { DollarSign, ShoppingCart, Package, Seed, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FarmShopProps {
  cash: number;
  inventory: Record<string, number>;
  selectedCropId: string | null;
  onSelectCrop: (cropId: string | null) => void;
  onBuySeed: (crop: Crop) => void;
  onSellCrop: (crop: Crop, quantity: number) => void;
}

const FarmShop: React.FC<FarmShopProps> = ({ cash, inventory, selectedCropId, onSelectCrop, onBuySeed, onSellCrop }) => {
  
  const totalInventoryValue = Object.entries(inventory).reduce((total, [cropId, quantity]) => {
    const crop = CROPS.find(c => c.id === cropId);
    if (crop) {
      return total + quantity * crop.basePrice;
    }
    return total;
  }, 0);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <ShoppingCart className="w-6 h-6 mr-2" />
          Marketplace & Inventory
        </CardTitle>
        <CardDescription>Manage your resources and trade goods.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy Seeds</TabsTrigger>
            <TabsTrigger value="sell">Sell Harvest ({Object.keys(inventory).length})</TabsTrigger>
          </TabsList>
          
          {/* Buy Seeds Tab */}
          <TabsContent value="buy" className="mt-4 space-y-3">
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
          
          {/* Sell Inventory Tab */}
          <TabsContent value="sell" className="mt-4 space-y-3">
            {Object.entries(inventory).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Inventory is empty. Harvest some crops first!</p>
            ) : (
              <>
                <div className="flex justify-between items-center p-2 border-b mb-3">
                  <span className="font-semibold">Total Estimated Value:</span>
                  <Badge variant="secondary" className="text-lg">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {totalInventoryValue.toLocaleString()}
                  </Badge>
                </div>
                
                {Object.entries(inventory).map(([cropId, quantity]) => {
                  const crop = CROPS.find(c => c.id === cropId);
                  if (!crop || quantity === 0) return null;
                  
                  const value = quantity * crop.basePrice;

                  return (
                    <div 
                      key={cropId} 
                      className="flex items-center justify-between p-3 border rounded-lg bg-card"
                    >
                      <div className="flex items-center space-x-3">
                        <Package className="w-6 h-6 text-blue-500" />
                        <div>
                          <h4 className="font-semibold">{crop.name} ({quantity.toLocaleString()} units)</h4>
                          <p className="text-xs text-muted-foreground">
                            Sell Price: ${crop.basePrice} per unit. Total: ${value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => onSellCrop(crop, quantity)}
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