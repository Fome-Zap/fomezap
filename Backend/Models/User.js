import mongoose from 'mongoose';
import argon2 from 'argon2';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres']
  },
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'tenant_admin', 'employee'],
    default: 'tenant_admin',
    required: true
  },
  tenantId: {
    type: String,
    required: function() {
      // tenantId é obrigatório para tenant_admin e employee, mas não para super_admin
      return this.role !== 'super_admin';
    }
  },
  ativo: {
    type: Boolean,
    default: true
  }
  // Recuperação de senha
  , resetToken: {
    type: String,
    default: null
  },
  resetTokenExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Middleware para hashear senha antes de salvar
userSchema.pre('save', async function(next) {
  // Só hashear se a senha foi modificada (ou é nova)
  if (!this.isModified('senha')) return next();
  
  try {
    // Gerar hash com argon2
    this.senha = await argon2.hash(this.senha);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senha
userSchema.methods.compararSenha = async function(senhaInformada) {
  try {
    return await argon2.verify(this.senha, senhaInformada);
  } catch (error) {
    return false;
  }
};

// Método para retornar dados públicos (sem senha)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.senha;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
