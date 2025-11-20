// FomeZap Super Admin - Frontend
const API_URL = 'http://localhost:3001/api';
let tenants = [];
let tenantIdExcluir = null;

// ===================================
// INICIALIZAÇÃO
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    carregarStatus();
    carregarTenants();
    
    // Event listeners
    document.getElementById('tenantForm').addEventListener('submit', salvarTenant);
    document.getElementById('criarAdmin').addEventListener('change', toggleAdminFields);
    document.getElementById('nome').addEventListener('input', gerarSlugAutomatico);
});

// ===================================
// STATUS DA CONEXÃO
// ===================================
async function carregarStatus() {
    try {
        const response = await fetch(`${API_URL}/status`);
        const data = await response.json();
        
        const statusEl = document.getElementById('status');
        statusEl.className = `status ${data.mongodb}`;
        statusEl.innerHTML = `
            ${data.mongodb === 'conectado' ? '✅' : '❌'} 
            MongoDB ${data.mongodb === 'conectado' ? 'Conectado' : 'Desconectado'} 
            (${data.database})
            <br><small>${data.ambiente === 'production' ? '🌐 PRODUÇÃO' : '💻 DESENVOLVIMENTO'}</small>
        `;
    } catch (error) {
        console.error('Erro ao verificar status:', error);
        const statusEl = document.getElementById('status');
        statusEl.className = 'status desconectado';
        statusEl.textContent = '❌ Erro de conexão';
    }
}

