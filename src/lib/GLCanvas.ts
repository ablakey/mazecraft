/**
 * A minimal implementation of a WebGL-based canvas that offers a limited "drawImage" API akin to the "2d" canvas
 * context.
 *
 * Inspired by: https://webglfundamentals.org/webgl/lessons/webgl-2d-drawimage.html
 */
export class GLCanvas {
  private static FRAGMENT_SHADER = `
    precision mediump float;
    varying vec2 v_texcoord;
    uniform sampler2D u_texture;
    void main() {
      gl_FragColor = texture2D(u_texture, v_texcoord);
    }
  `;

  private static VERTEX_SHADER = `
    attribute vec4 a_position;
    attribute vec2 a_texcoord;
    uniform mat4 u_matrix;
    varying vec2 v_texcoord;
    void main() {
      gl_Position = u_matrix * a_position;
      v_texcoord = a_texcoord;
    }
  `;

  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private positionLocation: number;
  private texcoordLocation: number;
  private matrixLocation: WebGLUniformLocation;
  private textureLocation: WebGLUniformLocation;
  private positionBuffer: WebGLBuffer;
  private texcoordBuffer: WebGLBuffer;
  private textureCache: Map<HTMLImageElement, { texture: WebGLTexture; width: number; height: number }> = new Map();

  constructor(
    canvasSize: Vec2,
    parentElementSelector: string,
    onMouseEvent: (e: MouseEvent, type: "mousemove" | "mousedown" | "mouseup") => void
  ) {
    const viewport = document.querySelector<HTMLCanvasElement>(parentElementSelector)!;
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize[0];
    canvas.height = canvasSize[1];
    viewport.appendChild(canvas);

    canvas.addEventListener("mousedown", (e) => onMouseEvent(e, "mousedown"));
    canvas.addEventListener("mousemove", (e) => onMouseEvent(e, "mousemove"));
    canvas.addEventListener("mouseup", (e) => onMouseEvent(e, "mouseup"));
    canvas.addEventListener("mouseleave", (e) => onMouseEvent(e, "mouseup"));

    const gl = canvas.getContext("webgl")!;
    this.gl = gl;

    const program = gl.createProgram()!;
    this.program = program;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, GLCanvas.VERTEX_SHADER);
    gl.compileShader(vertexShader);
    gl.attachShader(program, vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, GLCanvas.FRAGMENT_SHADER);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    this.positionLocation = gl.getAttribLocation(this.program, "a_position");
    this.texcoordLocation = gl.getAttribLocation(this.program, "a_texcoord");
    this.matrixLocation = gl.getUniformLocation(this.program, "u_matrix")!;
    this.textureLocation = gl.getUniformLocation(this.program, "u_texture")!;

    this.positionBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    const positions = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    this.texcoordBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
    const texcoords = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
  }

  private getTexture(img: HTMLImageElement) {
    if (this.textureCache.has(img)) {
      return this.textureCache.get(img);
    }

    const gl = this.gl;
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    const cachedTexture = { texture, width: img.width, height: img.height };
    this.textureCache.set(img, cachedTexture);

    return cachedTexture;
  }

  private buildMatrix(x: number, y: number, w: number, h: number) {
    // This is a combination of orthographic, scale, transform. Yes, that makes it not very re-usable.
    // See: https://webglfundamentals.org/webgl/resources/m4.js
    const ww = 2 / this.gl.canvas.width;
    const hh = 2 / -this.gl.canvas.height;
    return new Float32Array([ww * w, 0, 0, 0, 0, hh * h, 0, 0, 0, 0, -2, 0, ww * x - 1, hh * y + 1, -1, 1]);
  }

  drawImage(img: HTMLImageElement, x: number, y: number, w?: number, h?: number) {
    const { width, height, texture } = this.getTexture(img)!;

    const gl = this.gl;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
    gl.enableVertexAttribArray(this.texcoordLocation);
    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    const matrix = this.buildMatrix(x, y, w ?? width, h ?? height);

    gl.uniformMatrix4fv(this.matrixLocation, false, matrix);
    gl.uniform1i(this.textureLocation, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
