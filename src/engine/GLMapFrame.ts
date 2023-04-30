import { m4 } from "./m4";

const VERTEX_SHADER = `
attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_matrix;

varying vec2 v_texcoord;

void main() {
   gl_Position = u_matrix * a_position;
   v_texcoord = a_texcoord;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;

void main() {
   gl_FragColor = texture2D(u_texture, v_texcoord);
}
`;

export class GLMapFrame {
  width: number;
  height: number;
  gl: WebGLRenderingContext;
  program: any;
  foo: any;
  positionLocation: any;
  texcoordLocation: any;
  matrixLocation: any;
  textureLocation: any;
  positionBuffer: any;
  texcoordBuffer: any;

  start(w: number, h: number) {
    this.width = w;
    this.height = h;

    const viewport = document.querySelector<HTMLCanvasElement>("#mapframe")!;
    const canvas = document.createElement("canvas");
    viewport.appendChild(canvas);
    const gl = canvas.getContext("webgl")!;
    canvas.width = w;
    canvas.height = h;
    this.gl = gl;

    // setup GLSL program
    // const program = webglUtils.createProgramFromScripts(gl, ["drawImage-vertex-shader", "drawImage-fragment-shader"]);
    const program = gl.createProgram()!;
    this.program = program;

    // Set up shaders.
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, VERTEX_SHADER);
    gl.compileShader(vertexShader);
    gl.attachShader(program, vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, FRAGMENT_SHADER);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    this.foo = this.loadImageAndCreateTextureInfo(window.Engine.assets.textures.gravel);

    // look up where the vertex data needs to go.
    this.positionLocation = gl.getAttribLocation(this.program, "a_position");
    this.texcoordLocation = gl.getAttribLocation(this.program, "a_texcoord");

    // lookup uniforms
    this.matrixLocation = gl.getUniformLocation(this.program, "u_matrix");
    this.textureLocation = gl.getUniformLocation(this.program, "u_texture");

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    // Put a unit quad in the buffer
    const positions = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create a buffer for texture coords
    // Put texcoords in the buffer
    this.texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
    const texcoords = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
  }

  loadImageAndCreateTextureInfo(img: HTMLImageElement) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    const textureInfo = {
      width: img.width,
      height: img.height,
      texture: tex,
    };

    return textureInfo;
  }

  draw() {
    const gl = this.gl;
    // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels

    gl.clear(gl.COLOR_BUFFER_BIT);

    const t0 = performance.now();
    for (let x = 0; x < 800; x += 10) {
      for (let y = 0; y < 600; y += 10) {
        this.drawImage(this.foo.texture, this.foo.width, this.foo.height, x, y);
      }
    }
    // console.log(performance.now() - t0);
  }

  // Unlike images, textures do not have a width and height associated
  // with them so we'll pass in the width and height of the texture
  drawImage(tex: any, texWidth: any, texHeight: any, dstX: any, dstY: any) {
    const gl = this.gl;

    gl.bindTexture(gl.TEXTURE_2D, tex);

    // Tell WebGL to use our shader program pair
    gl.useProgram(this.program);

    // Setup the attributes to pull data from our buffers
    // gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer); // TODO: needed?
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
    // gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer); // TODO: needed?
    gl.enableVertexAttribArray(this.texcoordLocation);
    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    // this matrix will convert from pixels to clip space
    let matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

    // this matrix will translate our quad to dstX, dstY
    matrix = m4.translate(matrix, dstX, dstY, 0);

    // this matrix will scale our 1 unit quad
    // from 1 unit to texWidth, texHeight units
    matrix = m4.scale(matrix, texWidth, texHeight, 1);

    // Set the matrix.
    gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(this.textureLocation, 0);

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
