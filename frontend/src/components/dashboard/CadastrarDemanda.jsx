import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function CadastrarDemanda({ onDemandaCriada, onCancel }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_prazo: '',
    responsavel_id: '',
    prioridade: 'normal',
  });
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Busca a lista de usuários para popular o campo 'Responsável' (RF03)
    api.get('/usuarios')
      .then(response => {
        setUsuarios(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, responsavel_id: response.data[0].id }));
        }
      })
      .catch(err => {
        console.error("Erro ao carregar usuários:", err);
        setError("Não foi possível carregar a lista de responsáveis.");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpa erro quando usuário começar a digitar
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Converte o data_prazo de volta para o formato ISO 8601 (o backend espera)
    const data_prazo_iso = new Date(formData.data_prazo).toISOString();

    try {
      const response = await api.post('/demandas', {
        ...formData,
        data_prazo: data_prazo_iso, // Usa o formato ISO
        responsavel_id: parseInt(formData.responsavel_id),
        prioridade: formData.prioridade,
      });

      // Limpa o formulário
      setFormData({ 
        titulo: '',
        descricao: '',
        data_prazo: '',
        responsavel_id: usuarios[0]?.id || '', 
        prioridade: 'normal',
      });
      
      // Notifica o Dashboard pai
      if (onDemandaCriada) {
        onDemandaCriada(response.data.demanda);
      }
      
      alert('✅ Demanda cadastrada com sucesso!');
      if (onCancel) {
        setTimeout(() => onCancel(), 500);
      }

    } catch (err) {
      console.error("Erro ao cadastrar demanda:", err.response?.data || err);
      setError(err.response?.data?.message || 'Falha ao cadastrar demanda. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-cadastro-demanda">
      <h2>Cadastrar Nova Demanda</h2>
      
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div>
          <label htmlFor="titulo">Título da Demanda *</label>
          <input
            id="titulo"
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ex: Elaborar petição inicial"
            required
            maxLength="100"
          />
        </div>

        <div>
          <label htmlFor="descricao">Descrição Detalhada</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descreva os detalhes da demanda..."
            rows="4"
          />
        </div>

        <div>
          <label htmlFor="data_prazo">Prazo Final *</label>
          <input
            id="data_prazo"
            type="datetime-local"
            name="data_prazo"
            value={formData.data_prazo}
            onChange={handleChange}
            required
            max="9999-12-31T23:59" // CORREÇÃO: Limita o ano a 4 dígitos para validação HTML
          />
        </div>

        {/* NOVO BLOCO: Prioridade */}
        <div>
          <label htmlFor="prioridade">Prioridade</label>
          <select
            id="prioridade"
            name="prioridade"
            value={formData.prioridade}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="baixa">Baixa</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
        
        <div>
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
        
        <div className="form-buttons">
          {onCancel && (
            <button 
              type="button" 
              className="btn-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar Demanda'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CadastrarDemanda;