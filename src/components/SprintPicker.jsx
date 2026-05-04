import { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, Check } from 'lucide-react';
import { C, RADIUS, SHADOW } from '../styles/theme';

// ============================================
// SprintPicker — sélecteur de sprint (dropdown)
// sprints: [{ value, label, count, isCurrent }]
// ============================================
export function SprintPicker({ sprints, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const current = sprints.find(s => s.value === selected);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "8px 14px", borderRadius: RADIUS.md,
        background: open ? C.orangeBg : C.paper,
        border: `1px solid ${open ? C.orange : C.line}`,
        cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.ink,
        fontFamily: "inherit", transition: "all 0.15s",
        minWidth: 240,
      }}>
        <Sparkles size={14} color={C.orange} strokeWidth={2.2} />
        <span style={{ letterSpacing: "0.02em" }}>
          {current?.label || "—"}
        </span>
        {current?.isCurrent && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
            padding: "2px 6px", borderRadius: RADIUS.sm,
            background: C.orange, color: "#fff",
          }}>ACTUEL</span>
        )}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: C.inkDim, fontWeight: 600 }}>
          {current?.count ?? 0} tickets
        </span>
        <ChevronDown size={14} color={C.inkDim} style={{
          transform: open ? "rotate(180deg)" : "rotate(0)",
          transition: "transform 0.15s",
        }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50,
          background: C.paper, border: `1px solid ${C.line}`, borderRadius: RADIUS.lg,
          boxShadow: SHADOW.lg,
          padding: 6, minWidth: 280, maxHeight: 360, overflowY: "auto",
        }}>
          {sprints.length === 0 && (
            <div style={{ padding: 16, fontSize: 12, color: C.inkDim, textAlign: "center" }}>
              Aucun sprint disponible
            </div>
          )}
          {sprints.map(s => {
            const isSelected = s.value === selected;
            return (
              <button key={s.value} onClick={() => { onChange(s.value); setOpen(false); }}
                style={{
                  width: "100%",
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: RADIUS.md,
                  background: isSelected ? C.orangeBg : "transparent",
                  border: "none", cursor: "pointer",
                  fontFamily: "inherit", textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = C.bgSoft; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: RADIUS.sm,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: isSelected ? C.orange : "transparent",
                  border: isSelected ? "none" : `1px solid ${C.line}`,
                }}>
                  {isSelected && <Check size={11} color="#fff" strokeWidth={3} />}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: C.ink,
                  letterSpacing: "0.02em",
                }}>{s.label}</span>
                {s.isCurrent && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                    padding: "2px 6px", borderRadius: RADIUS.sm,
                    background: C.orange, color: "#fff",
                  }}>ACTUEL</span>
                )}
                <span style={{ flex: 1 }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, color: isSelected ? C.orange : C.inkSoft,
                  padding: "2px 8px", borderRadius: RADIUS.sm,
                  background: isSelected ? C.paper : C.bgSoft,
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 28, textAlign: "center",
                }}>{s.count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
