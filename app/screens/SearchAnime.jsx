import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import tw from "twrnc";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SearchAnime = ({ watched, setWatched, watchlist, setWatchlist }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadAnimeLists();
  }, []);

  const searchAnime = async () => {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);
      const data = await response.json();
      setResults(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addToWatched = async (anime) => {
    if (!watched.some((item) => item.mal_id === anime.mal_id)) {
      const updatedWatched = [...watched, anime];
      setWatched(updatedWatched);
      await AsyncStorage.setItem("watched", JSON.stringify(updatedWatched));
    }
  };

  const addToWatchlist = async (anime) => {
    if (!watchlist.some((item) => item.mal_id === anime.mal_id)) {
      const updatedWatchlist = [...watchlist, anime];
      setWatchlist(updatedWatchlist);
      await AsyncStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
    }
  };

  const loadAnimeLists = async () => {
    const watchedList = await AsyncStorage.getItem("watched");
    const watchlistList = await AsyncStorage.getItem("watchlist");

    if (watchedList) setWatched(JSON.parse(watchedList));
    if (watchlistList) setWatchlist(JSON.parse(watchlistList));
  };

  const showModal = (anime) => {
    setSelectedAnime(anime);
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
    setSelectedAnime(null);
  };

  return (
    <SafeAreaView className="h-full">
    <View style={tw`flex-1 p-4`}>
      <TextInput
        style={tw`border p-2 mb-4`}
        placeholder="Search for an anime..."
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Search" onPress={searchAnime} />
      <FlatList
        data={results}
        keyExtractor={(item) => item.mal_id.toString()}
        renderItem={({ item }) => (
          <View style={tw`flex-row p-2 border-b items-center`}>
            <Image
              source={{ uri: item.images.jpg.image_url }}
              style={tw`w-16 h-16 rounded mr-4`}
            />
            <View style={tw`flex-1`}>
              <Text style={tw`text-lg`}>{item.title}</Text>
            </View>
            <TouchableOpacity
              style={tw`bg-green-500 p-2 rounded mr-2`}
              onPress={() => addToWatched(item)}
            >
              <Text style={tw`text-white`}>Watched</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`bg-blue-500 p-2 rounded`}
              onPress={() => addToWatchlist(item)}
            >
              <Text style={tw`text-white`}>Watchlist</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showModal(item)}>
              <Text style={tw`text-blue-500`}>Details</Text>
            </TouchableOpacity>
          </View>
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
            <Text style={tw`text-sm`}>{selectedAnime.synopsis}</Text>
            <Button title="Close" onPress={hideModal} />
          </View>
        )}
      </Modal>
    </View>
    </SafeAreaView>
  );
};

export default SearchAnime;
