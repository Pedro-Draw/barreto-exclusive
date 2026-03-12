// src/hooks/useSubscriptionStatus.js
import { useApp } from '../App.jsx';
import { differenceInDays } from 'date-fns';
import { useMemo } from 'react';

export function useSubscriptionStatus() {
  const { user } = useApp();

  return useMemo(() => {
    if (!user || user.role === 'admin') {
      return {
        isActive: true,
        isAdmin: user?.role === 'admin',
        daysLeft: Infinity,
        expiresAt: null,
        status: 'active'
      };
    }

    if (!user.plano || !user.expiresAt) {
      return {
        isActive: false,
        daysLeft: 0,
        expiresAt: null,
        status: 'none'
      };
    }

    const expires = new Date(user.expiresAt);
    const daysLeft = differenceInDays(expires, new Date());

    return {
      isActive: daysLeft >= 0,
      daysLeft: Math.max(0, daysLeft),
      expiresAt: expires,
      status: daysLeft >= 0 ? 'active' : 'expired'
    };
  }, [user]);
}