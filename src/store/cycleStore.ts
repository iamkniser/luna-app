import { Cycle, DailyLog } from "@/src/types/cycle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CycleStore {
  cycles: Cycle[];
  dailyLogs: DailyLog[];
  isWaitingForNextPeriod: boolean;
  recoverySuppressedForStartDate: string | null;
  addCycle: (cycle: Cycle) => void;
  updateCycle: (id: string, data: Partial<Cycle>) => void;
  addDailyLog: (log: DailyLog) => void;
  updateDailyLog: (date: string, data: Partial<DailyLog>) => void;
  getDailyLog: (date: string) => DailyLog | undefined;
  deleteDailyLog: (date: string) => void;
  setWaitingForNextPeriod: (value: boolean) => void;
  setRecoverySuppressedForStartDate: (startDate: string | null) => void;
}

export const useCycleStore = create<CycleStore>()(
  persist(
    (set, get) => ({
      cycles: [],
      dailyLogs: [],
      isWaitingForNextPeriod: false,
      recoverySuppressedForStartDate: null,

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

      setWaitingForNextPeriod: (value: boolean) => {
        set({ isWaitingForNextPeriod: value });
      },

      setRecoverySuppressedForStartDate: (startDate: string | null) => {
        set({ recoverySuppressedForStartDate: startDate });
      },
    }),
    {
      name: "luna-cycle-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState: any, version) => {
        if (!persistedState) return {};
        if (version < 2) {
          // Сбрасываем подавление карточки восстановления при миграции
          return {
            ...persistedState,
            recoverySuppressedForStartDate: null,
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        cycles: state.cycles,
        dailyLogs: state.dailyLogs,
        isWaitingForNextPeriod: state.isWaitingForNextPeriod,
        recoverySuppressedForStartDate: null, // не сохраняем подавление, чтобы оно сбрасывалось при перезапуске
      }),
    }
  )
);
