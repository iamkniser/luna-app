import { Redirect } from "expo-router";
import { ReactElement } from "react";

export default function Index(): ReactElement {
  return <Redirect href="/(onboarding)/welcome" />;
}
