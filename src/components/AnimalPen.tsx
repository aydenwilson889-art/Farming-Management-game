"use client";

import React from 'react';
import { Animal } from '@/lib/game-data';
import { CardContent } from '@/components/ui/card';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnimalPenProps {
  ownedAnimals: Animal[];
}

const AnimalPen: React.FC<AnimalPenProps> = ({ ownedAnimals }) => {
  const producerAnimals = ownedAnimals.filter(a => !a.isMeatAnimal);
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Manage your livestock and track their production cycles.</p>
      {producerAnimals.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">You don't own any product animals yet. Visit the Marketplace!</p>
      ) : (
        producerAnimals.map((animal) => {
          const isReady = animal.daysUntilProduction === 1;
          
          return (
            <div 
              key={animal.id} 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg bg-card"
            >
              <div className="flex items-center space-x-3">
                <animal.icon className="w-6 h-6 text-amber-700" />
                <div>
                  <h4 className="font-semibold">{animal.name} ({animal.quantity} units)</h4>
                  <p className="text-xs text-muted-foreground">
                    Produces {animal.product.name} (Value: ${animal.product.basePrice})
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                {isReady ? (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready to Produce!
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {animal.daysUntilProduction - 1} days left
                  </Badge>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AnimalPen;