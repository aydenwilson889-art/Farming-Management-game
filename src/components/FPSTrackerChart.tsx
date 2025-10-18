"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FPSTrackerChartProps {
  data: { time: number; fps: number }[];
}

const FPSTrackerChart: React.FC<FPSTrackerChartProps> = ({ data }) => {
  // Format time for display (e.g., seconds elapsed)
  const formattedData = data.map((item, index) => ({
    ...item,
    time: index, // Using index as time elapsed in seconds for simplicity
  }));

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">Passive Income Flow Analysis (FPS)</CardTitle>
      </CardHeader>
      <CardContent className="h-64 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'bottom' }} tickFormatter={(value) => `${value}s`} />
            <YAxis label={{ value: 'FPS', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value, name) => [value.toLocaleString(), name]}
            />
            <Line type="monotone" dataKey="fps" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default FPSTrackerChart;