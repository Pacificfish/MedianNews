"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

interface BiasTrackerProps {
  userId: string;
}

const COLORS = {
  Left: "#3366FF",
  Center: "#D1D5DB",
  Right: "#FF3B3B",
};

export function BiasTracker({ userId }: BiasTrackerProps) {
  const [stats, setStats] = useState<{
    total: number;
    left: number;
    center: number;
    right: number;
    last7Days: { left: number; center: number; right: number };
    last30Days: { left: number; center: number; right: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, [userId]);

  async function loadStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all reads
    const { data: reads } = await supabase
      .from("user_reads")
      .select(`
        article_id,
        ts,
        articles!inner(
          bias_scores(leaning)
        )
      `)
      .eq("user_id", userId)
      .order("ts", { ascending: false });

    if (!reads) {
      setLoading(false);
      return;
    }

    const all = reads.map((r: any) => r.articles?.bias_scores?.[0]?.leaning).filter(Boolean);
    const last30 = reads
      .filter((r: any) => new Date(r.ts) >= thirtyDaysAgo)
      .map((r: any) => r.articles?.bias_scores?.[0]?.leaning)
      .filter(Boolean);
    const last7 = reads
      .filter((r: any) => new Date(r.ts) >= sevenDaysAgo)
      .map((r: any) => r.articles?.bias_scores?.[0]?.leaning)
      .filter(Boolean);

    const count = (arr: string[], label: string) => arr.filter((l) => l === label).length;

    setStats({
      total: all.length,
      left: count(all, "Left"),
      center: count(all, "Center"),
      right: count(all, "Right"),
      last7Days: {
        left: count(last7, "Left"),
        center: count(last7, "Center"),
        right: count(last7, "Right"),
      },
      last30Days: {
        left: count(last30, "Left"),
        center: count(last30, "Center"),
        right: count(last30, "Right"),
      },
    });
    setLoading(false);
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!stats || stats.total === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 mb-4">No reading history yet</p>
          <p className="text-sm text-gray-400">
            Start reading articles to see your bias breakdown
          </p>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: "Left", value: stats.left, color: COLORS.Left },
    { name: "Center", value: stats.center, color: COLORS.Center },
    { name: "Right", value: stats.right, color: COLORS.Right },
  ].filter((d) => d.value > 0);

  const barData = [
    { period: "Last 7 Days", Left: stats.last7Days.left, Center: stats.last7Days.center, Right: stats.last7Days.right },
    { period: "Last 30 Days", Left: stats.last30Days.left, Center: stats.last30Days.center, Right: stats.last30Days.right },
  ];

  const leftPercent = ((stats.left / stats.total) * 100).toFixed(1);
  const centerPercent = ((stats.center / stats.total) * 100).toFixed(1);
  const rightPercent = ((stats.right / stats.total) * 100).toFixed(1);

  // Determine dominant bias
  const dominant = stats.left > stats.right && stats.left > stats.center
    ? "Left"
    : stats.right > stats.left && stats.right > stats.center
    ? "Right"
    : "Center";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Left</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: COLORS.Left }}>
              {leftPercent}%
            </div>
            <div className="text-sm text-gray-500">{stats.left} articles</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Right</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: COLORS.Right }}>
              {rightPercent}%
            </div>
            <div className="text-sm text-gray-500">{stats.right} articles</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Left" fill={COLORS.Left} />
              <Bar dataKey="Center" fill={COLORS.Center} />
              <Bar dataKey="Right" fill={COLORS.Right} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {dominant !== "Center" && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Balance Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              You've been reading mostly <strong>{dominant}</strong> sources. Consider exploring{" "}
              {dominant === "Left" ? "Right" : "Left"} perspectives to get a more balanced view.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



