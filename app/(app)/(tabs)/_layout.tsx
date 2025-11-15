import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/lib/theme';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandOrange,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.divider,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home', 'Home'),
          tabBarIcon: ({ color }) => <TabIcon name="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mood"
        options={{
          title: t('tabs.mood', 'Mood'),
          tabBarIcon: ({ color }) => <TabIcon name="😊" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: t('tabs.ai', 'AI Coach'),
          tabBarIcon: ({ color }) => <TabIcon name="🤖" color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('tabs.analytics', 'Analytics'),
          tabBarIcon: ({ color }) => <TabIcon name="📊" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile', 'Profile'),
          tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name }: { name: string; color: string }) {
  return <Text style={{ fontSize: 24 }}>{name}</Text>;
}

