export async function carregarTextoDeArquivo(url) {
  const resposta = await fetch(url);
  return await resposta.text();
}

export function compilarShader(gl, tipo, codigoFonte) {
  const shader = gl.createShader(tipo);
  gl.shaderSource(shader, codigoFonte);
  gl.compileShader(shader);

  const sucesso = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!sucesso) {
    console.error("Erro ao compilar shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function criarPrograma(gl, vertexShader, fragmentShader) {
  const programa = gl.createProgram();
  gl.attachShader(programa, vertexShader);
  gl.attachShader(programa, fragmentShader);
  gl.linkProgram(programa);

  const sucesso = gl.getProgramParameter(programa, gl.LINK_STATUS);
  if (!sucesso) {
    console.error("Erro ao linkar programa:", gl.getProgramInfoLog(programa));
    gl.deleteProgram(programa);
    return null;
  }

  return programa;
}