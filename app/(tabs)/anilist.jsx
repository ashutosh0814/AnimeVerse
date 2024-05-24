import React, { useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import SearchAnime from "../screens/SearchAnime";
import Watched from "../screens/Watched";
import Watchlist from "../screens/Watchlist";
import { SafeAreaView } from "react-native-safe-area-context";


const Tab = createMaterialTopTabNavigator();

export default function anilist() {
  const [watched, setWatched] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  return (
    <SafeAreaView className="h-full">
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { backgroundColor: "#fff" },
      }}
    >
      <Tab.Screen name="SearchAnime">
        {() => (
          <SearchAnime
            watched={watched}
            setWatched={setWatched}
            watchlist={watchlist}
            setWatchlist={setWatchlist}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Watched">
        {() => <Watched watched={watched} />}
      </Tab.Screen>
      <Tab.Screen name="Watchlist">
        {() => <Watchlist watchlist={watchlist} />}
      </Tab.Screen>
    </Tab.Navigator>
    </SafeAreaView>
  );
}
