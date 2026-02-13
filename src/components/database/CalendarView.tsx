import { useMemo, useState } from "react";
import type { DatabaseBlock } from "@/types/docs";
import type { DbCellValue } from "@/types/database";
import { ChevronLeft, ChevronRight, Plus, Calendar } from "lucide-react";
import { cn } from "@/utils/cn";

export function CalendarView({
  data,
  disabled,
  addRow,
  updateCell,
}: {
  data: DatabaseBlock["data"];
  disabled: boolean;
  addRow: (initialCells?: Record<string, DbCellValue>) => void;
  updateCell: (rowId: string, propId: string, value: DbCellValue) => void;
}) {
  const dateProp = useMemo(() => {
    return data.properties.find((p) => p.type === "date") || data.properties[0];
  }, [data.properties]);

  const nameProp = data.properties[0];

  // Default to current month/year
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Adjust for Monday start (0=Sun, 1=Mon...)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    const res = [];
    // Previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      res.push({ day: prevMonthDays - i, current: false, date: d });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      res.push({ day: i, current: true, date: d });
    }
    // Next month days
    const remaining = 42 - res.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      res.push({ day: i, current: false, date: d });
    }
    return res;
  }, [currentDate]);

  const onAddForDate = (d: Date) => {
    if (disabled || !dateProp?.id) return;
    const iso = d.toISOString().slice(0, 16);
    addRow({ [dateProp.id]: iso });
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold">{monthName}</h3>
        </div>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={nextMonth} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="p-2 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((item, i) => {
          const isCurrentMonth = item.current;
          const dateStr = item.date.toISOString().slice(0, 10);
          const rowsForDay = data.rows.filter(r => {
             const val = r.cells[dateProp?.id];
             if (!val) return false;
             return String(val).startsWith(dateStr);
          });

          return (
            <div
              key={i}
              className={cn(
                "min-h-[100px] border-b border-r border-zinc-100 p-1 dark:border-zinc-800 transition-colors",
                !isCurrentMonth && "bg-zinc-50/50 dark:bg-zinc-900/30"
              )}
            >
              <div className={cn(
                "mb-1 flex items-center justify-between px-1 text-[10px] font-medium",
                isCurrentMonth ? "text-zinc-500" : "text-zinc-300"
              )}>
                <span>{item.day}</span>
                {isCurrentMonth && !disabled && (
                  <button 
                    onClick={() => onAddForDate(item.date)}
                    className="opacity-0 hover:opacity-100 text-indigo-500 transition-opacity"
                  >
                    <Plus className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
              
              <div className="space-y-1">
                {rowsForDay.map(r => (
                  <div 
                    key={r.id} 
                    className="group/item relative rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900"
                  >
                    <input 
                      disabled={disabled}
                      value={String(r.cells[nameProp?.id] || "")}
                      onChange={(e) => updateCell(r.id, nameProp?.id, e.target.value)}
                      placeholder="Event…"
                      className="w-full bg-transparent outline-none truncate"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
