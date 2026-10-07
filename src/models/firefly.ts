import { createModel } from '@rematch/core';
import moment from 'moment';
import { exchangeCodeAsync, refreshAsync } from 'expo-auth-session';
import { maxBy, minBy } from 'lodash';
import semver from 'semver';
import axios from 'axios';
import periodBounds from '../lib/period';
import {
  discovery, redirectUri, addCredential, replaceAccessToken,
} from '../lib/oauth';
import colors from '../constants/colors';
import { RootModel } from './index';
import { generateRangeTitle } from '../lib/common';
import { AccountType } from './accounts';
import { TCredential } from '../types/credential';

export type HomeDisplayType = {
  title: string;
  valueParsed: string;
  monetaryValue: string;
  currencyCode: string;
};

export type AssetAccountType = {
  title: string;
  label: string;
  currencyCode: string;
  currencySymbol: string;
  valueParsed: string;
  color: string;
  colorScheme: string;
  entries: { x: number; y: number }[];
  maxY: number;
  minY: number;
};

export type BalanceType = {
  label: 'earned' | 'spent';
  currencyCode: string;
  entries: { [timestamp: string]: string }[];
};

export type FireflyStateType = {
  rangeDetails: RangeDetailsType;
  netWorth: HomeDisplayType[];
  spent: HomeDisplayType[];
  earned: HomeDisplayType[];
  balance: HomeDisplayType[];
  accounts: AssetAccountType[];
  bills: { paid: HomeDisplayType | null; unpaid: HomeDisplayType | null };
  earnedChart: { x: number; y: number }[];
  spentChart: { x: number; y: number }[];
};

export type RangeDetailsType = {
  title: string;
  range: number;
  start: string;
  end: string;
};

const INITIAL_STATE = {
  rangeDetails: {
    title: generateRangeTitle(
      1,
      moment().startOf('month').format('YYYY-MM-DD'),
      moment().endOf('month').format('YYYY-MM-DD'),
    ),
    range: 1,
    start: moment().startOf('month').format('YYYY-MM-DD'),
    end: moment().endOf('month').format('YYYY-MM-DD'),
  },
  netWorth: [],
  spent: [],
  earned: [],
  balance: [],
  accounts: [],
  earnedChart: [],
  spentChart: [],
  bills: { paid: null, unpaid: null },
} as FireflyStateType;

