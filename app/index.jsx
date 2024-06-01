import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import tw from "twrnc";
import { SafeAreaView } from "react-native-safe-area-context";
import { normalize } from './responsiveFontSize'; // Adjust the import path as necessary

const { width, height } = Dimensions.get("window");

export default function App() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    require("../assets/images/logo7.jpg"),
    require("../assets/images/logo8.jpg"),
    require("../assets/images/logo9.jpg"),
    require("../assets/images/logo6.jpg"),
    require("../assets/images/logo11.jpg"),
    require("../assets/images/logo12.jpg"),
  ];

  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(animation, {
        toValue: -width,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        animation.setValue(0);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [animation]);

  const handleExploreClick = () => {
    router.replace("/album");
  };

  return (
    <SafeAreaView className="h-full w-full">
      <View style={tw`flex-1`}>
        <Animated.View
          style={{
            ...tw`absolute w-full h-full`,
            transform: [{ translateX: animation }],
          }}
        >
          <Image
            source={images[(currentImageIndex + 1) % images.length]}
            style={tw`absolute w-full h-full`}
            resizeMode="cover"
          />
        </Animated.View>
        <Image
          source={images[currentImageIndex]}
          style={tw`absolute w-full h-full`}
          resizeMode="cover"
          className="bg-slate-900 opacity-60"
        />

        <View style={tw`flex-1 items-center justify-center`}>
          <Text
            style={{
              fontSize: normalize(50), // Adjusted font size using normalize
              padding: normalize(5), // Adjusted padding using normalize
              color: "#FFF200",
              
            }}
            className="font-pextrabold"
          >
            AnimeVerse
          </Text>
          <Text
            style={{
              fontSize: normalize(46), // Adjusted font size using normalize
              padding: normalize(10), // Adjusted padding using normalize
              color: "#41B06E",
              fontWeight: "600",
            }}
            className="font-pextrabold"
          >
            アニメバース
          </Text>
          <StatusBar style="auto" />
          <Text
            style={{
              fontSize: normalize(26), // Adjusted font size using normalize
              textAlign: "center",
              padding: normalize(5), // Adjusted padding using normalize
              color: "white",
            }}
            className="font-pmedium"
          >
            Dive into Animeverse: Capture, Explore, and Wear Your Anime Passion!
          </Text>
          <View
            style={{
              borderRadius: 9999,
              backgroundColor: "#FFDB5C",
              marginTop: height * 0.08,
              padding: normalize(8), // Adjusted padding using normalize
            }}
            className="border-2"
          >
            <TouchableOpacity onPress={handleExploreClick}>
              <Text style={{ fontSize: normalize(16), color: "#000" }}>
                Explore
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
