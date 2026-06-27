import { createContext, useContext } from 'react';
import type { User } from '@/utils/type';

interface UserContextValue {
  user: User | null;
  isAdmin: boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isAdmin: false,
});

export function UserProvider({ user, children }: { user: User | null; children: React.ReactNode }) {
  const isAdmin = user?.IsAdmin === true;
  return <UserContext.Provider value={{ user, isAdmin }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
