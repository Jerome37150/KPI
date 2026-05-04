import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { C, RADIUS, SHADOW } from '../styles/theme';
import { MOIS_FR_SHORT, NOW, PROJECT_START, monthLabel } from '../utils/dates';

// ============================================
// MonthPicker — sélecteur de mois compact
// ============================================
export function MonthPicker({ selectedDate, onChange }) {
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedDate.getFullYear());
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const isCurrentMonth = selectedDate.getMonth() === NOW.getMonth() && selectedDate.getFullYear() === NOW.getFullYear();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "8px 14px", borderRadius: RADIUS.md,
        background: open ? C.orangeBg : C.paper,
        border: `1px solid ${open ? C.orange : C.line}`,
        cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.ink,
        fontFamily: "inherit", transition: "all 0.15s",
      }}>
        <Calendar size={14} color={C.orange} strokeWidth={2.2} />
        <span>{monthLabel(selectedDate)}</span>
        {isCurrentMonth && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
            padding: "2px 6px", borderRadius: RADIUS.sm,
            background: C.orange, color: "#fff",
          }}>EN COURS</span>
        )}
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
          padding: 16, minWidth: 280,
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.line}`,
          }}>
            <button onClick={() => setPickerYear(pickerYear - 1)} style={{
              width: 28, height: 28, borderRadius: RADIUS.md, border: `1px solid ${C.line}`,
              background: C.paper, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}><ChevronLeft size={14} color={C.inkSoft} /></button>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.ink, letterSpacing: "0.02em" }}>
              {pickerYear}
            </span>
            <button onClick={() => setPickerYear(pickerYear + 1)} style={{
              width: 28, height: 28, borderRadius: RADIUS.md, border: `1px solid ${C.line}`,
              background: C.paper, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}><ChevronRight size={14} color={C.inkSoft} /></button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {MOIS_FR_SHORT.map((mois, idx) => {
              const monthDate = new Date(pickerYear, idx, 1);
              const isSelected = selectedDate.getFullYear() === pickerYear && selectedDate.getMonth() === idx;
              const isCurrent  = NOW.getFullYear() === pickerYear && NOW.getMonth() === idx;
              const isFuture   = monthDate > NOW;
              const isBefore   = monthDate < PROJECT_START;
              const isDisabled = isFuture || isBefore;
              return (
                <button key={idx} onClick={() => {
                  if (!isDisabled) { onChange(monthDate); setOpen(false); }
                }}
                  disabled={isDisabled}
                  style={{
                    padding: "10px 8px", borderRadius: RADIUS.md,
                    fontSize: 12, fontWeight: isCurrent || isSelected ? 700 : 500,
                    background: isSelected ? C.orange : isCurrent ? C.orangeBg : "transparent",
                    color: isSelected ? "#fff" : isCurrent ? C.orange : isDisabled ? C.inkMute : C.inkSoft,
                    border: `1px solid ${isSelected ? C.orange : "transparent"}`,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                    opacity: isDisabled ? 0.4 : 1,
                  }}
                  onMouseEnter={e => { if (!isDisabled && !isSelected) e.currentTarget.style.background = C.bgSoft; }}
                  onMouseLeave={e => { if (!isDisabled && !isSelected) e.currentTarget.style.background = isCurrent ? C.orangeBg : "transparent"; }}
                >{mois}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
