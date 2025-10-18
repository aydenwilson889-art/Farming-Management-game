"use client";

import React from 'react';
import { Animal } from '@/lib/game-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Package, Clock, DollarSign } from 'lucide-react';
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
        <CardDescription>Manage your livestock and track their production.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ownedAnimals.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">You don't own any animals yet. Visit the Marketplace!</p>
        ) : (
          ownedAnimals.map((animal) => (
            <div 
              key={animal.id} 
              className="flex items-center justify-between p-3 border rounded-lg bg-card"
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
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {animal.daysUntilProduction} days left
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AnimalPen;