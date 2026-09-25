import { carregarTextoDeArquivo, compilarShader, criarPrograma } from "./gl-utils.js";

export async function criarRenderer(gl) {
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const codigoVertex = await carregarTextoDeArquivo("shaders/quad.vert");
  const codigoFragment = await carregarTextoDeArquivo("shaders/quad.frag");

  const vertexShader = compilarShader(gl, gl.VERTEX_SHADER, codigoVertex);
  const fragmentShader = compilarShader(gl, gl.FRAGMENT_SHADER, codigoFragment);
  const programa = criarPrograma(gl, vertexShader, fragmentShader);

  const posicaoAttribLocation = gl.getAttribLocation(programa, "a_position");
  const texCoordAttribLocation = gl.getAttribLocation(programa, "a_texCoord");
  const resolucaoUniformLocation = gl.getUniformLocation(programa, "u_resolution");
  const translacaoUniformLocation = gl.getUniformLocation(programa, "u_translation");
  const escalaUniformLocation = gl.getUniformLocation(programa, "u_scale");
  const texturaUniformLocation = gl.getUniformLocation(programa, "u_texture");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const quadVertices = new Float32Array([
  -0.5, -0.5,
   0.5, -0.5,
  -0.5,  0.5,
   0.5,  0.5,
  ]);
  const bufferPosicao = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosicao);
  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(posicaoAttribLocation);
  gl.vertexAttribPointer(posicaoAttribLocation, 2, gl.FLOAT, false, 0, 0);

  const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
  const bufferTexCoord = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferTexCoord);
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(texCoordAttribLocation);
  gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 0, 0);

  function desenharSprite({ x, y, largura, altura, textura }) {
    gl.useProgram(programa);
    gl.bindVertexArray(vao);

    gl.uniform2f(resolucaoUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(translacaoUniformLocation, x, y);
    gl.uniform2f(escalaUniformLocation, largura, altura);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textura);
    gl.uniform1i(texturaUniformLocation, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function limparTela() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.1, 0.1, 0.15, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  return { desenharSprite, limparTela };
}

export function criarTextura(gl, imagem) {
  const textura = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textura);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagem);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return textura;
}

export function carregarImagem(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}