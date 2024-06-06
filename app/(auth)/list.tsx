import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supabase } from "../../config/initSupabase";
import { useAuth } from "../../provider/AuthProvider";
import ImageItem from "@/components/ImageItem";
import { FileObject } from "@supabase/storage-js";
import FileItem from "@/components/FileItem";

const List: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileObject[]>([]);

  useEffect(() => {
    if (!user) return;
    loadFiles();
  }, [user]);

  const loadFiles = async () => {
    const { data } = await supabase.storage
      .from("pdfs-markdown-images")
      .list(user!.id);
    if (data) {
      setFiles(data);
    }
  };

  const onSelectFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf", "text/markdown"],
    });

    if (result.type === "success") {
      const fileUri = result.uri;
      const fileType = result.mimeType;
      const fileName = result.name;
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: "base64",
      });
      const filePath = `${user!.id}/${new Date().getTime()}_${fileName}`;
      const contentType = fileType;

      const { error } = await supabase.storage
        .from("pdfs-markdown-images")
        .upload(filePath, decode(base64), {
          contentType,
        });

      if (error) {
        console.error("Error uploading file:", error);
      } else {
        loadFiles();
      }
    }
  };

  const onRemoveFile = async (item: FileObject, index: number) => {
    const { error } = await supabase.storage
      .from("pdfs-markdown-images")
      .remove([`${user!.id}/${item.name}`]);
    if (error) {
      console.error("Error removing file:", error);
    } else {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      setFiles(newFiles);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {files.map((item, index) => (
          <FileItem
            key={item.id}
            item={item}
            userId={user!.id}
            onRemoveFile={() => onRemoveFile(item, index)}
          />
        ))}
      </ScrollView>
      <TouchableOpacity onPress={onSelectFile} style={styles.fab}>
        <Ionicons name="add-outline" size={30} color={"#fff"} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#151515",
  },
  fab: {
    position: "absolute",
    bottom: 40,
    right: 30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#2b825b",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default List;
