import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'he' ? 'en' : 'he';
    await i18n.changeLanguage(newLang);
  };

  const isHebrew = i18n.language === 'he';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isHebrew && styles.buttonActive]}
        onPress={() => !isHebrew && toggleLanguage()}
      >
        <Text style={[styles.buttonText, isHebrew && styles.buttonTextActive]}>עב</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, !isHebrew && styles.buttonActive]}
        onPress={() => isHebrew && toggleLanguage()}
      >
        <Text style={[styles.buttonText, !isHebrew && styles.buttonTextActive]}>EN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.button,
    padding: 4,
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.button - 4,
  },
  buttonActive: {
    backgroundColor: colors.bgCard,
  },
  buttonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: colors.textPrimary,
  },
});

