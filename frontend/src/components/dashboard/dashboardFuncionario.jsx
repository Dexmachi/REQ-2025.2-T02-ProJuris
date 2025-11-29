import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, Calendar, AlertTriangle, List, Eye, Send, MessageSquare, Menu, User } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const DashboardFuncionario = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState(null);
  const [filtroAtivo, setFiltroAtivo] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [demandaSelecionada, setDemandaSelecionada] = useState(null);
  const [userId] = useState('123'); // Mock - virá da autenticação

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
        },
        {
          id: 'DEM-002',
          titulo: 'Revisar contrato de prestação',
          descricao: 'Contrato Cliente B',
          prazo: '08/12/2024',
          prioridade: 'normal',
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
          responsavelId: '123',
          aprovadoEm: '25/11/2024'
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
      },
      {
        id: 2,
        tipo: 'Prazo urgente',
        mensagem: 'DEM-003 vence em 2 dias',
        tempo: 'Há 3 horas',
        lida: false,
        urgente: true
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
    
    // 1. Só pode mover suas próprias demandas
    if (demanda.responsavelId !== userId) {
      alert('❌ Você só pode mover demandas atribuídas a você!');
      return;
    }

    // 2. Não pode voltar de aguardando_revisao
    if (statusAntigo === 'aguardando_revisao' && novoStatus === 'em_andamento') {
      alert('⚠️ Demandas em revisão não podem voltar. Aguarde aprovação do sócio.');
      return;
    }

    // 3. Não pode marcar como concluída
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
      // Mover para aguardando revisão
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

  const getPrioridadeColor = (prioridade) => {
    const colors = {
      urgente: 'bg-red-100 text-red-600',
      alta: 'bg-yellow-100 text-yellow-700',
      normal: 'bg-blue-100 text-blue-700'
    };
    return colors[prioridade] || colors.normal;
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
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Minhas Demandas</h1>
          <p className="text-gray-600 mt-1">
            Olá, <strong>{dados?.user.nome}</strong>! Aqui estão suas tarefas.
          </p>
          <div className="flex items-center gap-6 mt-4">
            <div className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {dados?.notificacoes.filter(n => !n.lida).length}
              </span>
            </div>
            <img
              src={dados?.user.avatar}
              alt="User"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
              <List className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm text-gray-600">Atribuídas</h3>
              <p className="text-3xl font-bold">{dados?.stats.total}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm text-gray-600">Em Andamento</h3>
              <p className="text-3xl font-bold">{dados?.stats.emAndamento}</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-xl shadow-sm flex gap-4 border-l-4 border-yellow-500">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm text-gray-600">Aguardando Revisão</h3>
              <p className="text-3xl font-bold">{dados?.stats.aguardandoRevisao}</p>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-xl shadow-sm flex gap-4 border-l-4 border-red-500">
            <div className="w-12 h-12 rounded-lg bg-red-100 text-red-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm text-gray-600">Urgentes</h3>
              <p className="text-3xl font-bold">{dados?.stats.urgentes}</p>
            </div>
          </div>
        </div>

        {/* Kanban */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Quadro de Demandas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Object.entries(dados?.demandas || {}).map(([status, demandas]) => (
              <div
                key={status}
                className={`rounded-lg p-4 min-h-[300px] ${
                  status === 'aguardando_revisao' ? 'bg-yellow-50' :
                  status === 'concluidas' ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center mb-4 pb-3 border-b-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    {status === 'novas' && <List className="w-4 h-4" />}
                    {status === 'em_andamento' && <Clock className="w-4 h-4" />}
                    {status === 'aguardando_revisao' && <Clock className="w-4 h-4" />}
                    {status === 'concluidas' && <CheckCircle className="w-4 h-4" />}
                    {getStatusLabel(status)}
                  </h3>
                  <span className="bg-gray-300 px-3 py-1 rounded-full text-xs font-bold">
                    {demandas.length}
                  </span>
                </div>

                <div
                  className="space-y-3"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  {demandas.map((demanda) => (
                    <div
                      key={demanda.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, demanda, status)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-move border-l-4 ${
                        status === 'aguardando_revisao' ? 'border-yellow-500' :
                        status === 'concluidas' ? 'border-green-500' : 'border-blue-900'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm">{demanda.id}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPrioridadeColor(demanda.prioridade)}`}>
                          {demanda.prioridade}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-sm mb-2">{demanda.titulo}</h4>
                      <p className="text-xs text-gray-600 mb-3">{demanda.descricao}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {demanda.prazo}
                        </div>
                        <button
                          onClick={() => verDetalhes(demanda)}
                          className="text-blue-900 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Notificações</h2>
          <div className="space-y-4">
            {dados?.notificacoes.map((notif) => (
              <div
                key={notif.id}
                className={`flex gap-4 p-4 rounded-lg ${
                  !notif.lida ? 'bg-blue-50 border-l-4 border-blue-900' : 'hover:bg-gray-50'
                }`}
              >
                <Bell className={`w-5 h-5 ${notif.urgente ? 'text-red-500' : 'text-blue-900'}`} />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    {notif.tipo}
                    {notif.urgente && (
                      <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs">
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
      </main>

      {/* Modal */}
      {modalOpen && demandaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{demandaSelecionada.id} - Detalhes</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-600 hover:text-red-500">
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{demandaSelecionada.titulo}</h3>
              <p className="text-gray-600 mb-6">{demandaSelecionada.descricao}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Prazo</label>
                  <p className="text-sm">{demandaSelecionada.prazo}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Prioridade</label>
                  <p className="text-sm">{demandaSelecionada.prioridade}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={solicitarRevisao}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                >
                  <Send className="w-5 h-5" />
                  Solicitar Revisão
                </button>
                <button className="flex items-center gap-2 px-6 py-3 border rounded-lg hover:bg-gray-50">
                  <MessageSquare className="w-5 h-5" />
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