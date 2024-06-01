import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TextInput,
  Button,
  Modal,
  Portal,
  Provider,
  Snackbar,
  Card,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { debounce } from "lodash";
import tw from "twrnc";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { normalize } from "../responsiveFontSize";

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
  const [showFullDescription, setShowFullDescription] = useState(false);

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
      try {
        await AsyncStorage.setItem(
          "watchlist",
          JSON.stringify(updatedWatchlist)
        );
        setSnackbarMessage("Added to Watchlist");
        setSnackbarVisible(true);
      } catch (error) {
        console.error("Error updating AsyncStorage:", error);
      }
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
    setShowFullDescription(false);
  };

  const getDescriptionText = (description) => {
    if (!description) return "";
    const descriptionWithoutHTML = description.replace(/<[^>]+>/g, "");
    const descriptionWords = descriptionWithoutHTML.split(" ");
    if (descriptionWords.length > 50 && !showFullDescription) {
      return descriptionWords.slice(0, 50).join(" ") + "...";
    }
    return descriptionWithoutHTML.replace(/<br>/g, "\n");
  };

  return (
    <Provider>
      <SafeAreaView style={tw`flex-1 p-3 bg-black`}>
        <TextInput
          label="Search for an anime..."
          value={query}
          onChangeText={setQuery}
          mode="flat"
          style={[tw`mb-4 bg-yellow-300`, { borderColor: "transparent" }]}
          theme={{
            colors: { text: "black", primary: "black",  placeholder: "black" },
          }}
          className="font-psemibold text-slate-950"
          fontSize={normalize(16)}
        />
        {query && (
          <TouchableOpacity
            onPress={() => setQuery("")}
            style={tw`absolute top-4 right-4`}
          >
            <Text style={[tw`text-white`, { fontSize: normalize(14) }]}>
              Clear
            </Text>
          </TouchableOpacity>
        )}
        {isLoading ? (
          <ActivityIndicator animating={true} size="large" color="#00ff00" />
        ) : error ? (
          <Text style={[tw`text-red-500`, { fontSize: normalize(14) }]}>
            {error}
          </Text>
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
                    <Text
                      style={[
                        tw`text-white p-1.2 bg-gray-800`,
                        { fontSize: normalize(14) },
                      ]}
                      className="font-pregular"
                    >
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
                      { width: wp("20%"), height: hp("10%") },
                    ]}
                    onError={() => console.log("Image failed to load")}
                  />
                  <View style={tw`flex-1`}>
                    <Text
                      className="font-pregular"
                      style={[tw`text-white`, { fontSize: normalize(14) }]}
                    >
                      {item.title.english || item.title.romaji}
                    </Text>
                  </View>
                  <View style={tw`flex-col`}>
                    <TouchableOpacity
                      style={tw`bg-green-600 p-2 rounded mb-2`}
                      onPress={() => addToWatched(item)}
                    >
                      <Text
                        style={[tw`text-white`, { fontSize: normalize(12) }]}
                      >
                        Watched
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={tw`bg-blue-500 p-2 rounded mb-2`}
                      onPress={() => addToWatchlist(item)}
                    >
                      <Text
                        style={[tw`text-white`, { fontSize: normalize(12) }]}
                      >
                        Watchlist
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={tw`bg-yellow-500 p-2 rounded`}
                      onPress={() => showModal(item)}
                    >
                      <Text
                        style={[tw`text-black`, { fontSize: normalize(12) }]}
                      >
                        Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </>
        )}
        <Portal>
          <Modal
            visible={isModalVisible}
            onDismiss={hideModal}
            contentContainerStyle={[
              tw`p-4 bg-white rounded`,
              {
                maxHeight: hp("80%"),
                borderColor: "black",
                borderWidth: 1,
                marginHorizontal: wp("5%"),
              },
            ]}
          >
            {selectedAnime && (
              <Card>
                <ScrollView
                  contentContainerStyle={tw`p-4`}
                  className="bg-white"
                >
                  <Card.Cover
                    source={{ uri: selectedAnime.coverImage.large }}
                    style={[
                      tw`rounded mb-4`,
                      { width: wp("90%"), height: hp("30%") },
                    ]}
                    onError={() => console.log("Image failed to load")}
                  />
                  <Card.Title
                    title={
                      selectedAnime.title.english || selectedAnime.title.romaji
                    }
                    titleStyle={[tw`text-black`, { fontSize: normalize(20) }]}
                  />
                  <Card.Content>
                    <Text
                      style={[tw`text-black mb-2`, { fontSize: normalize(14) }]}
                    >
                      {getDescriptionText(selectedAnime.description)}
                    </Text>
                    {selectedAnime.description &&
                      selectedAnime.description.split(" ").length > 50 && (
                        <TouchableOpacity
                          onPress={() =>
                            setShowFullDescription(!showFullDescription)
                          }
                        >
                          <Text
                            style={tw`text-blue-500`}
                            className="font-pregular"
                            fontSize={normalize(14)}
                          >
                            {showFullDescription ? "Show Less" : "Read More"}
                          </Text>
                        </TouchableOpacity>
                      )}
                  </Card.Content>
                  <Button
                    mode="contained"
                    onPress={hideModal}
                    style={tw`mt-4 bg-green-700`}
                    labelStyle={{ fontSize: normalize(14) }}
                  >
                    Close
                  </Button>
                </ScrollView>
              </Card>
            )}
          </Modal>
        </Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          <Text style={{ fontSize: normalize(14) }}>{snackbarMessage}</Text>
        </Snackbar>
      </SafeAreaView>
    </Provider>
  );
};

export default SearchAnime;
