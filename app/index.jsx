import { useState, useEffect, useRef } from "react";
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
            fontSize: width * 0.16, // Responsive font size
            padding: width * 0.05,
            color: "#FFF200",
            marginTop: -height * 0.1,
          }}
          className="font-pextrabold"
        >
          AnimeVerse
        </Text>
        <Text
          style={{
            fontSize: width * 0.15, // Responsive font size
            padding: width * 0.05,
            color: "#FFF200",
            marginTop: -height * 0.1,
          }}
        >
          アニメバース
        </Text>
        <StatusBar style="auto" />
        <Text
          style={{
            fontSize: width * 0.08, // Responsive font size
            textAlign: "center",
            padding: width * 0.02,
            color: "white",
          }}
        >
          Dive into Animeverse: Capture, Explore, and Wear Your Anime Passion!
        </Text>
        <View
          style={{
            borderRadius: 9999,
            backgroundColor: "#FFDB5C",
            marginTop: height * 0.08,
            padding: width * 0.03,
          }}
          className="border-2"
        >
          <TouchableOpacity onPress={handleExploreClick}>
            <Text style={{ fontSize: width * 0.04, color: "#000" }}>
              Explore
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
