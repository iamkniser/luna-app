import { Cycle, DailyLog } from "@/src/types/cycle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CycleStore {
  cycles: Cycle[];
  dailyLogs: DailyLog[];
  addCycle: (cycle: Cycle) => void;
  updateCycle: (id: string, data: Partial<Cycle>) => void;
  addDailyLog: (log: DailyLog) => void;
  updateDailyLog: (id: string, data: Partial<DailyLog>) => void;
  getDailyLog: (date: string) => DailyLog | undefined;
}

export const useCycleStore = create<CycleStore>()(
  persist(
    (set, get) => ({
      cycles: [],
      dailyLogs: [],

      addCycle: (cycle: Cycle) => {
        set((state) => ({
          cycles: [...state.cycles, cycle].sort(
            (a, b) =>
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          ),
        }));
      },

      updateCycle: (id: string, data: Partial<Cycle>) => {
        set((state) => ({
          cycles: state.cycles.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },

      addDailyLog: (log: DailyLog) => {
        set((state) => ({
          dailyLogs: [...state.dailyLogs, log],
        }));
      },

      updateDailyLog: (id: string, data: Partial<DailyLog>) => {
        set((state) => ({
          dailyLogs: state.dailyLogs.map((log) =>
            log.id === id ? { ...log, ...data } : log
          ),
        }));
      },

      getDailyLog: (date: string) => {
        return get().dailyLogs.find((log) => log.date === date);
      },
    }),
    {
      name: "luna-cycle-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
