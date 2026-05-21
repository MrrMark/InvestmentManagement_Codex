import { Tabs } from 'expo-router';
import React from 'react';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeName = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[themeName].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '대시보드',
          tabBarAccessibilityLabel: '대시보드 탭',
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              size={26}
              name="dashboard"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="snapshots"
        options={{
          title: '스냅샷',
          tabBarAccessibilityLabel: '스냅샷 탭',
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              size={26}
              name="list-alt"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '추가',
          tabBarAccessibilityLabel: '추가 탭',
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              size={26}
              name="add-circle-outline"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: '비교',
          tabBarAccessibilityLabel: '비교 탭',
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              size={26}
              name="compare-arrows"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
