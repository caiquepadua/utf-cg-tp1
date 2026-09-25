import { criarRenderer, criarTextura, carregarImagem } from "./renderer.js";
import { Inimigo } from "./entities/Inimigo.js";
import { Torre } from "./entities/Torre.js";
import { Projetil } from "./entities/Projetil.js";
import { Templo } from "./entities/Templo.js";

const canvas = document.getElementById("game-canvas");
canvas.width = 960;
canvas.height = 540;

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

  const elementoValorVida = document.getElementById("valor-vida");
  const elementoValorPontuacao = document.getElementById("valor-pontuacao");

  let pontuacao = 0;

  const imagemAreia = await carregarImagem("assets/images/areia.jpg");
  const texturaAreia = criarTextura(gl, imagemAreia); // placeholder

  const inimigos = [];
  let tempoDesdeUltimoSpawn = 0;
  const intervaloSpawn = 1.5; // segundos entre cada inimigo

  const projeteis = [];

  // aparece aleatorio
  function spawnarInimigo() {
    const borda = Math.floor(Math.random() * 4);
    let x, y;
    if (borda === 0) { x = Math.random() * canvas.width; y = -40; }
    else if (borda === 1) { x = Math.random() * canvas.width; y = canvas.height + 40; }
    else if (borda === 2) { x = -40; y = Math.random() * canvas.height; }
    else { x = canvas.width + 40; y = Math.random() * canvas.height; }

    inimigos.push(new Inimigo({
      x, y,
      velocidade: 80,
      vidaMaxima: 30,
      largura: 40,
      altura: 40,
      textura: texturaAreia,
      alcanceAtaque: 40,
      danoAtaque: 5,
      cadenciaAtaque: 1,
    }));
  }

  const templo = new Templo({
    x: centroX,
    y: centroY,
    vidaMaxima: 100,
    largura: 70,
    altura: 70,
    textura: texturaAreia, // placeholder
  });

  const torre = new Torre({
      x: centroX,
      y: centroY,
      alcance: 200,
      dano: 10,
      cadencia: 1, // 1 tiro por segundo
      largura: 60,
      altura: 60,
      textura: texturaAreia, // placeholder
    });

  function criarProjetil(x, y, alvo) {
    projeteis.push(new Projetil({
      x, y,
      alvo,
      velocidade: 400,
      dano: torre.dano,
      largura: 12,
      altura: 12,
      textura: texturaAreia, // placeholder
    }));
  }

  canvas.addEventListener("click", (evento) => {
    if (jogoAcabou) return;

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
        inimigo.receberDano(15); // dano
        break;
      }
    }
  });

  let ultimoTempo = 0;

  function loop(tempoAtualMs) {
    if (jogoAcabou) return;
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

    torre.atualizar(deltaTime, inimigos, criarProjetil);

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
    for (const inimigo of inimigos) {
      renderer.desenharSprite({
        x: inimigo.x,
        y: inimigo.y,
        largura: inimigo.largura,
        altura: inimigo.altura,
        textura: inimigo.textura,
      });
    }

    renderer.desenharSprite({
      x: torre.x,
      y: torre.y,
      largura: torre.largura,
      altura: torre.altura,
      textura: torre.textura,
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
      textoPontuacaoFinal.textContent = `Você derrotou inimigos suficientes para ${pontuacao} pontos!`;
      telaGameOver.classList.remove("escondido");
      return;
  }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

iniciar();