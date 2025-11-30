import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const EditarDemanda = ({ demanda, onDemandaAtualizada, onCancel }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_prazo: '',
    prioridade: 'normal'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (demanda) {
      // Converte a data do formato brasileiro para ISO (YYYY-MM-DD)
      let dataISO = '';
      if (demanda.prazo) {
        const [dia, mes, ano] = demanda.prazo.split('/');
        dataISO = `${ano}-${mes}-${dia}`;
      } else if (demanda.data_prazo) {
        dataISO = demanda.data_prazo.split('T')[0];
      }

      setFormData({
        titulo: demanda.titulo || `Processo ${demanda.id}`,
        descricao: demanda.descricao || '',
        data_prazo: dataISO,
        prioridade: demanda.prioridade || 'normal'
      });
    }
  }, [demanda]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validações
      if (!formData.titulo.trim()) {
        setError('O título é obrigatório');
        setLoading(false);
        return;
      }

      if (!formData.data_prazo) {
        setError('O prazo é obrigatório');
        setLoading(false);
        return;
      }

      // Prepara os dados para enviar ao backend
      const dadosAtualizados = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        data_prazo: new Date(formData.data_prazo).toISOString(),
        prioridade: formData.prioridade
      };

      // Extrai o ID numérico do código da demanda (ex: "DEM-001" -> "001" ou se já for número, usa direto)
      let demandaId = demanda.id;
      if (typeof demandaId === 'string' && demandaId.includes('-')) {
        // Remove o prefixo e pega apenas o número
        demandaId = demandaId.split('-').pop();
      }

      const token = localStorage.getItem('token');
      
      // Debug logs
      console.log('🔍 Debug - Editando demanda:');
      console.log('  ID original:', demanda.id);
      console.log('  ID para enviar:', demandaId);
      console.log('  Token existe?', !!token);
      console.log('  URL:', `${API_BASE_URL}/demandas/${demandaId}`);
      
      if (!token) {
        setError('Você não está autenticado. Faça login novamente.');
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/demandas/${demandaId}`,
        dadosAtualizados,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        onDemandaAtualizada(response.data.demanda);
      }
    } catch (err) {
      console.error('❌ Erro ao atualizar demanda:', err);
      console.error('  Status:', err.response?.status);
      console.error('  Dados:', err.response?.data);
      console.error('  Headers:', err.response?.headers);
      setError(err.response?.data?.error || 'Erro ao atualizar a demanda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editar-demanda-container">
      <form onSubmit={handleSubmit}>
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="data_prazo">Prazo *</label>
            <input
              type="date"
              id="data_prazo"
              name="data_prazo"
              value={formData.data_prazo}
              onChange={handleChange}
              required
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

        {error && <div className="error-message">{error}</div>}

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
