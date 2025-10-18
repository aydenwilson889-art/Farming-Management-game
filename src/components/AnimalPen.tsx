"use client";

import React from 'react';
import { Animal } from '@/lib/game-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Package, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnimalPenProps {
  ownedAnimals: Animal[];
}

const AnimalPen: React.FC<AnimalPenProps> = ({ ownedAnimals }) => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Package className="w-6 h-6 mr-2" />
          Animal Pen
        </CardTitle>
        <CardDescription>Manage your livestock and track their production cycles.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ownedAnimals.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">You don't own any animals yet. Visit the Marketplace!</p>
        ) : (
          ownedAnimals.map((animal) => {
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
      </CardContent>
    </Card>
  );
};

export default AnimalPen;