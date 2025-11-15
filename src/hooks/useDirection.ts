import { useMemo } from 'react';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';

export function useDirection() {
  const { i18n } = useTranslation();
  
  const isRTL = useMemo(() => {
    return i18n.language === 'he';
  }, [i18n.language]);

  const direction = isRTL ? 'rtl' : 'ltr';
  
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  
  const textAlign = isRTL ? 'right' : 'left';
  
  const alignSelf = isRTL ? 'flex-end' : 'flex-start';

  // Force RTL layout if needed
  const forceRTL = (shouldBeRTL: boolean) => {
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
      // Note: Requires app restart on native
    }
  };

  return {
    isRTL,
    direction,
    rowDirection,
    textAlign,
    alignSelf,
    forceRTL,
  };
}

