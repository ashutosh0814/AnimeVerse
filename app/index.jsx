import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View, ImageBackground } from "react-native";
import tw from "twrnc";

export default function app() {
  return (
    <ImageBackground
      source={require("../assets/images/logo.jpg")}
      style={tw`flex-1`}
    >
      <View style={tw`flex-1 items-center justify-center`}>
        <Text style={tw`text-7xl p-3`} className="font-pblack text-yellow-50 -mt-30">
          AnimeVerse
        </Text>
        <StatusBar style="auto" />
        <Text className="font-pregular text-[#BFF6C3] text-xl text-center p-2">Dive into Animeverse: Capture, Explore, and Wear Your Anime Passion!</Text>
        <View className=" rounded-full bg-yellow-400 mt-3">
        <Link href="/album" className="text-sm text-black p-3">
          Click to Explore  
        </Link>
        </View>
      </View>
    </ImageBackground>
  );
}
