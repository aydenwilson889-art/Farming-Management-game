"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Fish } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FishClicker: React.FC = () => {
  const [fishCount, setFishCount] = useState(0);

  const handleFishClick = () => {
    setFishCount((prevCount) => prevCount + 1);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-extrabold text-blue-600">
          Fish Clicker Game
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 p-6">
        <div className="text-6xl font-mono text-gray-800 dark:text-gray-200">
          {fishCount}
        </div>
        <Button
          onClick={handleFishClick}
          className="w-48 h-48 rounded-full bg-blue-500 hover:bg-blue-600 transition-transform duration-100 active:scale-95 shadow-xl flex flex-col items-center justify-center p-0"
          aria-label="Click the fish to gain points"
        >
          <Fish className="w-24 h-24 text-white" />
          <span className="mt-2 text-lg font-semibold text-white">Click Me!</span>
        </Button>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Click the fish to increase your fish count!
        </p>
      </CardContent>
    </Card>
  );
};

export default FishClicker;