import React from "react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import styles from "./StatCard.module.css";

interface StatCardProps {
  value: number;
  label: string;
  delay: number;
  duration?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  value, 
  label, 
  delay, 
  duration = 1200
}) => {
  const animatedValue = useAnimatedCounter(value, duration, delay);

  return (
    <div className={styles.statCard}>
      <span className={styles.statValue}>{animatedValue}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
};