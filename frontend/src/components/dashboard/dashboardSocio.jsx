import React, { useState, useEffect } from 'react';
import {
  Bell, Home, Folder, Users, TrendingUp, FileText, Plus, Settings,
  ChevronLeft, ChevronRight, Calendar, AlertTriangle, Clock, FolderOpen,
  Menu, List, CheckCircle, Eye, Edit
} from 'lucide-react';
import '../../style/dashboardSocio.css';
import CadastrarDemanda from './CadastrarDemanda';
import EditarDemanda from './EditarDemanda';
import { demandasAPI } from '../../services/api'; // Importa a API
import { useAuth } from '../../context/authContext'; // Importa o contexto para o usuário logado

// Funções de Mapeamento: Converte dados do DB para o formato do Kanban
const formatDemandasToKanban = (demandasArray) => {
  const kanban = {
    novos: [],
    em_andamento: [],
    aguardando: [],
    concluidos: [],
  };

  demandasArray.forEach(d => {
    const dataPrazo = new Date(d.data_prazo);
    const prazoFormatado = `${dataPrazo.getDate().toString().padStart(2, '0')}/${(dataPrazo.getMonth() + 1).toString().padStart(2, '0')}/${dataPrazo.getFullYear()}`;
    
    let statusKey;
    switch (d.status) {
      case 'Elaboração':
      case 'Nova':
        statusKey = 'novos';
        break;
      case 'Em Andamento':
        statusKey = 'em_andamento';
        break;
      case 'Aguardando Revisão':
        statusKey = 'aguardando';
        break;
      case 'Concluído':
      case 'Concluídos':
        statusKey = 'concluidos';
        break;
      default:
        statusKey = 'novos';
    }

    const item = {
      id: d.id, 
      titulo: d.titulo,
      descricao: d.descricao,
      prazo: prazoFormatado,
      responsavel: d.responsavel_email || 'Não Atribuído', 
      prioridade: d.prioridade || 'normal', 
      status: d.status, // Mantém o status original do backend
      responsavel_id: d.responsavel_id, // Incluído para futuras verificações de permissão
    };

    if (kanban[statusKey]) {
      kanban[statusKey].push(item);
    }
  });

  return kanban;
};
// Fim das Funções de Mapeamento

