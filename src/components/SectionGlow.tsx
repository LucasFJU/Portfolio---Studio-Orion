import "./section-glow.css";

/** An overlay on the next surface; it contributes no height to the document. */
export default function SectionGlow({ continuousLine = false }: { continuousLine?: boolean }) {
  return <div className="orion-section-glow" data-line={continuousLine ? "continuous" : undefined} aria-hidden="true"><span /></div>;
}
