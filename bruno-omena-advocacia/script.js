/* =========================================================
   CONFIGURAÇÃO — edite apenas este bloco
   whatsapp: número com DDI e DDD, ex.: '5581999999999'
   ========================================================= */
const CONFIG = {
  whatsapp: '5581999157026',
  email: 'brunoomena.adv@gmail.com',
  instagram: '[INSERIR USUÁRIO DO INSTAGRAM]',
};

const MENSAGENS = {
  geral: 'Olá, gostaria de obter informações sobre atendimento jurídico.',
  saude: 'Olá, gostaria de falar sobre uma questão relacionada a Direito da Saúde.',
  medico: 'Olá, gostaria de falar sobre uma questão relacionada a Direito Médico.',
};

/* Monta o link do WhatsApp. Quando há tema, ele é acrescentado à mensagem da área. */
function linkWhatsApp(area, tema) {
  const numero = CONFIG.whatsapp.replace(/\D/g, '');
  let texto = MENSAGENS[area] || MENSAGENS.geral;
  if (tema) {
    texto = `${texto.slice(0, -1)}, especificamente sobre ${tema.charAt(0).toLowerCase()}${tema.slice(1)}.`;
  }
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function configurarLinks() {
  if (!/\d{10,}/.test(CONFIG.whatsapp.replace(/\D/g, ''))) {
    console.warn('Configure o número do WhatsApp em script.js (CONFIG.whatsapp).');
  }

  document.querySelectorAll('[data-wa]').forEach((link) => {
    const tema = link.closest('.topic')?.querySelector('.topic__toggle span')?.textContent.trim();
    link.href = linkWhatsApp(link.dataset.wa, tema);
    link.target = '_blank';
    link.rel = 'noopener';
  });

  const email = document.querySelector('[data-config="email"]');
  if (email) email.href = `mailto:${CONFIG.email}`;

  const instagram = document.querySelector('[data-config="instagram"]');
  if (instagram) instagram.href = `https://instagram.com/${CONFIG.instagram.replace(/^@/, '')}`;

  document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear(); });
}

/* O botão flutuante adota a mensagem da área que está no centro da tela. */
function acompanharArea() {
  const botao = document.querySelector('[data-wa-float]');
  const secoes = document.querySelectorAll('main section');
  if (!botao || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        botao.href = linkWhatsApp(entrada.target.dataset.area || 'geral');
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  secoes.forEach((secao) => observer.observe(secao));
}

/* Cards e perguntas: um item aberto por grupo, com expansão suave. */
function configurarAccordions() {
  document.querySelectorAll('[data-accordion]').forEach((grupo, g) => {
    const itens = [...grupo.children];

    const fechar = (item) => {
      item.classList.remove('is-open');
      item.querySelector('button').setAttribute('aria-expanded', 'false');
      item.querySelector('.topic__panel').inert = true;
    };

    itens.forEach((item, i) => {
      const botao = item.querySelector('button');
      const painel = item.querySelector('.topic__panel');
      const id = `painel-${g}-${i}`;

      painel.id = id;
      painel.setAttribute('role', 'region');
      botao.setAttribute('aria-controls', id);
      painel.inert = true;

      botao.addEventListener('click', () => {
        const abrir = !item.classList.contains('is-open');
        itens.forEach(fechar);
        if (abrir) {
          item.classList.add('is-open');
          botao.setAttribute('aria-expanded', 'true');
          painel.inert = false;
        }
      });
    });
  });
}

function configurarMenu() {
  const header = document.querySelector('.header');
  const botao = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');

  const definir = (aberto) => {
    menu.classList.toggle('is-open', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  };

  botao.addEventListener('click', () => definir(!menu.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => definir(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') definir(false); });

  const marcarRolagem = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  marcarRolagem();
  window.addEventListener('scroll', marcarRolagem, { passive: true });
}

function configurarEntradas() {
  const elementos = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('is-visible');
        observer.unobserve(entrada.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  elementos.forEach((el) => observer.observe(el));
}

function configurarDialogos() {
  document.querySelectorAll('[data-dialog]').forEach((botao) => {
    const dialogo = document.getElementById(botao.dataset.dialog);
    botao.addEventListener('click', () => dialogo.showModal());
  });

  document.querySelectorAll('dialog').forEach((dialogo) => {
    dialogo.querySelector('[data-dialog-close]').addEventListener('click', () => dialogo.close());
    // Fecha ao clicar fora do conteúdo
    dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close(); });
  });
}

configurarLinks();
acompanharArea();
configurarAccordions();
configurarMenu();
configurarEntradas();
configurarDialogos();
