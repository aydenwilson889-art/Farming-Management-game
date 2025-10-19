"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Leaf, Package, DollarSign } from 'lucide-react';
import { ALL_AT_ONCE_FEE, getCropById } from '@/lib/game-data';
import { showError } from '@/utils/toast';

interface MassActionPanelProps {
  cash: number;
  selectedCropId: string | null;
  onPlantAll: (cropId: string) => void;
  onHarvestAll: () => void;
}

const MassActionPanel: React.FC<MassActionPanelProps> = ({ cash, selectedCropId, onPlantAll, onHarvestAll }) => {
  const canAfford = cash >= ALL_AT_ONCE_FEE;
  const selectedCrop = selectedCropId ? getCropById(selectedCropId) : null;

  const handlePlantAllClick = () => {
    if (!canAfford) {
      showError(`You need $${ALL_AT_ONCE_FEE} to use the 'Plant All' service.`);
      return;
    }
    if (!selectedCropId) {
      showError("Please select a seed type first.");
      return;
    }
    onPlantAll(selectedCropId);
  };

  const handleHarvestAllClick = () => {
    if (!canAfford) {
      showError(`You need $${ALL_AT_ONCE_FEE} to use the 'Harvest All' service.`);
      return;
    }
    onHarvestAll();
  };

  return (
    <Card className="w-full shadow-lg border-2 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/20">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-xl flex items-center text-yellow-800 dark:text-yellow-300">
          <Zap className="w-5 h-5 mr-2" />
          Mass Action Services
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4 p-3 pt-2">
        
        {/* Plant All */}
        <Button
          onClick={handlePlantAllClick}
          disabled={!canAfford || !selectedCropId}
          className="flex-1 min-w-[150px] bg-green-600 hover:bg-green-700 text-white"
        >
          <Leaf className="w-4 h-4 mr-1" />
          Plant All ({selectedCrop ? selectedCrop.name : 'Select Seed'})
          <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
            -${ALL_AT_ONCE_FEE}
          </Badge>
        </Button>

        {/* Harvest All */}
        <Button
          onClick={handleHarvestAllClick}
          disabled={!canAfford}
          className="flex-1 min-w-[150px] bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Package className="w-4 h-4 mr-1" />
          Harvest All
          <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
            -${ALL_AT_ONCE_FEE}
          </Badge>
        </Button>
        
        <p className="text-xs text-yellow-800 dark:text-yellow-300 w-full pt-1">
          Fee: ${ALL_AT_ONCE_FEE}. Instantly plants the selected seed in all empty, plantable tiles or harvests all ready crops across all plots.
        </p>
      </CardContent>
    </Card>
  );
};

export default MassActionPanel;