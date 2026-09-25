// js/entities/Inimigo.js

export class Inimigo {
  constructor({ x, y, velocidade, vidaMaxima, largura, altura, textura, alcanceAtaque, danoAtaque, cadenciaAtaque }) {
    this.x = x;
    this.y = y;
    this.velocidade = velocidade;
    this.vidaMaxima = vidaMaxima;
    this.vida = vidaMaxima;
    this.largura = largura;
    this.altura = altura;
    this.textura = textura;
    this.morto = false;

    this.alcanceAtaque = alcanceAtaque;
    this.danoAtaque = danoAtaque;
    this.cadenciaAtaque = cadenciaAtaque;
    this.tempoDesdeUltimoAtaque = 0;
  }

  atualizar(deltaTime, templo) {
    const dx = templo.x - this.x;
    const dy = templo.y - this.y;
    const distancia = Math.hypot(dx, dy);

    if (distancia > this.alcanceAtaque) { //longe
      const dirX = dx / distancia;
      const dirY = dy / distancia;
      this.x += dirX * this.velocidade * deltaTime;
      this.y += dirY * this.velocidade * deltaTime;
    } else { //perto
      this.tempoDesdeUltimoAtaque += deltaTime;
      if (this.tempoDesdeUltimoAtaque >= this.cadenciaAtaque) {
        this.tempoDesdeUltimoAtaque = 0;
        templo.receberDano(this.danoAtaque);
      }
    }
  }

  receberDano(quantidade) {
    this.vida -= quantidade;
    if (this.vida <= 0) {
      this.morto = true;
    }
  }
}