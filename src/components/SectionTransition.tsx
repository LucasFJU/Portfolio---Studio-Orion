import "./home-surfaces.css";

export interface SectionTransitionProps {
  sourceColor: string;
  destinationColor: string;
}

/** A fixed, straight boundary between adjacent section backgrounds. */
export default function SectionTransition({
  sourceColor,
  destinationColor,
}: SectionTransitionProps) {
  return (
    <div
      aria-hidden="true"
      className="orion-section-transition"
      data-motion="static"
      data-source={sourceColor}
      data-destination={destinationColor}
      style={{ backgroundColor: destinationColor }}
    />
  );
}
