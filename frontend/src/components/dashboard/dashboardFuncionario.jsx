import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, Calendar, AlertTriangle, List, Eye, Send, MessageSquare, Menu, User, Edit,LogOut } from 'lucide-react';
import '../../style/dashboardFuncionario.css';
import EditarDemanda from './EditarDemanda';
import { demandasAPI } from '../../services/api'; // Importa a API

import { useAuth } from '../../context/authContext'; // Importa o contexto para o usuário logado

const DashboardFuncionario = () => {
  const { user } = useAuth(); // Obtém o usuário logado (João/Maria)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [demandaSelecionada, setDemandaSelecionada] = useState(null);
  const [isEditingDemanda, setIsEditingDemanda] = useState(false);
  
  const userId = user?.id; 

  // Dados Mockados Restantes (Stats e Notificações)
  const mockData = {
    user: {
      id: userId,
      nome: user?.nome || 'Funcionário',
      avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=1e3a8a&color=fff'
    },
    stats: {
      total: 0, 
      emAndamento: 0, 
      aguardandoRevisao: 0, 
      urgentes: 0
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

  // Funções de Mapeamento: Converte dados do DB para o formato do Kanban do Funcionário, aplicando filtro
  const formatDemandasToKanbanFuncionario = (demandasArray, currentUserId) => {
    const kanban = {
      novas: [],
      em_andamento: [],
      aguardando_revisao: [],
      concluidas: [],
    };
    
    // Filtra apenas as demandas atribuídas a este usuário
    demandasArray
      .filter(d => d.responsavel_id === currentUserId) 
      .forEach(d => {
        const dataPrazo = new Date(d.data_prazo);
        const prazoFormatado = `${dataPrazo.getDate().toString().padStart(2, '0')}/${(dataPrazo.getMonth() + 1).toString().padStart(2, '0')}/${dataPrazo.getFullYear()}`;
        
        let statusKey;
        switch (d.status) {
          case 'Elaboração':
          case 'Nova':
            statusKey = 'novas';
            break;
          case 'Em Andamento':
            statusKey = 'em_andamento';
            break;
          case 'Aguardando Revisão':
            statusKey = 'aguardando_revisao';
            break;
          case 'Concluído':
          case 'Concluídos':
            statusKey = 'concluidas';
            break;
          default:
            statusKey = 'novas';
        }

        const item = {
          id: d.id, 
          titulo: d.titulo,
          descricao: d.descricao,
          prazo: prazoFormatado,
          prioridade: d.prioridade || 'normal', 
          atribuidoPor: 'Sócio', // Simplificado
          responsavelId: d.responsavel_id
        };

        if (kanban[statusKey]) {
          kanban[statusKey].push(item);
        }
      });

    return kanban;
  };
  // Fim das Funções de Mapeamento

  useEffect(() => {
    if (userId) { // Só carrega se o ID do usuário estiver disponível
      loadDados();
    }
  }, [userId]); // Dependência no userId para carregar após o login

  const loadDados = async () => {
    try {
      setLoading(true);
      
      const demandaResponse = await demandasAPI.getAll();
      const demandasBackend = demandaResponse.data;

      const kanbanData = formatDemandasToKanbanFuncionario(demandasBackend, userId);

      const totalDemandasFuncionario = demandasBackend.filter(d => d.responsavel_id === userId).length;
      const emAndamento = kanbanData.em_andamento.length;
      const aguardandoRevisao = kanbanData.aguardando_revisao.length;

      const combinedData = {
          user: mockData.user, 
          stats: {
            ...mockData.stats,
            total: totalDemandasFuncionario,
            emAndamento,
            aguardandoRevisao
          }, 
          demandas: kanbanData, // DADOS REAIS
          notificacoes: mockData.notificacoes 
      };

      setDados(combinedData);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setDados(mockData);
      setLoading(false);
    }
  };

  const LogoutButton = ({ userName, userAvatar, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="logout-container">
      <div
        className="logout-user"
        onClick={() => setShowMenu(!showMenu)}
      >
        <img src={userAvatar} alt="avatar" className="logout-avatar" />
        <span>{userName}</span>
      </div>

      {showMenu && (
        <div className="logout-menu">
          <button onClick={onLogout}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      )}
    </div>
  );
};


  const handleDemandaAtualizada = (demandaAtualizada) => {
    // CORREÇÃO: Recarrega os dados do servidor para sincronizar
    loadDados(); 
    
    setIsEditingDemanda(false);
    setModalOpen(false);
    alert('✅ Demanda atualizada com sucesso!');
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

  const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};


  const handleDrop = async (e, novoStatus) => {
    e.preventDefault();

    if (!draggedCard) return;

    const { demanda, status: statusAntigo } = draggedCard;

    // Mapeia o status do Frontend (Key) para o status do Backend (Valor)
    let novoStatusBackend;
    switch (novoStatus) {
      case 'novas':
        novoStatusBackend = 'Elaboração';
        break;
      case 'em_andamento':
        novoStatusBackend = 'Em Andamento';
        break;
      case 'aguardando_revisao':
        novoStatusBackend = 'Aguardando Revisão';
        break;
      case 'concluidas':
        novoStatusBackend = 'Concluído';
        break;
      default:
        return;
    }

    // Regras de negócio
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

    setDraggedCard(null);

    try {
        // 2. Chama a API para atualizar o status (PATCH /demandas/<id>/status)
        await demandasAPI.updateStatus(demanda.id, novoStatusBackend);
        
        // 3. Recarrega os dados do dashboard para refletir a persistência
        loadDados();
        //alert(`✅ Status atualizado para: ${novoStatusBackend}`);

    } catch (error) {
        console.error('Erro ao persistir movimento:', error);
        alert('❌ Falha ao atualizar o status da demanda. Verifique sua permissão.');
        loadDados(); // Recarrega para voltar o cartão para a posição salva no DB
    }
  };

  const verDetalhes = (demanda) => {
    setDemandaSelecionada(demanda);
    setIsEditingDemanda(false);
    setModalOpen(true);
  };

  const handleEditarDemanda = () => {
    setIsEditingDemanda(true);
  };

  const solicitarRevisao = () => {
    if (demandaSelecionada) {
      // NOTE: Aqui deveria haver uma chamada para o backend. 
      loadDados(); 

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

  const getStatusKey = (status) => {
    const map = {
      'Novos': 'novas',
      'Em Andamento': 'em_andamento',
      'Aguardando Revisão': 'aguardando_revisao',
      'Concluídas': 'concluidas'
    };
    return map[status] || status;
  };


  if (loading || !userId) { 
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
                        <span className="badge">3</span>
                      </div>
                      <LogoutButton
                        userName={dados?.user.nome}
                        userAvatar={dados?.user.avatar}
                        onLogout={handleLogout}
                      />
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
                className={`kanban-column 
                 ${status === "novas" ? "status-novos" : ""}
                 ${status === "em_andamento" ? "status-andamento" : ""}
                 ${status === "aguardando_revisao" ? "status-revisao" : ""}
                 ${status === "concluidas" ? "status-concluido" : ""}
              `}>
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
              <h2>{isEditingDemanda ? 'Editar Demanda' : 'Detalhes da Demanda'}</h2>
              <button onClick={() => { setModalOpen(false); setIsEditingDemanda(false); }} className="btn-close">
                ✕
              </button>
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
                    <span>{demandaSelecionada.titulo}</span>
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
                    <strong>Prioridade:</strong>
                    <span className={`priority-badge ${demandaSelecionada.prioridade}`}>
                      {demandaSelecionada.prioridade}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <strong>Atribuído por:</strong>
                    <span>{demandaSelecionada.atribuidoPor}</span>
                  </div>
                </div>

                <div className="modal-footer">
                  <button onClick={() => setModalOpen(false)} className="btn-secondary">
                    Fechar
                  </button>
                  <button onClick={handleEditarDemanda} className="btn-primary">
                    <Edit size={18} />
                    Editar
                  </button>
                  <button onClick={solicitarRevisao} className="btn-primary">
                    <Send size={18} />
                    Solicitar Revisão
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

export default DashboardFuncionario;