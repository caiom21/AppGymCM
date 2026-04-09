import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from '../../../components/useColorScheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TeacherTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FBFF00',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          height: 92,
          paddingBottom: 32,
          paddingTop: 12,
        },
        headerStyle: {
          backgroundColor: '#0A0A0A',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.08)',
        },
        headerTitleStyle: {
          fontFamily: 'JetBrainsMono_700Bold',
          fontSize: 18,
          color: '#FFFFFF',
          letterSpacing: -0.5,
        },
        tabBarLabelStyle: {
          fontFamily: 'JetBrainsMono_400Regular',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'DASHBOARD',
          tabBarIcon: ({ color }) => <TabBarIcon name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="students/index"
        options={{
          title: 'ALUNOS',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="plans/index"
        options={{
          title: 'PLANOS',
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="sales/index"
        options={{
          title: 'LOJA',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-bag" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PERFIL',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
