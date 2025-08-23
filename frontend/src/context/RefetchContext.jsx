import { createContext, useContext } from 'react';

export const RefetchContext = createContext({ refetch: () => {} });

export const useRefetchWholeData = () => {
  return useContext(RefetchContext).refetch;
};