const DashboardSocio = () => {
  const { user } = useAuth(); 
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [demandaSelecionada, setDemandaSelecionada] = useState(null);
  const [isCreatingDemanda, setIsCreatingDemanda] = useState(false);
  const [isEditingDemanda, setIsEditingDemanda] = useState(false);

  // Dados mockados restantes (Stats e Notificações)
  const mockData = {
    user: {
      nome: user?.nome || 'Dr. Fausto Correia',
      avatar: 'https://ui-avatars.com/api/?name=Fausto+Correia&background=1e3a8a&color=fff'
    },
    stats: {
      processosAtivos: { value: 124, change: '+12% vs mês anterior' },
      prazosPrazo: { value: 89, change: '+5% vs mês anterior' },
      prazosCriticos: { value: 7 },
      tempoMedio: { value: '12 dias', change: '-2 dias vs mês anterior' }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const demandaResponse = await demandasAPI.getAll();
      const demandasBackend = demandaResponse.data;

      const kanbanData = formatDemandasToKanban(demandasBackend);

      const combinedData = {
          user: mockData.user, 
          stats: mockData.stats, 
          kanban: kanbanData, 
          notificacoes: mockData.notificacoes 
      };

      setDados(combinedData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      const fallbackData = { ...mockData, kanban: { novos: [], em_andamento: [], aguardando: [], concluidos: [] } };
      setDados(fallbackData); 
      setLoading(false);
    }
  };

  const handleDemandaCriada = (novaDemandaBackend) => {
    loadDashboardData(); 
    setIsCreatingDemanda(false);
    alert('✅ Demanda cadastrada com sucesso!');
  };

  const handleDemandaAtualizada = (demandaAtualizada) => {
    loadDashboardData(); 
    setIsEditingDemanda(false);
    setModalOpen(false);
    alert('✅ Demanda atualizada com sucesso!');
  };


  const getPrioridadeClass = (prioridade) => {
    return prioridade?.toLowerCase() || 'normal';
  };

  const verDetalhes = (demanda) => {
    setDemandaSelecionada(demanda);
    setIsEditingDemanda(false);
    setModalOpen(true);
  };

  const handleEditarDemanda = () => {
    setIsEditingDemanda(true);
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

// CORREÇÃO CRÍTICA: LIGA O DRAG & DROP AO BACKEND (RF11)
const handleDrop = async (e, novoStatusLabel) => {
  e.preventDefault();

  if (!draggedCard) return;

  const { demanda, status: statusAntigoLabel } = draggedCard;

  // 1. Mapeia o status do Frontend (Label) para o status do Backend (Valor)
  let novoStatusBackend;
  switch (novoStatusLabel) {
    case 'Novos':
      novoStatusBackend = 'Elaboração';
      break;
    case 'Em Andamento':
      novoStatusBackend = 'Em Andamento';
      break;
    case 'Aguardando':
      novoStatusBackend = 'Aguardando Revisão';
      break;
    case 'Concluídos':
      novoStatusBackend = 'Concluído';
      break;
    default:
      return;
  }
  
  // Regra de segurança extra: Sócios podem mover tudo.
  // A verificação de permissão principal é feita no backend (main.py).
  
  setDraggedCard(null);

  try {
    // 2. Chama a API para atualizar o status (PATCH /demandas/<id>/status)
    await demandasAPI.updateStatus(demanda.id, novoStatusBackend);
    
    // 3. Recarrega os dados do dashboard para refletir a persistência
    loadDashboardData();
    alert(`✅ Status atualizado para: ${novoStatusBackend}`);

  } catch (error) {
    console.error('Erro ao persistir movimento:', error);
    alert('❌ Falha ao atualizar o status da demanda. Verifique sua permissão.');
    loadDashboardData(); // Recarrega para voltar o cartão para a posição salva no DB
  }
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

// ... (O restante do código de renderização do componente não muda)
//...
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

// ... (Resto do código de renderização)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
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

        {/* Stats */}
        <div className="stats-grid">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`stat-card ${stat.critical ? 'critical' : ''}`}>
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
                <div
                  key={status}
                  className={`kanban-column kanban-${status}`}
                >
                
                  <div className="column-header">
                    <h3>
                      {status === 'novos' && <List size={16} />}
                      {status === 'em_andamento' && <Clock size={16} />}
                      {status === 'aguardando' && <Clock size={16} />}
                      {status === 'concluidos' && <CheckCircle size={16} />}
                      {statusLabels[status]}
                    </h3>
                    <span className="count">{demandas.length}</span>
                  </div>

                  <div
                    className="column-content"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, statusLabels[status])} // Passa o label para o handler
                  >
                    {demandas.map((demanda) => (
                      <div
                        key={demanda.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, demanda, statusLabels[status])}
                        onDragEnd={handleDragEnd}
                        className="kanban-card"
                      >
                        <div className="card-header">
                          <span className="processo-id">{demanda.id}</span>
                          <span className={`priority-badge ${getPrioridadeClass(demanda.prioridade)}`}>
                            {demanda.prioridade || 'normal'}
                          </span>
                        </div>

                        <h4 className="card-title">{demanda.titulo || `Processo ${demanda.id}`}</h4>
                        <p className="card-description">{demanda.descricao || 'Demanda em andamento'}</p>

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
              <button 
                  className="action-btn primary"
                  onClick={() => setIsCreatingDemanda(true)} // Abre o modal
              >
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

      {/* Modal/Componente para Cadastro de Demanda (RF01) */}
      {isCreatingDemanda && (
        <div className="modal-overlay" onClick={() => setIsCreatingDemanda(false)}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={() => setIsCreatingDemanda(false)}>X</button>
                <CadastrarDemanda 
                    onDemandaCriada={handleDemandaCriada} // Passa a função de callback
                    onCancel={() => setIsCreatingDemanda(false)} // Permite fechar pelo componente
                />
            </div>
        </div>
      )}
      {/* Fim ADIÇÃO 5 */}

      {modalOpen && demandaSelecionada && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditingDemanda ? 'Editar Demanda' : 'Detalhes da Demanda'}</h2>
              <button className="close-btn" onClick={() => { setModalOpen(false); setIsEditingDemanda(false); }}>×</button>
            </div>
            
            {isEditingDemanda ? (
              <div className="modal-body">
                <EditarDemanda
                  demanda={demandaSelecionada}
                  onDemandaAtualizada={handleDemandaAtualizada}
                  onCancel={() => setIsEditingDemanda(false)}
                />
              </div>
            ) : (
              <>
                <div className="modal-body">
                  <div className="detail-row">
                    <strong>ID:</strong>
                    <span>{demandaSelecionada.id}</span>
                  </div>
                  
                  <div className="detail-row">
                    <strong>Título:</strong>
                    <span>{demandaSelecionada.titulo || `Processo ${demandaSelecionada.id}`}</span>
                  </div>
                  
                  <div className="detail-row">
                    <strong>Descrição:</strong>
                    <span>{demandaSelecionada.descricao || 'Sem descrição'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <strong>Prazo:</strong>
                    <span className="prazo-destaque">
                      <Calendar size={16} />
                      {demandaSelecionada.prazo}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <strong>Responsável:</strong>
                    <span>{demandaSelecionada.responsavel}</span>
                  </div>
                  
                  <div className="detail-row">
                    <strong>Prioridade:</strong>
                    <span className={`priority-badge ${getPrioridadeClass(demandaSelecionada.prioridade)}`}>
                      {demandaSelecionada.prioridade || 'normal'}
                    </span>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setModalOpen(false)}>
                    Fechar
                  </button>
                  <button className="btn-primary" onClick={handleEditarDemanda}>
                    <Edit size={18} />
                    Editar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      
    </div>
  );
};

export default DashboardSocio;