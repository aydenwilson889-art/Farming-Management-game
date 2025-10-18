"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, DollarSign, CheckCircle } from 'lucide-react';
import { GREENHOUSE_COST } from '@/lib/game-data';

interface GreenhouseProps {
  hasGreenhouse: boolean;
  cash: number;
  onBuyGreenhouse: () => void;
}

const Greenhouse: React.FC<GreenhouseProps> = ({ hasGreenhouse, cash, onBuyGreenhouse }) => {
  const canAfford = cash >= GREENHOUSE_COST;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Leaf className="w-6 h-6 mr-2 text-green-600" />
          Greenhouse
        </CardTitle>
        <CardDescription>Allows planting and growth during Winter.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasGreenhouse ? (
          <div className="flex items-center space-x-2 text-green-600 font-semibold">
            <CheckCircle className="w-5 h-5" />
            <span>Greenhouse operational! Winter planting is enabled.</span>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium">Cost: ${GREENHOUSE_COST.toLocaleString()}</p>
            <Button
              onClick={onBuyGreenhouse}
              disabled={!canAfford}
              className="flex items-center space-x-1"
            >
              <DollarSign className="w-4 h-4" />
              <span>{canAfford ? 'Purchase' : 'Cannot Afford'}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Greenhouse;