import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { API_URL } from '../config/api';

const UploadFoto = ({ onUploadSuccess, onClose }) => {
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [arrastandoArquivo, setArrastandoArquivo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const inputRef = useRef(null);

  const TAMANHO_MAX = 200 * 1024; // 200KB - Tamanho máximo APÓS compressão
  const TIPOS_ACEITOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validarArquivo = (file) => {
    if (!TIPOS_ACEITOS.includes(file.type)) {
      return 'Formato inválido. Use: JPG, PNG ou WebP';
    }
    // Não validamos tamanho aqui pois vamos comprimir primeiro
    return null;
  };

  const comprimirImagem = async (file) => {
    try {
      console.log('🗜️ Comprimindo imagem...', {
        nome: file.name,
        tamanhoOriginal: (file.size / 1024).toFixed(2) + 'KB'
      });

      const options = {
        maxSizeMB: 0.2, // 200KB máximo
        maxWidthOrHeight: 800, // Máximo 800x800 pixels
        useWebWorker: true,
        fileType: 'image/webp', // Converter para WebP (mais leve)
        initialQuality: 0.8 // Qualidade inicial
      };

      const compressedFile = await imageCompression(file, options);
      
      console.log('✅ Imagem comprimida:', {
        tamanhoFinal: (compressedFile.size / 1024).toFixed(2) + 'KB',
        reducao: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
      });

      return compressedFile;
    } catch (error) {
      console.error('Erro ao comprimir:', error);
      throw new Error('Erro ao comprimir imagem');
    }
  };

  const processarArquivo = async (file) => {
    const erroValidacao = validarArquivo(file);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setErro(null);
    setUploading(true);
    setProgresso(25); // Iniciando compressão

    try {
      // Comprimir imagem antes de salvar
      const arquivoComprimido = await comprimirImagem(file);
      
      setProgresso(50); // Compressão concluída
      
      // Verificar se após compressão ainda está muito grande
      if (arquivoComprimido.size > TAMANHO_MAX) {
        setErro(`Arquivo ainda está grande: ${(arquivoComprimido.size / 1024).toFixed(0)}KB. Tente uma imagem menor.`);
        setUploading(false);
        setProgresso(0);
        return;
      }

      setArquivo(arquivoComprimido);

      // Gerar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setProgresso(100); // Preview gerado
        setUploading(false);
      };
      reader.readAsDataURL(arquivoComprimido);
    } catch (error) {
      console.error('Erro ao processar:', error);
      setErro(error.message);
      setUploading(false);
      setProgresso(0);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processarArquivo(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setArrastandoArquivo(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setArrastandoArquivo(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastandoArquivo(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processarArquivo(file);
    }
  };

  const handleUpload = async () => {
    if (!arquivo) return;

    console.log('📤 Iniciando upload...', arquivo);

    setUploading(true);
    setErro(null);
    setProgresso(0);

    const formData = new FormData();
    formData.append('foto', arquivo);

    console.log('📋 FormData criado');

    try {
      // Simular progresso (você pode integrar com axios onUploadProgress)
      const intervalo = setInterval(() => {
        setProgresso(prev => {
          if (prev >= 90) {
            clearInterval(intervalo);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      console.log('🌐 Enviando para:', `${API_URL}/upload/foto`);

      const response = await fetch(`${API_URL}/upload/foto`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      clearInterval(intervalo);
      setProgresso(100);

      console.log('📥 Resposta recebida:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(errorData.mensagem || errorData.erro || 'Erro ao fazer upload');
      }

      const data = await response.json();
      console.log('✅ Upload bem-sucedido:', data);
      
      setSucesso(true);
      setTimeout(() => {
        // Backend retorna data.arquivo.url
        const imageUrl = data.arquivo?.url || data.url;
        console.log('🎉 URL da imagem:', imageUrl);
        onUploadSuccess(imageUrl);
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Erro no upload:', error);
      setErro(error.message || 'Erro ao fazer upload da imagem');
      setProgresso(0);
    } finally {
      setUploading(false);
    }
  };

  const limparSelecao = () => {
    setArquivo(null);
    setPreview(null);
    setErro(null);
    setProgresso(0);
    setSucesso(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de Drop */}
      {!preview && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
            arrastandoArquivo
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
          }`}
        >
          <Upload className={`mx-auto mb-4 ${arrastandoArquivo ? 'text-orange-500' : 'text-gray-400'}`} size={48} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {arrastandoArquivo ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique para selecionar'}
          </p>
          <p className="text-sm text-gray-500">
            JPG, PNG ou WebP • Máximo 500KB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-start gap-4">
            {/* Imagem Preview */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              {!uploading && !sucesso && (
                <button
                  type="button"
                  onClick={limparSelecao}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Informações */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="text-gray-400" size={20} />
                <span className="font-medium text-gray-700 truncate">
                  {arquivo?.name}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {(arquivo?.size / 1024).toFixed(0)}KB
              </p>

              {/* Barra de Progresso */}
              {uploading && (
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-orange-500 h-full transition-all duration-300"
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Fazendo upload... {progresso}%
                  </p>
                </div>
              )}

              {/* Sucesso */}
              {sucesso && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={20} />
                  <span className="font-medium">Upload concluído!</span>
                </div>
              )}

              {/* Botão de Upload */}
              {!uploading && !sucesso && (
                <button
                  type="button"
                  onClick={handleUpload}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  Fazer Upload
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 mb-1">Erro no upload</p>
            <p className="text-sm text-red-600">{erro}</p>
          </div>
          <button
            type="button"
            onClick={() => setErro(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadFoto;
