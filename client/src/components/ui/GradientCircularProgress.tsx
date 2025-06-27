import * as React from "react";

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string; // Prop mới để nhận màu
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 144,
  strokeWidth = 12,
  color = "#3b82f6", // Mặc định là màu xanh blue
}) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
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
          stroke={color} // Sử dụng màu từ prop
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
          {/* Sửa ở đây: Thêm class màu cho điểm số */}
          <span className={`text-3xl font-bold`} style={{ color: color }}>
            {progress}
          </span>
          <span className="text-xl">/100</span>
          <p className="text-sm mt-1 text-muted-foreground">Điểm tổng thể</p>
        </div>
      </div>
    </div>
  );
};

// Đổi tên component export
export default CircularProgress;