import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Flame,
  Globe,
  Star,
  Zap,
  Smartphone,
  MousePointer,
  RotateCw,
  Play,
  Pause,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ServiceRadarNode {
  id: string;
  serviceNum: "01" | "02" | "03";
  serviceLabel: string;
  subLabel: string;
  icon: React.ElementType;
  badge: string;
  color: string;
  description: string;
  isPrimary?: boolean;
}

export const RADAR_NODES: ServiceRadarNode[] = [
  {
    id: "brand-identity",
    serviceNum: "01",
    serviceLabel: "Identidade visual",
    subLabel: "Sistema de Marca",
    icon: Sparkles,
    badge: "Branding",
    color: "#FF4001",
    description: "Logotipo, posicionamento, matriz visual e identidade completa",
    isPrimary: true,
  },
  {
    id: "social-media",
    serviceNum: "02",
    serviceLabel: "Design para redes sociais",
    subLabel: "Direção de Arte & Feed",
    icon: Flame,
    badge: "Social Media",
    color: "#FF7A00",
    description: "Direção visual contínua, feed estratégico e campanhas de impacto",
    isPrimary: true,
  },
  {
    id: "web-interfaces",
    serviceNum: "03",
    serviceLabel: "Sites e interfaces",
    subLabel: "Web & UX/UI",
    icon: Globe,
    badge: "Web Design",
    color: "#00E5FF",
    description: "Landing pages e interfaces responsivas focadas em conversão",
    isPrimary: true,
  },
  {
    id: "brand-guidelines",
    serviceNum: "01",
    serviceLabel: "Identidade visual",
    subLabel: "Brand Book Oficial",
    icon: Star,
    badge: "Diretrizes",
    color: "#FF551A",
    description: "Manual completo de marca, tipografia, cores e regras de aplicação",
    isPrimary: false,
  },
  {
    id: "social-creative",
    serviceNum: "02",
    serviceLabel: "Design para redes sociais",
    subLabel: "Carrosséis Narrativos",
    icon: Zap,
    badge: "Criativos",
    color: "#FFA133",
    description: "Carrosséis persuasivos e criativos para gerar autoridade e vendas",
    isPrimary: false,
  },
  {
    id: "web-landing",
    serviceNum: "03",
    serviceLabel: "Sites e interfaces",
    subLabel: "Landing Pages & CRO",
    icon: Smartphone,
    badge: "Mobile-First",
    color: "#38BDF8",
    description: "Páginas ultrarrápidas, mobile-first com foco total em conversão",
    isPrimary: false,
  },
];

const SERVICE_META: Record<
  "01" | "02" | "03",
  { label: string; badge: string; color: string; count: string }
> = {
  "01": {
    label: "Identidade visual",
    badge: "Branding Estratégico",
    color: "#FF4001",
    count: "+250 marcas criadas",
  },
  "02": {
    label: "Design para redes sociais",
    badge: "Social & Conteúdo",
    color: "#FF7A00",
    count: "+10M visualizações",
  },
  "03": {
    label: "Sites e interfaces",
    badge: "Web & UX/UI",
    color: "#00E5FF",
    count: "Taxa de conversão 99+",
  },
};

interface ServiceOrbitalRadarProps {
  activeNum: "01" | "02" | "03";
  onSelectService: (serviceNum: "01" | "02" | "03", nodeId?: string) => void;
  isPaused?: boolean;
}

