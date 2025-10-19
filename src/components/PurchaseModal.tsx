"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, ShoppingCart, Percent, Minus, Plus } from 'lucide-react';
import { Crop, Animal, Fertilizer, Pet } from '@/lib/game-data';
import { PurchaseDetails, calculatePurchaseDetails } from '@/hooks/use-farm-game';

interface PurchaseModalProps {
  isOpen: boolean;
  item: Crop | Animal | Fertilizer | Pet | null;
  cash: number;
  onClose: () => void;
  onConfirm: (details: PurchaseDetails) => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, item, cash, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);
  const [details, setDetails] = useState<PurchaseDetails | null>(null);

  useEffect(() => {
    if (item) {
      const calculatedDetails = calculatePurchaseDetails(item, quantity);
      setDetails(calculatedDetails);
    }
  }, [item, quantity]);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  if (!item || !details) return null;

  const isSeed = details.type === 'seed';
  const isPet = details.type === 'pet';
  const itemName = isSeed ? `${item.name} Seeds` : item.name;
  const canAfford = cash >= details.totalCost;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

  const handleConfirm = () => {
    if (canAfford) {
      onConfirm(details);
      onClose();
    }
  };
  
  // Pets are usually bought one at a time, but we allow quantity > 1 for flexibility
  const maxQuantity = isPet ? 5 : Infinity; 

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Online Purchase: {itemName}
          </DialogTitle>
          <DialogDescription>
            Enter the quantity you wish to purchase and review the final cost breakdown.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handleDecrement} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
                max={maxQuantity}
                className="text-center"
              />
              <Button variant="outline" size="icon" onClick={handleIncrement} disabled={quantity >= maxQuantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-semibold text-lg">Cost Breakdown</h4>
            
            <div className="flex justify-between text-sm">
              <span>Unit Price:</span>
              <span>${details.costPerUnit}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Subtotal ({details.quantity} units):</span>
              <span>${(details.costPerUnit * details.quantity).toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
              <span className="flex items-center">
                <Percent className="w-3 h-3 mr-1" />
                Bulk Discount ({details.discountRate * 100}%):
              </span>
              <span>-${((details.costPerUnit * details.quantity) * details.discountRate).toFixed(0)}</span>
            </div>

            <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
              <span className="flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                Sales Tax ({details.taxRate * 100}%):
              </span>
              <span>+${details.taxAmount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total Cost:</span>
              <span>${details.totalCost.toLocaleString()}</span>
            </div>
            
            <p className="text-xs text-muted-foreground pt-2">
              {details.discountRate > 0 
                ? "The bulk discount is applied before sales tax is calculated."
                : "Taxes are applied to all purchases."
              }
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!canAfford}
            className="flex items-center"
          >
            <DollarSign className="w-4 h-4 mr-1" />
            {canAfford ? `Pay $${details.totalCost.toLocaleString()}` : 'Cannot Afford'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;