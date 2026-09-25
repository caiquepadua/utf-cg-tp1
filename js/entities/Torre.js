export class Torre {
  constructor({ x, y, alcance, dano, cadencia, largura, altura, textura }) {
    this.x = x;
    this.y = y;
    this.alcance = alcance;
    this.dano = dano;
    this.cadencia = cadencia; // segundos entre tiros
    this.tempoDesdeUltimoTiro = 0;
    this.largura = largura;
    this.altura = altura;
    this.textura = textura;
    this.alvoAtual = null;
  }

  encontrarAlvo(inimigos) {
    let maisProximo = null;
    let menorDistancia = this.alcance;

    for (const inimigo of inimigos) {
      const dx = inimigo.x - this.x;
      const dy = inimigo.y - this.y;
      const distancia = Math.hypot(dx, dy);

      if (distancia <= menorDistancia) {
        menorDistancia = distancia;
        maisProximo = inimigo;
      }
    }

    this.alvoAtual = maisProximo;
  }

  atualizar(deltaTime, inimigos, criarProjetil) {
    this.tempoDesdeUltimoTiro += deltaTime;
    this.encontrarAlvo(inimigos);

    if (this.alvoAtual && this.tempoDesdeUltimoTiro >= this.cadencia) {
      this.tempoDesdeUltimoTiro = 0;
      criarProjetil(this.x, this.y, this.alvoAtual);
    }
  }
}