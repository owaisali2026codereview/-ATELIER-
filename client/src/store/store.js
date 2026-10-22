import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import cartReducer from './cartSlice';
import studioReducer from './studioSlice';
import filterReducer from './filterSlice';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    studio: studioReducer,
    filters: filterReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export default store;
