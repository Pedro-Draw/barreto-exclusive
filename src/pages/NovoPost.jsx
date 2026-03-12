import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../App.jsx";
import { useApp } from "../App.jsx";

import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

export default function NovoPost() {

  const navigate = useNavigate();
  const { user } = useApp();

  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");

  async function handleCreatePost() {

    if (!text && !image && !video) {
      alert("Adicione algo no post.");
      return;
    }

    try {

      await addDoc(collection(db, "posts"), {

        content: text,
        image,
        video,

        user: {
          name: user.name || "Membro",
          avatar: user.avatar || ""
        },

        userId: user.uid,

        likes: 0,
        comments: 0,

        likesBy: [],
        savedBy: [],

        createdAt: serverTimestamp()

      });

      navigate("/hoje");

    } catch (err) {

      console.error(err);

    }

  }

  return (

    <div className="container">

      <h1>Criar Post</h1>

      <textarea
        placeholder="O que está acontecendo?"
        value={text}
        onChange={e => setText(e.target.value)}
      />

      <input
        placeholder="Link da imagem"
        value={image}
        onChange={e => setImage(e.target.value)}
      />

      <input
        placeholder="Link do vídeo"
        value={video}
        onChange={e => setVideo(e.target.value)}
      />

      <button
        className="btn btn-gold"
        onClick={handleCreatePost}
      >
        Publicar
      </button>

    </div>

  );

}