// Dados do site - Para facilitar a adição de novos conteúdos
const siteData = {
    // Dados da galeria de fotos (carregados dinamicamente)
    gallery: [],

    // Dados dos vídeos (carregados dinamicamente)
    videos: [],    // Dados das mensagens
    messages: [
        {
            text: "Parabéns, meu amor.. Você é incrível e é um privilégio eu aprender todos os dias com a melhor teacher desse mundo ❤️",
            author: "Seu Amor",
            emoji: "💕",
            position: "center",
            authorColor: "text-red-600"
        }
    ],

    // Citação inspiradora
    quote: {
        text: "Educação não transforma o mundo. Educação muda pessoas. Pessoas transformam o mundo.",
        author: "Paulo Freire"
    }
};

// Funções para carregar dados dos arquivos JSON
const DataLoader = {
    // Carregar conteúdo do arquivo unificado conteudo.json
    loadFromConteudo: async function() {
        try {
            const response = await fetch('./conteudo.json');
            const conteudoData = await response.json();
              // Carregar imagens
            if (conteudoData.imagens) {
                siteData.gallery = Object.values(conteudoData.imagens).map(img => ({
                    src: img.src,
                    alt: img.alt,
                    categoria: img.categoria,
                    capitulo: img.capitulo,
                    ordem: img.ordem,
                    historia: img.historia
                }));
            }
            
            // Carregar vídeos
            if (conteudoData.videos) {
                siteData.videos = Object.entries(conteudoData.videos).map(([key, video]) => ({
                    title: video.titulo || video.sessao.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    description: video.descricao,
                    color: video.cor || 'blue',
                    url: video.link,
                    hoverRotation: video.rotacao || 'hover:rotate-1',
                    sessao: video.sessao
                }));
            }
            
            return { images: siteData.gallery, videos: siteData.videos };
        } catch (error) {
            console.error('Erro ao carregar conteúdo unificado:', error);
            // Fallback para arquivos separados
            return this.loadSeparateFiles();
        }
    },

    // Carregar imagens do arquivo imagens.json (fallback)
    loadImages: async function() {
        try {
            const response = await fetch('./imagens.json');
            const imagensData = await response.json();
              // Converter o objeto em array para o formato esperado
            siteData.gallery = Object.values(imagensData).map(img => ({
                src: img.src,
                alt: img.alt,
                categoria: img.categoria,
                capitulo: img.capitulo,
                ordem: img.ordem,
                historia: img.historia
            }));
            
            return siteData.gallery;
        } catch (error) {
            console.error('Erro ao carregar imagens:', error);
            return [];
        }
    },

    // Carregar vídeos do arquivo depara.json (fallback e compatibilidade)
    loadVideos: async function() {
        try {
            const response = await fetch('./depara.json');
            const deparaData = await response.json();
            
            // Converter o objeto em array para o formato esperado
            const videoColors = ['blue', 'pink', 'green', 'purple', 'red', 'yellow'];
            const rotations = ['hover:-rotate-2', 'hover:rotate-2', 'hover:-rotate-1', 'hover:rotate-1'];
            
            siteData.videos = Object.entries(deparaData).map(([key, video], index) => ({
                title: video.titulo || video.sessao.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                description: video.descricao,
                color: video.cor || videoColors[index % videoColors.length],
                url: video.link,
                hoverRotation: video.rotacao || rotations[index % rotations.length],
                sessao: video.sessao
            }));
            
            return siteData.videos;
        } catch (error) {
            console.error('Erro ao carregar vídeos:', error);
            return [];
        }
    },

    // Carregar arquivos separados (fallback)
    loadSeparateFiles: async function() {
        await Promise.all([
            this.loadImages(),
            this.loadVideos()
        ]);
        return { images: siteData.gallery, videos: siteData.videos };
    },

    // Carregar todos os dados (prioriza arquivo unificado)
    loadAll: async function() {
        return await this.loadFromConteudo();
    }
};

// Gerenciador de vídeos com suporte ao Google Drive
const VideoManager = {
    // Detectar tipo de link do vídeo
    detectVideoSource: function(url) {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return 'youtube';
        } else if (url.includes('drive.google.com')) {
            return 'drive';
        } else if (url.includes('github.com')) {
            return 'github';
        }
        return 'direct';
    },

    // Converter link do Google Drive para embed
    convertDriveLink: function(url) {
        // Extrair ID do arquivo do Google Drive
        const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
            const fileId = match[1];
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }
        return url;
    },

    // Converter link do YouTube para embed
    convertYouTubeLink: function(url) {
        let videoId = '';
        
        if (url.includes('youtube.com/watch')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/shorts/')) {
            videoId = url.split('shorts/')[1]?.split('?')[0];
        }
        
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    },

    // Obter ícone baseado na fonte
    getSourceIcon: function(source) {
        const icons = {
            youtube: '📺',
            drive: '☁️',
            github: '🐙',
            direct: '🎬'
        };
        return icons[source] || icons.direct;
    },

    // Processar URL do vídeo
    processVideoUrl: function(url) {
        const source = this.detectVideoSource(url);
        let processedUrl = url;
        
        switch (source) {
            case 'drive':
                processedUrl = this.convertDriveLink(url);
                break;
            case 'youtube':
                processedUrl = this.convertYouTubeLink(url);
                break;
        }
        
        return {
            original: url,
            processed: processedUrl,
            source: source,
            icon: this.getSourceIcon(source)
        };
    }
};

