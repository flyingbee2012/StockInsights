import React, { useRef, useCallback, useEffect, useState } from "react";
import styles from "./DualRangeSlider.module.scss";

interface DualRangeSliderProps {
  min: number;
  max: number;
  startValue: number;
  endValue: number;
  disabled?: boolean;
  onChange: (start: number, end: number) => void;
  onChangeComplete: (start: number, end: number) => void;
}

const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  startValue,
  endValue,
  disabled = false,
  onChange,
  onChangeComplete,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"start" | "end" | null>(null);

  const range = max - min || 1;

  const getPercent = (value: number) => ((value - min) / range) * 100;

  const getValueFromPosition = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      return Math.round(min + percent * range);
    },
    [min, range],
  );

  const handlePointerDown = useCallback(
    (thumb: "start" | "end") => (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(thumb);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const val = getValueFromPosition(e.clientX);

      if (dragging === "start") {
        const clamped = Math.min(val, endValue);
        onChange(clamped, endValue);
      } else {
        const clamped = Math.max(val, startValue);
        onChange(startValue, clamped);
      }
    },
    [dragging, startValue, endValue, getValueFromPosition, onChange],
  );

  const handlePointerUp = useCallback(() => {
    if (dragging) {
      setDragging(null);
      onChangeComplete(startValue, endValue);
    }
  }, [dragging, startValue, endValue, onChangeComplete]);

  // Handle track click to move nearest thumb
  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || dragging) return;
      const val = getValueFromPosition(e.clientX);
      const distToStart = Math.abs(val - startValue);
      const distToEnd = Math.abs(val - endValue);

      if (distToStart <= distToEnd) {
        const clamped = Math.min(val, endValue);
        onChange(clamped, endValue);
        onChangeComplete(clamped, endValue);
      } else {
        const clamped = Math.max(val, startValue);
        onChange(startValue, clamped);
        onChangeComplete(startValue, clamped);
      }
    },
    [
      dragging,
      startValue,
      endValue,
      getValueFromPosition,
      onChange,
      onChangeComplete,
    ],
  );

  const startPercent = getPercent(startValue);
  const endPercent = getPercent(endValue);

  return (
    <div
      className={`${styles.sliderContainer} ${disabled ? styles.disabled : ""}`}
    >
      <div
        className={styles.track}
        ref={trackRef}
        onClick={handleTrackClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Background track */}
        <div className={styles.trackBackground} />

        {/* Active range highlight */}
        <div
          className={styles.trackFill}
          style={{
            left: `${startPercent}%`,
            width: `${endPercent - startPercent}%`,
          }}
        />

        {/* Start thumb */}
        <div
          className={`${styles.thumb} ${dragging === "start" ? styles.active : ""}`}
          style={{ left: `${startPercent}%` }}
          onPointerDown={handlePointerDown("start")}
          role="slider"
          aria-label="Start year"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={startValue}
          tabIndex={0}
        />

        {/* End thumb */}
        <div
          className={`${styles.thumb} ${dragging === "end" ? styles.active : ""}`}
          style={{ left: `${endPercent}%` }}
          onPointerDown={handlePointerDown("end")}
          role="slider"
          aria-label="End year"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={endValue}
          tabIndex={0}
        />
      </div>
    </div>
  );
};

export default DualRangeSlider;
