import { createModel } from '@rematch/core';
import axios, { AxiosResponse } from 'axios';

import { RootModel } from './index';
import { convertKeysToCamelCase } from '../lib/common';
import colors from '../constants/colors';
import {
  cacheResponse, cachedResponse, canUseCache, ResponseCache,
} from '../lib/response-cache';

type ConfigurationStateType = {
  backendURL: string
  cacheIdentity?: string
  responseCache?: ResponseCache
  unavailableRequests?: Record<string, boolean>
  preferredColorScheme?: 'light' | 'dark' | null
  hideBalance: boolean
  tapToHideNetWorth: boolean
  hideNetWorth: boolean
  displayAllAccounts: boolean
  displayOnlyExpenseCategories: boolean
  displayForeignCurrency: boolean
  useBiometricAuth: boolean
  apiVersion: string
  serverVersion: string
  closeTransactionScreen: boolean
  selectedTheme: string
  selectedBrandStyle: string
}

type FireflyIIIApiResponse = {
  data: unknown,
  meta?: {
    pagination: {
      currentPage: number
      totalPages: number
    }
  },
}

type AboutType = {
  data?: {
    apiVersion: string
    version: string
  }
}

type AboutUserType = {
  data: {
    attributes: {
      email: string
    }
  }
}

const INITIAL_STATE = {
  backendURL: '',
  hideBalance: false,
  tapToHideNetWorth: false,
  hideNetWorth: false,
  displayAllAccounts: false,
  displayOnlyExpenseCategories: false,
  displayForeignCurrency: false,
  useBiometricAuth: false,
  apiVersion: '',
  serverVersion: '',
  closeTransactionScreen: false,
  selectedTheme: 'gradientPurple',
  selectedBrandStyle: colors.brandStyle,
} as ConfigurationStateType;

