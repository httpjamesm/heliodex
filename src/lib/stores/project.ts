import { writable } from "svelte/store";
import type { Project } from "$lib/db/migrations";

const createProjectStore = () => {
  const storedId = localStorage.getItem("activeProjectId");
  const initialId = storedId ? parseInt(storedId) : null;

  const { subscribe, set, update } = writable<number | null>(initialId);

  return {
    subscribe,
    set: (id: number | null) => {
      if (id) {
        localStorage.setItem("activeProjectId", id.toString());
      } else {
        localStorage.removeItem("activeProjectId");
      }
      set(id);
    },
    clear: () => {
      localStorage.removeItem("activeProjectId");
      set(null);
    },
  };
};

export const activeProjectId = createProjectStore();
export const isTracking = writable<boolean>(false);
export const activeLogId = writable<number | null>(null);
