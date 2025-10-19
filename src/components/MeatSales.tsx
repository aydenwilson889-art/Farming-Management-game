"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Utensils, Package, ArrowRight, ChefHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ANIMAL_PRODUCTS, getAnimalProductById, RESTAURANTS, Restaurant, MEAT_PRODUCT_IDS } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { showError } from '@/utils/toast';

interface MeatSalesProps {
  freezerInventory: Record<string, number>;
  onSellMeatToRestaurant: (restaurantId: string, productId: string, quantity: number) => void;
}

const MeatSales: React.FC<MeatSalesProps> = ({ freezerInventory, onSellMeatToRestaurant }) => {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(RESTAURANTS[0].id);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const meatProductsInFreezer = Object.entries(freezerInventory)
    .filter(([id]) => MEAT_PRODUCT_IDS.includes(id))
    .map(([id, quantity]) => ({
      product: getAnimalProductById(id)!,
      quantity,
    }));
    
  const selectedRestaurant = RESTAURANTS.find(r => r.id === selectedRestaurantId)!;

  const handleQuantityChange = (productId: string, value: string) => {
    const num = parseInt(value);
    const max = freezerInventory[productId] || 0;
    
    if (isNaN(num) || num < 0) {
      setQuantities(prev => ({ ...prev, [productId]: 0 }));
    } else {
      setQuantities(prev => ({ ...prev, [productId]: Math.min(num, max) }));
    }
  };
  
  const handleSell = (productId: string) => {
    const quantity = quantities[productId] || 0;
    if (quantity <= 0) {
      showError("Please enter a quantity greater than zero.");
      return;
    }
    onSellMeatToRestaurant(selectedRestaurantId, productId, quantity);
    setQuantities(prev => ({ ...prev, [productId]: 0 })); // Reset quantity after sale
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center text-red-600 dark:text-red-400">
          <Package className="w-6 h-6 mr-2" />
          Freezer & Restaurant Sales
        </CardTitle>
        <CardDescription>
          Meat processed via your Personal Butcher Stand is stored here. Sell to restaurants for better prices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Restaurant Selection */}
        <div className="space-y-3 border p-3 rounded-lg bg-muted/50">
            <h4 className="font-semibold flex items-center">
                <ChefHat className="w-4 h-4 mr-2" /> Select Buyer
            </h4>
            <div className="flex flex-wrap gap-2">
                {RESTAURANTS.map(restaurant => (
                    <Button
                        key={restaurant.id}
                        variant={selectedRestaurantId === restaurant.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedRestaurantId(restaurant.id)}
                        className="flex items-center"
                    >
                        <restaurant.icon className="w-4 h-4 mr-1" />
                        {restaurant.name}
                    </Button>
                ))}
            </div>
            <p className="text-sm text-muted-foreground italic pt-1">{selectedRestaurant.description}</p>
        </div>

        {/* Freezer Inventory & Sales */}
        <div className="space-y-3">
            <h4 className="text-lg font-semibold flex items-center border-b pb-2">
                <Package className="w-5 h-5 mr-2" /> Freezer Inventory
            </h4>
            
            {meatProductsInFreezer.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Freezer is empty. Purchase the Personal Butcher Stand and process meat animals!</p>
            ) : (
                meatProductsInFreezer.map(({ product, quantity }) => {
                    const multiplier = selectedRestaurant.demand[product.id] || 1.0;
                    const unitPrice = Math.floor(product.basePrice * multiplier);
                    const currentQuantity = quantities[product.id] || 0;
                    const totalSaleValue = currentQuantity * unitPrice;

                    return (
                        <div 
                            key={product.id} 
                            className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 border rounded-lg bg-card space-y-2 md:space-y-0"
                        >
                            <div className="flex items-center space-x-3">
                                <product.icon className="w-6 h-6 text-red-600" />
                                <div>
                                    <h4 className="font-semibold">{product.name}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        In Stock: {quantity.toLocaleString()} units
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 w-full md:w-auto">
                                <div className="flex flex-col items-end space-y-1">
                                    <Badge variant="secondary" className={cn(multiplier > 1.1 ? "bg-green-500" : multiplier < 0.9 ? "bg-red-500" : "bg-yellow-500")}>
                                        {selectedRestaurant.name} Price: ${unitPrice} ({multiplier.toFixed(2)}x)
                                    </Badge>
                                    <p className="text-xs text-muted-foreground">
                                        Sale Value: ${totalSaleValue.toLocaleString()}
                                    </p>
                                </div>
                                
                                <Input
                                    type="number"
                                    placeholder="Qty"
                                    value={currentQuantity}
                                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                    min={0}
                                    max={quantity}
                                    className="w-20 text-center h-8"
                                />
                                <Button
                                    onClick={() => handleSell(product.id)}
                                    disabled={currentQuantity === 0}
                                    className="h-8 flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                                >
                                    <DollarSign className="w-4 h-4" />
                                    Sell
                                </Button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MeatSales;