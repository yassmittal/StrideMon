import { Tabs } from 'expo-router/js-tabs'
import type { ColorValue } from 'react-native'
import { Icon, type IconName } from '../../src/components/ui/Icon'
import { colors, fontFamilies, textStyles } from '../../src/theme'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.overlayOnLight },
        tabBarLabelStyle: {
          ...textStyles.label,
          fontFamily: fontFamilies.medium,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: renderTabIcon('home') }} />
      <Tabs.Screen
        name="sneaker"
        options={{ title: 'Sneaker', tabBarIcon: renderTabIcon('sneaker') }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History', tabBarIcon: renderTabIcon('history') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: renderTabIcon('profile') }}
      />
    </Tabs>
  )
}

/** A line icon in the tab's tint. Without one, the tab bar draws a glyph the font lacks (a box). */
function renderTabIcon(iconName: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Icon name={iconName} color={color} size={size} />
  )
}