export const ServiceOrbitalRadar = ({
  activeNum,
  onSelectService,
  isPaused: externalPaused = false,
}: ServiceOrbitalRadarProps) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);

  const activeMeta = SERVICE_META[activeNum] || SERVICE_META["01"];
  const totalNodes = RADAR_NODES.length;
  // Radius of the orbit ring in pixels
  const orbitRadius = 112;

  // Auto-spin orbital loop (slow and majestic)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (!isDraggingRef.current && !hoveredNodeId && autoRotate && !externalPaused) {
        // Rotates ~8.5 degrees per second (full 360 deg in ~42 seconds)
        setRotationAngle((prev) => (prev + delta * 8.5) % 360);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [hoveredNodeId, autoRotate, externalPaused]);

  // Touch and pointer dragging to rotate manually
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startAngleRef.current = rotationAngle;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    setRotationAngle((startAngleRef.current + deltaX * 0.45) % 360);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // When clicking a node, smooth-rotate the wheel so the clicked node faces top
  const handleNodeClick = useCallback(
    (node: ServiceRadarNode, index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectService(node.serviceNum, node.id);

      // Desired angle for clicked node is -90 degrees (top position)
      // Node position is: baseAngleDeg + rotationAngle
      // baseAngleDeg = (360 / totalNodes) * index
      const baseAngleDeg = (360 / totalNodes) * index;
      const targetRotation = (270 - baseAngleDeg + 360) % 360;

      // Animate smoothly towards target angle
      setRotationAngle(targetRotation);
    },
    [onSelectService, totalNodes]
  );

  // Active or hovered node for live HUD status
  const hoveredNode = RADAR_NODES.find((n) => n.id === hoveredNodeId);
  const activePrimaryNode =
    RADAR_NODES.find((n) => n.serviceNum === activeNum && n.isPrimary) || RADAR_NODES[0];
  const displayedNode = hoveredNode || activePrimaryNode;

  return (
    <div
      className="relative w-full aspect-[4/3] min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center bg-[#07080A] rounded-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.65)]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Dynamic Ambient Glow matching the active service color */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${activeMeta.color}1f 0%, transparent 72%)`,
        }}
      />

      {/* Top HUD Status Bar */}
      <div className="absolute top-3 inset-x-3.5 z-30 flex items-center justify-between gap-2 pointer-events-none">
        {/* Active Service Badge */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/75 backdrop-blur-md border border-white/15 px-3 py-1 text-[11px] font-mono text-white/90 shadow-md">
          <span
            className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor]"
            style={{ backgroundColor: activeMeta.color, color: activeMeta.color }}
          />
          <span className="font-semibold">{activeMeta.badge}</span>
          <span className="text-white/40">·</span>
          <span className="text-white/70">Frente {activeNum}</span>
        </div>

        {/* Rotation toggle and hint */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAutoRotate((prev) => !prev);
            }}
            aria-label={autoRotate ? "Pausar rotação" : "Ativar rotação"}
            title={autoRotate ? "Pausar rotação" : "Ativar rotação"}
            className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/20 border border-white/15 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            {autoRotate ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </button>

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono text-white/50 uppercase tracking-wider">
            <MousePointer size={10} />
            <span>Gire ou clique</span>
          </div>
        </div>
      </div>

      {/* Orbital Stage Container */}
      <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
        {/* Outer Solid Orbit Ring with fine tick markings */}
        <div
          aria-hidden="true"
          className="absolute inset-[10px] sm:inset-[16px] rounded-full border border-white/[0.12] pointer-events-none"
        />

        {/* Middle Dashed Orbit Ring */}
        <div
          aria-hidden="true"
          className="absolute inset-[44px] sm:inset-[54px] rounded-full border border-dashed border-white/[0.18] pointer-events-none"
        />

        {/* Inner Subtle Ring */}
        <div
          aria-hidden="true"
          className="absolute inset-[82px] sm:inset-[96px] rounded-full border border-white/[0.08] pointer-events-none"
        />

        {/* Focal Orientation Indicator (North Pointer Mark) */}
        <div
          aria-hidden="true"
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-3 rounded-full pointer-events-none transition-colors duration-300"
          style={{ backgroundColor: activeMeta.color }}
        />

        {/* Center Interactive Studio Core Hub */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // Clicking center core cycles to the next service
            const nextMap: Record<"01" | "02" | "03", "01" | "02" | "03"> = {
              "01": "02",
              "02": "03",
              "03": "01",
            };
            onSelectService(nextMap[activeNum]);
          }}
          title="Clique para alternar para a próxima frente de serviço"
          className="relative z-20 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-white to-[#E5E5E0] text-black shadow-[0_0_35px_rgba(255,255,255,0.4)] hover:shadow-[0_0_45px_rgba(255,64,1,0.6)] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 group"
        >
          {/* Active Service Monogram & Number */}
          <span className="font-mono text-[10px] font-bold text-black/60 leading-none">
            {activeNum}
          </span>
          <div className="my-0.5 text-[#FF4001] transition-transform duration-200 group-hover:scale-110">
            {activeNum === "01" && <Sparkles size={18} className="fill-[#FF4001]" />}
            {activeNum === "02" && <Flame size={18} className="fill-[#FF4001]" />}
            {activeNum === "03" && <Globe size={18} />}
          </div>
          <span className="text-[9px] font-sans font-bold uppercase tracking-tight text-black/80 leading-none">
            Estúdio
          </span>
        </button>

        {/* Orbiting Satellite Nodes (6 interactive service/specialty nodes) */}
        {RADAR_NODES.map((node, index) => {
          const baseAngleDeg = (360 / totalNodes) * index;
          const currentAngleDeg = (baseAngleDeg + rotationAngle) % 360;
          const angleRad = (currentAngleDeg * Math.PI) / 180;

          // Position along the circular orbit path
          const x = Math.cos(angleRad) * orbitRadius;
          const y = Math.sin(angleRad) * orbitRadius;

          const isActiveService = activeNum === node.serviceNum;
          const isHovered = hoveredNodeId === node.id;
          const NodeIcon = node.icon;

          return (
            <div
              key={node.id}
              style={{
                transform: `translate3d(${x}px, ${y}px, 0px)`,
              }}
              className="absolute z-20 transition-transform duration-75 ease-linear pointer-events-auto"
            >
              <button
                type="button"
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={(e) => handleNodeClick(node, index, e)}
                aria-label={`Abrir frente: ${node.serviceLabel} (${node.subLabel})`}
                className={`group relative rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  node.isPrimary
                    ? "w-11 h-11 sm:w-12 sm:h-12 -ml-5.5 -mt-5.5 sm:-ml-6 sm:-mt-6"
                    : "w-9 h-9 sm:w-10 sm:h-10 -ml-4.5 -mt-4.5 sm:-ml-5 sm:-mt-5"
                } ${
                  isActiveService
                    ? "bg-[#16181D] text-white scale-110 shadow-[0_0_24px_rgba(255,64,1,0.55)] z-30"
                    : "bg-[#0E1014]/90 border-white/20 text-white/75 hover:text-white hover:bg-white/10 hover:scale-115"
                }`}
                style={{
                  borderColor: isActiveService ? node.color : undefined,
                  boxShadow: isActiveService
                    ? `0 0 24px ${node.color}55, 0 0 6px ${node.color}`
                    : undefined,
                }}
              >
                {/* Active pulsating beacon ring */}
                {isActiveService && (
                  <span
                    aria-hidden="true"
                    className="absolute -inset-1 rounded-full animate-ping opacity-40 pointer-events-none"
                    style={{ backgroundColor: node.color }}
                  />
                )}

                {/* Counter-rotate icon so it stays upright */}
                <div
                  style={{
                    transform: `rotate(${-currentAngleDeg}deg)`,
                  }}
                  className="transition-transform duration-75 ease-linear flex items-center justify-center"
                >
                  <NodeIcon
                    size={node.isPrimary ? 18 : 15}
                    style={{ color: isActiveService ? node.color : "currentColor" }}
                    strokeWidth={isActiveService ? 2.5 : 2}
                  />
                </div>

                {/* Floating Micro-Badge for Active or Hovered State */}
                {(isHovered || (isActiveService && node.isPrimary)) && (
                  <div
                    style={{
                      transform: `rotate(${-currentAngleDeg}deg)`,
                    }}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[9px] font-mono font-bold whitespace-nowrap text-white pointer-events-none shadow-md z-40"
                  >
                    {node.subLabel}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Interactive Detail Bar showing current node info & click hint */}
      <div className="absolute bottom-2.5 inset-x-3.5 z-30">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayedNode.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="rounded-xl bg-black/85 backdrop-blur-md border border-white/15 px-3.5 py-2.5 flex items-center justify-between gap-3 text-left shadow-xl"
          >
            <div className="min-w-0 flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: displayedNode.color, color: displayedNode.color }}
              />
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-white">
                    {displayedNode.serviceLabel}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/80">
                    {displayedNode.subLabel}
                  </span>
                </div>
                <p className="text-[11px] text-white/65 truncate mt-0.5">
                  {displayedNode.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectService(displayedNode.serviceNum, displayedNode.id);
              }}
              className="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-white transition-all cursor-pointer hover:scale-105"
              style={{
                backgroundColor: displayedNode.color,
                boxShadow: `0 0 12px ${displayedNode.color}66`,
              }}
            >
              Abrir Frente →
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
