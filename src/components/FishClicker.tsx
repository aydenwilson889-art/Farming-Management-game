"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Fish, Zap, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UpgradeShop from "./UpgradeShop";
import FPSTrackerChart from "./FPSTrackerChart";
import GameSettings from "./GameSettings";
import { Upgrade, UPGRADES } from "@/lib/game-data";
import { showSuccess } from "@/utils/toast";

const FishClicker: React.FC = () => {
  const [fishCount, setFishCount] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [fps, setFps] = useState(0);
  const [ownedUpgrades, setOwnedUpgrades] = useState<Record<string, number>>({});
  
  // Far Too Advanced State Management
  const [fpsHistory, setFpsHistory] = useState<{ time: number; fps: number }[]>([]);
  const [tickInterval, setTickInterval] = useState(1); // Interval in seconds (default 1s)
  const [totalClicks, setTotalClicks] = useState(0);

  // 1. Passive Income Effect: Adds fish based on FPS every `tickInterval` seconds
  useEffect(() => {
    const intervalMs = tickInterval * 1000;
    
    const interval = setInterval(() => {
      // Calculate fish gained based on FPS and the interval duration
      setFishCount((prevCount) => prevCount + fps * tickInterval);
      
      // Track FPS history every tick
      setFpsHistory(prevHistory => {
        const newEntry = { time: Date.now(), fps: fps };
        // Keep history size manageable (e.g., last 60 ticks)
        return [...prevHistory.slice(-59), newEntry];
      });
      
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [fps, tickInterval]);

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
    setTotalClicks(prev => prev + 1);
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
  
  const handleTickIntervalChange = (newInterval: number) => {
    setTickInterval(newInterval);
    showSuccess(`Synchronization interval updated to ${newInterval.toFixed(1)} seconds.`);
  };
  
  // 3. Efficiency Calculation (Absurd Metric)
  const totalPassiveIncome = fpsHistory.reduce((sum, entry) => sum + entry.fps, 0);
  // Efficiency Rating: Passive Income generated per click (normalized)
  const efficiencyRating = totalClicks > 0 || totalPassiveIncome > 0 
    ? (totalPassiveIncome / (totalClicks + 1)) * 100 
    : 0; 

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 relative">
      
      <GameSettings 
        tickInterval={tickInterval} 
        onTickIntervalChange={handleTickIntervalChange} 
      />
      
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
            Hyper-Optimized Resource Acquisition System (H.O.R.A.S.)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          
          {/* Stats Display */}
          <div className="flex flex-wrap justify-around mb-8 p-4 bg-muted rounded-lg">
            <div className="text-center m-2">
              <p className="text-sm text-muted-foreground">Total Fish Units</p>
              <div className="text-4xl font-bold text-foreground flex items-center justify-center">
                <DollarSign className="w-6 h-6 mr-1 text-green-600" />
                {fishCount.toLocaleString()}
              </div>
            </div>
            <div className="text-center m-2 flex items-center space-x-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Manual Input Power</p>
                <div className="text-2xl font-semibold">{clickPower.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-center m-2 flex items-center space-x-2">
              <Clock className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Automated Yield Rate (FPS)</p>
                <div className="text-2xl font-semibold">{fps.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Clicker Button */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={handleFishClick}
              className="w-60 h-60 rounded-full bg-blue-500 hover:bg-blue-600 transition-transform duration-100 active:scale-95 shadow-2xl flex flex-col items-center justify-center p-0"
              aria-label="Execute manual resource acquisition protocol"
            >
              <Fish className="w-32 h-32 text-white animate-pulse" />
              <span className="mt-2 text-xl font-bold text-white">Execute Protocol</span>
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
      
      {/* New Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FPSTrackerChart data={fpsHistory} />
        
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Operational Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">Total Manual Inputs Recorded:</span>
              <span className="font-bold text-lg">{totalClicks.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">Synchronization Interval:</span>
              <span className="font-bold text-lg text-blue-500">{tickInterval.toFixed(1)} s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Click-to-Passive Efficiency Rating:</span>
              <span className={`font-bold text-lg ${efficiencyRating > 10 ? 'text-green-600' : 'text-red-600'}`}>
                {efficiencyRating.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              This metric quantifies the ratio of total passive fish generated to manual inputs performed, indicating system reliance on automation versus user interaction.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FishClicker;