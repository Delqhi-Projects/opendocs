import { useState, useEffect } from "react";
import type { DatabaseBlockData } from "@/types/database";
import { Modal } from "@/components/ui/Modal";
import { Zap, AlertCircle } from "lucide-react";
import { createAutomationRule, installAutomations, syncAutomationRules } from "@/services/dbProvisioning";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/utils/blockHelpers";

export function DatabaseRulesModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: DatabaseBlockData;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const tableName = data.remote?.tableName;

  useEffect(() => {
    if (open) {
      // In a real app we'd fetch existing rules for this table
    }
  }, [open, tableName]);

  const addRule = async (whenId: string, whenVal: string, thenId: string, thenVal: string) => {
    if (!tableName) return;
    setBusy(true);
    setError("");
    try {
      // Ensure engine installed
      await installAutomations();
      
      const whenProp = data.properties.find(p => p.id === whenId);
      const thenProp = data.properties.find(p => p.id === thenId);
      
      if (!whenProp || !thenProp) throw new Error("Property not found");

      await createAutomationRule({
        tableName,
        whenColumn: whenProp.dbColumnName,
        whenEquals: whenVal,
        thenSetColumn: thenProp.dbColumnName,
        thenSetValue: thenVal
      });

      await syncAutomationRules(tableName);
      onClose();
      alert("Automation rule created and synced to database.");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const [selWhenId, setSelWhenId] = useState("");
  const [selWhenVal, setSelWhenVal] = useState("");
  const [selThenId, setSelThenId] = useState("");
  const [selThenVal, setSelThenVal] = useState("");

  if (!tableName) {
    return (
      <Modal open={open} title="Database Automations" onClose={onClose}>
        <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 italic">
          Please convert this block to a DB-backed table first.
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} title={`Automations: ${data.title}`} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center gap-2 rounded-lg bg-indigo-50/50 p-3 text-xs text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
           <Zap className="h-4 w-4" />
           <div>
             <p className="font-bold uppercase tracking-tight">Edge Automation Engine v1</p>
             <p className="mt-0.5 opacity-80 text-[10px]">Rules run instantly in Postgres when a row is updated.</p>
           </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[10px] uppercase font-bold text-zinc-400">When Property</label>
               <select 
                 value={selWhenId} 
                 onChange={e => setSelWhenId(e.target.value)}
                 className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
               >
                 <option value="">Select...</option>
                 {data.properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] uppercase font-bold text-zinc-400">Equals Value</label>
               <input 
                 value={selWhenVal} 
                 onChange={e => setSelWhenVal(e.target.value)}
                 placeholder="e.g. Done"
                 className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
               />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[10px] uppercase font-bold text-zinc-400">Then Set Property</label>
               <select 
                 value={selThenId} 
                 onChange={e => setSelThenId(e.target.value)}
                 className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
               >
                 <option value="">Select...</option>
                 {data.properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] uppercase font-bold text-zinc-400">To Value</label>
               <input 
                 value={selThenVal} 
                 onChange={e => setSelThenVal(e.target.value)}
                 placeholder="e.g. 2026-02-09"
                 className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
               />
             </div>
          </div>
          
          <Button 
            disabled={busy || !selWhenId || !selThenId} 
            className="w-full"
            onClick={() => addRule(selWhenId, selWhenVal, selThenId, selThenVal)}
          >
            {busy ? "Syncing..." : "Add Edge Automation Rule"}
          </Button>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
           <p className="text-[10px] text-zinc-400 font-medium italic">
             Note: Deleting the database block will also remove all associated rules and Postgres triggers.
           </p>
        </div>
      </div>
    </Modal>
  );
}
