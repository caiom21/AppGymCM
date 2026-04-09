import { Redirect } from 'expo-router';

// This route is never actually shown — the FAB in the tab bar
// intercepts the press and opens LiveWorkout directly.
// This file exists only to satisfy Expo Router's file-based routing.
export default function QuickStartRedirect() {
  return <Redirect href="/(student)" />;
}
