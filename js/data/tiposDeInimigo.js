export function criarTiposDeInimigo(texturas) {
  return {
    mumia: {
      velocidade: 50,
      vidaMaxima: 40,
      largura: 55,
      altura: 55,
      textura: texturas.mumia,
      alcanceAtaque: 40,
      danoAtaque: 8,
      cadenciaAtaque: 1,
    },
    escaravelho: {
      velocidade: 140,
      vidaMaxima: 12,
      largura: 40,
      altura: 40,
      textura: texturas.escaravelho,
      alcanceAtaque: 30,
      danoAtaque: 3,
      cadenciaAtaque: 0.6,
    },
    guerreiroChacal: {
      velocidade: 90,
      vidaMaxima: 25,
      largura: 52,
      altura: 52,
      textura: texturas.guerreiroChacal,
      alcanceAtaque: 40,
      danoAtaque: 6,
      cadenciaAtaque: 0.8,
    },
  };
}