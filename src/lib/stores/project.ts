import { writable } from "svelte/store";
import type { Project } from "$lib/db/migrations";

export const selectedProject = writable<Project | null>(null);
export const isTracking = writable<boolean>(false);
export const activeLogId = writable<number | null>(null);
