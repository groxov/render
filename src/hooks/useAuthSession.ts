import { useCallback, useEffect, useState } from 'react';
import { clearStoredSession, getAuthToken, getStoredSession, persistSession } from '../lib/session';
import { UserType } from '../types';

export function useAuthSession() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>('user');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    const session = getStoredSession();

    if (token && session) {
      setIsLoggedIn(true);
      setUserType(session.type);
      setUserName(session.name);
    }

    setIsReady(true);
  }, []);

  const login = useCallback((type: UserType, name: string) => {
    persistSession({ type, name });
    setIsLoggedIn(true);
    setUserType(type);
    setUserName(name);
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setIsLoggedIn(false);
    setUserType('user');
    setUserName('');
  }, []);

  return {
    isReady,
    isLoggedIn,
    userType,
    userName,
    login,
    logout,
  };
}
