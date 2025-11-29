import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, Calendar, AlertTriangle, List, Eye, Send, MessageSquare, Menu, User } from 'lucide-react';
import '../../style/dashboardFuncionario.css';

const API_BASE_URL = 'http://localhost:5000/api';

const DashboardFuncionario = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [demandaSelecionada, setDemandaSelecionada] = useState(null);
  const [userId] = useState('123');

  const mockData = {
    user: {
      id: '123',
      nome: 'João Silva',
      avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=1e3a8a&color=fff'
    },
    stats: {
      total: 8,
      emAndamento: 3,
      aguardandoRevisao: 2,
      urgentes: 1
    },
    demandas: {
      novas: [
        {
          id: 'DEM-001',
          titulo: 'Elaborar petição inicial - Cliente A',
          descricao: 'Ação de indenização por danos morais',
          prazo: '05/12/2024',
          prioridade: 'alta',
          atribuidoPor: 'Dr. Fausto',
          responsavelId: '123'
        }
      ],
      em_andamento: [
        {
          id: 'DEM-003',
          titulo: 'Responder contestação',
          descricao: 'Processo 1234/2024',
          prazo: '02/12/2024',
          prioridade: 'urgente',
          atribuidoPor: 'Dr. Fausto',
          responsavelId: '123'
        }
      ],
      aguardando_revisao: [
        {
          id: 'DEM-006',
          titulo: 'Análise de viabilidade',
          descricao: 'Parecer jurídico preliminar',
          prazo: '28/11/2024',
          prioridade: 'normal',
          atribuidoPor: 'Dr. Fausto',
          responsavelId: '123'
        }
      ],
      concluidas: [
        {
          id: 'DEM-008',
          titulo: 'Organização de documentos',
          descricao: 'Processo 9999',
          prazo: '25/11/2024',
          prioridade: 'normal',
          atribuidoPor: 'Dr. Fausto',
          responsavelId: '123'
        }
      ]
    },
    notificacoes: [
      {
        id: 1,
        tipo: 'Nova demanda',
        mensagem: 'DEM-002 atribuída a você',
        tempo: 'Há 1 hora',
        lida: false,
        urgente: false
      }
    ]
  };

  useEffect(() => {
    loadDados();
  }, []);

  const loadDados = async () => {
    try {
      setLoading(true);
      setDados(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setDados(mockData);
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: List, label: 'Minhas Demandas', active: true },
    { icon: Clock, label: 'Aguardando Revisão' },
    { icon: CheckCircle, label: 'Concluídas' },
    { icon: Calendar, label: 'Calendário' },
    { icon: Bell, label: 'Notificações' },
    { icon: User, label: 'Meu Perfil' }
  ];

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

    // VALIDAÇÕES DE REGRAS DE NEGÓCIO
    if (demanda.responsavelId !== userId) {
      alert('❌ Você só pode mover demandas atribuídas a você!');
      return;
    }

    if (statusAntigo === 'aguardando_revisao' && novoStatus === 'em_andamento') {
      alert('⚠️ Demandas em revisão não podem voltar. Aguarde aprovação do sócio.');
      return;
    }

    if (novoStatus === 'concluidas') {
      alert('⚠️ Apenas o sócio pode marcar demandas como concluídas. Envie para revisão.');
      return;
    }

    // Mover demanda
    setDados(prev => {
      const newDados = { ...prev };
      
      newDados.demandas[statusAntigo] = newDados.demandas[statusAntigo].filter(
        d => d.id !== demanda.id
      );
      
      newDados.demandas[novoStatus].push(demanda);
      
      return newDados;
    });

    setDraggedCard(null);

    if (novoStatus === 'aguardando_revisao') {
      alert('✅ Demanda enviada para revisão do sócio!');
    } else {
      alert('✅ Demanda movida com sucesso!');
    }
  };

  const verDetalhes = (demanda) => {
    setDemandaSelecionada(demanda);
    setModalOpen(true);
  };

  const solicitarRevisao = () => {
    if (demandaSelecionada) {
      const statusAtual = Object.keys(dados.demandas).find(key =>
        dados.demandas[key].some(d => d.id === demandaSelecionada.id)
      );

      setDados(prev => {
        const newDados = { ...prev };
        newDados.demandas[statusAtual] = newDados.demandas[statusAtual].filter(
          d => d.id !== demandaSelecionada.id
        );
        newDados.demandas.aguardando_revisao.push(demandaSelecionada);
        return newDados;
      });

      setModalOpen(false);
      alert('✅ Revisão solicitada! O sócio será notificado.');
    }
  };

  const getPrioridadeClass = (prioridade) => {
    return prioridade?.toLowerCase() || 'normal';
  };

  const getStatusLabel = (status) => {
    const labels = {
      novas: 'Novas',
      em_andamento: 'Em Andamento',
      aguardando_revisao: 'Aguardando Revisão',
      concluidas: 'Concluídas'
    };
    return labels[status] || status;
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
    <div className="dashboard-funcionario">
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
                <li key={index} className={item.active ? 'active' : ''}>
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
          <div>
            <h1>Minhas Demandas</h1>
            <p className="subtitle">
              Olá, <strong>{dados?.user.nome}</strong>! Aqui estão suas tarefas.
            </p>
          </div>
          <div className="header-right">
            <div className="notifications">
              <Bell size={24} />
              <span className="badge">
                {dados?.notificacoes.filter(n => !n.lida).length}
              </span>
            </div>
            <img src={dados?.user.avatar} alt="User" className="user-avatar" />
          </div>
        </header>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <List size={24} />
            </div>
            <div className="stat-content">
              <h3>Atribuídas</h3>
              <p className="stat-value">{dados?.stats.total}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>Em Andamento</h3>
              <p className="stat-value">{dados?.stats.emAndamento}</p>
            </div>
          </div>

          <div className="stat-card yellow-card">
            <div className="stat-icon yellow">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>Aguardando Revisão</h3>
              <p className="stat-value">{dados?.stats.aguardandoRevisao}</p>
            </div>
          </div>

          <div className="stat-card critical">
            <div className="stat-icon red">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-content">
              <h3>Urgentes</h3>
              <p className="stat-value">{dados?.stats.urgentes}</p>
            </div>
          </div>
        </div>

        {/* Kanban */}
        <div className="kanban-section">
          <h2>Quadro de Demandas</h2>

          <div className="kanban-board">
            {Object.entries(dados?.demandas || {}).map(([status, demandas]) => (
              <div
                key={status}
                className={`kanban-column ${status === 'aguardando_revisao' ? 'revision' : ''} ${status === 'concluidas' ? 'success' : ''}`}
              >
                <div className="column-header">
                  <h3>
                    {status === 'novas' && <List size={16} />}
                    {status === 'em_andamento' && <Clock size={16} />}
                    {status === 'aguardando_revisao' && <Clock size={16} />}
                    {status === 'concluidas' && <CheckCircle size={16} />}
                    {getStatusLabel(status)}
                  </h3>
                  <span className="count">{demandas.length}</span>
                </div>

                <div
                  className="column-content"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  {demandas.map((demanda) => (
                    <div
                      key={demanda.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, demanda, status)}
                      onDragEnd={handleDragEnd}
                      className="kanban-card"
                    >
                      <div className="card-header">
                        <span className="processo-id">{demanda.id}</span>
                        <span className={`priority-badge ${getPrioridadeClass(demanda.prioridade)}`}>
                          {demanda.prioridade}
                        </span>
                      </div>
                      
                      <h4 className="card-title">{demanda.titulo}</h4>
                      <p className="card-description">{demanda.descricao}</p>
                      
                      <div className="card-footer">
                        <div className="card-meta">
                          <Calendar size={14} />
                          <span>{demanda.prazo}</span>
                        </div>
                        <button
                          onClick={() => verDetalhes(demanda)}
                          className="btn-icon"
                          title="Ver detalhes"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notificações */}
        <div className="notifications-section">
          <h2>Notificações</h2>
          <div className="notifications-list">
            {dados?.notificacoes.map((notif) => (
              <div
                key={notif.id}
                className={`notification-item ${!notif.lida ? 'unread' : ''}`}
              >
                <Bell size={20} className={notif.urgente ? 'urgent' : ''} />
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
      </main>

      {/* Modal */}
      {modalOpen && demandaSelecionada && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{demandaSelecionada.id} - Detalhes</h2>
              <button onClick={() => setModalOpen(false)} className="btn-close">
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <h3>{demandaSelecionada.titulo}</h3>
              <p className="modal-description">{demandaSelecionada.descricao}</p>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Prazo</label>
                  <p>{demandaSelecionada.prazo}</p>
                </div>
                <div className="detail-item">
                  <label>Prioridade</label>
                  <p>{demandaSelecionada.prioridade}</p>
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={solicitarRevisao} className="btn-primary">
                  <Send size={20} />
                  Solicitar Revisão
                </button>
                <button className="btn-secondary">
                  <MessageSquare size={20} />
                  Comentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFuncionario;