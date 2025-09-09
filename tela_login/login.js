
// Função para validar o login
function login() {
    var email = document.getElementById("email").value;
    var senha = document.getElementById("senha").value;


    if (email === null || senha === null || email === "" || senha === "" ) {
        window.alert("Por favor, preencha todos os campos.");
        return;
    } else {
        window.location.href = '../index.html';
    }

        //vai salvar o nome da peesoa que ta logando
    localStorage.setItem("email", email);
}