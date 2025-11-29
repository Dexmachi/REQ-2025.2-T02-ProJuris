import React, { useState, useEffect } from 'react';
import { Bell, Home, Folder, Users, TrendingUp, FileText, Plus, Settings, ChevronLeft, ChevronRight, Calendar, AlertTriangle, Clock, FolderOpen, CheckCircle, Menu } from 'lucide-react';

// Configuração da API
const API_BASE_URL = 'http://localhost:5000/api';

const DashboardSocio = () => {
  // Estados
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentStatsIndex, setCurrentStatsIndex] = useState(0);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState(null);

  // Dados mock (substituir por chamada real à API)
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

  // Carregar dados
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

  // Menu items
  const menuItems = [
    { icon: Home, label: 'Processos', active: true },
    { icon: Folder, label: 'Tarefas' },
    { icon: Users, label: 'Atribuições' },
    { icon: TrendingUp, label: 'Métricas' },
    { icon: FileText, label: 'Relatórios' },
    { icon: Plus, label: 'Adicionar' },
    { icon: Settings, label: 'Configurações' }
  ];

  // Stats data
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

  // Navegação do carrossel
  const navigateStats = (direction) => {
    if (direction === 'prev' && currentStatsIndex > 0) {
      setCurrentStatsIndex(currentStatsIndex - 1);
    } else if (direction === 'next' && currentStatsIndex < statsData.length - 2) {
      setCurrentStatsIndex(currentStatsIndex + 1);
    }
  };

  // Drag and Drop
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

    // Mover demanda
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`bg-blue-900 text-white transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-72'} fixed h-full overflow-y-auto z-50`}>
        <div className="p-6 flex items-center justify-between">
          {!sidebarCollapsed && <h2 className="text-2xl font-bold">LegisPRO</h2>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-white/10 rounded"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6">
          <ul>
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li
                  key={index}
                  className={`px-6 py-3 cursor-pointer transition flex items-center gap-4 ${
                    item.active ? 'bg-white/15 border-l-4 border-white' : 'hover:bg-white/10'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'} p-8 overflow-y-auto`}>
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                3
              </span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={dados?.user.avatar}
                alt="User"
                className="w-10 h-10 rounded-full"
              />
              <span className="font-medium">{dados?.user.nome}</span>
            </div>
          </div>
        </header>

        {/* Stats Carousel */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateStats('prev')}
              disabled={currentStatsIndex === 0}
              className="bg-white border rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-900 hover:text-white transition disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 overflow-hidden">
              <div
                className="flex gap-6 transition-transform duration-400"
                style={{ transform: `translateX(-${currentStatsIndex * 51.5}%)` }}
              >
                {statsData.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition min-w-[calc(50%-12px)] flex gap-4 ${
                        stat.critical ? 'bg-red-50 border-l-4 border-red-500' : ''
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        stat.color === 'blue' ? 'bg-blue-100 text-blue-900' :
                        stat.color === 'green' ? 'bg-green-100 text-green-600' :
                        stat.color === 'red' ? 'bg-red-100 text-red-500' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm text-gray-600 mb-2">{stat.title}</h3>
                        <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                        {stat.change && (
                          <p className={`text-xs ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>
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
              className="bg-white border rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-900 hover:text-white transition disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Visão Geral - Kanban</h2>
            <button className="text-blue-900 flex items-center gap-2 text-sm font-medium">
              Ver Quadro Completo <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Object.entries(dados?.kanban || {}).map(([status, demandas]) => {
              const statusLabels = {
                novos: 'Novos',
                em_andamento: 'Em Andamento',
                aguardando: 'Aguardando',
                concluidos: 'Concluídos'
              };
              
              return (
                <div key={status} className="bg-gray-50 rounded-lg p-4 min-h-[300px]">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b-2">
                    <h3 className="text-sm font-semibold">{statusLabels[status]}</h3>
                    <span className="bg-gray-300 px-3 py-1 rounded-full text-xs font-bold">
                      {demandas.length}
                    </span>
                  </div>

                  <div
                    className="space-y-3"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, statusLabels[status])}
                  >
                    {demandas.map((demanda) => (
                      <div
                        key={demanda.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, demanda, statusLabels[status])}
                        onDragEnd={handleDragEnd}
                        className="bg-white p-4 rounded-lg border-l-4 border-blue-900 shadow-sm hover:shadow-md transition cursor-move"
                      >
                        <p className="font-semibold text-sm mb-2">{demanda.id}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Notificações</h2>
            <div className="space-y-4">
              {dados?.notificacoes.map((notif) => (
                <div key={notif.id} className="flex gap-4 p-4 hover:bg-gray-50 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-900" />
                  <div>
                    <h4 className="text-sm font-semibold mb-1">
                      {notif.tipo}
                      {notif.urgente && (
                        <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs">
                          Urgente
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">{notif.mensagem}</p>
                    <span className="text-xs text-gray-500">{notif.tempo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Ações Rápidas</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-4 p-4 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
                <Plus className="w-6 h-6" />
                <div className="text-left text-sm">
                  <div className="font-semibold">Novo Processo</div>
                  <div className="text-xs opacity-90">Criar instantemente</div>
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