// ===================================
// CARREGAR TENANTS
// ===================================
async function carregarTenants() {
    const container = document.getElementById('tenantsList');
    container.innerHTML = '<div class="loading">🔄 Carregando tenants...</div>';
    
    try {
        const response = await fetch(`${API_URL}/tenants`);
        tenants = await response.json();
        
        if (tenants.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>📭 Nenhum tenant cadastrado</h3>
                    <p>Comece criando seu primeiro tenant para o FomeZap!</p>
                    <button class="btn btn-primary" onclick="abrirModalCriar()">
                        ➕ Criar Primeiro Tenant
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tenants.map(tenant => `
            <div class="tenant-card">
                <div class="tenant-header">
                    <div>
                        <div class="tenant-name">${tenant.nome}</div>
                        <div class="tenant-slug">${tenant.slug}</div>
                    </div>
                    <span class="tenant-status status-${tenant.status}">
                        ${getStatusIcon(tenant.status)} ${formatStatus(tenant.status)}
                    </span>
                </div>
                
                <div class="tenant-info">
                    ${tenant.telefone ? `
                        <div class="info-row">
                            <span class="info-label">📞 Telefone:</span>
                            <span class="info-value">${tenant.telefone}</span>
                        </div>
                    ` : ''}
                    ${tenant.email ? `
                        <div class="info-row">
                            <span class="info-label">📧 Email:</span>
                            <span class="info-value">${tenant.email}</span>
                        </div>
                    ` : ''}
                    <div class="info-row">
                        <span class="info-label">🆔 ID:</span>
                        <span class="info-value" style="font-family: monospace; font-size: 0.8rem;">${tenant.tenantId}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">🌐 Subdomínio:</span>
                        <span class="info-value">
                            <a href="https://${tenant.slug}.fomezap.com" target="_blank" style="color: #667eea;">
                                ${tenant.slug}.fomezap.com
                            </a>
                        </span>
                    </div>
                </div>
                
                <div class="tenant-stats">
                    <div class="stat">
                        <div class="stat-number">${tenant.stats?.categorias || 0}</div>
                        <div class="stat-label">Categorias</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${tenant.stats?.produtos || 0}</div>
                        <div class="stat-label">Produtos</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${tenant.stats?.usuarios || 0}</div>
                        <div class="stat-label">Usuários</div>
                    </div>
                </div>
                
                <div class="tenant-actions">
                    <button class="btn btn-primary btn-small" onclick="editarTenant('${tenant.tenantId}')">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger btn-small" onclick="abrirModalExcluir('${tenant.tenantId}', '${tenant.nome.replace(/'/g, "\\'")}')">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar tenants:', error);
        container.innerHTML = `
            <div class="empty-state">
                <h3>❌ Erro ao carregar tenants</h3>
                <p>${error.message}</p>
                <button class="btn btn-secondary" onclick="carregarTenants()">
                    🔄 Tentar Novamente
                </button>
            </div>
        `;
    }
}

// ===================================
// CRIAR/EDITAR TENANT
// ===================================
function abrirModalCriar() {
    document.getElementById('modalTitulo').textContent = 'Criar Novo Tenant';
    document.getElementById('tenantForm').reset();
    document.getElementById('tenantId').value = '';
    document.getElementById('slug').placeholder = 'Gerado automaticamente';
    document.getElementById('adminSection').style.display = 'block';
    document.getElementById('modal').classList.add('show');
}

async function editarTenant(tenantId) {
    try {
        const response = await fetch(`${API_URL}/tenants/${tenantId}`);
        const tenant = await response.json();
        
        document.getElementById('modalTitulo').textContent = 'Editar Tenant';
        document.getElementById('tenantId').value = tenant.tenantId;
        document.getElementById('nome').value = tenant.nome;
        document.getElementById('slug').value = tenant.slug;
        document.getElementById('telefone').value = tenant.telefone || '';
        document.getElementById('email').value = tenant.email || '';
        document.getElementById('endereco').value = tenant.endereco || '';
        document.getElementById('status').value = tenant.status;
        document.getElementById('adminSection').style.display = 'none';
        
        document.getElementById('modal').classList.add('show');
    } catch (error) {
        alert('Erro ao carregar tenant: ' + error.message);
    }
}

async function salvarTenant(e) {
    e.preventDefault();
    
    const tenantId = document.getElementById('tenantId').value;
    const isEdicao = !!tenantId;
    
    const dados = {
        nome: document.getElementById('nome').value,
        slug: document.getElementById('slug').value || undefined,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value,
        endereco: document.getElementById('endereco').value,
        status: document.getElementById('status').value
    };
    
    // Se for criação e checkbox marcado, adicionar dados do admin
    if (!isEdicao && document.getElementById('criarAdmin').checked) {
        dados.criarAdmin = true;
        dados.emailAdmin = document.getElementById('emailAdmin').value;
        dados.senhaAdmin = document.getElementById('senhaAdmin').value;
        
        if (!dados.emailAdmin || !dados.senhaAdmin) {
            alert('Preencha email e senha do admin ou desmarque a opção');
            return;
        }
    }
    
    try {
        const url = isEdicao ? `${API_URL}/tenants/${tenantId}` : `${API_URL}/tenants`;
        const method = isEdicao ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erro ao salvar tenant');
        }
        
        alert(result.message);
        
        // Se foi criação e criou admin, mostrar credenciais
        if (!isEdicao && result.admin) {
            alert(`✅ Tenant criado com sucesso!\n\n👤 CREDENCIAIS DO ADMIN:\nEmail: ${result.admin.email}\nSenha: ${result.admin.senha}\n\n⚠️ Anote essas credenciais!`);
        }
        
        fecharModal();
        carregarTenants();
        
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

// ===================================
// EXCLUIR TENANT
// ===================================
function abrirModalExcluir(tenantId, nome) {
    tenantIdExcluir = tenantId;
    document.getElementById('nomeExcluir').textContent = nome;
    document.getElementById('modalExcluir').classList.add('show');
}

async function confirmarExclusao() {
    if (!tenantIdExcluir) return;
    
    try {
        const response = await fetch(`${API_URL}/tenants/${tenantIdExcluir}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erro ao excluir tenant');
        }
        
        alert(result.message);
        fecharModalExcluir();
        carregarTenants();
        
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

// ===================================
// UTILITÁRIOS
// ===================================
function fecharModal() {
    document.getElementById('modal').classList.remove('show');
}

function fecharModalExcluir() {
    document.getElementById('modalExcluir').classList.remove('show');
    tenantIdExcluir = null;
}

function toggleAdminFields() {
    const checked = document.getElementById('criarAdmin').checked;
    document.getElementById('adminFields').style.display = checked ? 'block' : 'none';
}

function gerarSlugAutomatico() {
    const nome = document.getElementById('nome').value;
    if (!document.getElementById('tenantId').value) { // Só auto-gerar se for criação
        const slug = nome
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        document.getElementById('slug').value = slug;
    }
}

function getStatusIcon(status) {
    const icons = {
        'ativo': '✅',
        'inativo': '🔴',
        'trial': '🎯',
        'suspenso': '⚠️'
    };
    return icons[status] || '❓';
}

function formatStatus(status) {
    const labels = {
        'ativo': 'Ativo',
        'inativo': 'Inativo',
        'trial': 'Trial',
        'suspenso': 'Suspenso'
    };
    return labels[status] || status;
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    const modalExcluir = document.getElementById('modalExcluir');
    
    if (event.target === modal) {
        fecharModal();
    }
    if (event.target === modalExcluir) {
        fecharModalExcluir();
    }
}
