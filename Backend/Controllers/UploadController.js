import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UploadController {
  
  // POST /api/upload/foto - Upload de foto com compressão
  async uploadFoto(req, res) {
    try {
      console.log('📤 Upload iniciado');
      console.log('📋 req.file:', req.file);
      
      // Verificar se arquivo foi enviado
      if (!req.file) {
        console.log('❌ Nenhum arquivo enviado');
        return res.status(400).json({ 
          mensagem: 'Nenhum arquivo foi enviado' 
        });
      }

      const file = req.file;
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      const originalPath = file.path;
      
      console.log('📁 Pasta uploads:', uploadsDir);
      console.log('📄 Arquivo original:', originalPath);
      
      // Gerar nome do arquivo comprimido
      const ext = path.extname(file.filename);
      const nameWithoutExt = path.basename(file.filename, ext);
      const compressedFilename = `${nameWithoutExt}-compressed.webp`;
      const compressedPath = path.join(uploadsDir, compressedFilename);

      console.log('🗜️ Comprimindo para:', compressedPath);

      // Comprimir e converter para WebP (formato mais leve)
      // Usar failOnError: false para tentar processar mesmo com erros menores
      await sharp(originalPath, { failOnError: false })
        .rotate() // Auto-rotaciona baseado em EXIF (previne problemas de orientação)
        .resize(400, 400, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: false
        })
        .webp({ quality: 80 })
        .toFile(compressedPath);

      console.log('✅ Compressão concluída');

      // Deletar arquivo original (com retry para Windows)
      try {
        // Aguardar um pouco antes de deletar (Windows pode estar travando)
        await new Promise(resolve => setTimeout(resolve, 100));
        fs.unlinkSync(originalPath);
        console.log('🗑️ Arquivo original deletado');
      } catch (unlinkError) {
        console.warn('⚠️ Não foi possível deletar arquivo original:', unlinkError.message);
        // Continua mesmo se não conseguir deletar
      }

      // URL para acessar a imagem
      const imageUrl = `/uploads/${compressedFilename}`;

      console.log('🎉 Upload concluído! URL:', imageUrl);

      res.json({
        mensagem: 'Upload realizado com sucesso',
        arquivo: {
          nome: compressedFilename,
          url: imageUrl,
          tamanho: fs.statSync(compressedPath).size,
          tipo: 'image/webp'
        }
      });

    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      console.error('❌ Stack:', error.stack);
      
      // Limpar arquivo se houver erro
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({ 
        mensagem: 'Erro ao processar upload',
        erro: error.message,
        detalhes: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // DELETE /api/upload/foto/:filename - Deletar foto
  async deletarFoto(req, res) {
    try {
      const { filename } = req.params;
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      const filePath = path.join(uploadsDir, filename);

      // Verificar se arquivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          mensagem: 'Arquivo não encontrado' 
        });
      }

      // Verificar se o arquivo está dentro da pasta uploads (segurança)
      const normalizedPath = path.normalize(filePath);
      const normalizedUploadsDir = path.normalize(uploadsDir);
      
      if (!normalizedPath.startsWith(normalizedUploadsDir)) {
        return res.status(403).json({ 
          mensagem: 'Acesso negado' 
        });
      }

      // Deletar arquivo
      fs.unlinkSync(filePath);

      res.json({
        mensagem: 'Arquivo deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      res.status(500).json({ 
        mensagem: 'Erro ao deletar arquivo',
        erro: error.message 
      });
    }
  }

  // GET /api/upload/fotos-padrao - Listar fotos padrão disponíveis
  async listarFotosPadrao(req, res) {
    try {
      const fotosPadraoDir = path.join(__dirname, '..', 'public', 'fotos-padrao');
      
      // Verificar se diretório existe
      if (!fs.existsSync(fotosPadraoDir)) {
        return res.json({
          categorias: []
        });
      }

      // Ler categorias (subpastas)
      const categorias = fs.readdirSync(fotosPadraoDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
          const categoriaPath = path.join(fotosPadraoDir, dirent.name);
          
          // Ler arquivos da categoria
          const arquivos = fs.readdirSync(categoriaPath)
            .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
            .map(file => ({
              nome: file,
              url: `/fotos-padrao/${dirent.name}/${file}`
            }));

          return {
            nome: dirent.name,
            fotos: arquivos
          };
        });

      res.json({
        categorias
      });

    } catch (error) {
      console.error('Erro ao listar fotos padrão:', error);
      res.status(500).json({ 
        mensagem: 'Erro ao listar fotos padrão',
        erro: error.message 
      });
    }
  }

}

export default new UploadController();
