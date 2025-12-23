import { TFile, Vault } from "obsidian";
import { KanbanColumn, KanbanTask } from "./types";
import { parseKanbanFile } from "./parser";

export class TaskTracker {
    private previousState: Map<string, KanbanColumn[]> = new Map();
    private vault: Vault;

    constructor(vault: Vault) {
        this.vault = vault;
    }

    /**
     * Initializes the state for a specific file.
     * Call this when the plugin loads or when opening a file.
     */
    async initializeFile(file: TFile) {
        try {
            const content = await this.vault.read(file);
            const state = parseKanbanFile(content);
            this.previousState.set(file.path, state);
            console.log(`[XP System] Initialized tracking for ${file.path}`);
        } catch (e) {
            console.error(`[XP System] Failed to initialize tracking for ${file.path}`, e);
        }
    }

    /**
     * Compares the new state of the file with the previous state to find changes.
     */
    async processFileChange(file: TFile): Promise<void> {
        const oldState = this.previousState.get(file.path);
        if (!oldState) {
            // If we missed initialization, treat first change as init.
            await this.initializeFile(file);
            return;
        }

        const content = await this.vault.read(file);
        const newState = parseKanbanFile(content);

        this.detectTaskCompletion(oldState, newState);

        // Update state
        this.previousState.set(file.path, newState);
    }

    /**
     * Core logic to detect if a task has been completed.
     * Strategy: Look for tasks that appeared in "Done" column that weren't there before.
     */
    private detectTaskCompletion(oldState: KanbanColumn[], newState: KanbanColumn[]) {
        const doneColumnNames = ["Done", "Completed", "Finished"]; // Configurable later

        // Helper to get all task IDs in specific columns
        const getTaskIdsInColumns = (state: KanbanColumn[], definitions: string[]) => {
            const ids = new Set<string>();
            for (const col of state) {
                if (definitions.some(d => col.title.toLowerCase().includes(d.toLowerCase()))) {
                    for (const task of col.tasks) {
                        ids.add(task.id);
                    }
                }
            }
            return ids;
        };

        const oldDoneIds = getTaskIdsInColumns(oldState, doneColumnNames);
        const newDoneColumns = newState.filter(col =>
            doneColumnNames.some(d => col.title.toLowerCase().includes(d.toLowerCase()))
        );

        // Check each task in the new 'Done' columns
        const completedTasks: KanbanTask[] = [];

        for (const col of newDoneColumns) {
            for (const task of col.tasks) {
                // If it wasn't in Done before, it's newly completed
                if (!oldDoneIds.has(task.id)) {
                    // Double check: It might be a brand new task typed directly into Done.
                    // Or it might be a task moved from 'Todo'.
                    // For XP system, usually we only reward moving existing tasks or checking tasks.
                    // Let's log it regardless for now.
                    completedTasks.push(task);
                }
            }
        }

        // Also check for Checkbox changes ( - [ ] -> - [x] ) regardless of column?
        // The prompt specifically asked about "moving to Done column" in the Phase description header
        // "Отслеживать когда задача перемещается в Done колонку". 
        // But let's support both if possible or stick to prompt strictly? 
        // Let's strictly follow "Moved to Done column" logic first as primary driver, 
        // but often 'Done' column implies checkmarks are checked. 
        // If a user drags a checked task around, it shouldn't trigger again.
        // My logic above checks if ID was in Done before. If it was, no XP. Good.

        if (completedTasks.length > 0) {
            console.log(`[XP System] 🚀 Detected ${completedTasks.length} newly completed task(s):`);
            completedTasks.forEach(t => console.log(`   - ${t.text} (XP: ${t.metadata.xp || 0})`));
        } else {
            console.log("[XP System] Change detected, but no new task completions.");
        }
    }
}
