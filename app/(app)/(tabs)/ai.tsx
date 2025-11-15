import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAIChat } from '@/hooks/useAIChat';
import { useDirection } from '@/hooks/useDirection';

export default function AIScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isRTL } = useDirection();
  const { messages, loading, remainingMessages, isPremium, sendMessage, fetchRemainingMessages } = useAIChat();

  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchRemainingMessages();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const message = input;
    setInput('');

    const result = await sendMessage({
      message,
      contextType: 'general',
      language: i18n.language as 'he' | 'en',
    });

    if (result.error === 'AI_LIMIT_REACHED') {
      router.push('/(app)/paywall');
    }

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScreenHeader
        title={t('ai.title', 'AI Wellness Coach')}
        subtitle={
          isPremium
            ? t('ai.unlimited', 'Unlimited messages')
            : t('ai.remaining', `${remainingMessages ?? '...'} messages left today`)
        }
        rightAction={
          !isPremium && (
            <TouchableOpacity onPress={() => router.push('/(app)/paywall')}>
              <Text style={styles.upgradeText}>💎</Text>
            </TouchableOpacity>
          )
        }
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🤖</Text>
            <Text style={styles.emptyTitle}>{t('ai.welcome', 'Hi! I\'m your AI Wellness Coach')}</Text>
            <Text style={styles.emptyText}>
              {t('ai.intro', 'Ask me anything about your wellness journey, goals, or life balance.')}
            </Text>

            <View style={styles.suggestions}>
              <TouchableOpacity
                style={[styles.suggestionButton, shadows.sm]}
                onPress={() => setInput(t('ai.suggestion1', 'How can I improve my work-life balance?'))}
              >
                <Text style={styles.suggestionText}>{t('ai.suggestion1', 'How can I improve my work-life balance?')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.suggestionButton, shadows.sm]}
                onPress={() => setInput(t('ai.suggestion2', 'Help me set a health goal'))}
              >
                <Text style={styles.suggestionText}>{t('ai.suggestion2', 'Help me set a health goal')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              message.role === 'user' && isRTL && styles.userBubbleRTL,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.role === 'user' && styles.userMessageText,
                { textAlign: message.role === 'user' && isRTL ? 'right' : 'left' },
              ]}
            >
              {message.content}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <Text style={styles.messageText}>...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputContainer, shadows.lg]}>
        {!isPremium && remainingMessages === 0 && (
          <TouchableOpacity style={styles.limitBanner} onPress={() => router.push('/(app)/paywall')}>
            <Text style={styles.limitText}>
              {t('ai.limitReached', 'Daily limit reached. Upgrade for unlimited access! 💎')}
            </Text>
          </TouchableOpacity>
        )}
        <View style={[styles.inputRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TextInput
            style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={t('ai.placeholder', 'Ask me anything...')}
            placeholderTextColor={colors.textTertiary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendButtonText}>{isRTL ? '←' : '→'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  suggestions: {
    width: '100%',
    gap: spacing.md,
  },
  suggestionButton: {
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  suggestionText: {
    ...typography.body,
    color: colors.brandOrange,
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brandOrange,
  },
  userBubbleRTL: {
    alignSelf: 'flex-start',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgCard,
  },
  messageText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  userMessageText: {
    color: colors.white,
  },
  inputContainer: {
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    padding: spacing.md,
  },
  limitBanner: {
    backgroundColor: colors.brandOrange + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  limitText: {
    ...typography.caption,
    color: colors.brandOrange,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputRow: {
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.brandOrange,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  upgradeText: {
    fontSize: 24,
  },
});

