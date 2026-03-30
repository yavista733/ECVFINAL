import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export interface ConnectivityState {
  isConnected: boolean;
  isInternetReachable: boolean;
}

let currentState: ConnectivityState = {
  isConnected: true,
  isInternetReachable: true,
};

let listeners: ((state: ConnectivityState) => void)[] = [];

const checkInternetConnectivity = async (): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok || response.status === 0;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
};

const notifyListeners = () => {
  for (const listener of listeners) {
    listener(currentState);
  }
};

const checkConnection = async () => {
  const isReachable = await checkInternetConnectivity();
  const newState: ConnectivityState = {
    isConnected: isReachable,
    isInternetReachable: isReachable,
  };

  if (
    newState.isConnected !== currentState.isConnected ||
    newState.isInternetReachable !== currentState.isInternetReachable
  ) {
    currentState = newState;
    notifyListeners();
  }
};

export const getCurrentConnectivityState = async (): Promise<ConnectivityState> => {
  await checkConnection();
  return currentState;
};

export const subscribeConnectivity = (
  callback: (state: ConnectivityState) => void,
): (() => void) => {
  listeners.push(callback);
  callback(currentState);

  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
};

export const useConnectivity = (): ConnectivityState => {
  const [state, setState] = useState<ConnectivityState>(currentState);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        checkConnection();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    const unsubscribe = subscribeConnectivity(setState);

    return () => {
      clearInterval(interval);
      subscription.remove();
      unsubscribe();
    };
  }, []);

  return state;
};
