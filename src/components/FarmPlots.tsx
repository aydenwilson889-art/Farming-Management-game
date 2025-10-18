"use client";

import React from 'react';
import { LandPlot, PlotTile, Crop, getCropById, Season } from '@/lib/game-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Leaf, Check, X, Loader2, LandPlot as LandPlotIcon, Snowflake, Factory } from 'lucide-react';

interface FarmPlotsProps {
  plots: LandPlot[];
  selectedCropId: string | null;
  currentSeason: Season;
  onTileAction: (plotId: string, tileId: string, action: 'plant' | 'harvest') => void;
}

const FarmPlots: React.FC<FarmPlotsProps> = ({ plots, selectedCropId, currentSeason, onTileAction }) => {
  
  if (plots.length === 0) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Farm Plots</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">No land plots owned yet. Purchase land in the Construction section!</p>
        </CardContent>
      </Card>
    );
  }

  const renderTile = (plotId: string, tile: PlotTile, isGreenhouse: boolean) => {
    const crop = tile.cropId ? getCropById(tile.cropId) : null;
    const selectedCrop = selectedCropId ? getCropById(selectedCropId) : null;

    let tileClasses = "w-8 h-8 border flex items-center justify-center text-xs transition-all duration-300 cursor-pointer";
    let content = <X className="w-4 h-4 text-gray-400" />;
    let action: 'plant' | 'harvest' | null = null;
    let tooltip = "Empty Plot";

    const isWinter = currentSeason === 'Winter';
    
    // Planting is allowed if:
    // 1. It's not winter OR
    // 2. It IS winter AND it's the greenhouse plot
    const isPlantingAllowed = !isWinter || isGreenhouse;
    const isOptimalSeason = selectedCrop && selectedCrop.optimalSeason === currentSeason;

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
      
      // If it's regular land and winter, growth stops/freezes
      if (isWinter && !isGreenhouse) {
        tileClasses = cn(tileClasses, "bg-red-800 border-red-900");
        content = <Snowflake className="w-4 h-4 text-white" />;
        tooltip = `${crop.name} is frozen! Growth stopped.`;
      }

    } else if (selectedCropId) {
      // Empty, ready to plant
      if (isPlantingAllowed) {
        tileClasses = cn(tileClasses, "bg-gray-200 hover:bg-green-300 border-gray-400");
        content = <Leaf className="w-4 h-4 text-green-600" />;
        action = 'plant';
        tooltip = `Click to plant ${selectedCrop?.name}. ${isOptimalSeason ? '(Optimal Season)' : ''}`;
      } else {
        // Cannot plant due to winter on regular land
        tileClasses = cn(tileClasses, "bg-blue-100 border-blue-300 cursor-not-allowed");
        content = <Snowflake className="w-4 h-4 text-blue-500" />;
        action = null;
        tooltip = `Cannot plant in Winter outside of the Greenhouse.`;
      }
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
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Farm Plots</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={plots[0].id}>
          <TabsList className="w-full justify-start h-auto flex-wrap p-1 mb-4">
            {plots.map((plot) => {
              const isGreenhouse = plot.id === 'greenhouse';
              return (
                <TabsTrigger key={plot.id} value={plot.id} className="flex items-center space-x-1 px-4 py-2">
                  {isGreenhouse ? <Factory className="w-4 h-4 text-green-600" /> : <LandPlotIcon className="w-4 h-4 text-amber-600" />}
                  <span>{plot.name} ({plot.size} tiles)</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {plots.map((plot) => {
            const isGreenhouse = plot.id === 'greenhouse';
            const gridColumns = isGreenhouse ? 6 : Math.sqrt(plot.size); // 6x2 for greenhouse, NxN for others

            return (
              <TabsContent key={plot.id} value={plot.id} className="mt-0 pt-4">
                <div 
                  className="grid gap-1 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                    maxWidth: `${gridColumns * 36}px` // 32px tile + 4px gap
                  }}
                >
                  {plot.tiles.map(tile => renderTile(plot.id, tile, isGreenhouse))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FarmPlots;