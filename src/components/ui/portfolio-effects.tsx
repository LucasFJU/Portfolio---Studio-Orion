"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";

function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;

    const update = () => {
      frame = null;
      if (media.matches) {
        setProgress(1);
        return;
      }

      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      const start = viewport * 0.9;
      const end = viewport * 0.15;
      const value = (start - rect.top) / (start - end);

      setProgress(Math.min(1, Math.max(0, value)));
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, []);

  return { ref, progress };
}

export function InteractiveButton({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  const className = `pf-button${secondary ? " pf-button--secondary" : ""}`;
  const isInternalRoute = href.startsWith("/") && !href.startsWith("//");

  if (isInternalRoute) {
    return (
      <Link to={href} className={className}>
        <span>{children}</span>
        <span className="pf-button__arrow" aria-hidden="true">
          ↗
        </span>
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      <span>{children}</span>
      <span className="pf-button__arrow" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}

export type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
};

export function ServicesPanel({ services }: { services: Service[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const { ref, progress } = useScrollProgress();

  if (!services.length) return null;

  const selectedIndex = Math.min(active, services.length - 1);
  const selected = services[selectedIndex];
  const isInternalHref = selected.href.startsWith("/") && !selected.href.startsWith("//");

  return (
    <div ref={ref} className="pf-services">
      <div
        aria-hidden="true"
        className="pf-services__surface"
        style={{ transform: `scaleX(${0.94 + progress * 0.06})` }}
      />
      <div className="pf-services__content">
        <h2>Como posso ajudar.</h2>
        <div className="pf-services__grid">
          <div
            className="pf-services__tabs"
            role="tablist"
            aria-label="Serviços"
            aria-orientation="vertical"
            onKeyDown={(event) => {
              let next = selectedIndex;

              if (event.key === "ArrowDown") {
                next = (selectedIndex + 1) % services.length;
              } else if (event.key === "ArrowUp") {
                next = (selectedIndex - 1 + services.length) % services.length;
              } else if (event.key === "Home") {
                next = 0;
              } else if (event.key === "End") {
                next = services.length - 1;
              } else {
                return;
              }

              event.preventDefault();
              setActive(next);
              document.getElementById(`${baseId}-tab-${next}`)?.focus();
            }}
          >
            {services.map((service, index) => (
              <button
                key={service.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${index}`}
                aria-selected={selectedIndex === index}
                aria-controls={`${baseId}-panel`}
                tabIndex={selectedIndex === index ? 0 : -1}
                className="pf-service"
                onClick={() => setActive(index)}
              >
                <span className="pf-service__number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <strong>{service.title}</strong>
                  <span className="pf-service__description">
                    {service.description}
                  </span>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>

          <div
            id={`${baseId}-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${selectedIndex}`}
            tabIndex={0}
            className="pf-services__media"
          >
            {selected.image ? (
              <img
                key={selected.image}
                className="pf-services__image"
                src={selected.image}
                alt={selected.imageAlt}
                loading="lazy"
                width={900}
                height={1000}
              />
            ) : (
              <div className="pf-services__fallback">
                <span className="pf-service__number">
                  {String(selectedIndex + 1).padStart(2, "0")}
                </span>
                <strong>{selected.title}</strong>
                <p>{selected.description}</p>
              </div>
            )}
            {isInternalHref ? (
              <Link to={selected.href} className="pf-services__link">
                Conhecer este serviço <span aria-hidden="true">↗</span>
              </Link>
            ) : (
              <a href={selected.href} className="pf-services__link">
                Conhecer este serviço <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={`pf-spotlight ${className}`}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const element = ref.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();

        element.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
        element.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      }}
    >
      <div aria-hidden="true" className="pf-spotlight__glow" />
      <div className="pf-spotlight__content">{children}</div>
    </div>
  );
}

export function ScrollMediaExpansion({
  src,
  alt,
  loading = "eager",
}: {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
}) {
  const { ref, progress } = useScrollProgress();

  return (
    <div ref={ref} className="pf-expansion">
      <div
        className="pf-expansion__frame"
        style={{ transform: `scale(${0.92 + progress * 0.08})` }}
      >
        <img
          src={src}
          alt={alt}
          width={1600}
          height={1000}
          loading={loading}
          decoding="async"
        />
      </div>
    </div>
  );
}

export function ScrollHighlight({ children }: { children: ReactNode }) {
  const { ref, progress } = useScrollProgress();

  return (
    <div ref={ref} className="pf-highlight">
      <span
        style={{ "--highlight-progress": `${progress * 100}%` } as CSSProperties}
      >
        {children}
      </span>
    </div>
  );
}

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role?: string;
};

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);

  if (!items.length) return null;

  const current = Math.min(index, items.length - 1);
  const item = items[current];

  return (
    <section className="pf-testimonials" aria-label="Depoimentos">
      <h2>O que dizem sobre o trabalho.</h2>
      <div aria-live="polite" aria-atomic="true">
        <figure key={item.id} className="pf-testimonials__item">
          <blockquote>{item.quote}</blockquote>
          <figcaption>
            <strong>{item.name}</strong>
            {item.role && <span>{item.role}</span>}
          </figcaption>
        </figure>
      </div>

      {items.length > 1 && (
        <div className="pf-testimonials__controls">
          <button
            type="button"
            aria-label="Depoimento anterior"
            onClick={() =>
              setIndex((current + items.length - 1) % items.length)
            }
          >
            ←
          </button>
          <span>
            {current + 1} / {items.length}
          </span>
          <button
            type="button"
            aria-label="Próximo depoimento"
            onClick={() => setIndex((current + 1) % items.length)}
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}

export function Ripple({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pf-ripple ${className}`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className="pf-ripple__circle"
          style={{
            width: `${220 + index * 115}px`,
            height: `${220 + index * 115}px`,
            animationDelay: `${index * 0.3}s`,
            opacity: 0.24 - index * 0.035,
          }}
        />
      ))}
    </div>
  );
}
