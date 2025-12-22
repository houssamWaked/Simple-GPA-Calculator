import React, { useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { adRequestOptions, adUnitIds } from "./adConfig";

type Props = {
  style?: object;
};

// Safe, low-impact banner. Intended for placement at the bottom of Cumulative or Settings screens.
export const BannerAdView = ({ style }: Props) => {
  const [node, setNode] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      setNode(null);
      return;
    }

    import("react-native-google-mobile-ads")
      .then(({ BannerAd, BannerAdSize }) => {
        setNode(
          <BannerAd
            unitId={adUnitIds.banner}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={adRequestOptions}
            // Do nothing on failure; app should continue seamlessly.
            onAdFailedToLoad={() => {}}
            style={[styles.banner, style]}
          />,
        );
      })
      .catch(() => {
        setNode(null);
      });
  }, [style]);

  return node as React.ReactElement | null;
};

const styles = StyleSheet.create({
  banner: {
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
});
