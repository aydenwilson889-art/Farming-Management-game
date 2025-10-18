"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Settings, Lock, Unlock, DollarSign, Clock } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const ADMIN_PASSWORD = "2028068";

interface AdminPanelProps {
  currentCash: number;
  currentDay: number;
  onAdjustCash: (amount: number) => void;
  onAdjustDay: (day: number) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentCash, currentDay, onAdjustCash, onAdjustDay }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [newCash, setNewCash] = useState(currentCash.toString());
  const [newDay, setNewDay] = useState(currentDay.toString());

  const handleUnlock = () => {
    if (password === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      showSuccess("Admin Panel Unlocked!");
    } else {
      showError("Incorrect password.");
      setPassword('');
    }
  };

  const handleApplyCash = () => {
    const cashValue = parseInt(newCash);
    if (!isNaN(cashValue) && cashValue >= 0) {
      onAdjustCash(cashValue);
      showSuccess(`Cash set to $${cashValue.toLocaleString()}.`);
    } else {
      showError("Invalid cash amount.");
    }
  };

  const handleApplyDay = () => {
    const dayValue = parseInt(newDay);
    if (!isNaN(dayValue) && dayValue >= 1) {
      onAdjustDay(dayValue);
      showSuccess(`Day set to ${dayValue}. Game time will adjust on the next tick.`);
    } else {
      showError("Invalid day number.");
    }
  };

  // Sync local state when props change (e.g., after applying changes or game progression)
  React.useEffect(() => {
    setNewCash(currentCash.toString());
  }, [currentCash]);

  React.useEffect(() => {
    setNewDay(currentDay.toString());
  }, [currentDay]);


  return (
    <Card className="w-full shadow-lg border-2 border-destructive/50">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center text-destructive">
          <Settings className="w-6 h-6 mr-2" />
          Admin Panel
        </CardTitle>
        <CardDescription>
          {isUnlocked ? "Adjust game parameters for testing." : "Enter password to unlock administrative controls."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isUnlocked ? (
          <div className="flex space-x-2">
            <Input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleUnlock} className="flex items-center">
              <Lock className="w-4 h-4 mr-1" />
              Unlock
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cash Adjustment */}
            <div className="space-y-2 p-3 border rounded-md">
              <Label htmlFor="cash-input" className="flex items-center font-semibold">
                <DollarSign className="w-4 h-4 mr-1" /> Adjust Cash
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="cash-input"
                  type="number"
                  value={newCash}
                  onChange={(e) => setNewCash(e.target.value)}
                  min={0}
                />
                <Button onClick={handleApplyCash}>Set Cash</Button>
              </div>
            </div>

            {/* Day Adjustment */}
            <div className="space-y-2 p-3 border rounded-md">
              <Label htmlFor="day-input" className="flex items-center font-semibold">
                <Clock className="w-4 h-4 mr-1" /> Adjust Day
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="day-input"
                  type="number"
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  min={1}
                />
                <Button onClick={handleApplyDay}>Set Day</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPanel;