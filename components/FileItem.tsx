import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../config/initSupabase";
import { FileObject } from "@supabase/storage-js";
import * as FileSystem from "expo-file-system";

interface FileItemProps {
  item: FileObject;
  userId: string;
  onRemoveFile: () => void;
}

const FileItem: React.FC<FileItemProps> = ({ item, userId, onRemoveFile }) => {
  const [fileUri, setFileUri] = useState<string>("");

  useEffect(() => {
    const loadFile = async () => {
      const { data, error } = await supabase.storage
        .from("pdfs-markdown-images")
        .download(`${userId}/${item.name}`);
      if (data) {
        const filePath = FileSystem.documentDirectory + item.name;
        const fileData = new Uint8Array(await data.arrayBuffer());
        const fileContent = String.fromCharCode.apply(
          null,
          Array.from(fileData)
        );
        await FileSystem.writeAsStringAsync(filePath, fileContent, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setFileUri(filePath);
      } else if (error) {
        console.error("Error loading file:", error);
      }
    };

    loadFile();
  }, [item, userId]);

  const isImage = item.name.match(/\.(jpeg|jpg|gif|png)$/) != null;

  return (
    <View style={styles.fileItem}>
      {isImage ? (
        <Image style={styles.image} source={{ uri: fileUri }} />
      ) : (
        <TouchableOpacity
          onPress={() => Linking.openURL(fileUri)}
          style={styles.filePlaceholder}
        >
          <Text style={styles.fileText}>{item.name}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.fileName}>{item.name}</Text>
      <TouchableOpacity onPress={onRemoveFile}>
        <Ionicons name="trash-outline" size={20} color={"#fff"} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fileItem: {
    flexDirection: "row",
    margin: 1,
    alignItems: "center",
    gap: 5,
  },
  image: {
    width: 80,
    height: 80,
  },
  filePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },
  fileText: {
    color: "#fff",
    textAlign: "center",
  },
  fileName: {
    flex: 1,
    color: "#fff",
  },
});

export default FileItem;
