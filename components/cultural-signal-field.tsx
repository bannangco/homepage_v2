"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

const POINTER_MOTION_QUERY =
  "(pointer: fine) and (prefers-reduced-motion: no-preference)";
const MAX_POINTER_OFFSET = 8;

export default function CulturalSignalField() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    const pointerZone = field?.closest<HTMLElement>("[data-hero-pointer-zone]");

    if (!field || !pointerZone) return;

    const motionQuery = window.matchMedia(POINTER_MOTION_QUERY);
    let frameId: number | null = null;
    let pointerX = 0;
    let pointerY = 0;
    let listenersActive = false;

    const resetPosition = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }

      field.style.setProperty("--signal-x", "0px");
      field.style.setProperty("--signal-y", "0px");
    };

    const updatePosition = () => {
      frameId = null;

      const bounds = pointerZone.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      const normalizedX = Math.max(
        -1,
        Math.min(1, ((pointerX - bounds.left) / bounds.width) * 2 - 1),
      );
      const normalizedY = Math.max(
        -1,
        Math.min(1, ((pointerY - bounds.top) / bounds.height) * 2 - 1),
      );

      field.style.setProperty(
        "--signal-x",
        `${(normalizedX * MAX_POINTER_OFFSET).toFixed(2)}px`,
      );
      field.style.setProperty(
        "--signal-y",
        `${(normalizedY * MAX_POINTER_OFFSET).toFixed(2)}px`,
      );
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (frameId === null) {
        frameId = window.requestAnimationFrame(updatePosition);
      }
    };

    const enablePointerMotion = () => {
      if (listenersActive) return;

      pointerZone.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      pointerZone.addEventListener("pointerleave", resetPosition);
      listenersActive = true;
    };

    const disablePointerMotion = () => {
      if (listenersActive) {
        pointerZone.removeEventListener("pointermove", handlePointerMove);
        pointerZone.removeEventListener("pointerleave", resetPosition);
        listenersActive = false;
      }

      resetPosition();
    };

    const syncMotionPreference = () => {
      if (motionQuery.matches) {
        enablePointerMotion();
      } else {
        disablePointerMotion();
      }
    };

    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    return () => {
      motionQuery.removeEventListener("change", syncMotionPreference);
      disablePointerMotion();
    };
  }, []);

  return (
    <div
      ref={fieldRef}
      aria-hidden="true"
      className="cultural-signal-field pointer-events-none relative h-[8.5rem] min-w-0 overflow-hidden border border-grid bg-surface-dark sm:h-[10rem] lg:h-[30rem]"
      style={
        {
          "--signal-x": "0px",
          "--signal-y": "0px",
        } as CSSProperties
      }
    >
      <div className="signal-grid absolute inset-0 opacity-45" />
      <div
        className="cultural-signal-field__plane absolute inset-0 transition-transform duration-500 ease-out motion-reduce:transform-none motion-reduce:transition-none"
        style={{
          transform:
            "translate3d(var(--signal-x, 0px), var(--signal-y, 0px), 0)",
        }}
      >
        <svg
          viewBox="0 0 560 440"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
          className="absolute left-0 top-1/2 h-auto w-full -translate-y-1/2 sm:static sm:h-full sm:translate-y-0"
          fill="none"
        >
          <path
            d="M34 326C108 326 117 237 194 237C273 237 272 102 354 102C423 102 449 171 526 171"
            stroke="rgb(var(--color-ivory-muted) / 0.34)"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M64 112C132 112 149 178 218 178C289 178 307 313 384 313C443 313 472 278 526 278"
            stroke="rgb(var(--color-ivory-muted) / 0.2)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="cultural-signal-flow-path"
            d="M34 326C108 326 117 237 194 237C273 237 272 102 354 102C423 102 449 171 526 171"
            pathLength="100"
            stroke="rgb(var(--color-signal))"
            strokeDasharray="13 87"
            strokeLinecap="round"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />

          <g fill="rgb(var(--color-surface-dark))" strokeWidth="1.5">
            <circle
              cx="64"
              cy="112"
              r="7"
              stroke="rgb(var(--color-ivory-muted) / 0.7)"
            />
            <circle
              cx="194"
              cy="237"
              r="8"
              stroke="rgb(var(--color-signal))"
            />
            <circle
              cx="384"
              cy="313"
              r="7"
              stroke="rgb(var(--color-ivory-muted) / 0.7)"
            />
          </g>
          <circle
            className="cultural-signal-pulse-node"
            cx="354"
            cy="102"
            r="5"
            fill="rgb(var(--color-signal))"
          />

          <g
            fill="rgb(var(--color-ivory-muted) / 0.72)"
            fontFamily="var(--font-inter), sans-serif"
            fontSize="13"
            fontWeight="600"
          >
            <text x="48" y="88">
              발견
            </text>
            <text x="174" y="268">
              참여
            </text>
            <text x="366" y="344">
              운영
            </text>
          </g>
        </svg>
      </div>

      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between border-t border-grid pt-2 font-mono text-[0.625rem] tracking-[0.12em] text-ivory/45 sm:bottom-5 sm:left-5 sm:right-5 sm:pt-3">
        <span>CULTURAL SIGNAL FIELD</span>
        <span>01—03</span>
      </div>
    </div>
  );
}
