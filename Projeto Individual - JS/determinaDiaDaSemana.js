//Função para determinar o dia da semana
const determinaDiaDaSemana = () => {
    // Array com os nomes dos dias da semana
    const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const dataAtual = new Date();

    // Retorna 0 a 6, onde 0 é Domingo e 6 é Sábado
    const diaAtual = dataAtual.getDay();

    // Retorna o nome do dia da semana atual
    return diasDaSemana[diaAtual];
}

module.exports = determinaDiaDaSemana;