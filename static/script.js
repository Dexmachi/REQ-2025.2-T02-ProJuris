// Configuração da API Backend
const API_CONFIG = {
    baseURL: 'http://localhost:5000/api', // Ajuste conforme seu backend Flask
    endpoints: {
        dashboard: '/dashboard',
        processos: '/processos',
        tarefas: '/tarefas',
        notificacoes: '/notificacoes',
        stats: '/stats',
        kanban: '/kanban'
    }
};

// Estado global da aplicação
const appState = {
    currentStatsIndex: 0,
    totalStats: 4,
    dados: null
};

// Inicialização do Dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard LegisPRO carregado');
    
    // Configurações iniciais
    setupSidebarToggle();
    setupStatsCarousel();
    setupInteractions();
    
    // Carregar dados do backend
    loadDashboardData();
    
    // Animações
    animateCards();
});

function setupStatsCarousel() {
    const prevBtn = document.getElementById('stats-prev');
    const nextBtn = document.getElementById('stats-next');
    const statsGrid = document.querySelector('.stats-grid');
    
    if (!prevBtn || !nextBtn || !statsGrid) {
        console.error('Elementos do carrossel não encontrados');
        return;
    }
    
    // Event listeners dos botões
    prevBtn.addEventListener('click', () => navigateStats('prev'));
    nextBtn.addEventListener('click', () => navigateStats('next'));
    
    // Atualizar estado inicial dos botões
    updateCarouselButtons();
}

function navigateStats(direction) {
    const statsGrid = document.querySelector('.stats-grid');
    const cardWidth = statsGrid.querySelector('.stat-card').offsetWidth;
    const gap = 24; // 1.5rem = 24px
    const moveDistance = cardWidth + gap;
    
    if (direction === 'next' && appState.currentStatsIndex < appState.totalStats - 2) {
        appState.currentStatsIndex++;
    } else if (direction === 'prev' && appState.currentStatsIndex > 0) {
        appState.currentStatsIndex--;
    }
    
    // Aplicar transformação
    const translateX = -(appState.currentStatsIndex * moveDistance);
    statsGrid.style.transform = `translateX(${translateX}px)`;
    
    updateCarouselButtons();
}

function updateCarouselButtons() {
    const prevBtn = document.getElementById('stats-prev');
    const nextBtn = document.getElementById('stats-next');
    
    // Desabilitar botão prev se estiver no início
    prevBtn.disabled = appState.currentStatsIndex === 0;
    
    // Desabilitar botão next se estiver no final
    nextBtn.disabled = appState.currentStatsIndex >= appState.totalStats - 2;
}

function setupSidebarToggle() {
    const toggleBtn = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            console.log('Sidebar toggle clicked - collapsed:', sidebar.classList.contains('collapsed'));
        });
    } else {
        console.error('Elementos da sidebar não encontrados');
    }
}

//COMUNICAÇÃO COM BACKEND USANDO FLASK

/**
 * Função genérica para fazer requisições à API
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };
    
    // Adicionar body para POST/PUT/PATCH
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log(`✅ ${method} ${endpoint}:`, responseData);
        return responseData;
        
    } catch (error) {
        console.error(`❌ Erro em ${method} ${endpoint}:`, error);
        showNotification(`Erro ao comunicar com o servidor: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * Carregar dados completos do dashboard
 */
