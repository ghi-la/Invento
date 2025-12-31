
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { increasePopulation } from '@/hooks/slices/bearSlice';
import { RootState } from '@/hooks/store';
import { Button } from '@mui/material';

const BearButtons = () => {
    const dispatch = useAppDispatch();
    const bear = useAppSelector((state: RootState) => state.bear);

    const increaseBears = () => {
        dispatch(increasePopulation());
    }
  return (
      <div>
          <h1>Bear Counts: {bear.bears}</h1>
      <Button onClick={increaseBears}>Increase bear</Button>
    </div>
  );
};

export default BearButtons;