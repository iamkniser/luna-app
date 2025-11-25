import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import * as GestureHandler from "react-native-gesture-handler";
import "react-native-reanimated";

import { colors } from "@/src/constants/colors";

const { GestureHandlerRootView } = GestureHandler;

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            navigationBarColor: colors.background,
          }}
        />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