async function loadDashboardData() {
    try {
        const data = await apiRequest(API_CONFIG.endpoints.dashboard);
        appState.dados = data;
        
        // Atualizar interface com os dados
        updateStatsCards(data.stats);
        updateKanbanBoard(data.kanban);
        updateNotifications(data.notificacoes);
        
        showNotification('Dashboard atualizado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        // Usar dados de exemplo em caso de erro
        useMockData();
    }
}

/**
 * Criar novo processo
 */
async function createProcesso(processoData) {
    try {
        const response = await apiRequest(API_CONFIG.endpoints.processos, 'POST', processoData);
        
        showNotification('Processo criado com sucesso!', 'success');
        loadDashboardData(); // Recarregar dados
        
        return response;
    } catch (error) {
        console.error('Erro ao criar processo:', error);
        return null;
    }
}

/**
 * Atualizar status de processo (movimentação no Kanban)
 */
async function updateProcessoStatus(processoId, novoStatus) {
    try {
        const data = {
            id: processoId,
            status: novoStatus,
            timestamp: new Date().toISOString()
        };
        
        const response = await apiRequest(
            `${API_CONFIG.endpoints.processos}/${processoId}/status`, 
            'PATCH', 
            data
        );
        
        showNotification('Status atualizado com sucesso!', 'success');
        return response;
        
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        return null;
    }
}

/**
 * Buscar processos com filtros
 */
async function searchProcessos(filtros = {}) {
    try {
        const queryParams = new URLSearchParams(filtros).toString();
        const endpoint = `${API_CONFIG.endpoints.processos}?${queryParams}`;
        
        const response = await apiRequest(endpoint);
        return response;
        
    } catch (error) {
        console.error('Erro ao buscar processos:', error);
        return [];
    }
}

/**
 * Marcar notificação como lida
 */
async function markNotificationAsRead(notificationId) {
    try {
        await apiRequest(
            `${API_CONFIG.endpoints.notificacoes}/${notificationId}/read`, 
            'PATCH'
        );
    } catch (error) {
        console.error('Erro ao marcar notificação:', error);
    }
}

//ATUALIZAÇÃO DA INTERFACE

function updateStatsCards(stats) {
    if (!stats) return;
    
    const statsData = [
        { 
            key: 'processos_ativos', 
            selector: '.stat-card:nth-child(1) .stat-value',
            changeSelector: '.stat-card:nth-child(1) .stat-change'
        },
        { 
            key: 'prazos_prazo', 
            selector: '.stat-card:nth-child(2) .stat-value',
            changeSelector: '.stat-card:nth-child(2) .stat-change'
        },
        { 
            key: 'prazos_criticos', 
            selector: '.stat-card:nth-child(3) .stat-value',
            changeSelector: '.stat-card:nth-child(3) .stat-change'
        },
        { 
            key: 'tempo_medio', 
            selector: '.stat-card:nth-child(4) .stat-value',
            changeSelector: '.stat-card:nth-child(4) .stat-change'
        }
    ];
    
    statsData.forEach(stat => {
        const valueElement = document.querySelector(stat.selector);
        const changeElement = document.querySelector(stat.changeSelector);
        
        if (valueElement && stats[stat.key]) {
            valueElement.textContent = stats[stat.key].value;
            
            if (changeElement && stats[stat.key].change) {
                changeElement.textContent = stats[stat.key].change;
            }
        }
    });
}

function updateKanbanBoard(kanban) {
    if (!kanban) return;
    
    const colunas = ['novos', 'em_andamento', 'aguardando', 'concluidos'];
    
    colunas.forEach((coluna, index) => {
        const columnContent = document.querySelectorAll('.column-content')[index];
        const countElement = document.querySelectorAll('.count')[index];
        
        if (columnContent && kanban[coluna]) {
            columnContent.innerHTML = '';
            
            kanban[coluna].forEach(processo => {
                const card = createKanbanCard(processo);
                columnContent.appendChild(card);
            });
            
            if (countElement) {
                countElement.textContent = kanban[coluna].length;
            }
        }
    });
}

function createKanbanCard(processo) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.setAttribute('draggable', 'true');
    card.dataset.processoId = processo.id;
    
    card.innerHTML = `
        <p class="processo-id">Processo ${processo.id}</p>
        <p class="processo-prazo"><i class="far fa-calendar"></i> Prazo: ${processo.prazo}</p>
    `;
    
    // Adicionar event listeners de drag and drop
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    
    return card;
}

function updateNotifications(notificacoes) {
    if (!notificacoes) return;
    
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList) return;
    
    notificationsList.innerHTML = '';
    
    notificacoes.forEach(notificacao => {
        const item = createNotificationItem(notificacao);
        notificationsList.appendChild(item);
    });
}

