// src/pages/Notas.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import '../../pages.css/Notas.css';

export default function Notas() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const startNewNote = () => {
    setEditingId('new');
    setTitle('');
    setContent('');
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const saveNote = () => {
    if (!title.trim() && !content.trim()) return;

    if (editingId === 'new') {
      const newNote = {
        id: Date.now(),
        title: title || 'Sem título',
        content,
        date: new Date().toLocaleString('pt-BR'),
      };
      setNotes([newNote, ...notes]);
    } else {
      setNotes(notes.map(n =>
        n.id === editingId ? { ...n, title, content, date: new Date().toLocaleString('pt-BR') } : n
      ));
    }

    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const deleteNote = (id) => {
    if (window.confirm('Excluir esta nota?')) {
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  return (
    <div className="notas-page container">
      <div className="header">
        <h1 className="gold-gradient">Minhas Notas</h1>
        <button className="btn-gold new-btn" onClick={startNewNote}>
          <Plus size={20} /> Nova Nota
        </button>
      </div>

      {editingId && (
        <div className="edit-card glass-premium">
          <input
            type="text"
            placeholder="Título da nota"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="note-title-input"
          />
          <textarea
            placeholder="Escreva sua anotação aqui..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="note-content-input"
          />
          <div className="edit-actions">
            <button className="btn-outline" onClick={cancelEdit}>
              <X size={18} /> Cancelar
            </button>
            <button className="btn-gold" onClick={saveNote}>
              <Save size={18} /> Salvar
            </button>
          </div>
        </div>
      )}

      <div className="notes-grid grid-3">
        {notes.map(note => (
          <div key={note.id} className="note-card glass">
            <div className="note-header">
              <h3>{note.title}</h3>
              <span className="note-date">{note.date}</span>
            </div>
            <p className="note-content">{note.content}</p>
            <div className="note-actions">
              <button onClick={() => startEdit(note)}><Edit2 size={18} /></button>
              <button onClick={() => deleteNote(note.id)} className="delete-btn">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {notes.length === 0 && !editingId && (
          <div className="empty-state">
            <p>Nenhuma nota ainda. Crie sua primeira!</p>
          </div>
        )}
      </div>
    </div>
  );
}