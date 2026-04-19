import { useRouter } from 'next/router';
import { useNavigate } from 'react-router';
import { createContext } from 'react';

const useReactRouterNavigate = () => {
  const navigate = useNavigate();
  return { navigate };
};

const ReactRouterNavigationContext = createContext();
const NextRouterNavigationContext = createContext();
