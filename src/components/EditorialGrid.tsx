import { useId } from "react";
import "./editorial-grid.css";

/** Shared, noninteractive guides; difference blending makes the same ink work on light and dark surfaces. */
export default function EditorialGrid() {
  const id = useId().replace(/:/g, "");
  return (
    <div className="orion-editorial-grid" aria-hidden="true" data-editorial-grid>
      {[1, 2, 3].map((columns) => {
        const guides = Array.from({ length: columns + 1 }, (_, index) => `${index * 100 / columns}%`);
        const patternId = `orion-grid-${id}-${columns}`;
        return (
          <svg key={columns} className={`orion-grid-${columns}`} width="100%" height="100%" focusable="false" fill="none">
            <defs>
              <pattern id={patternId} width="100%" height={columns === 1 ? 240 : 320} patternUnits="userSpaceOnUse">
                <line x1="0" x2="100%" y1="4" y2="4" stroke="white" strokeWidth="1" strokeDasharray="2 5" />
                {guides.map((x) => (
                  <svg key={x} x={x} y="0" width="8" height="8" overflow="visible">
                    <path d="M-4 4H4 M0 0V8" stroke="white" strokeWidth="1" />
                  </svg>
                ))}
              </pattern>
            </defs>
            {guides.map((x) => <line key={x} x1={x} x2={x} y1="0" y2="100%" stroke="white" strokeWidth="1" strokeDasharray="2 5" />)}
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
          </svg>
        );
      })}
    </div>
  );
}
