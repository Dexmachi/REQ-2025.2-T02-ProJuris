import React, { useState, useEffect } from 'react';
import { Bell, Home, Folder, Users, TrendingUp, FileText, Plus, Settings, ChevronLeft, ChevronRight, Calendar, AlertTriangle, Clock, FolderOpen, Menu } from 'lucide-react';
import '../../style/dashboardSocio.css';

const API_BASE_URL = 'http://localhost:5000/api';

const DashboardSocio = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentStatsIndex, setCurrentStatsIndex] = useState(0);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState(null);

  const mockData = {
    user: {
      nome: 'Dr. Fausto Correia',
      avatar: 'https://ui-avatars.com/api/?name=Fausto+Correia&background=1e3a8a&color=fff'
    },
    stats: {
      processosAtivos: { value: 124, change: '+12% vs mês anterior' },
      prazosPrazo: { value: 89, change: '+5% vs mês anterior' },
      prazosCriticos: { value: 7 },
      tempoMedio: { value: '12 dias', change: '-2 dias vs mês anterior' }
    },
    kanban: {
      novos: [
        { id: 'DEM-001', prazo: '15/12/2024', responsavel: 'João Silva' },
        { id: 'DEM-002', prazo: '18/12/2024', responsavel: 'Maria Santos' }
      ],
      em_andamento: [
        { id: 'DEM-003', prazo: '20/12/2024', responsavel: 'João Silva' },
        { id: 'DEM-004', prazo: '22/12/2024', responsavel: 'Pedro Costa' }
      ],
      aguardando: [
        { id: 'DEM-005', prazo: '10/01/2025', responsavel: 'Maria Santos' }
      ],
      concluidos: [
        { id: 'DEM-006', prazo: '01/12/2024', responsavel: 'João Silva' }
      ]
    },
    notificacoes: [
      {
        id: 1,
        tipo: 'Prazo Próximo',
        mensagem: 'Processo DEM-001 vence em 3 dias',
        tempo: 'Há 2 horas',
        urgente: true
      },
      {
        id: 2,
        tipo: 'Solicitação de Revisão',
        mensagem: 'João Silva enviou DEM-007 para revisão',
        tempo: 'Há 5 horas',
        urgente: false
      }
    ]
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setDados(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setDados(mockData);
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: Home, label: 'Processos', active: true },
    { icon: Folder, label: 'Tarefas' },
    { icon: Users, label: 'Atribuições' },
    { icon: TrendingUp, label: 'Métricas' },
    { icon: FileText, label: 'Relatórios' },
    { icon: Plus, label: 'Adicionar' },
    { icon: Settings, label: 'Configurações' }
  ];

  const statsData = dados ? [
    {
      icon: FolderOpen,
      color: 'blue',
      title: 'Processos Ativos',
      value: dados.stats.processosAtivos.value,
      change: dados.stats.processosAtivos.change,
      positive: true
    },
    {
      icon: Clock,
      color: 'green',
      title: 'Prazos no Prazo',
      value: dados.stats.prazosPrazo.value,
      change: dados.stats.prazosPrazo.change,
      positive: true
    },
    {
      icon: AlertTriangle,
      color: 'red',
      title: 'Prazos Críticos',
      value: dados.stats.prazosCriticos.value,
      critical: true
    },
    {
      icon: TrendingUp,
      color: 'yellow',
      title: 'Tempo Médio',
      value: dados.stats.tempoMedio.value,
      change: dados.stats.tempoMedio.change,
      positive: false
    }
  ] : [];

  const navigateStats = (direction) => {
    if (direction === 'prev' && currentStatsIndex > 0) {
      setCurrentStatsIndex(currentStatsIndex - 1);
    } else if (direction === 'next' && currentStatsIndex < statsData.length - 2) {
      setCurrentStatsIndex(currentStatsIndex + 1);
    }
  };

  const handleDragStart = (e, demanda, status) => {
    setDraggedCard({ demanda, status });
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, novoStatus) => {
    e.preventDefault();
    
    if (!draggedCard) return;

    const { demanda, status: statusAntigo } = draggedCard;

    setDados(prev => {
      const newDados = { ...prev };
      const statusKey = getStatusKey(statusAntigo);
      const novoStatusKey = getStatusKey(novoStatus);
      
      newDados.kanban[statusKey] = newDados.kanban[statusKey].filter(
        d => d.id !== demanda.id
      );
      
      newDados.kanban[novoStatusKey].push(demanda);
      
      return newDados;
    });

    setDraggedCard(null);
    alert('Demanda movida com sucesso!');
  };

  const getStatusKey = (status) => {
    const map = {
      'Novos': 'novos',
      'Em Andamento': 'em_andamento',
      'Aguardando': 'aguardando',
      'Concluídos': 'concluidos'
    };
    return map[status] || status;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="logo">
          {!sidebarCollapsed && <h2>LegisPRO</h2>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="toggle-sidebar"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="nav-menu">
          <ul>
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li
                  key={index}
                  className={item.active ? 'active' : ''}
                >
                  <Icon size={20} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        {/* Header */}
        <header className="header">
          <h1>Dashboard</h1>
          <div className="header-right">
            <div className="notifications">
              <Bell size={24} />
              <span className="badge">3</span>
            </div>
            <div className="user-profile">
              <img src={dados?.user.avatar} alt="User" />
              <span>{dados?.user.nome}</span>
            </div>
          </div>
        </header>

        {/* Stats Carousel */}
        <div className="stats-carousel-wrapper">
          <div className="stats-carousel-container">
            <button
              onClick={() => navigateStats('prev')}
              disabled={currentStatsIndex === 0}
              className="carousel-btn"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="stats-carousel">
              <div
                className="stats-grid"
                style={{ transform: `translateX(-${currentStatsIndex * 51.5}%)` }}
              >
                {statsData.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className={`stat-card ${stat.critical ? 'critical' : ''}`}
                    >
                      <div className={`stat-icon ${stat.color}`}>
                        <Icon size={24} />
                      </div>
                      <div className="stat-content">
                        <h3>{stat.title}</h3>
                        <p className="stat-value">{stat.value}</p>
                        {stat.change && (
                          <p className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                            {stat.change}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => navigateStats('next')}
              disabled={currentStatsIndex >= statsData.length - 2}
              className="carousel-btn"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="kanban-section">
          <div className="section-header">
            <h2>Visão Geral - Kanban</h2>
            <button className="btn-link">
              Ver Quadro Completo <ChevronRight size={16} />
            </button>
          </div>

          <div className="kanban-board">
            {Object.entries(dados?.kanban || {}).map(([status, demandas]) => {
              const statusLabels = {
                novos: 'Novos',
                em_andamento: 'Em Andamento',
                aguardando: 'Aguardando',
                concluidos: 'Concluídos'
              };
              
              return (
                <div key={status} className="kanban-column">
                  <div className="column-header">
                    <h3>{statusLabels[status]}</h3>
                    <span className="count">{demandas.length}</span>
                  </div>

                  <div
                    className="column-content"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, statusLabels[status])}
                  >
                    {demandas.map((demanda) => (
                      <div
                        key={demanda.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, demanda, statusLabels[status])}
                        onDragEnd={handleDragEnd}
                        className="kanban-card"
                      >
                        <p className="processo-id">{demanda.id}</p>
                        <div className="card-meta">
                          <Calendar size={14} />
                          <span>{demanda.prazo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notificações e Ações */}
        <div className="bottom-section">
          <div className="notifications-panel">
            <h2>Notificações</h2>
            <div className="notifications-list">
              {dados?.notificacoes.map((notif) => (
                <div key={notif.id} className="notification-item">
                  <Bell size={20} />
                  <div className="notification-content">
                    <h4>
                      {notif.tipo}
                      {notif.urgente && <span className="badge-urgente">Urgente</span>}
                    </h4>
                    <p>{notif.mensagem}</p>
                    <span className="time">{notif.tempo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="quick-actions">
            <h2>Ações Rápidas</h2>
            <div className="actions-list">
              <button className="action-btn primary">
                <Plus size={24} />
                <div>
                  <strong>Novo Processo</strong>
                  <span>Criar instantemente</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSocio;