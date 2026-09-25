export class Projetil {
  constructor({ x, y, alvo, velocidade, dano, largura, altura, textura, efeitoLentidao, raioDano, todosInimigos }) {
    this.x = x;
    this.y = y;
    this.alvo = alvo;
    this.velocidade = velocidade;
    this.dano = dano;
    this.largura = largura;
    this.altura = altura;
    this.textura = textura;
    this.efeitoLentidao = efeitoLentidao || null;
    this.raioDano = raioDano || null;
    this.todosInimigos = todosInimigos || [];
    this.atingiuAlvo = false;
  }

  atualizar(deltaTime) {
    if (!this.alvo || this.alvo.morto) {
      this.atingiuAlvo = true;
      return;
    }

    const dx = this.alvo.x - this.x;
    const dy = this.alvo.y - this.y;
    const distancia = Math.hypot(dx, dy);
    const distanciaDeAcerto = 15;

    if (distancia <= distanciaDeAcerto) {
      if (this.raioDano) { //dano em area
        for (const inimigo of this.todosInimigos) {
          const dxArea = inimigo.x - this.x;
          const dyArea = inimigo.y - this.y;
          const distanciaArea = Math.hypot(dxArea, dyArea);
          if (distanciaArea <= this.raioDano) {
            inimigo.receberDano(this.dano);
          }
        }
      } else {
        this.alvo.receberDano(this.dano);
        if (this.efeitoLentidao) {
          this.alvo.aplicarLentidao(this.efeitoLentidao.duracao, this.efeitoLentidao.multiplicador);
        }
      }
      this.atingiuAlvo = true;
      return;
    }

    const dirX = dx / distancia;
    const dirY = dy / distancia;
    this.x += dirX * this.velocidade * deltaTime;
    this.y += dirY * this.velocidade * deltaTime;
  }
}