export default createModel<RootModel>()({
  state: INITIAL_STATE,

  reducers: {
    setData(state, payload) {
      const {
        netWorth = state.netWorth,
        balance = state.balance,
        spent = state.spent,
        earned = state.earned,
        accounts = state.accounts,
        earnedChart = state.earnedChart,
        spentChart = state.spentChart,
        bills = state.bills,
      } = payload;

      return {
        ...state,
        netWorth,
        balance,
        spent,
        earned,
        accounts,
        earnedChart,
        spentChart,
        bills,
      };
    },

    setRangeDetails(state, rangeDetails: RangeDetailsType) {
      return {
        ...state,
        rangeDetails,
      };
    },

    resetState() {
      return INITIAL_STATE;
    },
  },

  effects: (dispatch) => ({
    async setRange(payload, rootState): Promise<void> {
      const {
        firefly: {
          rangeDetails: { range: oldRange, start: oldStart },
        },
      } = rootState;
      const { range = oldRange, direction } = payload;

      const rangeInt = [1, 3, 6, 12].includes(Number(range)) ? Number(range) : 1;
      const selectedAnchor = payload.monthStart && moment(payload.monthStart, 'YYYY-MM-DD', true).isValid()
        ? moment(payload.monthStart) : direction !== undefined ? moment(oldStart).add(direction > 0 ? rangeInt : -rangeInt, 'months') : moment();
      const { start, end } = periodBounds(selectedAnchor.toDate(), rangeInt);

      const title: string = generateRangeTitle(rangeInt, start, end);

      // console.log('RANGE', range, title);
      // console.log('DATE', start, end);

      dispatch.firefly.setRangeDetails({
        title,
        range: rangeInt,
        start,
        end,
      });
    },

    async getNetWorth(_: void, rootState): Promise<void> {
      const {
        firefly: {
          rangeDetails: { start, end },
        },
        currencies: { currentCode },
      } = rootState;
      if (currentCode) {
        const params = new URLSearchParams({
          start,
          end,
          currency_code: currentCode,
        });
        const { data: summary } = await dispatch.configuration.apiFetch({
          url: `/api/v1/summary/basic?${params.toString()}`,
        });
        const netWorth = [];
        const balance = [];
        const earned = [];
        const spent = [];
        const bills = { paid: null, unpaid: null };
        Object.keys(summary).forEach((key) => {
          if (key.includes(`net-worth-in-${currentCode}`)) {
            netWorth.push(summary[key]);
          }
          if (key.includes(`balance-in-${currentCode}`)) {
            balance.push(summary[key]);
          }
          if (key.includes(`earned-in-${currentCode}`)) {
            earned.push(summary[key]);
          }
          if (key.includes(`spent-in-${currentCode}`)) {
            spent.push(summary[key]);
          }
          if (key.includes(`bills-paid-in-${currentCode}`)) {
            bills.paid = summary[key];
          }
          if (key.includes(`bills-unpaid-in-${currentCode}`)) {
            bills.unpaid = summary[key];
          }
        });

        dispatch.firefly.setData({
          netWorth,
          balance,
          earned,
          spent,
          bills,
        });
      }
    },

    async getAccountChart(_: void, rootState): Promise<void> {
      const {
        firefly: {
          rangeDetails: { range, start, end },
        },
        currencies: { currentCode },
        configuration: { selectedBrandStyle, displayAllAccounts },
      } = rootState;

      const { data: accounts } = (await dispatch.configuration.apiFetch({
        url: `/api/v1/chart/account/overview?start=${start}&end=${end}&preselected=${displayAllAccounts ? 'all' : ''}`,
      })) as { data: AssetAccountType[] };
      let colorIndex = 0;

      accounts
        .forEach((v, index) => {
          if (index === 0) {
            accounts[index].color = selectedBrandStyle;
          } else {
            if (colorIndex >= 6) {
              colorIndex = 0;
            }
            accounts[index].color = colors[`brandStyle${colorIndex}`];
            colorIndex += 1;
          }
          accounts[index].entries = range > 3
            ? Object.keys(v.entries)
              .filter((e, i) => i % 2 === 0)
              .filter((e, i) => i % 2 === 0)
              .filter((e, i) => i % 2 === 0)
              .map((key) => {
                const value = parseFloat(accounts[index].entries[key]);
                const date = new Date(key);

                return {
                  x: +date,
                  y: value,
                };
              })
            : Object.keys(v.entries).map((key) => {
              const value = parseFloat(accounts[index].entries[key]);
              const date = new Date(key);

              return {
                x: +date,
                y: value,
              };
            });
          accounts[index].maxY = maxBy(
            accounts[index].entries,
            (o: { x: number; y: number }) => o.y,
          ).y;
          accounts[index].minY = minBy(
            accounts[index].entries,
            (o: { x: number; y: number }) => o.y,
          ).y;
        });

      dispatch.firefly.setData({ accounts: accounts.filter((account) => account.currencyCode === currentCode) });
    },

    async getBalanceChart(_: void, rootState): Promise<void> {
      const {
        firefly: {
          rangeDetails: { start, end },
        },
        currencies: { currentCode },
        configuration: { apiVersion },
      } = rootState;
      try {
        const apiSemverMinimum = '2.0.9';
        const { data: accounts } = (await dispatch.configuration.apiFetch({
          url: `/api/v1/accounts?type=asset&date=${end}`,
        })) as { data: AccountType[] };
        if (semver.valid(apiVersion) && (!semver.gte(apiVersion, apiSemverMinimum) || accounts.length === 0)) {
          this.setData({ earnedChart: [], spentChart: [] });
          return;
        }

        const accountIdsParam = accounts.map((a) => a.id).join('&filter[accounts][]=');
        const endpoint = semver.gte(apiVersion, '6.3.0') ? '/api/v1/chart/balance/balance' : '/api/v2/chart/balance/balance';
        const { data: balances } = (await dispatch.configuration.apiFetch({ url: `${endpoint}?start=${start}&end=${end}&filter[accounts][]=${accountIdsParam}` })) as { data: BalanceType[] };

        const earnedChartEntries = balances.filter((balance) => balance.currencyCode === currentCode && balance.label === 'earned')[0]?.entries;

        if (earnedChartEntries) {
          this.setData({
            earnedChart: Object.keys(earnedChartEntries).map((key) => {
              const value = parseFloat(earnedChartEntries[key]);

              return {
                x: key,
                y: value,
              };
            }),
          });
        } else {
          this.setData({ earnedChart: [] });
        }

        const spentChartEntries = balances.filter((balance) => balance.currencyCode === currentCode && balance.label === 'spent')[0]?.entries;

        if (spentChartEntries) {
          this.setData({
            spentChart: Object.keys(spentChartEntries).map((key) => {
              const value = parseFloat(spentChartEntries[key]);

              return {
                x: key,
                y: value,
              };
            }),
          });
        } else {
          this.setData({ spentChart: [] });
        }
      } catch (error) {
        this.setData({ earnedChart: [], spentChart: [] });
      }
    },

    async getFreshAccessToken(credential: TCredential): Promise<void> {
      const response = await refreshAsync(
        {
          clientId: credential.oauthClientId,
          refreshToken: credential.refreshToken,
          extraParams: {
            client_secret: credential.oauthClientSecret,
          },
        },
        discovery(credential.backendURL),
      );

      if (!response.accessToken) {
        throw new Error(
          'Failed to get accessToken with the refresh token. Please restart the Sign In process.',
        );
      }

      const newCredential = { ...credential };
      newCredential.accessToken = response.accessToken;
      newCredential.refreshToken = response.refreshToken;
      newCredential.accessTokenExpiresIn = response.issuedAt && response.expiresIn
        ? (response.issuedAt + response.expiresIn + -600).toString()
        : '';
      await replaceAccessToken(newCredential);

      // set backend url and access token for this session
      axios.defaults.headers.Authorization = `Bearer ${response.accessToken}`;
    },

    async getNewAccessToken(payload): Promise<void> {
      const {
        backendURL,
        oauthClientId,
        oauthClientSecret,
        codeVerifier,
        code,
      } = payload;

      const response = await exchangeCodeAsync(
        {
          clientId: oauthClientId,
          redirectUri,
          code,
          extraParams: {
            client_secret: oauthClientSecret,
            code_verifier: codeVerifier,
          },
        },
        discovery(backendURL),
      );

      if (!response.accessToken) {
        throw new Error('Please check Oauth Client ID / Secret.');
      }

      // test personal token and get user email
      axios.defaults.headers.Authorization = `Bearer ${response.accessToken}`;
      dispatch.configuration.setBackendURL(backendURL);
      const email = await dispatch.configuration.getCurrentUserEmail();

      const credential: TCredential = {
        email,
        backendURL,
        accessToken: response.accessToken,
        accessTokenExpiresIn:
          response.issuedAt && response.expiresIn
            ? (response.issuedAt + response.expiresIn + -600).toString()
            : '',
        oauthClientId,
        oauthClientSecret,
        refreshToken: response.refreshToken,
      };

      await addCredential(credential);
    },
  }),
});
