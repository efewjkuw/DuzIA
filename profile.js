const form = document.getElementById('profile-form');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Pega os dados de TODOS os campos do formulário
    const username = document.getElementById('username').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const bio = document.getElementById('bio').value.trim();
    const interests = document.getElementById('interests').value.trim();

    if (username && birthdate) {
        // Cria um objeto com TODOS os dados do perfil
        const userProfile = {
            username: username,
            birthdate: birthdate,
            bio: bio,
            interests: interests
        };

        // Salva o objeto como texto no LocalStorage
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        // Redireciona para a página principal do chat
        window.location.href = '/index.html';
    } else {
        alert('Por favor, preencha pelo menos o nome de usuário e a data de nascimento.');
    }
});