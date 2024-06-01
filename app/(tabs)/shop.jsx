import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { normalize } from '../responsiveFontSize'; // Adjust the import path as necessary

// Import the image from the assets folder
import backgroundImage from "../../assets/images/shop2.jpg";

const Shop = () => {
  return (
    <SafeAreaView style={tw`flex-1`}>
      <ImageBackground 
        source={backgroundImage} 
        style={tw`flex-1 justify-center items-center w-full h-full`}
      >
        <View style={tw`bg-black bg-opacity-70 px-6 py-4 md:px-8 md:py-6 lg:px-10 lg:py-8 rounded-lg`}>
          <Text className="font-psemibold" style={[tw`text-white`, { fontSize: normalize(36) }]}>
            Opening Soon
          </Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

export default Shop;
