export class Inimigo {
  constructor({ x, y, velocidade, vidaMaxima, largura, altura, textura, alcanceAtaque, danoAtaque, cadenciaAtaque }) {
    this.x = x;
    this.y = y;
    this.velocidadeBase = velocidade;
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

    this.tempoDeLentidaoRestante = 0;
    this.multiplicadorLentidao = 1;
  }

  aplicarLentidao(duracao, multiplicador) {
    this.tempoDeLentidaoRestante = duracao;
    this.multiplicadorLentidao = multiplicador;
  }

  atualizar(deltaTime, templo) {
    if (this.tempoDeLentidaoRestante > 0) {
      this.tempoDeLentidaoRestante -= deltaTime;
      if (this.tempoDeLentidaoRestante <= 0) {
        this.multiplicadorLentidao = 1; // efeito acabou
      }
    }

    const velocidadeAtual = this.velocidadeBase * this.multiplicadorLentidao;

    const dx = templo.x - this.x;
    const dy = templo.y - this.y;
    const distancia = Math.hypot(dx, dy);

    if (distancia > this.alcanceAtaque) {
      const dirX = dx / distancia;
      const dirY = dy / distancia;
      this.x += dirX * velocidadeAtual * deltaTime;
      this.y += dirY * velocidadeAtual * deltaTime;
    } else {
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