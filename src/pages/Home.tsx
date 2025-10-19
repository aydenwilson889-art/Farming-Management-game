"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tractor, ArrowRight } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    const name = playerName.trim() || 'Farmer';
    localStorage.setItem('playerName', name);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-xl shadow-2xl">
        <CardHeader className="text-center">
          <Tractor className="w-12 h-12 mx-auto mb-2 text-primary" />
          <CardTitle className="text-3xl font-bold">Grandpa's Legacy</CardTitle>
          <CardDescription className="text-lg mt-2">A New Beginning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              The old farm stood silent, a monument to a life well-lived. After Grandpa passed away, the fields lay fallow, waiting. 
              You, his grandchild, decided to leave the city life behind and answer the call of the land.
            </p>
            <p className="font-semibold italic">
              It's time to revive Grandpa's Legacy.
            </p>
          </div>

          <form onSubmit={handleStartGame} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">What is your name?</Label>
              <Input
                id="name"
                placeholder="Type Your Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={30}
              />
            </div>
            <Button type="submit" className="w-full flex items-center justify-center text-lg py-6">
              Start Farming
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default Home;