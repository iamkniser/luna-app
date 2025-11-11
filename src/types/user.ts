export interface User {
  id: string;
  name: string;
  onboardingCompleted: boolean;
  lastPeriodDate: string;
  averageCycleLength: number;
  createdAt: string;
}

export interface OnboardingData {
  name: string;
  lastPeriodDate: string;
  averageCycleLength: number;
}
