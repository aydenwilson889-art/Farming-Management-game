"use client";

import React from 'react';
import { PurchaseRecord } from '@/lib/game-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, Package, LandPlot, Factory, Dog } from 'lucide-react';

interface PurchaseHistoryProps {
  history: PurchaseRecord[];
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ history }) => {
  
  const getTypeIcon = (type: PurchaseRecord['type']) => {
    switch (type) {
      case 'seed':
      case 'fertilizer':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'animal':
        return <Dog className="w-4 h-4 text-amber-700" />;
      case 'land':
        return <LandPlot className="w-4 h-4 text-green-600" />;
      case 'infrastructure':
        return <Factory className="w-4 h-4 text-gray-600" />;
      case 'pet':
        return <Dog className="w-4 h-4 text-indigo-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  if (history.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No purchases recorded yet.</p>;
  }

  // Sort history by day descending
  const sortedHistory = [...history].sort((a, b) => b.day - a.day);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Day</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedHistory.map((record, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                {record.day}
              </TableCell>
              <TableCell>{record.item}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="flex items-center space-x-1">
                  {getTypeIcon(record.type)}
                  <span>{record.type.charAt(0).toUpperCase() + record.type.slice(1)}</span>
                </Badge>
              </TableCell>
              <TableCell className="text-right">{record.quantity.toLocaleString()}</TableCell>
              <TableCell className="text-right font-semibold text-green-600">
                -${record.cost.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseHistory;