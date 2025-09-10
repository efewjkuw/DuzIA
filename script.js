// script.js (Versão com Pré-visualização de Imagens e UI Aprimorada)

// Verifica o perfil de usuário
if (!localStorage.getItem('userProfile') && !window.location.pathname.endsWith('profile.html')) {
    window.location.href = 'profile.html';
}

document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção dos Elementos do DOM ---
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    const imagePreviewContainer = document.getElementById('image-preview-container'); // NOVO
    const imagePreview = document.getElementById('image-preview'); // NOVO
    const removeImageBtn = document.getElementById('remove-image-btn'); // NOVO
    const userProfileBtn = document.getElementById('user-profile-btn');
    const profileModal = document.getElementById('profile-modal');
    const closeModalBtn = document.querySelector('.modal-close-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const personalitySelect = document.getElementById('ai-personality');

    // --- Estado para guardar o arquivo selecionado ---
    let selectedFile = null;

    // --- Lógica do MODAL DE PERFIL ---
    function openProfileModal() {
        const userProfile = JSON.parse(localStorage.getItem('userProfile'));
        if (userProfile) {
            document.getElementById('modal-username').textContent = userProfile.username || 'Usuário';
            document.getElementById('modal-bio').textContent = userProfile.bio || 'Nenhuma bio definida.';
            document.getElementById('modal-interests').textContent = userProfile.interests || 'Nenhum interesse definido.';
        }
        profileModal.style.display = 'flex';
    }

    function closeProfileModal() {
        profileModal.style.display = 'none';
    }

    userProfileBtn.addEventListener('click', openProfileModal);
    closeModalBtn.addEventListener('click', closeProfileModal);
    profileModal.addEventListener('click', (event) => {
        if (event.target === profileModal) {
            closeProfileModal();
        }
    });

    // --- Lógica de TEMA (Claro/Escuro) ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-theme');
            themeToggle.checked = false;
        }
    }

    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // --- Lógica de PERSONALIDADE da IA ---
    personalitySelect.addEventListener('change', () => {
        localStorage.setItem('personality', personalitySelect.value);
    });

    const savedPersonality = localStorage.getItem('personality') || 'amigavel';
    personalitySelect.value = savedPersonality;

    // --- LÓGICA DE UPLOAD DE ARQUIVO E PRÉ-VISUALIZAÇÃO ---
    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem (JPG, PNG, etc.).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            selectedFile = {
                type: file.type,
                data: e.target.result.split(',')[1],
                previewUrl: e.target.result
            };
            imagePreview.src = selectedFile.previewUrl;
            imagePreviewContainer.style.display = 'flex'; // Mostra a pré-visualização
            chatInput.placeholder = `Adicione uma legenda para a imagem...`;
        };
        reader.readAsDataURL(file);
    });

    removeImageBtn.addEventListener('click', () => {
        selectedFile = null;
        imagePreview.src = '#';
        imagePreviewContainer.style.display = 'none'; // Esconde a pré-visualização
        fileInput.value = null; // Limpa o input file para permitir selecionar o mesmo arquivo novamente
        chatInput.placeholder = 'Digite sua mensagem ou envie uma imagem...';
    });

    // --- Lógica de Adicionar Mensagem (Atualizada para mostrar imagens) ---
    const addMessage = (text, sender, imageUrl = null) => {
        if (!chatContainer) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        let messageContent = '';
        if (imageUrl) {
            messageContent += `<img src="${imageUrl}" alt="Imagem enviada" class="message-image">`;
        }
        if (text) {
            messageContent += marked.parse(text, { breaks: true });
        }
        
        messageDiv.innerHTML = messageContent;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    // --- Lógica de Envio de Mensagem (Atualizada para enviar arquivos) ---
    const handleSendMessage = async () => {
        const userText = chatInput.value.trim();
        
        if (userText === "" && !selectedFile) return;

        addMessage(userText, 'user', selectedFile ? selectedFile.previewUrl : null);

        const payload = {
            message: userText,
            fileData: selectedFile,
            personality: localStorage.getItem('personality') || 'amigavel'
        };

        // Limpa a interface após enviar
        chatInput.value = "";
        chatInput.placeholder = 'Digite sua mensagem ou envie uma imagem...';
        selectedFile = null;
        fileInput.value = null;
        imagePreviewContainer.style.display = 'none'; // Esconde a pré-visualização

        try {
            const response = await fetch('https://duzia.onrender.com/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('A resposta do servidor não foi OK.');

            const data = await response.json();
            addMessage(data.reply, 'ai');

        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            addMessage("Putz, deu um problema na minha conexão. Tenta de novo aí, parça.", 'ai');
        }
    };

    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
    });
    
    // --- Mensagem de Boas-Vindas ---
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    const welcomeMessage = `Olá, ${userProfile.username || 'pessoa'}! Tudo pronto por aqui. Manda sua pergunta ou uma foto pra gente resenhar!`;
    
    setTimeout(() => {
        addMessage(welcomeMessage, 'ai');
    }, 500);
});