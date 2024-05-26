import React, { useState } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Button,
} from "react-native";
import tw from "twrnc";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Watchlist = ({ watchlist, setWatchlist }) => {
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = (anime) => {
    setSelectedAnime(anime);
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
    setSelectedAnime(null);
  };

  const deleteFromWatchlist = async (anime) => {
    const updatedWatchlist = watchlist.filter(
      (item) => item.mal_id !== anime.mal_id
    );
    setWatchlist(updatedWatchlist);
    try {
      await AsyncStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
    } catch (error) {
      console.error("Error updating AsyncStorage:", error);
    }
    hideModal();
  };

  return (
    <SafeAreaView style={tw`h-full`}>
      <View style={tw`flex-1 p-4`}>
        <FlatList
          data={watchlist}
          keyExtractor={(item) => item.mal_id?.toString() || item.id?.toString()}
          renderItem={({ item }) => (
            item.mal_id && (
              <View style={tw`flex-row p-2 border-b items-center`}>
                <Image
                  source={{ uri: item.images.jpg.image_url }}
                  style={tw`w-16 h-16 rounded mr-4`}
                />
                <Text style={tw`text-lg text-white`}>{item.title}</Text>
                <TouchableOpacity onPress={() => showModal(item)} style={tw`ml-auto`}>
                  <Text style={tw`text-blue-500`}>Details</Text>
                </TouchableOpacity>
              </View>
            )
          )}
        />

        <Modal isVisible={isModalVisible} onBackdropPress={hideModal}>
          {selectedAnime && (
            <View style={tw`bg-white p-4 rounded`}>
              <Image
                source={{ uri: selectedAnime.images.jpg.image_url }}
                style={tw`w-full h-64 rounded mb-4`}
              />
              <Text style={tw`text-xl font-bold mb-2`}>
                {selectedAnime.title}
              </Text>
              <Text style={tw`text-sm mb-4`}>{selectedAnime.synopsis}</Text>
              <Button
                title="Delete"
                onPress={() => deleteFromWatchlist(selectedAnime)}
              />
              <Button title="Close" onPress={hideModal} />
            </View>
          )}
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Watchlist;
