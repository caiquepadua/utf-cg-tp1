import { criarRenderer, criarTextura, carregarImagem } from "./renderer.js";
import { Inimigo } from "./entities/Inimigo.js";
import { Torre } from "./entities/Torre.js";
import { Projetil } from "./entities/Projetil.js";
import { Templo } from "./entities/Templo.js";
import { criarTiposDeInimigo } from "./data/tiposDeInimigo.js";
import { criarTiposDeTorre } from "./data/tiposDeTorre.js";

const canvas = document.getElementById("game-canvas");
function redimensionarCanvas() {
  const proporcao = 16 / 9;
  let largura = window.innerWidth;
  let altura = window.innerHeight;

  if (largura / altura > proporcao) {
    largura = altura * proporcao;
  } else {
    altura = largura / proporcao;
  }

  canvas.width = largura;
  canvas.height = altura;
}

redimensionarCanvas();
window.addEventListener("resize", redimensionarCanvas);

const gl = canvas.getContext("webgl2");
if (!gl) {
  alert("Seu navegador não suporta WebGL2 :(");
}

const centroX = canvas.width / 2;
const centroY = canvas.height / 2;

async function iniciar() {
  const renderer = await criarRenderer(gl);

  const telaGameOver = document.getElementById("game-over");
  const textoPontuacaoFinal = document.getElementById("pontuacao-final");
  const botaoReiniciar = document.getElementById("botao-reiniciar");

  let jogoAcabou = false;

  botaoReiniciar.addEventListener("click", () => {
    location.reload();
  });

  const musicaFundo = new Audio("assets/sounds/musica_egito.mp3");
  musicaFundo.loop = true;
  musicaFundo.volume = 0.3;

  let musicaJaIniciada = false;

  const elementoValorVida = document.getElementById("valor-vida");
  const elementoValorPontuacao = document.getElementById("valor-pontuacao");

  let pontuacao = 0;
  let catapultaDesbloqueada = false;
  let anubisDesbloqueada = false;
  let multiplicadorDificuldade = 1;
  let dificuldade800Aplicada = false;

  // carrega as imagens
  const [
    imgFundo, imgTemplo, imgTorreArco, imgTorreAnubis, imgCatapulta,
    imgMumia, imgEscaravelho, imgGuerreiroChacal,
    imgFlecha, imgMaldicao, imgPedra,
  ] = await Promise.all([
    carregarImagem("assets/images/fundo.png"),
    carregarImagem("assets/images/templo.png"),
    carregarImagem("assets/images/torrearco.png"),
    carregarImagem("assets/images/torreanubis.png"),
    carregarImagem("assets/images/catapulta.png"),
    carregarImagem("assets/images/mumia.png"),
    carregarImagem("assets/images/escaravelho.png"),
    carregarImagem("assets/images/guerreirochacal.png"),
    carregarImagem("assets/images/flecha.png"),
    carregarImagem("assets/images/maldicao.png"),
    carregarImagem("assets/images/pedra.png"),
  ]);

  //WebGLTexture
  const texturaFundo = criarTextura(gl, imgFundo);
  const texturaTemplo = criarTextura(gl, imgTemplo);
  const texturaTorreArco = criarTextura(gl, imgTorreArco);
  const texturaTorreAnubis = criarTextura(gl, imgTorreAnubis);
  const texturaCatapulta = criarTextura(gl, imgCatapulta);
  const texturaMumia = criarTextura(gl, imgMumia);
  const texturaEscaravelho = criarTextura(gl, imgEscaravelho);
  const texturaGuerreiroChacal = criarTextura(gl, imgGuerreiroChacal);
  const texturaFlecha = criarTextura(gl, imgFlecha);
  const texturaMaldicao = criarTextura(gl, imgMaldicao);
  const texturaPedra = criarTextura(gl, imgPedra);

  const tiposDeInimigo = criarTiposDeInimigo({
    mumia: texturaMumia,
    escaravelho: texturaEscaravelho,
    guerreiroChacal: texturaGuerreiroChacal,
  });

  const listaDeTiposDeInimigo = Object.values(tiposDeInimigo);

  const elementoStatusCatapulta = document.getElementById("status-catapulta");
  const elementoStatusAnubis = document.getElementById("status-anubis");
  const elementoStatusDificuldade = document.getElementById("status-dificuldade");

  const tiposDeTorre = criarTiposDeTorre({
    torreArco: texturaTorreArco,
    torreAnubis: texturaTorreAnubis,
    catapulta: texturaCatapulta,
    flecha: texturaFlecha,
    maldicao: texturaMaldicao,
    pedra: texturaPedra,
  });

  const inimigos = [];
  let tempoDesdeUltimoSpawn = 0;
  let intervaloSpawn = 1.5; // segundos entre cada inimigo

  const projeteis = [];

  // aparece aleatorio
  function spawnarInimigo() {
    const borda = Math.floor(Math.random() * 4);
    let x, y;
    if (borda === 0) { x = Math.random() * canvas.width; y = -40; }
    else if (borda === 1) { x = Math.random() * canvas.width; y = canvas.height + 40; }
    else if (borda === 2) { x = -40; y = Math.random() * canvas.height; }
    else { x = canvas.width + 40; y = Math.random() * canvas.height; }

    const tipoSorteado = listaDeTiposDeInimigo[Math.floor(Math.random() * listaDeTiposDeInimigo.length)];

    inimigos.push(new Inimigo({
      x, y,
      ...tipoSorteado,
      vidaMaxima: tipoSorteado.vidaMaxima * multiplicadorDificuldade,
      danoAtaque: tipoSorteado.danoAtaque * multiplicadorDificuldade,
    }));
  }

  const templo = new Templo({
    x: centroX,
    y: centroY,
    vidaMaxima: 100,
    largura: 100,
    altura: 100,
    textura: texturaTemplo,
  });

  const torres = [
    new Torre({ x: centroX - 220, y: centroY - 130, ...tiposDeTorre.arco }),
  ];

  function criarProjetil(x, y, alvo, torreOrigem) {
    projeteis.push(new Projetil({
      x, y,
      alvo,
      velocidade: torreOrigem.velocidadeProjetil,
      dano: torreOrigem.dano,
      largura: torreOrigem.larguraProjetil,
      altura: torreOrigem.alturaProjetil,
      textura: torreOrigem.texturaProjetil,
      efeitoLentidao: torreOrigem.efeitoLentidao,
      raioDano: torreOrigem.raioDano,
      todosInimigos: inimigos,
    }));
  }

  canvas.addEventListener("click", (evento) => {
    if (!musicaJaIniciada) {
      musicaJaIniciada = true;
      musicaFundo.play();
    }

    if (jogoAcabou || jogoPausado) return;

    const retanguloCanvas = canvas.getBoundingClientRect();
    const escalaX = canvas.width / retanguloCanvas.width;
    const escalaY = canvas.height / retanguloCanvas.height;

    const cliqueX = (evento.clientX - retanguloCanvas.left) * escalaX;
    const cliqueY = (evento.clientY - retanguloCanvas.top) * escalaY;

    for (const inimigo of inimigos) {
      const meiaLargura = inimigo.largura / 2;
      const meiaAltura = inimigo.altura / 2;

      const dentroDoX = cliqueX >= inimigo.x - meiaLargura && cliqueX <= inimigo.x + meiaLargura;
      const dentroDoY = cliqueY >= inimigo.y - meiaAltura && cliqueY <= inimigo.y + meiaAltura;

      if (dentroDoX && dentroDoY) {
        // acha a torre mais proxima
        let torreMaisProxima = torres[0];
        let menorDistancia = Math.hypot(torreMaisProxima.x - inimigo.x, torreMaisProxima.y - inimigo.y);

        for (const torreAtual of torres) {
          const distancia = Math.hypot(torreAtual.x - inimigo.x, torreAtual.y - inimigo.y);
          if (distancia < menorDistancia) {
            menorDistancia = distancia;
            torreMaisProxima = torreAtual;
          }
        }

        projeteis.push(new Projetil({
          x: torreMaisProxima.x,
          y: torreMaisProxima.y,
          alvo: inimigo,
          velocidade: torreMaisProxima.velocidadeProjetil * 1.5,
          dano: 15,
          largura: torreMaisProxima.larguraProjetil,
          altura: torreMaisProxima.alturaProjetil,
          textura: torreMaisProxima.texturaProjetil,
          todosInimigos: inimigos,
          raioDano: torreMaisProxima.raioDano,
        }));

        break;
      }
    }
  });

  function aumentarDificuldade() {
    intervaloSpawn = Math.max(0.5, intervaloSpawn - 0.3);
    multiplicadorDificuldade += 0.25;
  }

  function verificarDesbloqueios() {
    if (!catapultaDesbloqueada && pontuacao >= 100) {
      catapultaDesbloqueada = true;
      torres.push(new Torre({ x: centroX, y: centroY + 190, ...tiposDeTorre.catapulta }));
      aumentarDificuldade();
      elementoStatusCatapulta.textContent = "🏹 Catapulta: desbloqueada!";
      elementoStatusCatapulta.classList.add("desbloqueado");
    }

    if (!anubisDesbloqueada && pontuacao >= 400) {
      anubisDesbloqueada = true;
      torres.push(new Torre({ x: centroX + 220, y: centroY - 130, ...tiposDeTorre.anubis }));
      aumentarDificuldade();
      elementoStatusAnubis.textContent = "🐺 Anúbis: desbloqueada!";
      elementoStatusAnubis.classList.add("desbloqueado");
    }

    if (!dificuldade800Aplicada && pontuacao >= 800) {
      dificuldade800Aplicada = true;
      aumentarDificuldade();
      elementoStatusDificuldade.textContent = "⚠️ Dificuldade máxima!";
      elementoStatusDificuldade.classList.add("desbloqueado");
    }
  }

  const botaoPause = document.getElementById("botao-pause");
  const telaPause = document.getElementById("tela-pause");
  const botaoContinuar = document.getElementById("botao-continuar");

  let jogoPausado = false;

  function pausarJogo() {
    jogoPausado = true;
    telaPause.classList.remove("escondido");
    musicaFundo.pause();
  }

  function retomarJogo() {
    jogoPausado = false;
    telaPause.classList.add("escondido");
    if (musicaJaIniciada) musicaFundo.play();
  }

  botaoPause.addEventListener("click", () => {
    if (!jogoAcabou) pausarJogo();
  });

  botaoContinuar.addEventListener("click", retomarJogo);

  const botaoFullscreen = document.getElementById("botao-fullscreen");

  botaoFullscreen.addEventListener("click", () => {
    const container = document.getElementById("game-container");
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  let ultimoTempo = 0;

  function loop(tempoAtualMs) {
    if (jogoAcabou) return;

    if (jogoPausado) {
      ultimoTempo = tempoAtualMs / 1000;
      requestAnimationFrame(loop);
      return;
    }

    const tempoAtualSegundos = tempoAtualMs / 1000;
    const deltaTime = tempoAtualSegundos - ultimoTempo;
    ultimoTempo = tempoAtualSegundos;

    // spawna
    tempoDesdeUltimoSpawn += deltaTime;
    if (tempoDesdeUltimoSpawn >= intervaloSpawn) {
      tempoDesdeUltimoSpawn = 0;
      spawnarInimigo();
    }

    // cada inimigo anda pro centro
    for (const inimigo of inimigos) {
      inimigo.atualizar(deltaTime, templo);
    }

    for (const torre of torres) {
      torre.atualizar(deltaTime, inimigos, criarProjetil);
    }

    for (const projetil of projeteis) {
        projetil.atualizar(deltaTime);
    }

    // remove inimigos mortos
    for (let i = inimigos.length - 1; i >= 0; i--) {
      if (inimigos[i].morto) {
        pontuacao += 10;
        inimigos.splice(i, 1);
      }
    }

    verificarDesbloqueios();

    elementoValorVida.textContent = Math.ceil(templo.vida);
    elementoValorPontuacao.textContent = pontuacao;

    // remove projeteis que acertaram
    for (let i = projeteis.length - 1; i >= 0; i--) {
      if (projeteis[i].atingiuAlvo) {
        projeteis.splice(i, 1);
      }
    }

    // DESENHAR
    renderer.limparTela();

    renderer.desenharSprite({
      x: canvas.width / 2,
      y: canvas.height / 2,
      largura: canvas.width,
      altura: canvas.height,
      textura: texturaFundo,
    });
    
    for (const inimigo of inimigos) {
      renderer.desenharSprite({
        x: inimigo.x,
        y: inimigo.y,
        largura: inimigo.largura,
        altura: inimigo.altura,
        textura: inimigo.textura,
      });
    }

    for (const torre of torres) {
      renderer.desenharSprite({
        x: torre.x,
        y: torre.y,
        largura: torre.largura,
        altura: torre.altura,
        textura: torre.textura,
      });
    }

    renderer.desenharSprite({
      x: templo.x,
      y: templo.y,
      largura: templo.largura,
      altura: templo.altura,
      textura: templo.textura,
    });

    for (const projetil of projeteis) {
      renderer.desenharSprite({
        x: projetil.x,
        y: projetil.y,
        largura: projetil.largura,
        altura: projetil.altura,
        textura: projetil.textura,
      });
    }

    if (templo.vida <= 0) {
      jogoAcabou = true;
      musicaFundo.pause();
      textoPontuacaoFinal.textContent = `Você derrotou inimigos suficientes para ${pontuacao} pontos!`;
      telaGameOver.classList.remove("escondido");
      return;
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

iniciar();