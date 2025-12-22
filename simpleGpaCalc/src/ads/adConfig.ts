// AdMob configuration (test IDs by default). Replace with production IDs before release.
export const adUnitIds = {
  // Replace with your production unit IDs (kept here for clarity).
  // App ID (for your records): ca-app-pub-5424561542207971~5638601726
  banner: __DEV__
    ? "ca-app-pub-3940256099942544/6300978111" // Google test banner
    : "ca-app-pub-5424561542207971/6584304292", // Your provided banner unit
  interstitial: __DEV__
    ? "ca-app-pub-3940256099942544/1033173712" // Google test interstitial
    : "ca-app-pub-xxxxxxxxxxxxxxxx/interstitial_prod", // TODO: replace with your interstitial ID when created
};

export const adRequestOptions = {
  requestNonPersonalizedAdsOnly: true,
};
