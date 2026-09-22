// Ponto de entrada do jogo.
// Por enquanto só inicializa o WebGL2 e limpa a tela, pra confirmar
// que o ambiente está funcionando antes de começar a desenhar algo.

const canvas = document.getElementById("game-canvas");
canvas.width = 960;
canvas.height = 540;

const gl = canvas.getContext("webgl2");

if (!gl) {
  alert("Seu navegador não suporta WebGL2 :(");
} else {
  gl.clearColor(0.1, 0.1, 0.15, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  console.log("WebGL2 inicializado com sucesso!");
}
