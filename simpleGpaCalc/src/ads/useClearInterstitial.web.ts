// Web stub: ads are native-only; this no-op hook avoids bundling native modules on web.
export const useClearInterstitial = () => ({
  showInterstitialIfReady: () => {},
});
