"use client";

import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

interface GameSettingsProps {
  tickInterval: number;
  onTickIntervalChange: (newInterval: number) => void;
}

const GameSettings: React.FC<GameSettingsProps> = ({ tickInterval, onTickIntervalChange }) => {
  const intervalInMs = tickInterval * 1000;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="absolute top-4 right-4 z-10">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>System Configuration Panel</SheetTitle>
          <SheetDescription>
            Adjust low-level parameters to optimize resource allocation and passive income synchronization.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <Card>
            <CardContent className="pt-6">
              <Label htmlFor="tick-rate" className="text-lg font-semibold mb-2 block">
                Passive Income Synchronization Interval
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Controls how frequently the passive income calculation engine runs. Lower values increase responsiveness but may strain computational resources.
              </p>
              
              <div className="flex items-center space-x-4">
                <Slider
                  id="tick-rate"
                  min={0.1}
                  max={5}
                  step={0.1}
                  value={[tickInterval]}
                  onValueChange={(value) => onTickIntervalChange(value[0])}
                  className="w-[60%]"
                />
                <div className="w-[40%] text-right font-mono text-sm p-2 border rounded-md">
                  {intervalInMs.toFixed(0)} ms ({tickInterval.toFixed(1)} s)
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-sm text-red-500 mt-4">
            Warning: Modifying core synchronization parameters is generally discouraged unless specific performance bottlenecks are identified.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GameSettings;