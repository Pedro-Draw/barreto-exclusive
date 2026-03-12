// src/pages/Tecnicas.jsx
import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, SkipBack, SkipForward, Maximize } from 'lucide-react';
import '../../pages.css/Tecnicas.css';

const categories = [
  {
    title: 'Passagem de Guarda',
    items: [
      { id: 1, title: 'Técnica Pressure Pass', desc: 'Passagem com pressão alta e controle de postura.', url: 'https://www.youtube.com/watch?v=example1', cover: 'https://images.unsplash.com/photo-1622473596148-73d27e35e764?w=800' },
      { id: 2, title: 'Toreando Pass', desc: 'Passagem clássica com uso de quadril e braços.', url: 'https://www.youtube.com/watch?v=example2', cover: 'https://images.unsplash.com/photo-1618359057154-e21b0a0e3b3d?w=800' },
    ]
  },
  {
    title: 'Finalizações da Guarda',
    items: [
      { id: 3, title: 'Triângulo Fechado', desc: 'Detalhamento completo do triângulo a partir da guarda fechada.', url: 'https://www.youtube.com/watch?v=example3', cover: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800' },
    ]
  },
  // adicione mais categorias
];

export default function Tecnicas() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const speeds = [1, 1.5, 2, 3, 4];

  return (
    <div className="tecnicas-page container">
      <h1 className="gold-gradient">Técnicas e Posições</h1>
      <p className="subtitle">Biblioteca premium de guardas, passagens e finalizações</p>

      <div className="categories-grid grid-3">
        {categories.map(cat => (
          <div key={cat.title} className="category-card glass-premium">
            <h3>{cat.title}</h3>
            <div className="items">
              {cat.items.map(item => (
                <div 
                  key={item.id} 
                  className="technique-item"
                  onClick={() => setSelectedVideo(item)}
                >
                  <div className="cover" style={{ backgroundImage: `url(${item.cover})` }}>
                    <Play className="play-icon" size={48} />
                  </div>
                  <div className="info">
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <div className="video-modal active">
          <div className="video-player-wrapper glass-premium">
            <button className="close-modal" onClick={() => setSelectedVideo(null)}>×</button>
            
            <ReactPlayer
              url={selectedVideo.url}
              playing={playing}
              controls={false}
              width="100%"
              height="100%"
              playbackRate={playbackRate}
              config={{ youtube: { playerVars: { modestbranding: 1, rel: 0 } } }}
            />

            {/* Controles custom premium */}
            <div className="custom-controls">
              <button onClick={() => setPlaying(!playing)}>
                {playing ? <Pause size={28} /> : <Play size={28} />}
              </button>

              <button onClick={() => {/* seek -10s */}}>
                <SkipBack size={28} />
              </button>

              <button onClick={() => {/* seek +10s */}}>
                <SkipForward size={28} />
              </button>

              <div className="speed-control">
                <span>{playbackRate}x</span>
                <select value={playbackRate} onChange={e => setPlaybackRate(Number(e.target.value))}>
                  {speeds.map(s => <option key={s} value={s}>{s}x</option>)}
                </select>
              </div>

              <button><Maximize size={28} /></button>
            </div>

            <h2 className="video-title">{selectedVideo.title}</h2>
            <p className="video-desc">{selectedVideo.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}