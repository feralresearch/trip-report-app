import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import statusReducer from "../redux/slice/status";

const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    status: statusReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).prepend(listenerMiddleware.middleware)
});
setupListeners(store.dispatch);
