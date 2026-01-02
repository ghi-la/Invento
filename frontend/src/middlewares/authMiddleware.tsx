/* eslint-disable react-hooks/exhaustive-deps */

import { checkStatus } from '@/api/user';
import { paths } from '@/app/paths';
import { setLoggedUser } from '@/hooks/slices/appSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

const unprotectedPaths = paths.reduce((set, route) => {
  if (route.isLoggedInRequired === false) {
    set.add(route.path);
  }
  return set;
}, new Set<string>());

const AuthMiddleware = () => {
  const location = useLocation();
  const triggerReload = useSelector((state: any) => state.app.triggerReload);
  const loggedUser = useSelector((state: any) => state.app.loggedUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    checkStatus(localStorage.getItem('token') || '')
      .then((response: any) => {
        dispatch(setLoggedUser(response.data));
      })
      .catch((_error) => {
        dispatch(setLoggedUser(null));
        if (!unprotectedPaths.has(location.pathname)) {
          navigate('/login');
        }
      });
  }, [triggerReload, location.pathname]);

  useEffect(() => {
    if (
      loggedUser &&
      (location.pathname === '/login' || location.pathname === '/register')
    ) {
      navigate('/dashboard');
    }
  }, [loggedUser, location.pathname]);

  return null;
};

export default AuthMiddleware;
