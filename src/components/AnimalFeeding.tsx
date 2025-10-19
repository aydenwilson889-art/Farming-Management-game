"use client";

import React from 'react';
import { Animal, calculateMeatPriceMultiplier } from '@/lib/game-data';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Utensils, CheckCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { showError } from '@/utils/toast';

interface AnimalFeedingProps {
  meatAnimals: Animal[];
  cash: number;
  onFeedAnimal: (animalId: string) => void;
  onButcherAnimal: (animalId: string) => void;
}

const AnimalFeeding: React.FC<AnimalFeedingProps> = ({ meatAnimals, cash, onFeedAnimal, onButcherAnimal }) => {
  
  const renderWeightStatus = (animal: Animal) => {
    const multiplier = calculateMeatPriceMultiplier(animal.weight, animal.optimalWeight, animal.minWeight, animal.maxWeight);
    
    let statusText: string;
    let statusColor: string;

    if (multiplier >= 0.95) {
      statusText = "Beauty Butcher (Optimal)";
      statusColor = "bg-green-500 hover:bg-green-600";
    } else if (multiplier >= 0.8) {
      statusText = "Good Quality";
      statusColor = "bg-yellow-500 hover:bg-yellow-600";
    } else if (animal.weight < animal.optimalWeight) {
      statusText = "Too Skinny";
      statusColor = "bg-red-500 hover:bg-red-600";
    } else {
      statusText = "Too Heavy (Fatty)";
      statusColor = "bg-red-500 hover:bg-red-600";
    }

    return (
      <div className="flex flex-col items-end space-y-1">
        <Badge className={cn("text-xs", statusColor)}>
          {statusText} ({multiplier.toFixed(2)}x Value)
        </Badge>
        <p className="text-xs text-muted-foreground">
          Weight: {animal.weight.toFixed(1)} kg (Optimal: {animal.optimalWeight} kg)
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Feed your livestock daily to maintain optimal weight for processing into meat products.</p>
      {meatAnimals.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">You don't own any meat animals yet. Purchase them in the Marketplace!</p>
      ) : (
        meatAnimals.map((animal) => {
          const totalFeedCost = animal.feedCost * animal.quantity;
          const canAffordFeed = cash >= totalFeedCost;
          const isReadyToButcher = animal.daysUntilProduction <= 1;
          
          return (
            <div 
              key={animal.id} 
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 border rounded-lg bg-card space-y-3 md:space-y-0"
            >
              <div className="flex items-start space-x-3">
                <animal.icon className="w-6 h-6 text-amber-700 mt-1" />
                <div>
                  <h4 className="font-semibold">{animal.name} ({animal.quantity} units)</h4>
                  {renderWeightStatus(animal)}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-x-2">
                
                {/* Feeding Action */}
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => onFeedAnimal(animal.id)}
                    disabled={!canAffordFeed || animal.isFed}
                    variant={animal.isFed ? "secondary" : "default"}
                    className="h-8 text-xs"
                  >
                    {animal.isFed ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <DollarSign className="w-3 h-3 mr-1" />
                    )}
                    {animal.isFed ? 'Fed Today' : `Feed ($${totalFeedCost})`}
                  </Button>
                </div>

                {/* Butchering/Processing Action */}
                <Button
                  onClick={() => onButcherAnimal(animal.id)}
                  disabled={!isReadyToButcher}
                  variant="destructive"
                  className="h-8 text-xs mt-2 sm:mt-0"
                  title={isReadyToButcher ? `Convert ${animal.quantity} ${animal.name}(s) into meat inventory.` : `Ready in ${animal.daysUntilProduction - 1} days.`}
                >
                  <ArrowRight className="w-3 h-3 mr-1" />
                  {isReadyToButcher ? 'Send to Butcher Shop' : `${animal.daysUntilProduction - 1} Days Left`}
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AnimalFeeding;