/* eslint-disable react-hooks/exhaustive-deps */

import { checkStatus } from '@/api/user';
import { setLoggedUser } from '@/hooks/slices/appSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

const AuthMiddleware = () => {
  // const location = useLocation();
  const triggerReload = useSelector((state: any) => state.app.triggerReload);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('AuthMiddleware: Checking authentication status...');
    checkStatus(localStorage.getItem('token') || '')
      .then((response: any) => {
        console.log('User is authenticated:', response);
        dispatch(setLoggedUser(response.data));
        // dispatch(setUser(response.data));
      })
      .catch(
        (error) => {
          console.error('User is not authenticated:', error);
          // if (error.code === 'ERR_NETWORK') {
          //   dispatch(
          // openNotification({
          //   severity: 'error',
          //   message: 'Network error. Please check your connection.',
          // }),
          //   );
        },
        // if (location.pathname.startsWith('/dashboard')) {
        //   navigate('/');
        // }
      );
  }, [triggerReload]);

  return null;
};

export default AuthMiddleware;
