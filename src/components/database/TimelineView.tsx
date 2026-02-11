import { useMemo, useState } from "react";
import type { DatabaseBlock } from "@/types/docs";
import { cn } from "@/utils/cn";
import { Activity, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export function TimelineView({
  data,
  disabled,
  addRow,
  updateCell,
}: {
  data: DatabaseBlock["data"];
  disabled: boolean;
  addRow: (initialCells?: Record<string, any>) => void;
  updateCell: (rowId: string, propId: string, value: any) => void;
}) {
  const dateProp = useMemo(() => {
    return data.properties.find((p) => p.type === "date") || data.properties[0];
  }, [data.properties]);

  const nameProp = data.properties[0];

  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const count = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const onAddForDay = (day: number) => {
    if (disabled || !dateProp || !dateProp.id) return;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 9, 0, 0);
    const iso = date.toISOString().slice(0, 16);
    addRow({ [dateProp.id]: iso });
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 p-3 dark:border-zinc-800">
         <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-semibold">{monthName} Roadmap</h3>
         </div>
         <div className="flex gap-1">
            <button onClick={prevMonth} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={nextMonth} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><ChevronRight className="h-4 w-4" /></button>
         </div>
      </div>
      <div className="flex border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="w-48 shrink-0 border-r border-zinc-100 p-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
          Project / Item
        </div>
        <div className="flex-1 overflow-x-auto flex custom-scrollbar">
          {daysInMonth.map(d => (
            <div key={d} className="min-w-[80px] p-2 text-center border-r border-zinc-100 dark:border-zinc-800 last:border-0 relative">
               <span className="text-[10px] font-bold text-zinc-400">Day {d}</span>
               {!disabled && (
                 <button 
                  onClick={() => onAddForDay(d)}
                  className="absolute right-1 top-1 opacity-0 hover:opacity-100 text-indigo-500 transition-opacity"
                 >
                   <Plus className="h-2 w-2" />
                 </button>
               )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 overflow-y-auto max-h-[400px]">
        {data.rows.map(r => {
           const dateVal = r.cells[dateProp?.id];
           if (!dateVal || typeof dateVal !== 'string') return null;
           
           const date = new Date(dateVal);
           if (date.getMonth() !== currentDate.getMonth() || date.getFullYear() !== currentDate.getFullYear()) return null;
           
           const startDay = date.getDate();

           return (
             <div key={r.id} className="flex group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors h-12">
               <div className="w-48 shrink-0 border-r border-zinc-100 p-2 dark:border-zinc-800 flex items-center">
                  <input
                    disabled={disabled}
                    value={String(r.cells[nameProp?.id] || "")}
                    onChange={(e) => updateCell(r.id, nameProp?.id, e.target.value)}
                    placeholder="Item…"
                    className="w-full bg-transparent text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none truncate"
                  />
               </div>
               <div className="flex-1 relative flex items-center overflow-x-auto custom-scrollbar overflow-y-hidden">
                  <div 
                    className={cn(
                      "absolute h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center px-3 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 shadow-sm",
                    )}
                    style={{ 
                      left: `${(startDay - 1) * 80 + 4}px`,
                      width: "150px",
                      zIndex: 10
                    }}
                  >
                    <span className="truncate">Active</span>
                  </div>
                  {/* Invisible spacer to enable horizontal scroll if items are far right */}
                  <div style={{ width: `${daysInMonth.length * 80}px`, height: '1px' }} />
               </div>
             </div>
           );
        })}
      </div>
      
      {data.rows.length === 0 && (
        <div className="p-12 text-center text-sm text-zinc-400 italic">No roadmap items. Click '+' on a day to schedule.</div>
      )}
    </div>
  );
}