function createNotificationItem(notificacao) {
    const item = document.createElement('div');
    item.className = 'notification-item';
    item.dataset.notificationId = notificacao.id;
    
    const urgenteTag = notificacao.urgente 
        ? '<span class="badge-urgente">Urgente</span>' 
        : '';
    
    item.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-circle"></i>
        </div>
        <div class="notification-content">
            <h4>${notificacao.tipo} ${urgenteTag}</h4>
            <p>${notificacao.mensagem}</p>
            <span class="time">${notificacao.tempo}</span>
        </div>
    `;
    
    item.addEventListener('click', function() {
        this.style.backgroundColor = '#f3f4f6';
        markNotificationAsRead(notificacao.id);
        setTimeout(() => {
            this.style.backgroundColor = 'transparent';
        }, 300);
    });
    
    return item;
}

//DADOS DE EXEMPLO
function useMockData() {
    const mockData = {
        stats: {
            processos_ativos: { value: 124, change: '+12% vs mês anterior' },
            prazos_prazo: { value: 89, change: '+5% vs mês anterior' },
            prazos_criticos: { value: 7, change: null },
            tempo_medio: { value: '12 dias', change: '-2 dias vs mês anterior' }
        },
        kanban: {
            novos: [
                { id: '2024-001', prazo: '15/12/2024' },
                { id: '2024-002', prazo: '18/12/2024' }
            ],
            em_andamento: [
                { id: '2024-003', prazo: '20/12/2024' },
                { id: '2024-004', prazo: '22/12/2024' }
            ],
            aguardando: [
                { id: '2024-005', prazo: '10/01/2025' }
            ],
            concluidos: [
                { id: '2024-006', prazo: '01/12/2024' }
            ]
        },
        notificacoes: [
            {
                id: 1,
                tipo: 'Prazo Próximo',
                mensagem: 'Processo 2024-001 vence em 3 dias',
                tempo: 'Há 2 horas',
                urgente: true
            },
            {
                id: 2,
                tipo: 'Nova Tarefa',
                mensagem: 'Você foi atribuído ao processo 2024-007',
                tempo: 'Há 5 horas',
                urgente: false
            }
        ]
    };
    
    appState.dados = mockData;
    updateStatsCards(mockData.stats);
    updateKanbanBoard(mockData.kanban);
    updateNotifications(mockData.notificacoes);
}

//ANIMAÇÕES
function animateCards() {
    const cards = document.querySelectorAll('.stat-card, .kanban-card, .notification-item');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

//INTERAÇÕES
function setupInteractions() {
    // Menu lateral
    const menuItems = document.querySelectorAll('.nav-menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Botões de ação rápida
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.querySelector('strong').textContent;
            handleQuickAction(action);
        });
    });
    
    // Configurar drag and drop inicial
    setupDragAndDrop();
}

function setupDragAndDrop() {
    const kanbanCards = document.querySelectorAll('.kanban-card');
    kanbanCards.forEach(card => {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    const columns = document.querySelectorAll('.column-content');
    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
    });
}

//DRAG AND DROP
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.style.opacity = '0.5';
}

function handleDragEnd(e) {
    this.style.opacity = '1';
}

function handleDragOver(e) {
    e.preventDefault();
    return false;
}

function handleDrop(e) {
    e.preventDefault();
    
    if (draggedElement) {
        this.appendChild(draggedElement);
        updateColumnCounts();
        
        // Obter novo status baseado na coluna
        const columnHeader = this.previousElementSibling;
        const novoStatus = columnHeader.querySelector('h3').textContent.toLowerCase();
        const processoId = draggedElement.dataset.processoId;
        
        // Enviar atualização para o backend
        if (processoId) {
            updateProcessoStatus(processoId, novoStatus);
        }
        
        showNotification('Processo movido com sucesso!');
    }
    
    return false;
}

function updateColumnCounts() {
    const columns = document.querySelectorAll('.kanban-column');
    
    columns.forEach(column => {
        const count = column.querySelectorAll('.kanban-card').length;
        const countElement = column.querySelector('.count');
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

//AÇÕES RÁPIDAS
function handleQuickAction(action) {
    console.log(`Ação selecionada: ${action}`);
    
    switch(action) {
        case 'Novo Processo':
            openNovoProcessoForm();
            break;
        case 'Importar Excel':
            showNotification('Funcionalidade de importação em desenvolvimento...', 'info');
            break;
        case 'Gerar Relatório':
            generateRelatorio();
            break;
        case 'Buscar Modelo':
            showNotification('Abrindo busca de modelos...', 'info');
            break;
        default:
            showNotification('Ação não reconhecida', 'warning');
    }
}

function openNovoProcessoForm() {
    showNotification('Abrindo formulário de novo processo...', 'info');
    // Aqui podemos abrir um modal ou redirecionar
    // Exemplo de dados a enviar:
    const novoProcesso = {
        numero: '2024-008',
        tipo: 'Civil',
        cliente: 'Cliente Exemplo',
        prazo: '30/12/2024',
        status: 'novos',
        prioridade: 'normal'
    };
    
    // Descomentar quando backend estiver pronto!!!!:
    // createProcesso(novoProcesso);
}

function generateRelatorio() {
    showNotification('Gerando relatório...', 'info');
    // Implementar lógica de geração de relatório!!!!!
}

//NOTIFICAÇÕES
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#1e3a8a'
    };
    
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

//ANIMAÇÕES CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// PERIÓDICA
// Atualizar dashboard a cada 5 minutos
setInterval(() => {
    console.log('Atualizando dashboard automaticamente...');
    loadDashboardData();
}, 5 * 60 * 1000);

// exportar funções para uso global (OPCIONAL)
window.LegisPRO = {
    api: {
        loadDashboardData,
        createProcesso,
        updateProcessoStatus,
        searchProcessos,
        markNotificationAsRead
    },
    ui: {
        navigateStats,
        showNotification,
        updateStatsCards,
        updateKanbanBoard
    }
};