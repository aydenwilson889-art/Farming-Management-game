"use client";

import React from 'react';
import { LandPlot, PlotTile, Crop, getCropById } from '@/lib/game-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Leaf, Check, X, Loader2 } from 'lucide-react';

interface FarmMapProps {
  ownedLand: LandPlot[];
  selectedCropId: string | null;
  onTileAction: (plotId: string, tileId: string, action: 'plant' | 'harvest') => void;
}

const FarmMap: React.FC<FarmMapProps> = ({ ownedLand, selectedCropId, onTileAction }) => {
  
  const renderTile = (plotId: string, tile: PlotTile) => {
    const crop = tile.cropId ? getCropById(tile.cropId) : null;
    
    let tileClasses = "w-8 h-8 border flex items-center justify-center text-xs transition-all duration-300 cursor-pointer";
    let content = <X className="w-4 h-4 text-gray-400" />;
    let action: 'plant' | 'harvest' | null = null;
    let tooltip = "Empty Plot";

    if (tile.isReadyToHarvest && crop) {
      // Ready to Harvest
      tileClasses = cn(tileClasses, "bg-yellow-400 hover:bg-yellow-500 border-yellow-600");
      content = <Check className="w-5 h-5 text-white" />;
      action = 'harvest';
      tooltip = `Ready to Harvest: ${crop.name}`;
    } else if (crop) {
      // Growing
      const growthPercentage = tile.growthStage;
      
      // Simple color scaling based on growth stage
      const colorScale = Math.min(500, Math.max(100, Math.round(growthPercentage / 20) * 100));
      
      tileClasses = cn(tileClasses, `bg-green-${colorScale} border-green-700`);
      content = <Loader2 className="w-4 h-4 text-green-900 animate-spin" />;
      action = null;
      tooltip = `${crop.name} (${growthPercentage.toFixed(0)}% growth)`;
    } else if (selectedCropId) {
      // Empty, ready to plant
      tileClasses = cn(tileClasses, "bg-gray-200 hover:bg-green-300 border-gray-400");
      content = <Leaf className="w-4 h-4 text-green-600" />;
      action = 'plant';
      tooltip = `Click to plant ${getCropById(selectedCropId)?.name}`;
    } else {
      // Empty, no crop selected
      tileClasses = cn(tileClasses, "bg-gray-100 hover:bg-gray-200 border-gray-300");
      action = null;
    }

    const handleClick = () => {
      if (action) {
        onTileAction(plotId, tile.id, action);
      }
    };

    return (
      <div 
        key={tile.id} 
        className={tileClasses}
        onClick={handleClick}
        title={tooltip}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {ownedLand.map((plot) => (
        <Card key={plot.id} className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <LandPlot className="w-5 h-5 mr-2 text-amber-600" />
              {plot.name} ({plot.size} tiles)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${Math.sqrt(plot.size)}, minmax(0, 1fr))`,
                maxWidth: `${Math.sqrt(plot.size) * 36}px` // 32px tile + 4px gap
              }}
            >
              {plot.tiles.map(tile => renderTile(plot.id, tile))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FarmMap;