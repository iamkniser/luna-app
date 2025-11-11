import { Redirect } from "expo-router";
import { ReactElement } from "react";

import { useUserStore } from "@/src/store/userStore";

export default function Index(): ReactElement {
  const user = useUserStore((state) => state.user);

  if (!user || !user.onboardingCompleted) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}
