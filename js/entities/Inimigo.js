export class Inimigo {
  constructor({ x, y, velocidade, vidaMaxima, largura, altura, textura }) {
    this.x = x;
    this.y = y;
    this.velocidade = velocidade;
    this.vidaMaxima = vidaMaxima;
    this.vida = vidaMaxima;
    this.largura = largura;
    this.altura = altura;
    this.textura = textura;
    this.morto = false;
  }

  atualizar(deltaTime, alvoX, alvoY) {  // vetor direção ate a torre
    const dx = alvoX - this.x;
    const dy = alvoY - this.y;
    const distancia = Math.hypot(dx, dy);

    if (distancia > 1) {
      const dirX = dx / distancia;
      const dirY = dy / distancia;
      this.x += dirX * this.velocidade * deltaTime;
      this.y += dirY * this.velocidade * deltaTime;
    }
  }

  receberDano(quantidade) {
    this.vida -= quantidade;
    if (this.vida <= 0) {
      this.morto = true;
    }
  }
}