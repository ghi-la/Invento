import { closeNotification } from "@/hooks/slices/appSlice";
import { RootState } from "@/hooks/store";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Alert, Snackbar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

const NotificationToast = () => {
    const dispatch = useDispatch();
    const notification = useSelector((state: RootState) => state.app.notification);
    
  function handleClose() {
    dispatch(closeNotification());
  }

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={notification.autohideDuration || 6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert
        onClose={handleClose}
        severity={notification.severity}
        variant="filled"
        iconMapping={{
          info: <FavoriteIcon fontSize="inherit" />,
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast;