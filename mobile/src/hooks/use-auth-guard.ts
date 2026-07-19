import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { useUserStore } from '../../store/useUserStore';

export function useAuthGuard(redirectPath = '/login') {
  const router = useRouter();
  const user = useUserStore((state: any) => state.user);

  const [hydrated, setHydrated] = useState(() => {
    const persistApi = (useUserStore as any).persist;
    return persistApi?.hasHydrated?.() ?? true;
  });

  useEffect(() => {
    const persistApi = (useUserStore as any).persist;
    if (!persistApi?.onFinishHydration) {
      setHydrated(true);
      return;
    }

    const unsubscribe = persistApi.onFinishHydration(() => {
      setHydrated(true);
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      (router.replace as any)(redirectPath);
    }
  }, [hydrated, user, redirectPath, router]);

  return {
    isHydrated: hydrated,
    isAuthenticated: Boolean(user),
  };
}
