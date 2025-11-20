import { Tenant } from '../Models/TenantModels.js';

const ConfiguracoesController = {
  // Buscar configurações do tenant
  async buscarConfiguracoes(req, res) {
    try {
      const { tenantId } = req.params;

      const tenant = await Tenant.findOne({
        $or: [
          { tenantId },
          { slug: tenantId }
        ]
      });

      if (!tenant) {
        return res.status(404).json({ erro: 'Restaurante não encontrado' });
      }

      // Retornar configurações formatadas
      const config = {
        // Informações do tenant
        tenant: {
          tenantId: tenant.tenantId,
          slug: tenant.slug,
          nome: tenant.nome
        },
        
        // Delivery
        aceitaDelivery: tenant.configuracoes?.aceitaDelivery !== false,
        taxaEntrega: tenant.configuracoes?.taxaEntrega || 5.00,
        pedidoMinimo: tenant.configuracoes?.pedidoMinimo || 25.00,
        tempoEstimado: tenant.configuracoes?.tempoEstimado || '45-60 minutos',
        
        // Horário
        horarioAbertura: tenant.horarioFuncionamento?.abertura || '18:00',
        horarioFechamento: tenant.horarioFuncionamento?.fechamento || '23:30',
        diasFuncionamento: tenant.horarioFuncionamento?.diasSemana || ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'],
        fusoHorario: tenant.fusoHorario || 'America/Sao_Paulo',
        
        // Dados do restaurante
        nome: tenant.nome,
        telefone: tenant.telefone,
        endereco: tenant.endereco,
        
        // Formas de pagamento
        formasPagamento: tenant.configuracoes?.formasPagamento || ['dinheiro', 'pix', 'cartao']
      };

      res.json(config);
    } catch (erro) {
      console.error('Erro ao buscar configurações:', erro);
      res.status(500).json({ erro: 'Erro ao buscar configurações' });
    }
  },

  // Atualizar configurações
  async atualizarConfiguracoes(req, res) {
    try {
      const { tenantId } = req.params;
      const {
        aceitaDelivery,
        taxaEntrega,
        pedidoMinimo,
        tempoEstimado,
        horarioAbertura,
        horarioFechamento,
        diasFuncionamento,
        fusoHorario,
        nome,
        telefone,
        endereco,
        formasPagamento
      } = req.body;

      let tenant = await Tenant.findOne({
        $or: [
          { tenantId },
          { slug: tenantId }
        ]
      });

      if (!tenant) {
        // Criar tenant se não existir
        tenant = new Tenant({
          tenantId,
          nome: nome || 'FomeZap',
          slug: tenantId
        });
      }

      // Atualizar dados básicos
      tenant.nome = nome;
      tenant.telefone = telefone;
      tenant.endereco = endereco;
      tenant.fusoHorario = fusoHorario;

      // Atualizar horário de funcionamento
      tenant.horarioFuncionamento = {
        abertura: horarioAbertura,
        fechamento: horarioFechamento,
        diasSemana: diasFuncionamento
      };

      // Atualizar configurações
      tenant.configuracoes = {
        ...tenant.configuracoes,
        aceitaDelivery,
        taxaEntrega,
        pedidoMinimo,
        tempoEstimado,
        formasPagamento
      };

      await tenant.save();

      res.json({ 
        sucesso: true, 
        mensagem: 'Configurações atualizadas com sucesso',
        tenant 
      });
    } catch (erro) {
      console.error('Erro ao atualizar configurações:', erro);
      res.status(500).json({ erro: 'Erro ao atualizar configurações', detalhes: erro.message });
    }
  },

  // Verificar se está aberto
  async verificarHorarioFuncionamento(req, res) {
    try {
      const { tenantId } = req.params;

      const tenant = await Tenant.findOne({
        $or: [
          { tenantId },
          { slug: tenantId }
        ]
      });

      if (!tenant) {
        return res.status(404).json({ erro: 'Restaurante não encontrado' });
      }

      // Obter hora atual no fuso horário configurado
      const fusoHorario = tenant.fusoHorario || 'America/Sao_Paulo';
      const agora = new Date().toLocaleString('en-US', { timeZone: fusoHorario });
      const dataAtual = new Date(agora);
      
      const horaAtual = dataAtual.getHours();
      const minutoAtual = dataAtual.getMinutes();
      const horaAtualFormatada = `${String(horaAtual).padStart(2, '0')}:${String(minutoAtual).padStart(2, '0')}`;

      // Obter dia da semana (0 = domingo, 1 = segunda, ...)
      const diaSemana = dataAtual.getDay();
      const diasSemanaMap = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
      const diaAtual = diasSemanaMap[diaSemana];

      // Verificar se hoje é dia de funcionamento
      const diasFuncionamento = tenant.horarioFuncionamento?.diasSemana || [];
      const funcionaHoje = diasFuncionamento.includes(diaAtual);

      if (!funcionaHoje) {
        return res.json({ 
          aberto: false,
          motivo: 'Fechado hoje',
          proximaAbertura: 'Confira nossos dias de funcionamento'
        });
      }

      // Verificar horário
      const abertura = tenant.horarioFuncionamento?.abertura || '18:00';
      const fechamento = tenant.horarioFuncionamento?.fechamento || '23:30';

      // Converter horários para minutos desde meia-noite para comparação
      const converterParaMinutos = (hora) => {
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
      };

      const minutosAtual = converterParaMinutos(horaAtualFormatada);
      const minutosAbertura = converterParaMinutos(abertura);
      const minutosFechamento = converterParaMinutos(fechamento);

      let estaAberto = false;

      // Se fechamento < abertura, significa que o horário passa da meia-noite
      // Exemplo: Abre 01:00 e fecha 06:30 (madrugada)
      if (minutosFechamento < minutosAbertura) {
        // Está aberto se: hora atual >= abertura OU hora atual <= fechamento
        estaAberto = minutosAtual >= minutosAbertura || minutosAtual <= minutosFechamento;
      } else {
        // Horário normal (ex: 18:00 às 23:30)
        estaAberto = minutosAtual >= minutosAbertura && minutosAtual <= minutosFechamento;
      }

      res.json({
        aberto: estaAberto,
        horarioAbertura: abertura,
        horarioFechamento: fechamento,
        horaAtual: horaAtualFormatada,
        diaAtual,
        funcionaHoje,
        diasFuncionamento
      });
    } catch (erro) {
      console.error('Erro ao verificar horário:', erro);
      res.status(500).json({ erro: 'Erro ao verificar horário de funcionamento' });
    }
  }
};

export default ConfiguracoesController;
