// src/components/FloatingMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../App.jsx';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus.js'; // hook que você criou
import { 
  Menu, X, Home, User, Settings, Shield, Calendar, 
  BookOpen, List, Video, Dumbbell, MessageSquare, 
  Lock, LogOut, Moon, Sun 
} from 'lucide-react';
import './FloatingMenu.css';

const FloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, toggleTheme, logout } = useApp();
  const { isActive: hasActivePlan, daysLeft } = useSubscriptionStatus();

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Fecha ao navegar
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, premium: false },
    { name: 'Home (Feed)', path: '/home', icon: MessageSquare, premium: true },
    { name: 'Técnicas / Guarda', path: '/tecnicas', icon: Dumbbell, premium: true },
    { name: 'Notas', path: '/notas', icon: BookOpen, premium: true },
    { name: 'Data / Métricas', path: '/data', icon: Calendar, premium: true },
    { name: 'Perfil', path: '/perfil', icon: User, premium: false },
    { name: 'Configurações', path: '/configuracoes', icon: Settings, premium: false },
    { name: 'Admin', path: '/admin', icon: Shield, adminOnly: true, premium: false },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  const handleNavigate = (path, premium) => {
    if (premium && !hasActivePlan) {
      // Mostra aviso e redireciona para assinatura
      window.dispatchEvent(new CustomEvent("toast", { 
        detail: "Conteúdo premium. Assine ou renove seu plano para acessar." 
      }));
      navigate('/contract-sign');
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Botão hamburger flutuante */}
      <button 
        className="floating-hamburger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Overlay + Sidebar */}
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
        <div 
          ref={menuRef}
          className={`sidebar ${isOpen ? 'open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sidebar-header">
            <h2>Barreto Exclusive</h2>
            <button onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* Status da assinatura (opcional, pequeno badge) */}
          {user && !user.role === 'admin' && (
            <div 
              className="subscription-status"
              style={{
                padding: '8px 16px',
                background: hasActivePlan ? '#dcfce7' : '#fee2e2',
                color: hasActivePlan ? '#166534' : '#991b1b',
                margin: '0 16px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}
            >
              {hasActivePlan 
                ? `Plano ativo (${daysLeft} dias)` 
                : 'Assinatura necessária'}
            </div>
          )}

          <nav className="sidebar-nav">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isPremiumLocked = item.premium && !hasActivePlan;

              return (
                <button
                  key={item.path}
                  className={`nav-item ${isActive ? 'active' : ''} ${isPremiumLocked ? 'locked' : ''}`}
                  onClick={() => handleNavigate(item.path, item.premium)}
                  disabled={isPremiumLocked && item.premium} // visual apenas, clique é tratado acima
                  style={{
                    opacity: isPremiumLocked ? 0.6 : 1,
                    cursor: isPremiumLocked ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <item.icon size={22} />
                    {isPremiumLocked && (
                      <Lock size={14} color="#ef4444" style={{ position: 'absolute', top: -4, right: -4 }} />
                    )}
                  </div>
                  <span>{item.name}</span>
                  {item.premium && !isPremiumLocked && (
                    <span style={{ fontSize: '0.7rem', color: '#d4af37', marginLeft: 'auto' }}>Premium</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <button onClick={toggleTheme} className="theme-toggle">
              {document.body.classList.contains('light') ? (
                <><Moon size={18} /> Modo Escuro</>
              ) : (
                <><Sun size={18} /> Modo Claro</>
              )}
            </button>

            {user && (
              <button onClick={logout} className="logout-btn">
                <LogOut size={18} style={{ marginRight: '8px' }} />
                Sair
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FloatingMenu;