// js/entities/Projetil.js

export class Projetil {
  constructor({ x, y, alvo, velocidade, dano, largura, altura, textura }) {
    this.x = x;
    this.y = y;
    this.alvo = alvo; // referência direta ao objeto Inimigo que esse projétil persegue
    this.velocidade = velocidade;
    this.dano = dano;
    this.largura = largura;
    this.altura = altura;
    this.textura = textura;
    this.atingiuAlvo = false;
  }

  atualizar(deltaTime) {
    // se o alvo já morreu (por outro motivo) antes do projétil chegar, só marca como "gasto"
    if (!this.alvo || this.alvo.morto) {
      this.atingiuAlvo = true;
      return;
    }

    const dx = this.alvo.x - this.x;
    const dy = this.alvo.y - this.y;
    const distancia = Math.hypot(dx, dy);

    const distanciaDeAcerto = 15; // "colisão" simplificada: se chegou perto o suficiente, considera que acertou

    if (distancia <= distanciaDeAcerto) {
      this.alvo.receberDano(this.dano);
      this.atingiuAlvo = true;
      return;
    }

    const dirX = dx / distancia;
    const dirY = dy / distancia;
    this.x += dirX * this.velocidade * deltaTime;
    this.y += dirY * this.velocidade * deltaTime;
  }
}