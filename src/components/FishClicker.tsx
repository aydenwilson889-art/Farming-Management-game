"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Fish, Zap, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UpgradeShop from "./UpgradeShop";
import { Upgrade, UPGRADES } from "@/lib/game-data";
import { showSuccess } from "@/utils/toast";

const FishClicker: React.FC = () => {
  const [fishCount, setFishCount] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [fps, setFps] = useState(0);
  const [ownedUpgrades, setOwnedUpgrades] = useState<Record<string, number>>({});

  // 1. Passive Income Effect: Adds fish based on FPS every second
  useEffect(() => {
    const interval = setInterval(() => {
      setFishCount((prevCount) => prevCount + fps);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [fps]);

  // 2. Recalculate Stats Effect: Updates clickPower and FPS whenever upgrades are purchased
  useEffect(() => {
    let newClickPower = 1;
    let newFps = 0;

    UPGRADES.forEach(upgrade => {
      const owned = ownedUpgrades[upgrade.id] || 0;
      if (upgrade.type === 'click') {
        // Click power starts at 1 + total effect from upgrades
        newClickPower += owned * upgrade.baseEffect;
      } else if (upgrade.type === 'passive') {
        newFps += owned * upgrade.baseEffect;
      }
    });

    setClickPower(newClickPower);
    setFps(newFps);
  }, [ownedUpgrades]);


  const handleFishClick = () => {
    setFishCount((prevCount) => prevCount + clickPower);
  };

  const handlePurchase = useCallback((upgrade: Upgrade, cost: number) => {
    setFishCount(prevCount => prevCount - cost);
    
    setOwnedUpgrades(prev => {
      const newCount = (prev[upgrade.id] || 0) + 1;
      return {
        ...prev,
        [upgrade.id]: newCount,
      };
    });
    
    showSuccess(`Purchased ${upgrade.name}!`);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
            Super Advanced Fish Clicker
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          
          {/* Stats Display */}
          <div className="flex flex-wrap justify-around mb-8 p-4 bg-muted rounded-lg">
            <div className="text-center m-2">
              <p className="text-sm text-muted-foreground">Total Fish</p>
              <div className="text-4xl font-bold text-foreground flex items-center justify-center">
                <DollarSign className="w-6 h-6 mr-1 text-green-600" />
                {fishCount.toLocaleString()}
              </div>
            </div>
            <div className="text-center m-2 flex items-center space-x-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Click Power</p>
                <div className="text-2xl font-semibold">{clickPower.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-center m-2 flex items-center space-x-2">
              <Clock className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">FPS</p>
                <div className="text-2xl font-semibold">{fps.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Clicker Button */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={handleFishClick}
              className="w-60 h-60 rounded-full bg-blue-500 hover:bg-blue-600 transition-transform duration-100 active:scale-95 shadow-2xl flex flex-col items-center justify-center p-0"
              aria-label="Click the fish to gain points"
            >
              <Fish className="w-32 h-32 text-white animate-pulse" />
              <span className="mt-2 text-xl font-bold text-white">Catch Fish!</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Upgrade Shop */}
      <UpgradeShop 
        fishCount={fishCount} 
        ownedUpgrades={ownedUpgrades} 
        onPurchase={handlePurchase} 
      />
    </div>
  );
};

export default FishClicker;