"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Crop, Animal, Fertilizer, SEASONS } from '@/lib/game-data';
import { Clock, Leaf, DollarSign, Package, PawPrint, Zap, Droplet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ItemDetailsDialogProps {
  isOpen: boolean;
  item: Crop | Animal | Fertilizer | null;
  onClose: () => void;
}

const ItemDetailsDialog: React.FC<ItemDetailsDialogProps> = ({ isOpen, item, onClose }) => {
  if (!item) return null;

  const isCrop = 'seedCost' in item;
  const isAnimal = 'purchaseCost' in item;
  const isFertilizer = 'cost' in item;
  
  const title = isCrop ? `${item.name} Details` : isAnimal ? `${item.name} Details` : `${item.name} Details`;
  const Icon = item.icon;

  const renderCropDetails = (crop: Crop) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-medium flex items-center"><DollarSign className="w-4 h-4 mr-2 text-green-600" /> Seed Cost:</span>
        <Badge variant="secondary">${crop.seedCost}</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium flex items-center"><Clock className="w-4 h-4 mr-2 text-blue-600" /> Growth Time:</span>
        <Badge variant="secondary">{crop.growthTime} Days</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium flex items-center"><Package className="w-4 h-4 mr-2 text-purple-600" /> Base Yield:</span>
        <Badge variant="secondary">{crop.baseYield} units</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium flex items-center"><DollarSign className="w-4 h-4 mr-2 text-yellow-600" /> Base Sell Price:</span>
        <Badge variant="secondary">${crop.basePrice} / unit</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium flex items-center"><Zap className="w-4 h-4 mr-2 text-orange-600" /> Optimal Season:</span>
        <Badge variant="secondary">{crop.optimalSeason}</Badge>
      </div>
      <p className="text-sm text-muted-foreground pt-2">
        Crops grow faster during their optimal season. Growth stops entirely in Winter outside of the Greenhouse.
      </p>
    </div>
  );

  const renderAnimalDetails = (animal: Animal) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-medium flex items-center"><DollarSign className="w-4 h-4 mr-2 text-green-600" /> Purchase Cost:</span>
        <Badge variant="secondary">${animal.purchaseCost}</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium flex items-center"><Clock className="w-4 h-4 mr-2 text-blue-600" /> Production Cycle:</span>
        <Badge variant="secondary">{animal.productionTime} Days</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium flex items-center"><Package className="w-4 h-4 mr-2 text-purple-600" /> Product:</span>
        <Badge variant="secondary">{animal.product.name}</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium flex items-center"><DollarSign className="w-4 h-4 mr-2 text-yellow-600" /> Product Sell Price:</span>
        <Badge variant="secondary">${animal.product.basePrice} / unit</Badge>
      </div>
      <p className="text-sm text-muted-foreground pt-2">
        Animals produce one unit of product per animal unit owned at the end of their production cycle.
      </p>
    </div>
  );
  
  const renderFertilizerDetails = (fert: Fertilizer) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-medium flex items-center"><DollarSign className="w-4 h-4 mr-2 text-green-600" /> Unit Cost:</span>
        <Badge variant="secondary">${fert.cost}</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium flex items-center"><Package className="w-4 h-4 mr-2 text-purple-600" /> Coverage:</span>
        <Badge variant="secondary">{fert.coverage} tiles</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium flex items-center"><Zap className="w-4 h-4 mr-2 text-orange-600" /> Instant Growth Boost:</span>
        <Badge variant="secondary">{(fert.growthBoost * 100).toFixed(0)}%</Badge>
      </div>
      <p className="text-sm text-muted-foreground pt-2">
        Fertilizer is consumed upon application and instantly boosts the growth stage of crops within its coverage area. Can only be applied once per crop cycle.
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Icon className="w-5 h-5 mr-2" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Detailed statistics and information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isCrop ? renderCropDetails(item as Crop) : isAnimal ? renderAnimalDetails(item as Animal) : renderFertilizerDetails(item as Fertilizer)}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsDialog;