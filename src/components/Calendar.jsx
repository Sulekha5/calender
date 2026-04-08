import React, { useState, useEffect, useRef } from "react";

const MONTH_IMAGES = [
  "/images/jan.jpg",
  "/images/feb.jpg",
  "/images/march.jpg",
  "/images/april.jpg",
  "/images/may.jpg",
  "/images/june.jpg",
  "/images/july.jpg",
  "/images/aug.jpg",
  "/images/sep.jpg",
  "/images/oct.jpg",
  "/images/nov.jpg",
  "/images/dec.jpg",
];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
function isInRange(date, start, end) {
  if (!start || !end || !date) return false;
  return date > start && date < end;
}
function isToday(date) {
  return isSameDay(date, new Date());
}

export default function Calendar() {
  const [holidays, setHolidays] = useState({});
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cal_notes") || "{}"); }
    catch { return {}; }
  });
  const [noteInput, setNoteInput] = useState("");
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState("next");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const noteKey = `${year}-${month}`;

  useEffect(() => {
    setNoteInput(notes[noteKey] || "");
  }, [month, year]);

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const res = await fetch(
          `https://calendarific.com/api/v2/holidays?api_key=6WwHiD1k4aDUl46Xwg3LZLCHKi7QllNi&country=IN&year=${year}`
        );
        const data = await res.json();
        const formatted = {};
        data.response.holidays.forEach(h => {
          const d = new Date(h.date.iso);
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          formatted[key] = h.name;
        });
        setHolidays(formatted);
      } catch (err) {
        console.error("Holiday fetch error:", err);
      }
    }
    fetchHolidays();
  }, [year]);

  function handleNoteChange(val) {
    setNoteInput(val);
    const updated = { ...notes, [noteKey]: val };
    setNotes(updated);
    localStorage.setItem("cal_notes", JSON.stringify(updated));
  }

  function navigate(dir) {
    if (flipping) return;
    setFlipDir(dir);
    setFlipping(true);
    setImgLoaded(false);
    setTimeout(() => {
      if (dir === "next") {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
      } else {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
      }
      setStartDate(null);
      setEndDate(null);
      setFlipping(false);
    }, 520);
  }

  function handleDateClick(date) {
    if (!date) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(date); setEndDate(null);
    } else if (date > startDate) {
      setEndDate(date);
    } else {
      setStartDate(date); setEndDate(null);
    }
  }

  const totalDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);
  const prevDays = Array.from({ length: firstDay }, (_, i) =>
    new Date(year, month - 1, prevMonthDays - firstDay + i + 1)
  );
  const currentDays = Array.from({ length: totalDays }, (_, i) =>
    new Date(year, month, i + 1)
  );
  const nextDaysCount = (7 - ((prevDays.length + currentDays.length) % 7)) % 7;
  const nextDays = Array.from({ length: nextDaysCount }, (_, i) =>
    new Date(year, month + 1, i + 1)
  );
  const cells = [...prevDays, ...currentDays, ...nextDays];
  while (cells.length % 7 !== 0) cells.push(null);

  const bgImg = MONTH_IMAGES[month];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Lato:wght@300;400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cal-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          font-family: 'Lato', sans-serif;
          position: relative;
          overflow: hidden;
          background: #c8b89a;
        }

        /* Warm linen wall texture */
        .cal-wall {
          position: fixed;
          inset: 0;
          z-index: 0;
          background:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 3px,
              rgba(0,0,0,0.015) 3px,
              rgba(0,0,0,0.015) 6px
            ),
            linear-gradient(160deg, #d4c4a8 0%, #c2b090 40%, #b8a07a 100%);
        }

        /* Subtle photo background, very muted */
        .cal-bg-photo {
          position: fixed;
          inset: 0;
          background-image: var(--bg-img);
          background-size: cover;
          background-position: center;
          opacity: 0.08;
          z-index: 0;
          transition: opacity 0.8s ease;
        }

        /* ---- FLIP ANIMATION ---- */
        @keyframes flipNext {
          0%   { transform: perspective(1600px) rotateX(0deg) translateY(0); opacity: 1; }
          40%  { transform: perspective(1600px) rotateX(-85deg) translateY(-20px); opacity: 0.2; }
          60%  { transform: perspective(1600px) rotateX(85deg) translateY(-20px); opacity: 0.2; }
          100% { transform: perspective(1600px) rotateX(0deg) translateY(0); opacity: 1; }
        }
        @keyframes flipPrev {
          0%   { transform: perspective(1600px) rotateX(0deg) translateY(0); opacity: 1; }
          40%  { transform: perspective(1600px) rotateX(85deg) translateY(-20px); opacity: 0.2; }
          60%  { transform: perspective(1600px) rotateX(-85deg) translateY(-20px); opacity: 0.2; }
          100% { transform: perspective(1600px) rotateX(0deg) translateY(0); opacity: 1; }
        }

        .cal-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1060px;
          display: flex;
          gap: 24px;
          align-items: flex-start;
          justify-content: center;
          transform-origin: center top;
        }
        .cal-wrapper.flipping-next { animation: flipNext 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .cal-wrapper.flipping-prev { animation: flipPrev 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

        /* ---- WALL CALENDAR CARD ---- */
        .cal-card {
          flex: 1;
          min-width: 0;
          background: #faf6f0;
          border-radius: 4px;
          overflow: hidden;
          box-shadow:
            0 1px 0 #b8a882,
            0 4px 0 #c4b48e,
            0 6px 0 #b0a07a,
            0 10px 30px rgba(80,60,20,0.35),
            0 20px 60px rgba(60,40,10,0.2),
            inset 0 0 0 1px rgba(160,130,80,0.3);
          position: relative;
        }

        /* Binding holes at top */
        .cal-card::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 0;
          right: 0;
          height: 18px;
          background: #2c2418;
          z-index: 10;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }

        /* Spiral holes */
        .cal-holes {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 18px;
          z-index: 11;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          pointer-events: none;
        }
        .cal-hole {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #c8b89a;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(255,255,255,0.1);
        }

        /* ---- HERO IMAGE ---- */
        .cal-hero {
          position: relative;
          height: 240px;
          overflow: hidden;
          margin-top: 18px;
        }
        .cal-hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: saturate(0.85) contrast(0.95);
          transition: transform 0.7s ease;
        }
        .cal-hero:hover img { transform: scale(1.02); }

        /* Torn paper edge effect */
        .cal-hero::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 20px;
          background: #faf6f0;
          clip-path: polygon(
            0% 100%, 1% 20%, 2% 80%, 3% 30%, 4% 70%, 5% 15%,
            6% 60%, 7% 25%, 8% 75%, 9% 40%, 10% 85%, 11% 20%,
            12% 65%, 13% 30%, 14% 70%, 15% 10%, 16% 55%, 17% 25%,
            18% 80%, 19% 35%, 20% 75%, 21% 20%, 22% 60%, 23% 30%,
            24% 70%, 25% 15%, 26% 55%, 27% 25%, 28% 70%, 29% 35%,
            30% 80%, 31% 20%, 32% 65%, 33% 30%, 34% 70%, 35% 15%,
            36% 60%, 37% 25%, 38% 75%, 39% 35%, 40% 80%, 41% 20%,
            42% 65%, 43% 30%, 44% 70%, 45% 15%, 46% 60%, 47% 25%,
            48% 75%, 49% 35%, 50% 80%, 51% 20%, 52% 65%, 53% 30%,
            54% 70%, 55% 15%, 56% 60%, 57% 25%, 58% 75%, 59% 35%,
            60% 80%, 61% 20%, 62% 65%, 63% 30%, 64% 70%, 65% 15%,
            66% 60%, 67% 25%, 68% 75%, 69% 35%, 70% 80%, 71% 20%,
            72% 65%, 73% 30%, 74% 70%, 75% 15%, 76% 60%, 77% 25%,
            78% 75%, 79% 35%, 80% 80%, 81% 20%, 82% 65%, 83% 30%,
            84% 70%, 85% 15%, 86% 60%, 87% 25%, 88% 75%, 89% 35%,
            90% 80%, 91% 20%, 92% 65%, 93% 30%, 94% 70%, 95% 15%,
            96% 60%, 97% 25%, 98% 75%, 99% 35%, 100% 80%, 100% 100%
          );
        }

        .cal-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%);
          display: flex;
          align-items: flex-end;
          padding: 20px 28px 30px;
          justify-content: space-between;
        }

        .cal-month-label {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          font-weight: 900;
          color: #fff;
          line-height: 1;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 16px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.8);
        }
        .cal-year-label {
          font-family: 'Lato', sans-serif;
          font-size: 0.8rem;
          font-weight: 300;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        /* ---- NAV BUTTONS ---- */
        .cal-nav-btns { display: flex; gap: 10px; align-items: flex-end; }
        .cal-nav-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.5);
          background: rgba(250,246,240,0.15);
          backdrop-filter: blur(6px);
          color: white;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          font-family: 'Lato', sans-serif;
        }
        .cal-nav-btn:hover {
          background: rgba(250,246,240,0.3);
          border-color: rgba(255,255,255,0.85);
          transform: scale(1.1);
        }
        .cal-nav-btn:active { transform: scale(0.95); }

        /* ---- MONTH QUICK STRIP ---- */
        .year-strip {
          display: flex;
          gap: 2px;
          padding: 10px 20px 0;
          overflow-x: auto;
          scrollbar-width: none;
          border-bottom: 1px solid #e8dfc8;
        }
        .year-strip::-webkit-scrollbar { display: none; }
        .month-dot {
          flex-shrink: 0;
          font-size: 0.68rem;
          font-family: 'Lato', sans-serif;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 10px;
          border-radius: 3px;
          cursor: pointer;
          color: #9a8a6a;
          transition: all 0.15s ease;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
        }
        .month-dot:hover { color: #5a3e1b; }
        .month-dot.active {
          color: #c0392b;
          border-bottom-color: #c0392b;
          background: transparent;
        }

        /* ---- CALENDAR BODY ---- */
        .cal-body {
          padding: 16px 24px 24px;
          background: #faf6f0;
          position: relative;
        }

        /* Faint ruled lines like paper */
        .cal-body::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 47px,
            rgba(180,160,120,0.12) 47px,
            rgba(180,160,120,0.12) 48px
          );
          pointer-events: none;
        }

        .cal-day-headers {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 6px;
        }
        .cal-day-header {
          text-align: center;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #9a8a6a;
          padding: 4px 0 8px;
          border-bottom: 1.5px solid #ddd4be;
        }
        .cal-day-header.weekend { color: #c0392b; }

        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-top: 8px;
        }

        .cal-cell {
          aspect-ratio: 1;
          border-radius: 3px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 0.88rem;
          font-weight: 400;
          font-family: 'Lato', sans-serif;
          cursor: pointer;
          position: relative;
          transition: all 0.12s ease;
          color: #3a2e1e;
          user-select: none;
        }
        .cal-cell.empty { cursor: default; }
        .cal-cell.weekend-day { color: #c0392b; }
        .cal-cell.other-month { color: #c8b89a; }
        .cal-cell.other-month.weekend-day { color: #e8a090; }

        .cal-cell:not(.empty):not(.other-month):hover {
          background: rgba(180,120,40,0.12);
        }

        /* Today circle — red like a calendar marker */
        .cal-cell.is-today {
          background: #c0392b !important;
          color: #fff !important;
          font-weight: 700;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(192,57,43,0.4);
        }
        .cal-cell.is-today.weekend-day { color: #fff !important; }

        /* Holiday dot */
        .cal-cell.holiday::after {
          content: '';
          position: absolute;
          bottom: 4px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #c0392b;
        }
        .cal-cell.is-today.holiday::after { background: rgba(255,255,255,0.8); }

        /* Range selection */
        .cal-cell.is-start, .cal-cell.is-end {
          background: #8b5e1a !important;
          color: #faf6f0 !important;
          font-weight: 700;
          border-radius: 3px;
          box-shadow: 0 2px 8px rgba(139,94,26,0.35);
        }
        .cal-cell.in-range {
          background: rgba(139,94,26,0.12) !important;
          color: #5a3e1b;
          border-radius: 0;
        }
        .cal-cell.in-range:first-child, .cal-cell.range-row-start { border-radius: 3px 0 0 3px; }
        .cal-cell.in-range:last-child, .cal-cell.range-row-end { border-radius: 0 3px 3px 0; }

        /* ---- RANGE INFO ---- */
        .cal-range-info {
          margin-top: 14px;
          padding: 10px 14px;
          background: rgba(139,94,26,0.08);
          border: 1px solid rgba(139,94,26,0.2);
          border-radius: 3px;
          font-size: 0.78rem;
          color: #6a4e1e;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          font-family: 'Lato', sans-serif;
        }
        .range-tag {
          background: #8b5e1a;
          color: #faf6f0;
          padding: 2px 8px;
          border-radius: 2px;
          font-weight: 700;
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ---- LEGEND ---- */
        .cal-legend {
          margin-top: 12px;
          display: flex;
          gap: 18px;
          font-size: 0.7rem;
          color: #9a8a6a;
          align-items: center;
          flex-wrap: wrap;
          font-family: 'Lato', sans-serif;
          letter-spacing: 0.03em;
        }
        .cal-legend .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 5px;
          vertical-align: middle;
        }
        .holiday-dot { background: #c0392b; }
        .today-dot   { background: #c0392b; }
        .range-dot   { background: #8b5e1a; }

        /* ---- NOTES PANEL ---- */
        .notes-panel {
          width: 260px;
          flex-shrink: 0;
          background: #fdf8ee;
          border-radius: 4px;
          padding: 0;
          box-shadow:
            0 1px 0 #b8a882,
            0 4px 0 #c4b48e,
            0 6px 0 #b0a07a,
            0 10px 30px rgba(80,60,20,0.3),
            inset 0 0 0 1px rgba(160,130,80,0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        /* Binding at top matching cal-card */
        .notes-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 18px;
          background: #2c2418;
          z-index: 2;
        }
        .notes-holes {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 18px;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          pointer-events: none;
        }

        .notes-inner {
          padding: 28px 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
          position: relative;
        }

        /* Paper lines in notes */
        .notes-inner::before {
          content: '';
          position: absolute;
          inset: 28px 0 0;
          background: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 27px,
            rgba(180,160,120,0.2) 27px,
            rgba(180,160,120,0.2) 28px
          );
          pointer-events: none;
        }

        /* Red margin line */
        .notes-inner::after {
          content: '';
          position: absolute;
          left: 42px;
          top: 28px;
          bottom: 0;
          width: 1px;
          background: rgba(192,57,43,0.25);
          pointer-events: none;
        }

        .notes-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #3a2e1e;
          position: relative;
          z-index: 1;
        }
        .notes-subtitle {
          font-size: 0.68rem;
          color: #9a8a6a;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: 'Lato', sans-serif;
          margin-top: 2px;
        }
        .notes-textarea {
          flex: 1;
          min-height: 200px;
          background: transparent;
          border: none;
          padding: 4px 4px 4px 18px;
          color: #3a2e1e;
          font-family: 'Lato', sans-serif;
          font-size: 0.85rem;
          line-height: 28px;
          resize: none;
          outline: none;
          position: relative;
          z-index: 1;
        }
        .notes-textarea::placeholder { color: #c0b090; font-style: italic; }

        .notes-char-count {
          font-size: 0.65rem;
          color: #b0a07a;
          text-align: right;
          font-family: 'Lato', sans-serif;
          position: relative;
          z-index: 1;
        }

        .notes-quick-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          position: relative;
          z-index: 1;
        }
        .quick-tag {
          padding: 3px 10px;
          border-radius: 2px;
          border: 1px solid #d4c4a0;
          background: rgba(139,94,26,0.06);
          color: #7a5e2a;
          font-size: 0.7rem;
          font-family: 'Lato', sans-serif;
          cursor: pointer;
          transition: all 0.12s ease;
        }
        .quick-tag:hover {
          background: rgba(139,94,26,0.15);
          border-color: #8b5e1a;
          color: #5a3e1b;
        }

        /* ---- MOBILE ---- */
        .notes-toggle-btn {
          display: none;
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 100;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #8b5e1a;
          border: none;
          color: #faf6f0;
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(139,94,26,0.5);
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }
        .notes-toggle-btn:active { transform: scale(0.94); }

        .notes-drawer {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 99;
          background: #fdf8ee;
          border-top: 2px solid #2c2418;
          border-radius: 20px 20px 0 0;
          padding: 20px 20px 32px;
          transform: translateY(100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .notes-drawer.open { transform: translateY(0); }
        .drawer-handle {
          width: 40px; height: 4px;
          border-radius: 2px;
          background: #c0b090;
          margin: 0 auto 16px;
        }

        @media (max-width: 768px) {
          .cal-root { padding: 16px; align-items: flex-start; padding-top: 24px; }
          .cal-wrapper { flex-direction: column; gap: 0; width: 100%; }
          .cal-card { width: 100%; }
          .notes-panel { display: none; }
          .notes-toggle-btn { display: flex; }
          .notes-drawer { display: block; }
          .cal-hero { height: 180px; }
          .cal-month-label { font-size: 2rem; }
          .cal-body { padding: 12px 14px 18px; }
          .cal-cell { font-size: 0.8rem; }
        }

        @keyframes paperDrop {
          from { opacity: 0; transform: translateY(-24px) rotateX(8deg); }
          to   { opacity: 1; transform: translateY(0) rotateX(0deg); }
        }
        .cal-card { animation: paperDrop 0.5s ease both; }
        .notes-panel { animation: paperDrop 0.5s 0.08s ease both; }
      `}</style>

      <div className="cal-wall" />
      <div className="cal-bg-photo" style={{ "--bg-img": `url(${bgImg})` }} />

      <div className="cal-root">
        <div className={`cal-wrapper ${flipping ? `flipping-${flipDir}` : ""}`}>

          {/* ===== MAIN CALENDAR CARD ===== */}
          <div className="cal-card">
            {/* Binding + holes */}
            <div className="cal-holes">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="cal-hole" />
              ))}
            </div>

            {/* Hero Photo */}
            <div className="cal-hero">
              <img
                key={`${year}-${month}`}
                src={bgImg}
                alt={MONTH_NAMES[month]}
                onLoad={() => setImgLoaded(true)}
                style={{ opacity: imgLoaded ? 1 : 0.5, transition: "opacity 0.5s" }}
              />
              <div className="cal-hero-overlay">
                <div>
                  <div className="cal-year-label">{year}</div>
                  <div className="cal-month-label">{MONTH_NAMES[month]}</div>
                </div>
                <div className="cal-nav-btns">
                  <button className="cal-nav-btn" onClick={() => navigate("prev")} aria-label="Previous">←</button>
                  <button className="cal-nav-btn" onClick={() => navigate("next")} aria-label="Next">→</button>
                </div>
              </div>
            </div>

            {/* Month Strip */}
            <div className="year-strip">
              {MONTH_NAMES.map((m, i) => (
                <div
                  key={m}
                  className={`month-dot ${i === month ? "active" : ""}`}
                  onClick={() => {
                    if (i === month) return;
                    setFlipDir(i > month ? "next" : "prev");
                    setFlipping(true); setImgLoaded(false);
                    setTimeout(() => {
                      setMonth(i); setStartDate(null); setEndDate(null); setFlipping(false);
                    }, 520);
                  }}
                >
                  {m.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="cal-body">
              <div className="cal-day-headers">
                {DAY_LABELS.map((d, i) => (
                  <div key={d} className={`cal-day-header ${i === 0 || i === 6 ? "weekend" : ""}`}>{d}</div>
                ))}
              </div>

              <div className="cal-grid">
                {cells.map((date, i) => {
                  if (!date) return <div key={i} className="cal-cell empty" />;
                  const isCurrentMonth = date.getMonth() === month;
                  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                  const isHoliday = holidays[key];
                  const isStart = isSameDay(date, startDate);
                  const isEnd = isSameDay(date, endDate);
                  const inRange = isInRange(date, startDate, endDate);
                  const dow = date.getDay();
                  const isWknd = dow === 0 || dow === 6;

                  return (
                    <div
                      key={i}
                      className={[
                        "cal-cell",
                        !isCurrentMonth ? "other-month" : "",
                        isHoliday ? "holiday" : "",
                        isWknd ? "weekend-day" : "",
                        isToday(date) ? "is-today" : "",
                        isStart ? "is-start" : "",
                        isEnd ? "is-end" : "",
                        inRange ? "in-range" : "",
                      ].join(" ")}
                      onClick={() => handleDateClick(date)}
                      title={isHoliday || date.toDateString()}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>

              {startDate && (
                <div className="cal-range-info">
                  <span className="range-tag">From</span>
                  {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {endDate && (
                    <>
                      <span className="range-tag">To</span>
                      {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      <span style={{ marginLeft: "auto", color: "#9a8a6a", fontSize: "0.72rem" }}>
                        {Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </>
                  )}
                  <span
                    onClick={() => { setStartDate(null); setEndDate(null); }}
                    style={{ marginLeft: endDate ? "0" : "auto", cursor: "pointer", color: "#c0392b", fontSize: "0.72rem" }}
                  >
                    ✕ clear
                  </span>
                </div>
              )}

              <div className="cal-legend">
                <div><span className="dot holiday-dot" />Holiday</div>
                <div><span className="dot today-dot" />Today</div>
                <div><span className="dot range-dot" />Selected</div>
              </div>
            </div>
          </div>

          {/* ===== NOTES PANEL ===== */}
          <div className="notes-panel">
            <div className="notes-holes">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="cal-hole" />
              ))}
            </div>
            <div className="notes-inner">
              <div>
                <div className="notes-title">Notes</div>
                <div className="notes-subtitle">{MONTH_NAMES[month]} · {year}</div>
              </div>
              <textarea
                className="notes-textarea"
                value={noteInput}
                onChange={e => handleNoteChange(e.target.value)}
                placeholder={`Write your plans for ${MONTH_NAMES[month]}...`}
                maxLength={500}
              />
              <div className="notes-char-count">{noteInput.length} / 500</div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#b0a07a", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Lato', sans-serif" }}>
                  Quick add
                </div>
                <div className="notes-quick-tags">
                  {["🏖️ Vacation", "💼 Work", "🎂 Birthday", "🏥 Health", "✈️ Travel", "🎉 Event"].map(tag => (
                    <div key={tag} className="quick-tag"
                      onClick={() => handleNoteChange(noteInput + (noteInput ? "\n" : "") + tag)}>
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile toggle */}
        <button className="notes-toggle-btn" onClick={() => setShowNotes(v => !v)} aria-label="Notes">📝</button>

        <div className={`notes-drawer ${showNotes ? "open" : ""}`}>
          <div className="drawer-handle" onClick={() => setShowNotes(false)} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#3a2e1e", marginBottom: "12px" }}>
            Notes — {MONTH_NAMES[month]}
          </div>
          <textarea
            className="notes-textarea"
            value={noteInput}
            onChange={e => handleNoteChange(e.target.value)}
            placeholder={`Plans for ${MONTH_NAMES[month]}...`}
            maxLength={500}
            style={{ width: "100%", minHeight: "130px", background: "transparent", border: "none", outline: "none", lineHeight: "1.7", color: "#3a2e1e" }}
          />
          <div className="notes-char-count">{noteInput.length} / 500</div>
          <div className="notes-quick-tags" style={{ marginTop: "10px" }}>
            {["🏖️ Vacation", "💼 Work", "🎂 Birthday", "🎉 Event"].map(tag => (
              <div key={tag} className="quick-tag"
                onClick={() => handleNoteChange(noteInput + (noteInput ? "\n" : "") + tag)}>
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
