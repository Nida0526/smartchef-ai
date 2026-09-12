import { createContext, useContext } from 'react';

export const ToastContext = createContext({
  notify: () => {},
  clear: () => {}
});

export function useToast() {
  return useContext(ToastContext);
}