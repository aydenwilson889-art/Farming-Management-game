"use client";

import React from 'react';
import { Crop } from '@/lib/game-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, DollarSign, Leaf, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CropInfoCardProps {
  crop: Crop | null;
  currentSeason: string;
}

const CropInfoCard: React.FC<CropInfoCardProps> = ({ crop, currentSeason }) => {
  if (!crop) {
    return (
      <Card className="w-full shadow-lg h-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Leaf className="w-5 h-5 mr-2 text-green-600" />
            Planting Info
          </CardTitle>
          <CardDescription>Select a seed from the Marketplace to view details and start planting.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No crop selected.</p>
        </CardContent>
      </Card>
    );
  }

  const isOptimal = crop.optimalSeason === currentSeason;

  return (
    <Card className={cn("w-full shadow-lg h-full", isOptimal ? "border-green-500" : "border-yellow-500")}>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <crop.icon className="w-6 h-6 mr-2 text-green-700" />
          {crop.name} Seeds
        </CardTitle>
        <CardDescription>Ready to plant!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-500" />
            Growth Time:
          </span>
          <Badge variant="secondary">{crop.growthTime} Days</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-medium flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-yellow-600" />
            Base Sell Price:
          </span>
          <Badge variant="secondary">${crop.basePrice} / unit</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium flex items-center">
            <Leaf className="w-4 h-4 mr-2" />
            Optimal Season:
          </span>
          <Badge 
            className={isOptimal ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}
          >
            {crop.optimalSeason}
          </Badge>
        </div>

        <div className="pt-2 border-t mt-3">
          <h5 className="font-semibold mb-1">Current Season Status:</h5>
          <div className="flex items-center space-x-2 text-sm">
            {currentSeason === 'Winter' ? (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-500">Growth is halted (unless in Greenhouse).</span>
              </>
            ) : isOptimal ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Optimal growth speed!</span>
              </>
            ) : (
              <>
                <Leaf className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-600">Normal growth speed.</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CropInfoCard;