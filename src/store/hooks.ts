import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

import type { RootState, AppDispatch } from '.';
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;