import { useEffect, useState } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@/store";

export const useExternalScript = (src: string) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");

    script.src = src;
    script.defer = true;

    document.body.appendChild(script);

    const onLoad = () => {
      setIsReady(true);
    };
    script.addEventListener("load", onLoad);
    return () => {
      document.body.removeChild(script);
      script.removeEventListener("load", onLoad);
    };
  }, [src]);

  return isReady;
};

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
