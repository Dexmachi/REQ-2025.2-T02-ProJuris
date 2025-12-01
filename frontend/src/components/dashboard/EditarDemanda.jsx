import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react'; 
import api, { demandasAPI } from '../../services/api'; 

function EditarDemanda({ demanda, onDemandaAtualizada, onCancel }) {
  
  // Função auxiliar para converter DD/MM/YYYY para o formato que o input espera
  const formatBackendDate = (dateString) => {
    if (!dateString) return '';
    try {
      // Cria um objeto Date a partir da string ISO do backend
      const date = new Date(dateString);
      // Retorna no formato YYYY-MM-DDThh:mm, necessário para datetime-local
      return date.toISOString().slice(0, 16); 
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return '';
    }
  };


  const [formData, setFormData] = useState({
    titulo: demanda.titulo || '',
    descricao: demanda.descricao || '',
    // Tenta formatar a data que vem do backend (ISO) para o formato HTML datetime-local (YYYY-MM-DDThh:mm)
    data_prazo: formatBackendDate(demanda.data_prazo),
    status: demanda.status || 'Elaboração',
    prioridade: demanda.prioridade || 'normal', 
    responsavel_id: demanda.responsavel_id || '', 
  });

  
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Efeito para carregar a lista de usuários (para o campo Responsável)
  useEffect(() => {
    // Busca a lista de usuários (RF03)
    api.get('/usuarios')
      .then(response => {
        setUsuarios(response.data);
        // Tenta pre-selecionar o responsável atual
        const responsavelAtual = response.data.find(u => u.id === demanda.responsavel_id);
        if (responsavelAtual) {
            setFormData(prev => ({ ...prev, responsavel_id: responsavelAtual.id }));
        } else {
             // Mantém o ID original se o usuário não for encontrado na lista
             setFormData(prev => ({ ...prev, responsavel_id: demanda.responsavel_id }));
        }
      })
      .catch(err => {
        console.error("Erro ao carregar usuários para edição:", err);
        setError("Não foi possível carregar a lista de responsáveis para edição.");
      });
  }, [demanda.responsavel_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.titulo.trim() || !formData.data_prazo || !formData.responsavel_id) {
      setError('Título, Prazo e Responsável são obrigatórios.');
      setLoading(false);
      return;
    }
    
    // Converte a data do formato datetime-local para o formato ISO 8601 que o backend espera
    const data_prazo_iso = formData.data_prazo ? new Date(formData.data_prazo).toISOString() : null;

    try {
      // Prepara os dados para enviar ao backend
      const dadosAtualizados = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        data_prazo: data_prazo_iso,
        status: formData.status, 
        prioridade: formData.prioridade,
        responsavel_id: parseInt(formData.responsavel_id), // RF05: Transferir responsabilidade
      };
      
      // Chama a API PUT para atualizar a demanda (RF02 e RF05)
      const response = await demandasAPI.update(demanda.id, dadosAtualizados);

      if (response.data) {
        // Notifica o dashboard pai para recarregar ou atualizar a lista
        onDemandaAtualizada(response.data.demanda);
      }
    } catch (err) {
      console.error('❌ Erro ao atualizar demanda:', err.response?.data || err);
      // Exibe a mensagem de erro do backend (incluindo erros de permissão RF04)
      setError(err.response?.data?.message || 'Falha ao atualizar demanda. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="card-cadastro-demanda">
      <h2>Editar Demanda: {demanda.titulo}</h2>
      
      <form onSubmit={handleSubmit}>
        
        {/* TITULO E DESCRIÇÃO */}
        <div className="form-group">
          <label htmlFor="titulo">Título *</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ex: Elaborar petição inicial"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descreva os detalhes da demanda..."
            rows="4"
          />
        </div>

        {/* PRAZO E PRIORIDADE */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="data_prazo">Prazo *</label>
            <input
              type="datetime-local" 
              id="data_prazo"
              name="data_prazo"
              value={formData.data_prazo}
              onChange={handleChange}
              required
              max="9999-12-31T23:59" // CORREÇÃO: Limita o ano a 4 dígitos para validação HTML
            />
          </div>

          <div className="form-group">
            <label htmlFor="prioridade">Prioridade</label>
            <select
              id="prioridade"
              name="prioridade"
              value={formData.prioridade}
              onChange={handleChange}
            >
              <option value="baixa">Baixa</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>
        
        {/* STATUS */}
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="Elaboração">Elaboração</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Aguardando Revisão">Aguardando Revisão</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>

        {/* RESPONSÁVEL (RF05) */}
        <div className="form-group">
          <label htmlFor="responsavel_id">Responsável *</label>
          <select
            id="responsavel_id"
            name="responsavel_id"
            value={formData.responsavel_id}
            onChange={handleChange}
            required
            disabled={loading || usuarios.length === 0}
          >
            <option value="">Selecione o Responsável</option>
            {usuarios.map(user => (
              <option key={user.id} value={user.id}>
                {user.nome ? `${user.nome} (${user.email})` : user.email}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            <X size={18} />
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            <Save size={18} />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarDemanda;