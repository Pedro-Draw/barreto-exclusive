import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../App.jsx";

import {
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  MoreHorizontal,
  Plus,
  AlertCircle
} from "lucide-react";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment
} from "firebase/firestore";

import { db } from "../App.jsx";

import "../../pages.css/Home.css";

export default function Hoje() {

  const { user } = useApp();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*
  =========================
  CARREGAR POSTS
  =========================
  */

  useEffect(() => {

    async function loadPosts() {

      setLoading(true);
      setError(null);

      try {

        const q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(20)
        );

        let snap = await getDocs(q);

        /*
        =========================
        CRIAR POSTS EXEMPLO
        =========================
        */

        if (snap.empty) {

          const examplePosts = [

            {
              content: "Bem-vindos ao feed da equipe 💪",
              image: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e",
              likes: 12
            },

            {
              content: "Treino pesado hoje 🔥",
              image: "https://images.unsplash.com/photo-1558611848-73f7eb4001ab",
              likes: 8
            },

            {
              content: "Disciplina vence talento quando o talento não treina.",
              image: null,
              likes: 20
            }

          ];

          for (const p of examplePosts) {

            await addDoc(collection(db, "posts"), {

              ...p,

              user: {
                name: "Equipe Barreto",
                avatar: "https://i.pravatar.cc/150?img=68"
              },

              userId: "system",

              comments: 0,
              likesBy: [],
              savedBy: [],

              createdAt: new Date()

            });

          }

          snap = await getDocs(q);

        }

        /*
        =========================
        FORMATAR POSTS
        =========================
        */

        const loadedPosts = snap.docs.map((docSnap) => {

          const data = docSnap.data();

          const created =
            data.createdAt?.toDate?.() ||
            (data.createdAt ? new Date(data.createdAt) : new Date());

          return {

            id: docSnap.id,

            ...data,

            createdAt: created,

            liked: data.likesBy?.includes(user?.uid) || false,

            saved: data.savedBy?.includes(user?.uid) || false,

            likes: data.likes || 0,

            comments: data.comments || 0

          };

        });

        setPosts(loadedPosts);

      } catch (err) {

        console.error("Erro ao carregar feed:", err);
        setError("Não foi possível carregar o feed.");

      } finally {

        setLoading(false);

      }

    }

    if (user) loadPosts();

  }, [user]);

  /*
  =========================
  LIKE
  =========================
  */

  const toggleLike = async (postId, currentlyLiked) => {

    try {

      const postRef = doc(db, "posts", postId);

      await updateDoc(postRef, {

        likesBy: currentlyLiked
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid),

        likes: increment(currentlyLiked ? -1 : 1)

      });

      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
                ...p,
                liked: !currentlyLiked,
                likes: currentlyLiked ? p.likes - 1 : p.likes + 1
              }
            : p
        )
      );

    } catch (err) {

      console.error("Erro ao curtir:", err);

    }

  };

  /*
  =========================
  SALVAR POST
  =========================
  */

  const toggleSave = async (postId, currentlySaved) => {

    try {

      const postRef = doc(db, "posts", postId);

      await updateDoc(postRef, {

        savedBy: currentlySaved
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid)

      });

      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, saved: !currentlySaved }
            : p
        )
      );

    } catch (err) {

      console.error("Erro ao salvar:", err);

    }

  };

  /*
  =========================
  SEM LOGIN
  =========================
  */

  if (!user) {

    return (

      <div
        className="container"
        style={{ textAlign: "center", padding: 80 }}
      >

        <AlertCircle size={60} />

        <h2>Faça login para ver o feed</h2>

        <button
          className="btn btn-gold"
          onClick={() => navigate("/login")}
        >
          Entrar
        </button>

      </div>

    );

  }

  /*
  =========================
  LOADING
  =========================
  */

  if (loading) {

    return (

      <div className="container">

        <h1>Hoje na Equipe</h1>

        <p>Carregando feed...</p>

      </div>

    );

  }

  /*
  =========================
  ERRO
  =========================
  */

  if (error) {

    return (

      <div className="container">

        <AlertCircle size={60} />

        <h2>{error}</h2>

      </div>

    );

  }

  /*
  =========================
  FEED
  =========================
  */

  return (

    <div className="container">

      <h1 className="gold-gradient">Hoje na Equipe</h1>

      <div style={{ textAlign: "right", marginBottom: 20 }}>

        <button
          className="btn btn-gold"
          onClick={() => navigate("/novo-post")}
        >
          <Plus size={20} style={{ marginRight: 8 }} />
          Novo Post
        </button>

      </div>

      <div className="feed">

        {posts.map(post => (

          <div key={post.id} className="post-card">

            {/* HEADER */}

            <div className="post-header">

              <img
                src={
                  post.user?.avatar ||
                  "https://i.pravatar.cc/150"
                }
                alt="avatar"
                className="avatar"
              />

              <div>

                <strong>
                  {post.user?.name || "Usuário"}
                </strong>

                <span>
                  {formatDistanceToNow(post.createdAt, {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>

              </div>

              <button>
                <MoreHorizontal size={18} />
              </button>

            </div>

            {/* MIDIA */}

            {post.image && (
              <img
                src={post.image}
                className="post-media"
                alt=""
              />
            )}

            {post.video && (

              <iframe
                src={post.video}
                title="video"
                className="post-media"
              />

            )}

            {/* TEXTO */}

            <p className="post-text">
              {post.content}
            </p>

            {/* AÇÕES */}

            <div className="post-actions">

              <button
                className={`action-btn ${post.liked ? "liked" : ""}`}
                onClick={() =>
                  toggleLike(post.id, post.liked)
                }
              >

                <Heart
                  size={22}
                  fill={post.liked ? "red" : "none"}
                />

                <span>{post.likes}</span>

              </button>

              <button className="action-btn">

                <MessageCircle size={22} />

                <span>{post.comments}</span>

              </button>

              <button
                className={`action-btn ${post.saved ? "saved" : ""}`}
                onClick={() =>
                  toggleSave(post.id, post.saved)
                }
              >

                <Bookmark
                  size={22}
                  fill={post.saved ? "gold" : "none"}
                />

              </button>

              <button className="action-btn">

                <Send size={22} />

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}