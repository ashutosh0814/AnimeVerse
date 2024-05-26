import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  Text,
  Modal,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

const AlbumPage = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [notes, setNotes] = useState({});
  const [noteText, setNoteText] = useState("");
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission to access media library is required!");
        } else {
          await loadImages(isMounted);
        }
      } catch (error) {
        console.error("Error requesting media library permissions:", error);
        Alert.alert(
          "Error requesting media library permissions. Please try again."
        );
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadImages = async (isMounted) => {
    try {
      const imageDir = `${FileSystem.documentDirectory}images`;
      const dirInfo = await FileSystem.getInfoAsync(imageDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
      }

      const imageFiles = await FileSystem.readDirectoryAsync(imageDir);
      const imageUris = imageFiles.map((file) => `${imageDir}/${file}`);
      if (isMounted) {
        setImages(imageUris);
        await loadNotes(isMounted);
      }
    } catch (error) {
      console.error("Error loading images:", error);
      Alert.alert("Error loading images. Please try again.");
    }
  };

  const loadNotes = async (isMounted) => {
    try {
      const notesFile = `${FileSystem.documentDirectory}notes.json`;
      const notesInfo = await FileSystem.getInfoAsync(notesFile);

      if (notesInfo.exists) {
        const notesContent = await FileSystem.readAsStringAsync(notesFile);
        const parsedNotes = JSON.parse(notesContent);
        if (isMounted) {
          setNotes(parsedNotes);
        }
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  const saveImage = async (uri) => {
    if (!uri) {
      console.error("No URI provided for saving image");
      Alert.alert("Error saving image. URI is undefined.");
      return;
    }

    try {
      const imageDir = `${FileSystem.documentDirectory}images`;
      const imageName = uri.split("/").pop();
      const newPath = `${imageDir}/${imageName}`;

      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });

      setImages((prevImages) => [...prevImages, newPath]);
      Alert.alert("Image saved successfully!");
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error saving image. Please try again.");
    }
  };

  const deleteImage = async (uri) => {
    try {
      await FileSystem.deleteAsync(uri);
      setImages((prevImages) => prevImages.filter((image) => image !== uri));
      setNotes((prevNotes) => {
        const updatedNotes = { ...prevNotes };
        delete updatedNotes[uri];
        saveNotes(updatedNotes);
        return updatedNotes;
      });
      setSelectedImage(null);
      Alert.alert("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
      Alert.alert("Error deleting image. Please try again.");
    }
  };

  const selectImage = async () => {
    try {
      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (
        !pickerResult.canceled &&
        pickerResult.assets &&
        pickerResult.assets.length > 0
      ) {
        const uri = pickerResult.assets[0].uri;
        await saveImage(uri);
      } else {
        console.log("Image picking was cancelled or no URI returned");
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Error selecting image. Please try again.");
    }
  };

  const saveNotes = async (updatedNotes) => {
    try {
      const notesFile = `${FileSystem.documentDirectory}notes.json`;
      await FileSystem.writeAsStringAsync(
        notesFile,
        JSON.stringify(updatedNotes)
      );
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const handleSaveNote = () => {
    if (selectedImage && noteText.trim().split(/\s+/).length <= 30) {
      const updatedNotes = {
        ...notes,
        [selectedImage]: {
          text: noteText.trim(),
          date: new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
        },
      };
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      setIsNoteModalVisible(false);
    } else {
      Alert.alert("Note must be 30 words or less.");
    }
  };

  return (
    <SafeAreaView className="h-full">
      <View style={tw`flex-1 bg-black`}>
        {images.length === 0 ? (
          <Text style={tw`text-center text-lg text-white mt-5`}>
            No images yet
          </Text>
        ) : (
          <FlatList
            data={images}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedImage(item)}>
                <View style={tw`relative w-24 h-24 m-1 rounded`}>
                  <Image source={{ uri: item }} style={tw`w-full h-full`} />
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            numColumns={4}
            contentContainerStyle={tw`p-2`}
            style={tw`flex-1`}
          />
        )}
        <TouchableOpacity
          className="absolute bottom-7 right-5 bg-[#FFDB5C] p-4 rounded-full"
          onPress={selectImage}
        >
          <Ionicons name="add" size={30} color="black" />
        </TouchableOpacity>

        {selectedImage && (
          <Modal
            visible={!!selectedImage}
            transparent={true}
            onRequestClose={() => setSelectedImage(null)}
          >
            <View
              style={tw`flex-1 bg-black bg-opacity-86 justify-center items-center`}
            >
              <Image
                source={{ uri: selectedImage }}
                style={tw`w-11/12 h-5/6`}
                resizeMode="contain"
              />
              {notes[selectedImage] && (
                <View style={tw`absolute top-2 left-2 right-0 bg-transparent p-2`}>
                  <Text style={tw`text-white text-xs`}>
                    {notes[selectedImage].date}
                  </Text>
                  <Text style={tw`text-red-200 text-sm`}>
                    {notes[selectedImage].text}
                  </Text>
                </View>
              )}
              <View style={tw`absolute bottom-10 flex-row`}>
                <TouchableOpacity
                  style={tw`bg-[#FFDB5C] p-4 m-2 rounded-full `}
                  onPress={() => deleteImage(selectedImage)}
                >
                  <Ionicons name="trash" size={25} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`bg-[#FFDB5C] p-4 m-2 rounded-full`}
                  onPress={() => {
                    setNoteText(notes[selectedImage]?.text || "");
                    setIsNoteModalVisible(true);
                  }}
                >
                  <Ionicons name="create" size={25} color="##FFDB5C" />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {isNoteModalVisible && (
          <Modal
            visible={isNoteModalVisible}
            transparent={true}
            onRequestClose={() => setIsNoteModalVisible(false)}
            className="bg-slate-500"
          >
            <View
              style={tw`flex-1 justify-center items-center bg-black bg-opacity-60`}
            >
              <View style={tw`bg-slate-400 p-6 rounded-md w-10/12`}>
                <Text style={tw`text-lg mb-4`}>Add/Edit Note</Text>
                <TextInput
                  style={tw`border border-gray-300 p-2 mb-4 rounded`}
                  multiline
                  numberOfLines={4}
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="Enter your note here..."
                />
                <TouchableOpacity
                  style={tw`bg-[#FFDB5C] p-3 rounded-full`}
                  onPress={handleSaveNote}
                >
                  <Text style={tw`text-black text-center`}>Save Note</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AlbumPage;
