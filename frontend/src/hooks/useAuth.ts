import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// AuthContextType is not directly exported from AuthContext.tsx.
// We can derive its type from the AuthContext itself.
// AuthContext is defined as createContext<AuthContextType | undefined>(...).
// React.ContextType<typeof AuthContext> extracts the generic type parameter,
// which is AuthContextType | undefined.
// NonNullable then removes the 'undefined' part, giving us AuthContextType.
type AuthContextValueType = NonNullable<React.ContextType<typeof AuthContext>>;

const useAuth = (): AuthContextValueType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;