export default createModel<RootModel>()({

  state: INITIAL_STATE,

  reducers: {
    setCacheIdentity(state, cacheIdentity: string) {
      return { ...state, cacheIdentity };
    },

    setCachedResponse(state, { key, response }) {
      return { ...state, responseCache: cacheResponse(state.responseCache || {}, key, response) };
    },

    setRequestAvailability(state, { key, unavailable }) {
      const requests = { ...state.unavailableRequests };
      if (unavailable) requests[key] = true;
      else delete requests[key];
      return { ...state, unavailableRequests: requests };
    },

    clearResponseCache(state) {
      return { ...state, responseCache: {}, unavailableRequests: {} };
    },

    setBackendURL(state, payload) {
      return {
        ...state,
        backendURL: payload,
        cacheIdentity: undefined,
        unavailableRequests: {},
      };
    },

    setVersions(state, { apiVersion, serverVersion }) {
      return {
        ...state,
        apiVersion,
        serverVersion,
      };
    },

    setUseBiometricAuth(state): ConfigurationStateType {
      return {
        ...state,
        useBiometricAuth: !state.useBiometricAuth,
      };
    },

    setPreferredColorScheme(state, preferredColorScheme: 'light' | 'dark' | null): ConfigurationStateType {
      return { ...state, preferredColorScheme };
    },
    setHideBalance(state, hideBalance: boolean): ConfigurationStateType {
      return {
        ...state,
        hideBalance,
      };
    },

    setTapToHideNetWorth(state, enabled: boolean): ConfigurationStateType {
      return { ...state, tapToHideNetWorth: enabled, hideNetWorth: enabled ? Boolean(state.hideNetWorth) : false };
    },

    toggleNetWorthVisibility(state): ConfigurationStateType {
      if (!state.tapToHideNetWorth || state.hideBalance) return state;
      return { ...state, hideNetWorth: !state.hideNetWorth };
    },

    setDisplayAllAccounts(state, displayAllAccounts: boolean): ConfigurationStateType {
      return {
        ...state,
        displayAllAccounts,
      };
    },

    setDisplayOnlyExpenseCategories(state, displayOnlyExpenseCategories: boolean): ConfigurationStateType {
      return {
        ...state,
        displayOnlyExpenseCategories,
      };
    },

    setDisplayForeignCurrency(state, displayForeignCurrency: boolean): ConfigurationStateType {
      return {
        ...state,
        displayForeignCurrency,
      };
    },

    resetState() {
      return INITIAL_STATE;
    },

    setCloseTransactionScreen(state, closeTransactionScreen: boolean): ConfigurationStateType {
      return {
        ...state,
        closeTransactionScreen,
      };
    },
    setSelectedTheme(state, selectedTheme: string): ConfigurationStateType {
      return {
        ...state,
        selectedTheme,
      };
    },

    setSelectedBrandStyle(state, selectedBrandStyle: string): ConfigurationStateType {
      return {
        ...state,
        selectedBrandStyle,
      };
    },
  },

  effects: (dispatch) => ({

    async apiFetch({ url, config }, rootState): Promise<FireflyIIIApiResponse> {
      const {
        configuration: {
          backendURL,
        },
      } = rootState;

      if (backendURL) {
        // Identity is the authenticated account, so token refreshes retain its cache.
        const identity = rootState.configuration.cacheIdentity;
        const cacheable = Boolean(identity) && url !== '/api/v1/about/user' && !config?.headers?.Authorization;
        const key = JSON.stringify([backendURL, identity, url, config?.params || null]);
        try {
          const response = await axios.get(`${backendURL}${url}`, { timeout: 10000, ...config });
          const result = {
            data: convertKeysToCamelCase(response.data.data ?? response.data),
            meta: convertKeysToCamelCase(response.data.meta),
          };
          if (cacheable) dispatch.configuration.setCachedResponse({ key, response: result });
          dispatch.configuration.setRequestAvailability({ key, unavailable: false });
          return result;
        } catch (error) {
          if (!canUseCache(error)) throw error;
          dispatch.configuration.setRequestAvailability({ key, unavailable: true });
          const cached = cacheable ? cachedResponse(rootState.configuration.responseCache || {}, key) : undefined;
          if (cached) return cached as FireflyIIIApiResponse;
          throw error;
        }
      }

      throw new Error('No backend URL defined.');
    },

    async apiPost({ url, body, config }, rootState): Promise<AxiosResponse> {
      const {
        configuration: {
          backendURL,
        },
      } = rootState;

      if (backendURL) {
        // console.log('POST  ', `${backendURL}${url}`);
        const { data } = await axios.post(`${backendURL}${url}`, body, config);

        return data;
      }

      throw new Error('No backend URL defined.');
    },

    async apiPut({ url, body, config }, rootState): Promise<AxiosResponse> {
      const {
        configuration: {
          backendURL,
        },
      } = rootState;

      if (backendURL) {
        // console.log('PUT  ', `${backendURL}${url}`);
        const { data } = await axios.put(`${backendURL}${url}`, body, config);

        return data;
      }

      throw new Error('No backend URL defined.');
    },

    async apiDelete({ url }, rootState): Promise<AxiosResponse> {
      const {
        configuration: {
          backendURL,
        },
      } = rootState;

      if (backendURL) {
        // console.log('DELETE  ', `${backendURL}${url}`);
        const { data } = await axios.delete(`${backendURL}${url}`);

        return data;
      }

      throw new Error('No backend URL defined.');
    },

    async getCurrentApiVersion(): Promise<void> {
      const { data } = await dispatch.configuration.apiFetch({ url: '/api/v1/about' }) as AboutType;

      if (data.apiVersion && data.version) {
        dispatch.configuration.setVersions({
          apiVersion: data.apiVersion,
          serverVersion: data.version,
        });
      }
    },

    async getCurrentUserEmail(): Promise<string> {
      const { data } = await dispatch.configuration.apiFetch({ url: '/api/v1/about/user' }) as AboutUserType;

      return data.attributes.email;
    },

    async resetAllStates(): Promise<void> {
      dispatch.configuration.clearResponseCache();
      await Promise.all([
        dispatch.accounts.resetState(),
        dispatch.budgets.resetState(),
        dispatch.categories.resetState(),
        dispatch.currencies.resetState(),
        dispatch.firefly.resetState(),
        dispatch.transactions.resetState(),
        dispatch.piggyBanks.resetState(),
      ]);
    },
  }),
});
