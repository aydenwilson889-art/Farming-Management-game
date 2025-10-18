"use client";

import React from 'react';
import { LandPlot, PlotTile, Crop, getCropById, Season } from '@/lib/game-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Leaf, LandPlot as LandPlotIcon, Snowflake, Factory, Zap } from 'lucide-react';

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
  
  const isGreenhouseBoosted = currentSeason === 'Spring' || currentSeason === 'Summer';

  const renderTile = (plotId: string, tile: PlotTile, isGreenhouse: boolean) => {
    const crop = tile.cropId ? getCropById(tile.cropId) : null;
    const selectedCrop = selectedCropId ? getCropById(selectedCropId) : null;

    let tileClasses = "w-12 h-12 border flex items-center justify-center text-xs transition-all duration-300 relative overflow-hidden rounded-sm";
    let content = <LandPlotIcon className="w-6 h-6 text-gray-400" />;
    let action: 'plant' | 'harvest' | null = null;
    let tooltip = "Empty Plot";

    const isWinter = currentSeason === 'Winter';
    
    // Planting is allowed if:
    // 1. It's not winter OR
    // 2. It IS winter AND it's the greenhouse plot
    const isPlantingAllowed = !isWinter || isGreenhouse;
    const isOptimalSeason = crop && crop.optimalSeason === currentSeason;

    if (tile.isReadyToHarvest && crop) {
      // Ready to Harvest
      tileClasses = cn(tileClasses, "bg-yellow-300 hover:bg-yellow-400 border-yellow-600 ring-2 ring-yellow-600 cursor-pointer");
      const CropIcon = crop.icon;
      content = <CropIcon className="w-7 h-7 text-yellow-800 z-10" />;
      action = 'harvest';
      tooltip = `Ready to Harvest: ${crop.name} (Click to collect)`;
    } else if (crop) {
      // Growing
      const growthPercentage = tile.growthStage;
      const CropIcon = crop.icon;
      
      // Visual representation of growth
      const growthHeight = `${Math.min(100, Math.max(10, growthPercentage))}%`;
      
      tileClasses = cn(tileClasses, "bg-green-100 border-green-700 cursor-default");
      content = (
        <>
          <div 
            className="absolute bottom-0 left-0 w-full bg-green-500 transition-all duration-500 opacity-70"
            style={{ height: growthHeight }}
          />
          <CropIcon className="w-6 h-6 text-green-900 z-10" />
          {isOptimalSeason && <Zap className="absolute top-0 right-0 w-3 h-3 text-yellow-400 z-20" title="Optimal Growth" />}
        </>
      );
      action = null;
      tooltip = `${crop.name} (${growthPercentage.toFixed(0)}% growth)`;
      
      // If it's regular land and winter, growth stops/freezes
      if (isWinter && !isGreenhouse) {
        tileClasses = cn(tileClasses, "bg-blue-100 border-blue-300 cursor-not-allowed");
        content = <Snowflake className="w-6 h-6 text-blue-500 z-10" />;
        tooltip = `${crop.name} is frozen! Growth stopped.`;
      }

    } else if (selectedCropId) {
      // Empty, ready to plant
      if (isPlantingAllowed) {
        tileClasses = cn(tileClasses, "bg-gray-200 hover:bg-green-300 border-gray-400 cursor-pointer");
        content = <Leaf className="w-6 h-6 text-green-600" />;
        action = 'plant';
        tooltip = `Click to plant ${selectedCrop?.name}.`;
      } else {
        // Cannot plant due to winter on regular land
        tileClasses = cn(tileClasses, "bg-blue-100 border-blue-300 cursor-not-allowed");
        content = <Snowflake className="w-6 h-6 text-blue-500" />;
        action = null;
        tooltip = `Cannot plant in Winter outside of the Greenhouse.`;
      }
    } else {
      // Empty, no crop selected
      tileClasses = cn(tileClasses, "bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-default");
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
              const showZap = isGreenhouse && isGreenhouseBoosted;
              
              return (
                <TabsTrigger key={plot.id} value={plot.id} className="flex items-center space-x-1 px-4 py-2">
                  {isGreenhouse ? <Factory className="w-4 h-4 mr-1 text-green-600" /> : <LandPlotIcon className="w-4 h-4 mr-1 text-amber-600" />}
                  <span>{plot.name} ({plot.size} tiles)</span>
                  {showZap && <Zap className="w-3 h-3 text-yellow-500 ml-1" title="Greenhouse Speed Boost Active" />}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {plots.map((plot) => {
            const isGreenhouse = plot.id === 'greenhouse';
            // Determine grid size: 3 for greenhouse, square root for others
            const gridColumns = isGreenhouse ? 3 : Math.sqrt(plot.size); 

            return (
              <TabsContent key={plot.id} value={plot.id} className="mt-0 pt-4">
                <div 
                  className="grid gap-1 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                    maxWidth: `${gridColumns * 52}px` // 48px tile + 4px gap
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