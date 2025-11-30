import React, { useState, useEffect } from 'react';
import api from '../../services/api'; 
// Importamos o api para fazer requisições POST /demandas e GET /usuarios

function CadastrarDemanda({ onDemandaCriada }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_prazo: '',
    responsavel_id: '',
  });
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Busca a lista de usuários para popular o campo 'Responsável' (RF03)
    api.get('/usuarios')
      .then(response => {
        setUsuarios(response.data);
        // Define o primeiro usuário como padrão, se houver, ou deixa para seleção
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Envia os dados para a nova rota '/demandas' (POST)
      const response = await api.post('/demandas', {
        ...formData,
        // Garante que o responsavel_id seja um número
        responsavel_id: parseInt(formData.responsavel_id),
      });

      setSuccess(true);
      // Limpa o formulário, mantendo o responsável padrão
      setFormData({ 
        titulo: '',
        descricao: '',
        data_prazo: '',
        responsavel_id: usuarios[0]?.id || '', 
      });
      
      // Notifica o Dashboard pai para atualizar a lista (se houver)
      if (onDemandaCriada) {
          onDemandaCriada(response.data.demanda);
      }

    } catch (err) {
      console.error("Erro ao cadastrar demanda:", err.response?.data || err);
      setError(err.response?.data?.message || 'Falha ao cadastrar demanda. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-demanda-container">
      <h3>Cadastrar Nova Demanda (RF01)</h3>
      <form onSubmit={handleSubmit}>
        
        {/* Mensagens de feedback */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>Demanda criada com sucesso!</p>}
        
        <label>Título da Demanda *</label>
        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          required
        />

        <label>Descrição Detalhada</label>
        <textarea
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
        />

        <label>Prazo Final *</label>
        <input
          type="datetime-local" 
          name="data_prazo"
          value={formData.data_prazo}
          onChange={handleChange}
          required
        />
        
        <label>Responsável *</label>
        <select
          name="responsavel_id"
          value={formData.responsavel_id}
          onChange={handleChange}
          required
          disabled={loading || usuarios.length === 0}
        >
          <option value="">Selecione o Responsável</option>
          {usuarios.map(user => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar Demanda'}
        </button>
      </form>
    </div>
  );
}

export default CadastrarDemanda;