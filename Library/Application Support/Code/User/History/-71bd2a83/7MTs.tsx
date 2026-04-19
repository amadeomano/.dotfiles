import { useRouter } from 'next/router';
import { useNavigate } from 'react-router';
import { createContext } from 'react';

const useNextNavigate = () => ({
  navigate: () => {},
});

const ReactRouterNavigationContext = createContext();
const NextRouterNavigationContext = createContext();
