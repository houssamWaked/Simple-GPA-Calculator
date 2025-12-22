import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { adRequestOptions, adUnitIds } from "./adConfig";

// Native implementation; web uses useClearInterstitial.web.ts stub.
export const useClearInterstitial = () => {
  const interstitialRef = useRef<any>(null);
  const [canShow, setCanShow] = useState(Platform.OS !== "web");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return;

    import("react-native-google-mobile-ads")
      .then((mod) => {
        const { AdEventType, InterstitialAd } = mod;
        if (!InterstitialAd) {
          setCanShow(false);
          return;
        }

        const interstitial = InterstitialAd.createForAdRequest(adUnitIds.interstitial, adRequestOptions);
        interstitialRef.current = interstitial;

        const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => setLoaded(true));
        const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
          setLoaded(false);
          setCanShow(false);
        });

        interstitial.load();

        return () => {
          unsubLoaded();
          unsubClosed();
        };
      })
      .catch(() => {
        setCanShow(false);
      });
  }, []);

  const showInterstitialIfReady = () => {
    if (!canShow || !loaded) return;
    interstitialRef.current?.show();
  };

  return {
    showInterstitialIfReady,
  };
};