// Funções para adicionar novos conteúdos facilmente
const ContentManager = {
    // Adicionar nova imagem à galeria
    addGalleryImage: function(key, src, alt, categoria = "geral") {
        // Adiciona temporariamente à galeria local
        siteData.gallery.push({ src, alt, categoria });
        this.renderGallery();
        
        // Mostra o código para adicionar permanentemente
        const codigoConteudo = `
// Para adicionar ao arquivo conteudo.json (estrutura unificada):
"${key}": {
    "src": "${src}",
    "alt": "${alt}",
    "categoria": "${categoria}"
}`;

        const codigoImagens = `
// Para adicionar ao arquivo imagens.json (estrutura separada):
"${key}": {
    "src": "${src}",
    "alt": "${alt}",
    "categoria": "${categoria}"
}`;
        
        console.log('=== CÓDIGOS PARA ADICIONAR IMAGEM ===');
        console.log(codigoConteudo);
        console.log(codigoImagens);
        return { conteudo: codigoConteudo, imagens: codigoImagens };
    },

    // Adicionar novo vídeo
    addVideo: function(key, titulo, descricao, link, cor = "blue", rotacao = "hover:rotate-1") {
        // Adiciona temporariamente aos vídeos locais
        const newVideo = {
            title: titulo,
            description: descricao,
            color: cor,
            url: link,
            hoverRotation: rotacao,
            sessao: key
        };
        siteData.videos.push(newVideo);
        this.renderVideos();
        
        // Mostra o código para adicionar permanentemente
        const codigoConteudo = `
// Para adicionar ao arquivo conteudo.json (estrutura unificada):
"${key}": {
    "titulo": "${titulo}",
    "descricao": "${descricao}",
    "sessao": "${key}",
    "link": "${link}",
    "cor": "${cor}",
    "rotacao": "${rotacao}"
}`;

        const codigoDepara = `
// Para adicionar ao arquivo depara.json (estrutura compatível):
"${key}": {
    "descricao": "${descricao}",
    "sessao": "${key}",
    "link": "${link}"
}`;
        
        console.log('=== CÓDIGOS PARA ADICIONAR VÍDEO ===');
        console.log(codigoConteudo);
        console.log(codigoDepara);
        return { conteudo: codigoConteudo, depara: codigoDepara };
    },

    // Adicionar nova mensagem
    addMessage: function(text, author, emoji, position = "left", authorColor = "text-blue-600") {
        siteData.messages.push({ text, author, emoji, position, authorColor });
        this.renderMessages();
    },    // Renderizar galeria com história cronológica
    renderGallery: function() {
        const galleryContainer = document.querySelector('#gallery .grid');
        if (!galleryContainer) return;
        
        galleryContainer.innerHTML = '';
        
        // Ordenar imagens por capítulo e ordem se disponível
        const imagensOrdenadas = siteData.gallery.sort((a, b) => {
            if (a.capitulo && b.capitulo) {
                if (a.capitulo === b.capitulo) {
                    return (a.ordem || 0) - (b.ordem || 0);
                }
                return a.capitulo - b.capitulo;
            }
            return 0;
        });
        
        imagensOrdenadas.forEach((item, index) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'relative group';
            
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt;
            img.className = 'gallery-item w-full h-auto rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer object-cover aspect-square border-4 border-white';
            
            // Adicionar número da ordem se disponível
            if (item.ordem) {
                const orderBadge = document.createElement('div');
                orderBadge.className = 'absolute top-2 left-2 bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold';
                orderBadge.textContent = item.ordem;
                imgContainer.appendChild(orderBadge);
            }
            
            // Adicionar overlay com história ao passar o mouse
            if (item.historia) {
                const overlay = document.createElement('div');
                overlay.className = 'absolute inset-0 bg-black bg-opacity-80 text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-center';
                overlay.innerHTML = `<p class="text-xs leading-tight">${item.historia}</p>`;
                imgContainer.appendChild(overlay);
            }
            
            imgContainer.appendChild(img);
            galleryContainer.appendChild(imgContainer);
        });        // Re-adicionar event listeners para o modal
        this.attachGalleryListeners();
    },

    // Renderizar vídeos
    renderVideos: function() {
        const videosContainer = document.querySelector('#videos .flex');
        if (!videosContainer) return;
        
        videosContainer.innerHTML = '';
        
        siteData.videos.forEach(video => {
            const videoInfo = VideoManager.processVideoUrl(video.url);
            
            const videoCard = document.createElement('div');
            videoCard.className = `video-card bg-gradient-to-br from-[#FDF8E1] to-[#F0F7FF] border-4 border-[#D2B48C] rounded-3xl p-6 text-center shadow-xl hover:shadow-2xl backdrop-blur-sm`;
            
            // Criar conteúdo baseado no tipo de vídeo
            let videoContent = '';
            
            if (videoInfo.source === 'drive') {
                videoContent = `
                    <div class="mb-4">
                        <iframe src="${videoInfo.processed}" 
                                width="100%" 
                                height="200" 
                                frameborder="0" 
                                allow="autoplay"
                                class="rounded-xl shadow-md">
                        </iframe>
                    </div>
                `;
            } else if (videoInfo.source === 'youtube') {
                videoContent = `
                    <div class="mb-4">
                        <iframe src="${videoInfo.processed}" 
                                width="100%" 
                                height="200" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen
                                class="rounded-xl shadow-md">
                        </iframe>
                    </div>
                `;            } else {
                // Verificar se é um vídeo com autoplay (tipo GIF)
                if (video.autoplay && video.tipo === 'gif-like') {
                    videoContent = `
                        <div class="mb-4">
                            <video 
                                autoplay 
                                loop 
                                muted 
                                playsinline
                                class="w-full h-48 object-cover rounded-xl shadow-md"
                                poster=""
                            >
                                <source src="${video.url}" type="video/mp4">
                                Seu navegador não suporta o elemento de vídeo.
                            </video>
                        </div>
                    `;
                } else {
                    // Para links diretos normais, adicionar ícone de play grande
                    videoContent = `
                        <div class="mb-4 flex items-center justify-center h-40 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl border-2 border-dashed border-cyan-300">
                            <div class="text-6xl text-cyan-600">🎬</div>
                        </div>
                    `;
                }
            }
            
            videoCard.innerHTML = `
                ${videoContent}
                <h3 class="font-brand text-xl text-cyan-900 mb-3 leading-tight">
                    ${videoInfo.icon} ${video.title}
                </h3>
                <p class="text-sm text-gray-600 mb-5 line-clamp-3">${video.description}</p>                ${videoInfo.source === 'drive' || videoInfo.source === 'youtube' ? 
                    `<a href="${videoInfo.original}" target="_blank" class="inline-block bg-gradient-to-r from-${video.color}-400 to-${video.color}-600 text-white font-brand py-3 px-6 rounded-full hover:from-${video.color}-500 hover:to-${video.color}-700 transition-all duration-300 text-sm shadow-lg transform hover:scale-105">
                        ✨ Abrir ${videoInfo.source === 'drive' ? 'no Drive' : 'no YouTube'}
                    </a>` :
                    (video.autoplay && video.tipo === 'gif-like') ? 
                        `<p class="text-xs text-cyan-600 font-brand">
                            🌀 Reproduzindo automaticamente
                        </p>` :
                        `<a href="${video.url}" target="_blank" class="inline-block bg-gradient-to-r from-${video.color}-400 to-${video.color}-600 text-white font-brand py-3 px-8 rounded-full hover:from-${video.color}-500 hover:to-${video.color}-700 transition-all duration-300 text-lg shadow-lg transform hover:scale-105">
                            🎥 Ver Vídeo
                        </a>`
                }
            `;
            videosContainer.appendChild(videoCard);
        });
    },

    // Renderizar mensagens
    renderMessages: function() {
        const messagesContainer = document.querySelector('#messages .space-y-8');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = '';
        
        siteData.messages.forEach(message => {
            const messageCard = document.createElement('div');
            messageCard.className = 'bg-white p-6 rounded-2xl shadow-lg relative';
            messageCard.innerHTML = `
                <div class="absolute ${message.position === 'left' ? '-left-4' : '-right-4'} -top-4 text-4xl">${message.emoji}</div>
                <p class="text-gray-700 italic">"${message.text}"</p>
                <p class="text-right font-bold ${message.authorColor} mt-4">- ${message.author}</p>
            `;
            messagesContainer.appendChild(messageCard);
        });
    },

    // Renderizar citação
    renderQuote: function() {
        const quoteContainer = document.querySelector('#quote .max-w-3xl');
        if (!quoteContainer) return;
        
        quoteContainer.innerHTML = `
            <p class="text-2xl md:text-3xl font-light text-cyan-900 leading-relaxed">"${siteData.quote.text}"</p>
            <p class="mt-6 font-bold text-xl text-cyan-700">- ${siteData.quote.author}</p>
        `;
    },    // Funções de utilidade para gerenciar conteúdo
    getVideoBySession: function(sessao) {
        return siteData.videos.find(video => video.sessao === sessao);
    },

    getImagesByCategory: function(categoria) {
        return siteData.gallery.filter(img => img.categoria === categoria);
    },

    getImagesByChapter: function(capitulo) {
        return siteData.gallery.filter(img => img.capitulo === capitulo).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    },

    getAllCategories: function() {
        return [...new Set(siteData.gallery.map(img => img.categoria))];
    },

    getStoryTimeline: function() {
        const capitulos = {
            1: "Os Primeiros Experimentos",
            2: "Desbravando o Mundo", 
            3: "A Jornada da Heroína",
            4: "E a Ohana Cresceu"
        };
        
        const timeline = {};
        Object.keys(capitulos).forEach(cap => {
            timeline[cap] = {
                titulo: capitulos[cap],
                imagens: this.getImagesByChapter(parseInt(cap))
            };
        });
        
        return timeline;
    },

    showChapterStory: function(capitulo) {
        const timeline = this.getStoryTimeline();
        const cap = timeline[capitulo];
        if (!cap) return;
        
        console.log(`=== CAPÍTULO ${capitulo}: ${cap.titulo.toUpperCase()} ===`);
        cap.imagens.forEach(img => {
            console.log(`${img.ordem}. ${img.alt}`);
            console.log(`   ${img.historia}`);
            console.log('');
        });
    },

    exportContent: function() {
        const content = {
            videos: {},
            imagens: {}
        };

        // Exportar vídeos
        siteData.videos.forEach(video => {
            content.videos[video.sessao] = {
                titulo: video.title,
                descricao: video.description,
                sessao: video.sessao,
                link: video.url,
                cor: video.color,
                rotacao: video.hoverRotation
            };
        });

        // Exportar imagens
        siteData.gallery.forEach((img, index) => {
            const key = `imagem-${index + 1}`;
            content.imagens[key] = {
                src: img.src,
                alt: img.alt,
                categoria: img.categoria
            };
        });

        console.log('=== CONTEÚDO EXPORTADO ===');
        console.log(JSON.stringify(content, null, 2));
        return content;
    },

    // Anexar event listeners para a galeria
    attachGalleryListeners: function() {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        const galleryItems = document.querySelectorAll('.gallery-item');

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                modal.classList.remove('opacity-0', 'pointer-events-none');
                modalImg.src = item.src;
            });
        });
    },    // Inicializar todo o conteúdo
    init: async function() {
        // Carregar dados dos arquivos JSON primeiro
        await DataLoader.loadAll();
        
        // Renderizar o conteúdo
        this.renderGallery();
        this.renderVideos();
        this.renderMessages();
        this.renderQuote();
        
        console.log('=== CONTEÚDO CARREGADO ===');
        console.log(`${siteData.gallery.length} imagens carregadas`);
        console.log(`${siteData.videos.length} vídeos carregados`);
        
        // Mostrar informações sobre a história cronológica
        const timeline = this.getStoryTimeline();
        const capitulosComImagens = Object.keys(timeline).filter(cap => timeline[cap].imagens.length > 0);
        
        if (capitulosComImagens.length > 0) {
            console.log('=== HISTÓRIA CRONOLÓGICA DISPONÍVEL ===');
            capitulosComImagens.forEach(cap => {
                console.log(`Capítulo ${cap}: ${timeline[cap].titulo} (${timeline[cap].imagens.length} imagens)`);
            });
            console.log('Use ContentManager.showChapterStory(numero) para ver a história de cada capítulo');
            console.log('Use ContentManager.getStoryTimeline() para ver toda a timeline');
        }
        
        console.log('Use ContentManager.exportContent() para exportar todo o conteúdo');
    }
};
