import React, { useState, useEffect } from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../config/initSupabase";
import { FileObject } from "@supabase/storage-js";
import * as FileSystem from "expo-file-system";

interface ImageItemProps {
  item: FileObject;
  userId: string;
  onRemoveImage: () => void;
}

const ImageItem: React.FC<ImageItemProps> = ({
  item,
  userId,
  onRemoveImage,
}) => {
  const [imageUri, setImageUri] = useState<string>("");

  useEffect(() => {
    const loadImage = async () => {
      const { data, error } = await supabase.storage
        .from("pdfs-markdown-images")
        .download(`${userId}/${item.name}`);
      if (data) {
        const filePath = FileSystem.documentDirectory + item.name;
        await FileSystem.writeAsStringAsync(
          filePath,
          new TextDecoder().decode(new Uint8Array(await data.arrayBuffer())),
          {
            encoding: FileSystem.EncodingType.Base64,
          }
        );
        setImageUri(filePath);
      } else if (error) {
        console.error("Error loading image:", error);
      }
    };

    loadImage();
  }, [item, userId]);

  return (
    <View style={styles.imageItem}>
      {imageUri ? (
        <Image style={styles.image} source={{ uri: imageUri }} />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <Text style={styles.imageName}>{item.name}</Text>
      <TouchableOpacity onPress={onRemoveImage}>
        <Ionicons name="trash-outline" size={20} color={"#fff"} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  imageItem: {
    flexDirection: "row",
    margin: 1,
    alignItems: "center",
    gap: 5,
  },
  image: {
    width: 80,
    height: 80,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#1A1A1A",
  },
  imageName: {
    flex: 1,
    color: "#fff",
  },
});

export default ImageItem;
