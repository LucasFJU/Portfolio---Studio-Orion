import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, type LucideIcon } from "lucide-react";
import "./capabilities-section.css";

interface Capability {
  num: string;
  icon: LucideIcon;
  category: string;
  summary: string;
  skills: string[];
}

export default function CapabilitiesSection({ items }: { items: Capability[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const id = useId();
  const reducedMotion = useReducedMotion();

  return (
    <section className="container-editorial orion-capabilities" aria-labelledby={`${id}-title`}>
      <div className="orion-capabilities-heading">
        <div>
          <div className="section-label mb-3">
            <span className="label-num">04.</span> Ferramentas &amp; capacidades
          </div>
          <h2 id={`${id}-title`} data-orion-reveal>Do conceito à entrega.</h2>
        </div>
        <p>Estratégia, repertório e domínio técnico conectados em cada etapa do projeto.</p>
      </div>

      <div className="orion-capabilities-list">
        {items.map((item, index) => {
          const expanded = activeIndex === index;
          const Icon = item.icon;
          const triggerId = `${id}-trigger-${index}`;
          const panelId = `${id}-panel-${index}`;

          return (
            <article key={item.num} className="orion-capability" data-expanded={expanded}>
              <h3>
                <button
                  type="button"
                  id={triggerId}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setActiveIndex(expanded ? null : index)}
                  className="orion-capability-trigger"
                >
                  <span className="orion-capability-number" aria-hidden="true">{item.num}</span>
                  <span className="orion-capability-name">{item.category}</span>
                  <span className="orion-capability-toggle" aria-hidden="true"><Plus size={20} strokeWidth={1.5} /></span>
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!expanded}>
                {expanded && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.24 }}
                    className="orion-capability-detail"
                  >
                    <div className="orion-capability-summary">
                      <Icon size={25} strokeWidth={1.4} aria-hidden="true" />
                      <p>{item.summary}</p>
                    </div>
                    <ul className="orion-capability-skills">
                      {item.skills.map((skill) => <li key={skill}>{skill}</li>)}
                    </ul>
                  </motion.div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
