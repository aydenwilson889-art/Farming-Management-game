"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LandPlot as LandPlotIcon, DollarSign, Leaf, CheckCircle } from 'lucide-react';
import { LandPlot, GREENHOUSE_COST } from '@/lib/game-data';
import Greenhouse from './Greenhouse';

interface FarmConstructionProps {
  cash: number;
  availableLand: LandPlot[];
  hasGreenhouse: boolean;
  onBuyLand: (plot: LandPlot) => void;
  onBuyGreenhouse: () => void;
}

const FarmConstruction: React.FC<FarmConstructionProps> = ({ cash, availableLand, hasGreenhouse, onBuyLand, onBuyGreenhouse }) => {
  
  const unownedLand = availableLand.filter(p => !p.isOwned);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <LandPlotIcon className="w-6 h-6 mr-2" />
          Construction & Expansion
        </CardTitle>
        <CardDescription>Invest in new land and essential infrastructure.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Greenhouse Section */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold border-b pb-1">Infrastructure</h3>
          <Greenhouse 
            hasGreenhouse={hasGreenhouse}
            cash={cash}
            onBuyGreenhouse={onBuyGreenhouse}
          />
        </div>

        {/* Land Acquisition Section */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold border-b pb-1">Land Acquisition</h3>
          {unownedLand.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">All available land plots have been purchased!</p>
          ) : (
            unownedLand.map(plot => {
              const canAfford = cash >= plot.basePrice;
              return (
                <div key={plot.id} className="flex justify-between items-center p-3 border rounded-lg bg-card">
                  <div>
                    <h4 className="font-semibold">{plot.name} ({plot.size} tiles)</h4>
                    <p className="text-sm text-muted-foreground">Cost: ${plot.basePrice.toLocaleString()}</p>
                  </div>
                  <Button 
                    onClick={() => onBuyLand(plot)}
                    disabled={!canAfford}
                    className="h-8"
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Buy Land
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmConstruction;