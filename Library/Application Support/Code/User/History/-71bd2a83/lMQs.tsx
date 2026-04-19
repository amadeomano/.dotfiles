import { createContext } from 'react';

const useNavigate = () => ({
  navigate: () => {},
});

const NavigationContext = createContext();
