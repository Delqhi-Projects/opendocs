import { useState } from "react";
import { useDocsStore } from "@/store/useDocsStore";
import { IconPicker, RenderDocIcon } from "@/components/ui/IconPicker";
import { Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/utils/cn";

export function PageHeader() {
  const { state, actions } = useDocsStore();
  const page = state.selectedPageId ? state.pages[state.selectedPageId] : undefined;
  const [showIconPicker, setShowIconPicker] = useState(false);

  if (!page) return null;

  const hasCover = !!page.cover;

  return (
    <div className="group relative mb-8">
      {/* Cover Image */}
      <div className={cn(
        "relative h-48 w-full overflow-hidden bg-zinc-100 transition-all dark:bg-zinc-900",
        !hasCover && "h-24 opacity-0 group-hover:opacity-100"
      )}>
        {page.cover ? (
          <img src={page.cover} className="h-full w-full object-cover" alt="Cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center border-b border-dashed border-zinc-200 dark:border-zinc-800">
             <button 
               onClick={() => {
                 const url = prompt("Enter cover image URL:");
                 if (url) actions.updatePageMetadata?.(page.id, { cover: url });
               }}
               className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-zinc-500 shadow-sm border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
             >
               <ImageIcon className="h-3.5 w-3.5" /> Add cover
             </button>
          </div>
        )}
        
        {hasCover && (
          <button 
            onClick={() => actions.updatePageMetadata?.(page.id, { cover: "" })}
            className="absolute right-4 top-4 rounded-md bg-black/20 p-1 text-white opacity-0 transition-opacity hover:bg-black/40 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-1">
        {/* Page Icon */}
        <div className="relative -mt-10 mb-4 inline-block">
          <button
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-zinc-50 text-4xl shadow-sm transition-transform hover:scale-105 dark:border-black dark:bg-zinc-900"
          >
            {page.icon ? <RenderDocIcon icon={page.icon} className="h-10 w-10" /> : "📄"}
          </button>

          {showIconPicker && (
            <div className="absolute left-0 top-full z-50 mt-2">
              <IconPicker
                current={page.icon}
                onChange={(icon) => actions.updatePageIcon(page.id, icon)}
                onClose={() => setShowIconPicker(false)}
              />
            </div>
          )}
        </div>

        {/* Title */}
        <input
          value={page.title}
          onChange={(e) => actions.renamePage(page.id, e.target.value)}
          placeholder="Untitled"
          className="w-full bg-transparent text-4xl font-bold tracking-tight text-zinc-900 outline-none dark:text-zinc-100"
        />
      </div>
    </div>
  );
}
