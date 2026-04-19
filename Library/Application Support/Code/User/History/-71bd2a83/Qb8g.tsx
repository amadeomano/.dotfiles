import { createContext } from 'react';

const useNavigate = () => ({
  navigate: () => {},
});

const ReactRouterNavigationContext = createContext();
const NextRouterNavigationContext = createContext();
