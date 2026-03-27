import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../src/store/authStore';
import { authApi } from '../src/api/auth.api';
import { getRefreshToken } from '../src/utils/storage';
import { Loader } from '../src/components/common/Loader';

export default function RootLayout() {
  const { isAuthenticated, isLoading, setAuth, setLoading, logout, user } = useAuthStore();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) { setLoading(false); return; }

        const { data } = await authApi.refreshToken(refreshToken);
        const { accessToken, refreshToken: newRt } = data.data;

        // Save new refresh token
        const { saveRefreshToken } = await import('../src/utils/storage');
        await saveRefreshToken(newRt);

        useAuthStore.getState().setAccessToken(accessToken);

        const meRes = await authApi.getMe();
        setAuth(meRes.data.data, accessToken);
      } catch {
        logout();
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    if (user?.role === 'ADMIN') router.replace('/(admin)/dashboard');
    else if (user?.role === 'VENDOR') router.replace('/(vendor)/dashboard');
    else router.replace('/(customer)/');
  }, [isAuthenticated, isLoading, user?.role]);

  if (isLoading) return <Loader />;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
      <Toast />
    </>
  );
}
