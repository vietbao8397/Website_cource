"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import styles from "./page.module.css";

interface RevenueData {
    date: string;
    revenue: number;
}

interface RevenueChartProps {
    data: RevenueData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    function formatCurrency(value: number) {
        return new Intl.NumberFormat("vi-VN").format(value) + "đ";
    }

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3>Doanh thu (30 ngày gần đây)</h3>
            </div>
            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#b89a5a" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#b89a5a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#888", fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#888", fontSize: 12 }}
                            tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1a1a1a",
                                border: "1px solid rgba(184, 154, 90, 0.2)",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                            itemStyle={{ color: "#b89a5a" }}
                            formatter={(value: number | undefined) => [formatCurrency(value || 0), "Doanh thu"]}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#b89a5a"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
