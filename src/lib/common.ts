import { useSelector } from 'react-redux';
import { Dimensions, Platform, useColorScheme } from 'react-native';
import { getLocales } from 'expo-localization';
import moment from 'moment/moment';
import type { RootState } from '../store';
import colors from '../constants/colors';
import translate from '../i18n/locale';
import { TCredential } from '../types/credential';

export const { height: D_HEIGHT, width: D_WIDTH } = (() => {
  const { width, height } = Dimensions.get('window');
  if (width === 0 && height === 0) {
    return Dimensions.get('screen');
  }
  return { width, height };
})();

const LG_HEIGHT = 900;
const MD_HEIGHT = 800;
const XS_HEIGHT = 690;

export const isSmallScreen = () => {
  if (Platform.OS === 'web') {
    return false;
  }

  return (Platform.OS === 'ios' && D_HEIGHT < XS_HEIGHT && D_WIDTH);
};

export const isMediumScreen = () => {
  if (Platform.OS === 'web') {
    return false;
  }

  return (Platform.OS === 'ios' && D_HEIGHT > MD_HEIGHT && D_HEIGHT < LG_HEIGHT);
};

export const isLargeScreen = () => {
  if (Platform.OS === 'web') {
    return false;
  }

  return (Platform.OS === 'ios' && D_HEIGHT > LG_HEIGHT);
};

export const isValidHttpUrl = (string) => {
  const pattern = new RegExp('^(https?:\\/\\/)' // protocol
    + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // domain name
    + '((\\d{1,3}\\.){3}\\d{1,3})|' // OR ip (v4) address
    + '([a-z\\d]([a-z\\d-]*[a-z\\d])*))' // OR just domain name without .tld
    + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // port and path
    + '(\\?[;&a-z\\d%_.~+=-]*)?' // query string
    + '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!pattern.test(string);
};

export const isValidCredential = (credential: TCredential) => isValidHttpUrl(credential.backendURL) && credential.accessToken;

export const localNumberFormat = (currencyCode: string, num: number | bigint) => {
  const [locale] = getLocales();
  const subLocales = ['CA', 'IN'];
  const formatter = new Intl.NumberFormat(subLocales.some((substring) => locale.languageTag.includes(substring)) ? locale.languageTag : locale.languageCode, {
    style: 'currency',
    currency: currencyCode || 'USD',
  });

  return formatter.format(num);
};

export const useThemeColors = () => {
  const systemScheme = useColorScheme();
  const preferredScheme = useSelector((state: RootState) => state.configuration.preferredColorScheme);
  const colorScheme = preferredScheme || systemScheme || 'light';

  return {
    colors: { ...colors, ...colors[colorScheme] },
    colorScheme,
  };
};

const hexToRgb = (hexColor: string): number[] | null => {
  const hex = (hexColor || '').replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) {
    return null;
  }
  return [0, 2, 4].map((i) => parseInt(hex.substring(i, i + 2), 16));
};

const relativeLuminance = ([r, g, b]: number[]): number => {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const contrastRatio = (a: number[], b: number[]): number => {
  const [high, low] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

// Text color to draw on top of the given hex color: white by default,
// black when white would fall below 3:1 (light accents such as yellow or mint).
export const getContrastTextColor = (hexColor: string): 'black' | 'white' => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) {
    return 'white';
  }
  return contrastRatio(rgb, [255, 255, 255]) >= 3 ? 'white' : 'black';
};

// Accent color usable as text/icon on the given background: the accent itself when it
// already reaches 4.5:1, otherwise mixed towards white (dark bg) or black (light bg) until it does.
export const getReadableAccent = (accent: string, background: string): string => {
  const fg = hexToRgb(accent);
  const bg = hexToRgb(background);
  if (!fg || !bg) {
    return accent;
  }
  const target = relativeLuminance(bg) < 0.5 ? 255 : 0;
  for (let step = 0; step <= 10; step += 1) {
    const mixed = fg.map((c) => Math.round(c + (target - c) * (step / 10)));
    if (contrastRatio(mixed, bg) >= 4.5) {
      return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
    }
  }
  return accent;
};

export const useBrandStyle = () => {
  const { colors: themeColors } = useThemeColors();
  const brandStyle = useSelector((state: RootState) => state.configuration.selectedBrandStyle || themeColors.brandStyle);

  return {
    brandStyle,
    brandStyleText: getReadableAccent(brandStyle, themeColors.backgroundColor),
    brandStyleContrast: getContrastTextColor(brandStyle),
  };
};

export const generateRangeTitle = (range: number, start: string, end: string): string => {
  let title = '';

  switch (range) {
    case 1:
      title = `${moment(end).format('MMM')} ${moment(end).year()}`;
      break;
    case 3:
      title = `${translate('home_header_time_range_q')}${moment(start).quarter()} ${moment(start).year()}`;
      break;
    case 6:
      title = `${translate('home_header_time_range_s')}${moment(start).quarter() < 3 ? 1 : 2} ${moment(start).year()}`;
      break;
    case 12:
      title = `${moment(start).year()}`;
      break;
    default:
      title = `${moment(start).year()}`;
      break;
  }

  return title;
};

const snakeToCamel = (str) => str.replace(/(_\w)/g, (match) => match[1].toUpperCase());

export const convertKeysToCamelCase = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => convertKeysToCamelCase(item));
  }
  if (typeof data === 'object' && data !== null) {
    const camelCaseData = {};
    Object.keys(data).forEach((key) => {
      if (Object.hasOwn(data, key)) {
        const camelKey = snakeToCamel(key);
        if (typeof data[key] === 'object' && data[key] !== null) {
          camelCaseData[camelKey] = convertKeysToCamelCase(data[key]);
        } else {
          camelCaseData[camelKey] = data[key];
        }
      }
    });

    return camelCaseData;
  }

  return data;
};
