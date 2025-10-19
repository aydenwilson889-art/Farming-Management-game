"use client";

import React from 'react';
import { Pet, DOG_TRAINING_COST, DOG_TREAT_COST } from '@/lib/game-data';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Heart, Utensils, Dumbbell, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { showError } from '@/utils/toast';

interface PetManagementProps {
  ownedPets: Pet[];
  cash: number;
  onFeedPet: (petId: string) => void;
  onPlayWithPet: (petId: string) => void;
  onTrainDog: (petId: string) => void;
}

const PetManagement: React.FC<PetManagementProps> = ({ ownedPets, cash, onFeedPet, onPlayWithPet, onTrainDog }) => {
  
  const handleTrainDogClick = (pet: Pet) => {
    if (pet.isTrained) return;
    if (cash < DOG_TRAINING_COST) {
      showError(`Cannot afford dog training. Requires $${DOG_TRAINING_COST}.`);
      return;
    }
    onTrainDog(pet.id);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Pets boost your overall Happiness and can assist with livestock management.</p>
      
      {ownedPets.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">You don't own any pets yet. Purchase them in the Marketplace (Animals tab)!</p>
      ) : (
        ownedPets.map((pet) => {
          const canAffordFeed = cash >= pet.dailyFeedCost;
          const canAffordTraining = cash >= DOG_TRAINING_COST;
          const isDog = pet.isDog;
          
          return (
            <div 
              key={pet.id} 
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 border rounded-lg bg-card space-y-3 md:space-y-0"
            >
              <div className="flex items-start space-x-3">
                <pet.icon className="w-6 h-6 text-indigo-600 mt-1" />
                <div>
                  <h4 className="font-semibold">{pet.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Daily Feed Cost: ${pet.dailyFeedCost}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className={cn("text-xs", pet.isFed ? "bg-green-500" : "bg-red-500")}>
                        {pet.isFed ? 'Fed Today' : 'Needs Feeding'}
                    </Badge>
                    {isDog && (
                        <Badge variant="secondary" className={cn("text-xs", pet.isTrained ? "bg-blue-500" : "bg-gray-500")}>
                            {pet.isTrained ? 'Trained (Herding +15%)' : 'Untrained (Herding 0%)'}
                        </Badge>
                    )}
                    {!isDog && (
                        <Badge variant="secondary" className="text-xs bg-blue-500">
                            Riding Horse (Herding +5%)
                        </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-x-2">
                
                {/* Feed Action */}
                <Button
                  onClick={() => onFeedPet(pet.id)}
                  disabled={!canAffordFeed || pet.isFed}
                  variant={pet.isFed ? "secondary" : "default"}
                  className="h-8 text-xs"
                >
                  {pet.isFed ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <Utensils className="w-3 h-3 mr-1" />
                  )}
                  {pet.isFed ? 'Fed' : `Feed ($${pet.dailyFeedCost})`}
                </Button>

                {/* Play/Ride Action */}
                <Button
                  onClick={() => onPlayWithPet(pet.id)}
                  variant="outline"
                  className="h-8 text-xs mt-2 sm:mt-0 flex items-center space-x-1"
                >
                  <Heart className="w-3 h-3 fill-red-400 text-red-400" />
                  <span>{isDog ? 'Play (Happiness +15)' : 'Ride (Happiness +25)'}</span>
                </Button>
                
                {/* Training Action (Dog only) */}
                {isDog && !pet.isTrained && (
                    <Button
                      onClick={() => handleTrainDogClick(pet)}
                      disabled={!canAffordTraining}
                      variant="destructive"
                      className="h-8 text-xs mt-2 sm:mt-0 flex items-center space-x-1"
                    >
                      <Dumbbell className="w-3 h-3" />
                      <span>Train Dog (${DOG_TRAINING_COST})</span>
                    </Button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PetManagement;