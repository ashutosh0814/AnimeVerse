import { Text, View, Image } from "react-native";
import React from "react";
import { Tabs } from "expo-router"; // Assuming Redirect is not used in this component
import { icons } from "../../constants";
import { normalize } from "../responsiveFontSize"; // Adjust the import path as necessary

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        gap: normalize(1),
      }}
    >
      <Image
        source={icon}
        resizeMode="contain"
        style={{
          width: normalize(focused ? 26 : 22),
          height: normalize(focused ? 28 : 24),
        }}
        tintColor={color}
      />
      <Text
        style={{
          fontFamily: focused ? "Poppins-Bold" : "Poppins-Regular",
          fontSize: normalize(10),
          color: focused ? "#850F8D" : "#000000",
        }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FFDB5C",
        },
      }}
    >
      <Tabs.Screen
        name="album"
        options={{
          title: "Album",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.album} name="Album" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="anilist"
        options={{
          title: "Anilist",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.anilist} name="Anilist" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pomodoro"
        options={{
          title: "Animedoro",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.timer} name="Animedoro" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.shop} name="Shop" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
