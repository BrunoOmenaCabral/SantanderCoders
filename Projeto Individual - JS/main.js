//Import das funções
const enviaEmailMarketing = require('./enviaEmailMarketing.js');
const determinaDiaDaSemana = require('./determinaDiaDaSemana.js');

//Definindo lista com nome, email dos clientes e flag de marketing
let clientes = [
    { nome: "João", email: "joao@gmail.com", marketing: true },
    { nome: "Maria", email: "maria@gmail.com", marketing: false },
    { nome: "Pedro", email: "pedro@gmail.com", marketing: true },
    { nome: "Ana", email: "ana@gmail.com", marketing: true },
    { nome: "Carlos", email: "carlos@gmail.com", marketing: false },
];

// Retorna 0 a 6, onde 0 é Domingo e 6 é Sábado 
let diaAtual = determinaDiaDaSemana();
console.log(`Hoje é ${diaAtual}.`);

if (diaAtual == "Sexta-feira"){
    console.log(`Enviando email de marketing para clientes na lista...`)
    enviaEmailMarketing(clientes);
}


