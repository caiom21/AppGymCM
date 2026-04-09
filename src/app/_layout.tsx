import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { syncWorker } from '@/src/features/workouts/services/syncWorker';
import { OfflineBanner } from "@/src/shared/components/ui/OfflineBanner";
import '@/src/styles/global.css';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold, useFonts } from '@expo-google-fonts/jetbrains-mono';
import { StripeProvider } from '@stripe/stripe-react-native';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

const queryClient = new QueryClient();

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(student)',
};


SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const { isInitialized, isAuthenticated, onboardingCompleted, role } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [loaded, error] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    // Initiate background network syncing
    syncWorker.init();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isInitialized]);

  // ── Central auth redirect logic ──
  useEffect(() => {
    if (!loaded || !isInitialized) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments.some(s => s === 'onboarding');

    if (!isAuthenticated) {
      // Not logged in → send to login
      if (!inAuth) {
        router.replace('/(auth)/login' as any);
      }
    } else if (!onboardingCompleted) {
      // Logged in but hasn't finished onboarding
      if (!inOnboarding) {
        router.replace('/(auth)/onboarding' as any);
      }
    } else {
      // Fully authenticated → go to correct area
      if (inAuth) {
        const target = role === 'teacher' ? '/(teacher)' : '/(student)';
        router.replace(target as any);
      }
    }
  }, [isInitialized, isAuthenticated, onboardingCompleted, role, loaded]);

  if (!loaded || !isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}
      >
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <OfflineBanner />
            <Stack screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0A0A0A' }
            }}>
              <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
              <Stack.Screen name="(student)" options={{ animation: 'fade' }} />
              <Stack.Screen name="(teacher)" options={{ animation: 'fade' }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
