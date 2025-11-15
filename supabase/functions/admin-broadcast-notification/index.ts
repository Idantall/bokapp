// Admin Broadcast Notification Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const EXPO_ACCESS_TOKEN = Deno.env.get('EXPO_PUSH_ACCESS_TOKEN') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BroadcastRequest {
  titleEn: string;
  titleHe: string;
  bodyEn: string;
  bodyHe: string;
  segment: 'all' | 'inactive_last_7_days' | 'no_mood_today' | 'premium_only' | 'free_only';
  deepLink?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user ID from JWT
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body: BroadcastRequest = await req.json();
    const { titleEn, titleHe, bodyEn, bodyHe, segment, deepLink } = body;

    if (!titleEn || !titleHe || !bodyEn || !bodyHe || !segment) {
      throw new Error('Missing required fields');
    }

    // ========================================
    // 1. Select target users based on segment
    // ========================================
    let targetUserIds: string[] = [];

    switch (segment) {
      case 'all': {
        const { data: users } = await supabase.from('users').select('id');
        targetUserIds = users?.map((u) => u.id) || [];
        break;
      }

      case 'free_only': {
        const { data: users } = await supabase
          .from('users')
          .select('id')
          .eq('plan', 'free');
        targetUserIds = users?.map((u) => u.id) || [];
        break;
      }

      case 'premium_only': {
        const { data: users } = await supabase
          .from('users')
          .select('id')
          .eq('plan', 'premium');
        targetUserIds = users?.map((u) => u.id) || [];
        break;
      }

      case 'inactive_last_7_days': {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Users who haven't had any mood entries in last 7 days
        const { data: users } = await supabase.from('users').select('id').not('id', 'in', `(
          SELECT DISTINCT user_id
          FROM mood_entries
          WHERE created_at >= '${sevenDaysAgo.toISOString()}'
        )`);
        targetUserIds = users?.map((u) => u.id) || [];
        break;
      }

      case 'no_mood_today': {
        const today = new Date().toISOString().split('T')[0];

        // Users who haven't logged mood today
        const { data: users } = await supabase.from('users').select('id').not('id', 'in', `(
          SELECT DISTINCT user_id
          FROM mood_entries
          WHERE DATE(created_at) = '${today}'
        )`);
        targetUserIds = users?.map((u) => u.id) || [];
        break;
      }
    }

    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No users match the selected segment',
          recipients_count: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ========================================
    // 2. Get users with their languages and device tokens
    // ========================================
    const { data: usersWithDevices } = await supabase
      .from('users')
      .select(
        `
        id,
        language,
        user_devices (expo_push_token)
      `
      )
      .in('id', targetUserIds);

    // ========================================
    // 3. Build notification messages per language
    // ========================================
    const messages: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithDevices || []) {
      const userLanguage = user.language || 'he';
      const title = userLanguage === 'he' ? titleHe : titleEn;
      const body = userLanguage === 'he' ? bodyHe : bodyEn;

      // Get all devices for this user
      const devices = user.user_devices || [];

      for (const device of devices) {
        if (!device.expo_push_token) continue;

        messages.push({
          to: device.expo_push_token,
          sound: 'default',
          title,
          body,
          data: {
            url: deepLink || 'wellness://home',
            segment,
          },
        });
      }
    }

    // ========================================
    // 4. Send notifications via Expo Push API
    // ========================================
    if (messages.length > 0) {
      const chunkSize = 100; // Expo accepts up to 100 notifications per request
      const chunks = [];

      for (let i = 0; i < messages.length; i += chunkSize) {
        chunks.push(messages.slice(i, i + chunkSize));
      }

      for (const chunk of chunks) {
        try {
          const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              ...(EXPO_ACCESS_TOKEN && { 'Authorization': `Bearer ${EXPO_ACCESS_TOKEN}` }),
            },
            body: JSON.stringify(chunk),
          });

          if (response.ok) {
            const result = await response.json();
            successCount += result.data?.filter((r: any) => r.status === 'ok').length || 0;
            errorCount += result.data?.filter((r: any) => r.status === 'error').length || 0;
          } else {
            errorCount += chunk.length;
          }
        } catch (error) {
          console.error('Push notification error:', error);
          errorCount += chunk.length;
        }
      }
    }

    // ========================================
    // 5. Log broadcast to database
    // ========================================
    await supabase.from('admin_broadcasts').insert({
      admin_user_id: user.id,
      segment,
      title_en: titleEn,
      title_he: titleHe,
      body_en: bodyEn,
      body_he: bodyHe,
      deep_link: deepLink,
      payload: { segment, deepLink },
      recipients_count: targetUserIds.length,
      success_count: successCount,
      error_count: errorCount,
    });

    // ========================================
    // 6. Return response
    // ========================================
    return new Response(
      JSON.stringify({
        message: 'Broadcast sent successfully',
        recipients_count: targetUserIds.length,
        notifications_sent: messages.length,
        success_count: successCount,
        error_count: errorCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Admin Broadcast Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

