"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upgrade, UPGRADES, calculateCost } from "@/lib/game-data";
import { DollarSign, Zap, Clock } from "lucide-react";

interface UpgradeShopProps {
  fishCount: number;
  ownedUpgrades: Record<string, number>;
  onPurchase: (upgrade: Upgrade, cost: number) => void;
}

const UpgradeShop: React.FC<UpgradeShopProps> = ({ fishCount, ownedUpgrades, onPurchase }) => {
  const handlePurchase = (upgrade: Upgrade) => {
    const owned = ownedUpgrades[upgrade.id] || 0;
    const cost = calculateCost(upgrade.baseCost, upgrade.costMultiplier, owned);

    if (fishCount >= cost) {
      onPurchase(upgrade, cost);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Upgrade Shop</CardTitle>
        <CardDescription>Buy upgrades to increase your clicking power and passive income.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {UPGRADES.map((upgrade) => {
          const owned = ownedUpgrades[upgrade.id] || 0;
          const cost = calculateCost(upgrade.baseCost, upgrade.costMultiplier, owned);
          const canAfford = fishCount >= cost;

          return (
            <div
              key={upgrade.id}
              className="flex items-center justify-between p-3 border rounded-lg transition-colors hover:bg-muted/50"
            >
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold">{upgrade.name}</h4>
                  <Badge variant="secondary">Owned: {owned}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{upgrade.description}</p>
                <div className="flex items-center text-sm mt-1">
                  {upgrade.type === 'click' ? (
                    <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                  ) : (
                    <Clock className="w-4 h-4 mr-1 text-green-500" />
                  )}
                  <span>
                    Effect: +{upgrade.baseEffect} {upgrade.type === 'click' ? 'Click Power' : 'FPS'}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => handlePurchase(upgrade)}
                disabled={!canAfford}
                className="flex items-center space-x-1"
              >
                <DollarSign className="w-4 h-4" />
                <span>{cost.toLocaleString()} Fish</span>
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default UpgradeShop;