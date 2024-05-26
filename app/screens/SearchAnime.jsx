import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TextInput,
  Button,
  Modal,
  Portal,
  Provider,
  Snackbar,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { debounce } from "lodash";
import tw from "twrnc";

const { width, height } = Dimensions.get("window");

const SearchAnime = ({ watched, setWatched, watchlist, setWatchlist }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadAnimeLists();
  }, []);

  useEffect(() => {
    if (query) {
      setShowSuggestions(true);
      debounceSearchAnime(query);
    } else {
      setResults([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const debounceSearchAnime = useCallback(
    debounce((query) => {
      searchAnime(query);
    }, 500),
    []
  );

  const searchAnime = async (query) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://graphql.anilist.co`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `
            query ($search: String) {
              Page(page: 1, perPage: 10) {
                media(search: $search, type: ANIME) {
                  id
                  title {
                    english
                    romaji
                  }
                  coverImage {
                    large
                  }
                  description
                }
              }
            }
          `,
          variables: { search: query },
        }),
      });
      const data = await response.json();
      setResults(data.data.Page.media || []);
    } catch (error) {
      console.error("Error fetching anime data:", error);
      setError("Failed to load anime. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addToWatched = async (anime) => {
    if (!watched.some((item) => item.id === anime.id)) {
      const updatedWatched = [...watched, anime];
      setWatched(updatedWatched);
      await AsyncStorage.setItem("watched", JSON.stringify(updatedWatched));
      setSnackbarMessage("Added to Watched");
      setSnackbarVisible(true);
    }
  };

  const addToWatchlist = async (anime) => {
    if (!watchlist.some((item) => item.id === anime.id)) {
      const updatedWatchlist = [...watchlist, anime];
      setWatchlist(updatedWatchlist);
      await AsyncStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
      setSnackbarMessage("Added to Watchlist");
      setSnackbarVisible(true);
    }
  };

  const loadAnimeLists = async () => {
    try {
      const watchedList = await AsyncStorage.getItem("watched");
      const watchlistList = await AsyncStorage.getItem("watchlist");

      if (watchedList) setWatched(JSON.parse(watchedList));
      if (watchlistList) setWatchlist(JSON.parse(watchlistList));
    } catch (error) {
      console.error("Error loading anime lists:", error);
    }
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
    <Provider>
      <SafeAreaView style={tw`flex-1 p-3 bg-black`}>
        <TextInput
          label="Search for an anime..."
          value={query}
          onChangeText={setQuery}
          mode="flat"
          style={[
            tw`mb-4 bg-yellow-300`,
            { borderColor: "transparent" },
          ]}
          theme={{
            colors: { text: "black", primary: "black", placeholder: "black" },
          }}
        />
        {query && (
          <TouchableOpacity
            onPress={() => setQuery("")}
            style={tw`absolute top-4 right-4`}
          >
            <Text style={tw`text-white `}>Clear</Text>
          </TouchableOpacity>
        )}
        {isLoading ? (
          <ActivityIndicator animating={true} size="large" color="#00ff00" />
        ) : error ? (
          <Text style={tw`text-red-500`}>{error}</Text>
        ) : (
          <>
            {showSuggestions && (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setQuery(item.title.english || item.title.romaji);
                      setShowSuggestions(false);
                    }}
                  >
                    <Text style={tw`text-white p-2 bg-gray-800`}>
                      {item.title.english || item.title.romaji}
                    </Text>
                  </TouchableOpacity>
                )}
                style={tw`max-h-60`}
              />
            )}
            <FlatList
              data={results}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View
                  style={tw`flex-row p-2 border-b border-gray-700 items-center`}
                >
                  <Image
                    source={{ uri: item.coverImage.large }}
                    style={[
                      tw`rounded mr-4`,
                      { width: width * 0.2, height: height * 0.1 },
                    ]}
                  />
                  <View style={tw`flex-1`}>
                    <Text style={[tw`text-white`, { fontSize: width * 0.035 }]}>
                      {item.title.english || item.title.romaji}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={tw`bg-green-600 p-2 rounded mr-2`}
                    onPress={() => addToWatched(item)}
                  >
                    <Text style={[tw`text-white`, { fontSize: width * 0.027 }]}>
                      Watched
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tw`bg-blue-500 p-2 rounded mr-2`}
                    onPress={() => addToWatchlist(item)}
                  >
                    <Text style={[tw`text-white`, { fontSize: width * 0.027 }]}>
                      Watchlist
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tw`bg-yellow-500 p-2 rounded`}
                    onPress={() => showModal(item)}
                  >
                    <Text style={[tw`text-black`, { fontSize: width * 0.027 }]}>
                      Details
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        )}
        <Portal>
          <Modal
            visible={isModalVisible}
            onDismiss={hideModal}
            contentContainerStyle={tw`p-4 bg-white rounded`}
          >
            {selectedAnime && (
              <View>
                <Image
                  source={{ uri: selectedAnime.coverImage.large }}
                  style={[
                    tw`rounded mb-4`,
                    { width: width * 0.9, height: height * 0.3 },
                  ]}
                />
                <Text
                  style={[
                    tw`text-xl font-bold mb-2`,
                    { fontSize: width * 0.06 },
                  ]}
                >
                  {selectedAnime.title.english || selectedAnime.title.romaji}
                </Text>
                <Text style={[tw`text-sm`, { fontSize: width * 0.04 }]}>
                  {selectedAnime.description}
                </Text>
                <Button onPress={hideModal}>Close</Button>
              </View>
            )}
          </Modal>
        </Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </SafeAreaView>
    </Provider>
  );
};

export default SearchAnime;
