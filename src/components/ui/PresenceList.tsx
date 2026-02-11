import { useEffect, useState } from "react";
import { createDocChannel, isSupabaseConfigured, PresenceState } from "@/services/supabase";
import { Users } from "lucide-react";

export function PresenceList() {
  const [collaborators, setCollaborators] = useState<PresenceState[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = createDocChannel();
    if (!channel) return;

    const user_id = Math.random().toString(36).slice(2, 9);
    const name = `Guest ${user_id.toUpperCase()}`;
    const colors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as unknown as PresenceState[];
        setCollaborators(users);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        console.log("New collaborator joined:", newPresences);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        console.log("Collaborator left:", leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id,
            name,
            color,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      void channel.unsubscribe();
    };
  }, []);

  if (!isSupabaseConfigured) return null;

  return (
    <div className="flex items-center gap-1.5 px-2">
      <div className="flex -space-x-2">
        {collaborators.slice(0, 5).map((user) => (
          <div
            key={user.user_id}
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-zinc-950 shadow-sm"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.charAt(0)}
          </div>
        ))}
        {collaborators.length > 5 && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-[10px] font-bold text-zinc-600 dark:border-zinc-950 dark:bg-zinc-800 dark:text-zinc-400">
            +{collaborators.length - 5}
          </div>
        )}
      </div>
      {collaborators.length === 0 && (
        <Users className="h-4 w-4 text-zinc-400 opacity-50" />
      )}
    </div>
  );
}
