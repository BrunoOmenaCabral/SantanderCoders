const enviarEmail = require('./envia-email.js');
const geraCorpoDoEmail = require('./geraCorpoDoEmail.js');

//Envia email de marketing para os clientes selecionados
const enviaEmailMarketing = (listaClientes) => {
    for(let cliente in listaClientes){
        if(listaClientes[cliente].marketing){
            let corpoDoEmail = geraCorpoDoEmail(listaClientes[cliente].nome);
            let emailEnviado = enviarEmail(listaClientes[cliente].email, "Confira as Novidades!", corpoDoEmail);
            if(emailEnviado.status == "Error"){
                console.log("Erro!");
            }
            console.log(emailEnviado.message);
        }
    }
}

module.exports = enviaEmailMarketing;