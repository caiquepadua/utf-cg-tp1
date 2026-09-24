// js/main.js
import { criarRenderer, criarTextura, carregarImagem } from "./renderer.js";
import { Inimigo } from "./entities/Inimigo.js";
import { Torre } from "./entities/Torre.js";
import { Projetil } from "./entities/Projetil.js";

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
    }));
  }

  const torre = new Torre({
      x: centroX,
      y: centroY,
      alcance: 200,
      dano: 10,
      cadencia: 1, // 1 tiro por segundo
      largura: 60,
      altura: 60,
      textura: texturaAreia, // placeholder por enquanto
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

  let ultimoTempo = 0;

  function loop(tempoAtualMs) {
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
      inimigo.atualizar(deltaTime, centroX, centroY);
    }

    torre.atualizar(deltaTime, inimigos, criarProjetil);

    for (const projetil of projeteis) {
        projetil.atualizar(deltaTime);
    }

    // remove inimigos mortos
    for (let i = inimigos.length - 1; i >= 0; i--) {
      if (inimigos[i].morto) {
        inimigos.splice(i, 1);
      }
    }

    // remove projéteis que já acertaram (ou perderam o alvo)
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

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

iniciar();