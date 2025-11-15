// Send Daily Reminders Edge Function (Cron-triggered)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const EXPO_ACCESS_TOKEN = Deno.env.get('EXPO_PUSH_ACCESS_TOKEN') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const today = now.toISOString().split('T')[0];

    console.log(`Running reminders check at ${currentHour}:${currentMinute}`);

    // ========================================
    // 1. Mood Reminders
    // ========================================
    const { data: moodUsers } = await supabase
      .from('user_notification_settings')
      .select(
        `
        user_id,
        mood_reminder_time,
        users!inner (
          id,
          language
        )
      `
      )
      .eq('mood_reminder_enabled', true)
      .not('mood_reminder_time', 'is', null);

    let moodRemindersSent = 0;

    if (moodUsers) {
      for (const setting of moodUsers) {
        const reminderTime = setting.mood_reminder_time;
        if (!reminderTime) continue;

        const [reminderHour, reminderMinute] = reminderTime.split(':').map(Number);

        // Check if within 15-minute window
        if (
          Math.abs(currentHour - reminderHour) === 0 &&
          Math.abs(currentMinute - reminderMinute) <= 15
        ) {
          // Check if user already logged mood today
          const { data: moodEntry } = await supabase
            .from('mood_entries')
            .select('id')
            .eq('user_id', setting.user_id)
            .gte('created_at', `${today}T00:00:00`)
            .single();

          if (!moodEntry) {
            // User hasn't logged mood today - send reminder
            const userLanguage = setting.users.language || 'he';

            const title =
              userLanguage === 'he' ? 'זמן להתחברות רגשית' : 'Time for a mood check-in';
            const body =
              userLanguage === 'he'
                ? 'איך אתה מרגיש היום? הקדש רגע לעצמך'
                : 'How are you feeling today? Take a moment for yourself';

            // Get user devices
            const { data: devices } = await supabase
              .from('user_devices')
              .select('expo_push_token')
              .eq('user_id', setting.user_id);

            if (devices && devices.length > 0) {
              for (const device of devices) {
                try {
                  await sendPushNotification({
                    to: device.expo_push_token,
                    title,
                    body,
                    data: { url: 'wellness://mood' },
                  });

                  await supabase.from('notification_logs').insert({
                    user_id: setting.user_id,
                    type: 'mood',
                    payload: { title, body },
                    status: 'success',
                  });

                  moodRemindersSent++;
                } catch (error) {
                  await supabase.from('notification_logs').insert({
                    user_id: setting.user_id,
                    type: 'mood',
                    payload: { title, body },
                    status: 'error',
                    error_message: error instanceof Error ? error.message : 'Unknown error',
                  });
                }
              }
            }
          }
        }
      }
    }

    // ========================================
    // 2. Goal Reminders
    // ========================================
    const { data: goalUsers } = await supabase
      .from('user_notification_settings')
      .select(
        `
        user_id,
        goal_reminder_time,
        users!inner (
          id,
          language
        )
      `
      )
      .eq('goal_reminder_enabled', true)
      .not('goal_reminder_time', 'is', null);

    let goalRemindersSent = 0;

    if (goalUsers) {
      for (const setting of goalUsers) {
        const reminderTime = setting.goal_reminder_time;
        if (!reminderTime) continue;

        const [reminderHour, reminderMinute] = reminderTime.split(':').map(Number);

        // Check if within 15-minute window
        if (
          Math.abs(currentHour - reminderHour) === 0 &&
          Math.abs(currentMinute - reminderMinute) <= 15
        ) {
          // Check if user has active goals with upcoming/overdue deadlines
          const { data: upcomingGoals } = await supabase
            .from('user_goals')
            .select('id, title')
            .eq('user_id', setting.user_id)
            .eq('is_completed', false)
            .lte('target_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()); // Next 7 days

          if (upcomingGoals && upcomingGoals.length > 0) {
            const userLanguage = setting.users.language || 'he';

            const title =
              userLanguage === 'he' ? 'תזכורת ליעדים שלך' : 'Reminder about your goals';
            const body =
              userLanguage === 'he'
                ? `יש לך ${upcomingGoals.length} יעדים פעילים לעבוד עליהם`
                : `You have ${upcomingGoals.length} active goals to work on`;

            // Get user devices
            const { data: devices } = await supabase
              .from('user_devices')
              .select('expo_push_token')
              .eq('user_id', setting.user_id);

            if (devices && devices.length > 0) {
              for (const device of devices) {
                try {
                  await sendPushNotification({
                    to: device.expo_push_token,
                    title,
                    body,
                    data: { url: 'wellness://home' },
                  });

                  await supabase.from('notification_logs').insert({
                    user_id: setting.user_id,
                    type: 'goal',
                    payload: { title, body, goal_count: upcomingGoals.length },
                    status: 'success',
                  });

                  goalRemindersSent++;
                } catch (error) {
                  await supabase.from('notification_logs').insert({
                    user_id: setting.user_id,
                    type: 'goal',
                    payload: { title, body },
                    status: 'error',
                    error_message: error instanceof Error ? error.message : 'Unknown error',
                  });
                }
              }
            }
          }
        }
      }
    }

    // ========================================
    // 3. Weekly Summary (runs on configured day)
    // ========================================
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    const { data: weeklyUsers } = await supabase
      .from('user_notification_settings')
      .select(
        `
        user_id,
        weekly_summary_day,
        weekly_summary_time,
        users!inner (
          id,
          language
        )
      `
      )
      .eq('weekly_summary_enabled', true)
      .eq('weekly_summary_day', dayOfWeek)
      .not('weekly_summary_time', 'is', null);

    let weeklySummariesSent = 0;

    if (weeklyUsers) {
      for (const setting of weeklyUsers) {
        const summaryTime = setting.weekly_summary_time;
        if (!summaryTime) continue;

        const [summaryHour, summaryMinute] = summaryTime.split(':').map(Number);

        // Check if within 15-minute window
        if (
          Math.abs(currentHour - summaryHour) === 0 &&
          Math.abs(currentMinute - summaryMinute) <= 15
        ) {
          const userLanguage = setting.users.language || 'he';

          const title =
            userLanguage === 'he' ? 'סיכום שבועי שלך' : 'Your weekly summary';
          const body =
            userLanguage === 'he'
              ? 'בוא נראה את ההתקדמות שלך השבוע'
              : 'Let's review your progress this week';

          // Get user devices
          const { data: devices } = await supabase
            .from('user_devices')
            .select('expo_push_token')
            .eq('user_id', setting.user_id);

          if (devices && devices.length > 0) {
            for (const device of devices) {
              try {
                await sendPushNotification({
                  to: device.expo_push_token,
                  title,
                  body,
                  data: { url: 'wellness://analytics' },
                });

                await supabase.from('notification_logs').insert({
                  user_id: setting.user_id,
                  type: 'weekly_summary',
                  payload: { title, body },
                  status: 'success',
                });

                weeklySummariesSent++;
              } catch (error) {
                await supabase.from('notification_logs').insert({
                  user_id: setting.user_id,
                  type: 'weekly_summary',
                  payload: { title, body },
                  status: 'error',
                  error_message: error instanceof Error ? error.message : 'Unknown error',
                });
              }
            }
          }
        }
      }
    }

    // ========================================
    // 4. Return summary
    // ========================================
    return new Response(
      JSON.stringify({
        message: 'Daily reminders processed',
        mood_reminders_sent: moodRemindersSent,
        goal_reminders_sent: goalRemindersSent,
        weekly_summaries_sent: weeklySummariesSent,
        total_sent: moodRemindersSent + goalRemindersSent + weeklySummariesSent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Daily Reminders Error:', error);

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

// Helper function to send push notifications
async function sendPushNotification(notification: {
  to: string;
  title: string;
  body: string;
  data?: any;
}) {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(EXPO_ACCESS_TOKEN && { 'Authorization': `Bearer ${EXPO_ACCESS_TOKEN}` }),
    },
    body: JSON.stringify({
      to: notification.to,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
    }),
  });

  if (!response.ok) {
    throw new Error(`Push notification failed: ${await response.text()}`);
  }

  return await response.json();
}

