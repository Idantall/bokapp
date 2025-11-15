import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ContextType, Language } from '@/types/database';
import { useAuth } from './useAuth';
import { useCurrentUser } from './useCurrentUser';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SendMessageParams {
  message: string;
  contextType: ContextType;
  language: Language;
  lifeAreaId?: string;
  goalId?: string;
}

export function useAIChat() {
  const { user } = useAuth();
  const { user: userData, isPremium } = useCurrentUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);

  const fetchRemainingMessages = async () => {
    if (!user || isPremium) {
      setRemainingMessages(-1); // Unlimited for premium
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_remaining_ai_messages', { p_user_id: user.id });

      if (fetchError) throw fetchError;
      setRemainingMessages(data);
    } catch (err) {
      console.error('Error fetching remaining messages:', err);
    }
  };

  const sendMessage = async ({
    message,
    contextType,
    language,
    lifeAreaId,
    goalId,
  }: SendMessageParams) => {
    if (!user) {
      setError('Not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    // Add user message to UI immediately
    const userMessage: ChatMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('No auth token available');
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            contextType,
            language,
            lifeAreaId,
            goalId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Handle quota exceeded
        if (result.error === 'AI_LIMIT_REACHED') {
          setError('AI_LIMIT_REACHED');
          setRemainingMessages(0);
          return { 
            success: false, 
            error: 'AI_LIMIT_REACHED',
            message: result.message 
          };
        }

        throw new Error(result.error || 'Failed to send message');
      }

      // Add assistant message to UI
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.assistantMessage,
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update remaining messages
      if (result.remainingFreeMessages !== undefined) {
        setRemainingMessages(result.remainingFreeMessages);
      }

      return { 
        success: true, 
        data: result,
        remainingMessages: result.remainingFreeMessages 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    remainingMessages,
    isPremium,
    sendMessage,
    clearMessages,
    fetchRemainingMessages,
  };
}

