# Stronda Lilo - Site de Formatura 🎓

Um site especial de homenagem à formatura da Lilo, com tema do filme Lilo & Stitch.

## ✨ Funcionalidades

- **Galeria de Fotos**: Trajetória em imagens com modal para visualização
- **Vídeos de Recados**: Seção para vídeos da família e amigos
- **Suporte Multi-Plataforma**: YouTube, Google Drive e links diretos
- **Mural de Mensagens**: Mensagens carinhosas da Ohana
- **Citação Inspiradora**: Frase motivacional sobre educação
- **Design Responsivo**: Funciona em desktop e mobile
- **Animações**: Confetes temáticos e efeitos visuais

## 🚀 **NOVO: Sistema Dinâmico de Conteúdo**

Agora é super fácil adicionar novos conteúdos sem editar HTML!

### Arquivos Principais:
- `index.html` - Página principal
- `data.js` - **NOVO**: Todos os dados do site (imagens, vídeos, mensagens)
- `conteudo.json` - **NOVO**: Arquivo unificado para vídeos e imagens
- `depara.json` - Vídeos (compatibilidade)
- `imagens.json` - Imagens (compatibilidade)
- `admin.html` - **NOVO**: Interface para gerar códigos de novos conteúdos
- `COMO_ADICIONAR_CONTEUDO.md` - **NOVO**: Guia completo
- `GOOGLE_DRIVE_VIDEOS.md` - **NOVO**: Guia específico para Google Drive

### Como Adicionar Conteúdo:

#### Opção 1: Interface Administrativa
1. Abra `admin.html` no navegador
2. Preencha os formulários
3. Copie o código gerado
4. Cole no console do navegador da página principal (F12)

#### Opção 2: Console do Navegador
```javascript
// Adicionar nova imagem
ContentManager.addGalleryImage("chave", "URL_DA_IMAGEM", "Descrição", "categoria");

// Adicionar novo vídeo (suporta YouTube e Google Drive)
ContentManager.addVideo("chave", "Título", "Descrição", "URL_VIDEO", "cor", "rotacao");

// Adicionar nova mensagem
ContentManager.addMessage("Mensagem", "Autor", "🎉", "left", "text-blue-600");
```

#### Opção 3: Editar arquivos JSON
- **conteudo.json** (recomendado) - Arquivo unificado
- **depara.json** + **imagens.json** - Arquivos separados (compatibilidade)

## 🎥 Hospedagem de Vídeos

O site suporta múltiplas plataformas para vídeos:

### **🌟 Google Drive (Recomendado)**
- ✅ 15GB gratuitos
- ✅ Controle total da privacidade
- ✅ Qualidade mantida
- ✅ Fácil de usar

### **📺 YouTube**
- ✅ Ilimitado e gratuito
- ✅ Streaming otimizado
- ✅ Já integrado no projeto

### **🔗 Links Diretos**
- ✅ Qualquer servidor de vídeo
- ✅ Máximo controle

**📚 Consulte `GOOGLE_DRIVE_VIDEOS.md` para guia completo!**

## 🎨 Cores Disponíveis
- `blue`, `pink`, `green`, `purple`, `red`, `yellow`, `indigo`, `cyan`

## 📱 Como Usar
1. Abra `index.html` no navegador
2. Para adicionar conteúdo, use `admin.html` ou consulte `COMO_ADICIONAR_CONTEUDO.md`
3. Navegue entre as abas "A Formanda" e "A Ohana"

## 🛠️ Tecnologias
- HTML5
- CSS3 (Tailwind CSS)
- JavaScript Vanilla
- Canvas Confetti
- Google Fonts

---
**Feito com ❤️ para meu amorzim**
