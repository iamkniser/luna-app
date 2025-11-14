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
  updateDailyLog: (date: string, data: Partial<DailyLog>) => void;
  getDailyLog: (date: string) => DailyLog | undefined;
  deleteDailyLog: (date: string) => void;
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

      updateDailyLog: (date: string, data: Partial<DailyLog>) => {
        set((state) => {
          const existingLog = state.dailyLogs.find((log) => log.date === date);

          if (existingLog) {
            return {
              dailyLogs: state.dailyLogs.map((log) =>
                log.date === date ? { ...log, ...data } : log
              ),
            };
          }

          const newLog: DailyLog = {
            id: Date.now().toString(),
            date,
            isPeriodDay: false,
            ...data,
          };

          return {
            dailyLogs: [...state.dailyLogs, newLog],
          };
        });
      },

      getDailyLog: (date: string) => {
        return get().dailyLogs.find((log) => log.date === date);
      },

      deleteDailyLog: (date: string) => {
        set((state) => ({
          dailyLogs: state.dailyLogs.filter((log) => log.date !== date),
        }));
      },
    }),
    {
      name: "luna-cycle-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
