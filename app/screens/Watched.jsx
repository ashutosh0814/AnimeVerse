import React, { useState } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Button,
  ScrollView,
} from "react-native";
import tw from "twrnc";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Watched = ({ watched, setWatched }) => {
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReadMore, setIsReadMore] = useState(false);

  const showModal = (anime) => {
    setSelectedAnime(anime);
    setIsModalVisible(true);
    setIsReadMore(false);
  };

  const hideModal = () => {
    setIsModalVisible(false);
    setSelectedAnime(null);
  };

  const deleteFromWatched = async (anime) => {
    const updatedWatched = watched.filter((item) => item.id !== anime.id);
    setWatched(updatedWatched);
    try {
      await AsyncStorage.setItem("watched", JSON.stringify(updatedWatched));
    } catch (error) {
      console.error("Error updating AsyncStorage:", error);
    }
    hideModal();
  };

  const sanitizeDescription = (description) => {
    return description
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?i>/gi, "")
      .replace(/<\/?[^>]+(>|$)/g, ""); // Remove any other HTML tags
  };

  return (
    <SafeAreaView style={tw`h-full bg-black`}>
      <View style={tw`flex-1 p-4`}>
        <FlatList
          data={watched}
          keyExtractor={(item) =>
            item.mal_id?.toString() || item.id?.toString()
          }
          renderItem={({ item }) => (
            <View
              style={tw`flex-row p-2 border-b border-gray-700 items-center`}
            >
              <Image
                source={{
                  uri:
                    item.coverImage?.large || "https://via.placeholder.com/150",
                }}
                style={tw`w-16 h-16 rounded mr-4`}
              />
              <Text
                style={tw`text-lg text-white flex-1`}
                className="font-pmedium"
              >
                {item.title.english || item.title.romaji}
              </Text>
              <TouchableOpacity
                onPress={() => showModal(item)}
                style={tw`ml-auto`}
              >
                <Text style={tw`text-yellow-400`} className="text-6xl">
                  ...
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <Modal isVisible={isModalVisible} onBackdropPress={hideModal}>
          {selectedAnime && (
            <View style={tw`bg-white p-4 rounded`}>
              <ScrollView>
                <Image
                  source={{
                    uri:
                      selectedAnime.coverImage?.large ||
                      "https://via.placeholder.com/150",
                  }}
                  style={tw`w-full h-64 rounded mb-4`}
                />
                <Text style={tw`text-xl font-bold mb-2`}>
                  {selectedAnime.title.english || selectedAnime.title.romaji}
                </Text>
                <Text style={tw`text-sm mb-4`} className="font-pregular">
                  {isReadMore
                    ? sanitizeDescription(selectedAnime.description)
                    : `${sanitizeDescription(selectedAnime.description)
                        .split(" ")
                        .slice(0, 50)
                        .join(" ")}...`}
                </Text>
                {sanitizeDescription(selectedAnime.description).split(" ")
                  .length > 50 && (
                  <TouchableOpacity onPress={() => setIsReadMore(!isReadMore)}>
                    <Text style={tw`text-blue-500`}>
                      {isReadMore ? "Read Less" : "Read More"}
                    </Text>
                  </TouchableOpacity>
                )}
                <Button
                  title="Delete"
                  onPress={() => deleteFromWatched(selectedAnime)}
                  color="red"
                />
                <View style={tw`mt-2`}>
                  <Button title="Close" onPress={hideModal} />
                </View>
              </ScrollView>
            </View>
          )}
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Watched;
