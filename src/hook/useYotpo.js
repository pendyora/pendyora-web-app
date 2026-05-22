import { useCallback, useEffect, useState } from 'react';

export default function useYotpo(appKey, product = {}) {
  useEffect(() => {
    const yotpoScript = document.querySelector('[data-script="yotpo"]');
    if (yotpoScript) {
      yotpoScript.remove();
    }
    injectScript(appKey);
  }, [appKey, product, product?.code]);
}

function injectScript(appKey) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://cdn-widgetsrepository.yotpo.com/v1/loader/${appKey}`;
  script.dataset.script = 'yotpo';

  document.head.append(script);
}

export const YotpoReviewsRefresh = () => {
  const initWidgets = () => {
    window.yotpoWidgetsContainer.initWidgets();
  };

  setTimeout(() => window.yotpoWidgetsContainer.initWidgets(), 3210);

  return;
};
