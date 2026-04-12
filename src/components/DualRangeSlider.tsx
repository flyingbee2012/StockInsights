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
  const draggingRef = useRef<"start" | "end" | null>(null);
  const latestValuesRef = useRef({ startValue, endValue });
  const [dragging, setDragging] = useState<"start" | "end" | null>(null);

  // Keep ref in sync so document listeners always have fresh values
  latestValuesRef.current = { startValue, endValue };

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

  // Document-level move handler (avoids pointer capture bubbling issues)
  const handleDocumentPointerMove = useCallback(
    (e: PointerEvent) => {
      const thumb = draggingRef.current;
      if (!thumb) return;

      const val = getValueFromPosition(e.clientX);
      const { startValue: s, endValue: ev } = latestValuesRef.current;

      if (thumb === "start") {
        const clamped = Math.min(val, ev);
        onChange(clamped, ev);
      } else {
        const clamped = Math.max(val, s);
        onChange(s, clamped);
      }
    },
    [getValueFromPosition, onChange],
  );

  // Document-level up handler
  const handleDocumentPointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    const { startValue: s, endValue: ev } = latestValuesRef.current;
    draggingRef.current = null;
    setDragging(null);
    onChangeComplete(s, ev);
  }, [onChangeComplete]);

  // Attach/detach document listeners when dragging changes
  useEffect(() => {
    if (dragging) {
      document.addEventListener("pointermove", handleDocumentPointerMove);
      document.addEventListener("pointerup", handleDocumentPointerUp);
    }
    return () => {
      document.removeEventListener("pointermove", handleDocumentPointerMove);
      document.removeEventListener("pointerup", handleDocumentPointerUp);
    };
  }, [dragging, handleDocumentPointerMove, handleDocumentPointerUp]);

  const handlePointerDown = useCallback(
    (thumb: "start" | "end") => (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      draggingRef.current = thumb;
      setDragging(thumb);
    },
    [disabled],
  );

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
      disabled,
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
