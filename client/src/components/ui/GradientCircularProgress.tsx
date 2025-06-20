import * as React from "react";

interface GradientCircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  gradientId?: string;
  startColor?: string;
  endColor?: string;
}

const GradientCircularProgress: React.FC<GradientCircularProgressProps> = ({
  progress,
  size = 144, // w-36
  strokeWidth = 12,
  gradientId = "score-gradient",
  startColor = "#E080FE", // Màu tím bạn cung cấp
  endColor = "#38D7F8",   // Màu xanh bạn cung cấp
}) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        {/* Định nghĩa dải màu gradient */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>

        {/* Vòng tròn nền */}
        <circle
          className="text-gray-200 dark:text-gray-700"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />

        {/* Vòng tròn tiến độ */}
        <circle
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            transition: "stroke-dashoffset 0.5s ease-out",
          }}
        />
      </svg>
      {/* Text hiển thị điểm ở giữa */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-3xl font-bold">{progress}</span>
          <span className="text-xl">/100</span>
          <p className="text-sm mt-1 text-muted-foreground">Total Score</p>
        </div>
      </div>
    </div>
  );
};

export default GradientCircularProgress;