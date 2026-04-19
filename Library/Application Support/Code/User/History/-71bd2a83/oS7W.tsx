import { useRouter } from 'next/router';
import { useNavigate } from 'react-router';
import { createContext } from 'react';

const useReactRouterNavigate = () => {
  const navigate = useNavigate();
  return { navigate };
};

type NavigateParams = string | { pathname: string; search: string };
const useNextNavigate = () => {
  const router = useRouter();
  const navigate = (arg: NavigateParams) => {
    if (typeof arg === 'string') {
      router.push(arg);
    } else {
      router.push({ pathname: arg.pathname, search: arg.search });
    }
  };
  return { navigate };
};

const ReactRouterNavigationContext = createContext();
const NextRouterNavigationContext = createContext();
