export class Templo {
  constructor({ x, y, vidaMaxima, largura, altura, textura }) {
    this.x = x;
    this.y = y;
    this.vidaMaxima = vidaMaxima;
    this.vida = vidaMaxima;
    this.largura = largura;
    this.altura = altura;
    this.textura = textura;
  }

  receberDano(quantidade) {
    this.vida -= quantidade;
    if (this.vida < 0) {
      this.vida = 0; // nao deixa a vida ficar negativa
    }
  }
}