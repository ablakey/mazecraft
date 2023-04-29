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

const m4 = {
  translation: function (tx: number, ty: number, tz: number) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
  },

  xRotation: function (angle: number) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
  },

  yRotation: function (angle: number) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  },

  zRotation: function (angle: number) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },

  scaling: function (sx: number, sy: number, sz: number) {
    return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
  },
  orthographic: function (left: number, right: number, bottom: number, top: number, near: number, far: number) {
    return [
      2 / (right - left),
      0,
      0,
      0,
      0,
      2 / (top - bottom),
      0,
      0,
      0,
      0,
      2 / (near - far),
      0,

      (left + right) / (left - right),
      (bottom + top) / (bottom - top),
      (near + far) / (near - far),
      1,
    ];
  },
};

export class GLMapFrame {
  width: number;
  height: number;
  gl: WebGLRenderingContext;

  start(w: number, h: number) {
    this.width = w;
    this.height = h;

    const viewport = document.querySelector<HTMLCanvasElement>("#mapframe")!;
    const canvas = document.createElement("canvas");
    viewport.appendChild(canvas);
    const gl = canvas.getContext("webgl")!;
    canvas.width = w;
    canvas.height = h;

    // setup GLSL program
    // const program = webglUtils.createProgramFromScripts(gl, ["drawImage-vertex-shader", "drawImage-fragment-shader"]);
    const program = gl.createProgram()!;

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

    // look up where the vertex data needs to go.
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

    // lookup uniforms
    const matrixLocation = gl.getUniformLocation(program, "u_matrix");
    const textureLocation = gl.getUniformLocation(program, "u_texture");

    // Create a buffer.
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Put a unit quad in the buffer
    const positions = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create a buffer for texture coords
    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Put texcoords in the buffer
    const texcoords = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

    // creates a texture info { width: w, height: h, texture: tex }
    // The texture will start with 1x1 pixels and be updated
    // when the image has loaded
    function loadImageAndCreateTextureInfo(img: HTMLImageElement) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      // Fill the texture with a 1x1 blue pixel.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

      // let's assume all images are not a power of 2
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      const textureInfo = {
        width: img.width,
        height: img.height,
        texture: tex,
      };

      gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      return textureInfo;
    }

    const textureInfos = [loadImageAndCreateTextureInfo(window.Engine.assets.textures.star)];

    const drawInfos: { x: number; y: number; dx: number; dy: number; textureInfo: any }[] = [];
    const numToDraw = 9;
    const speed = 60;
    for (let ii = 0; ii < numToDraw; ++ii) {
      const drawInfo = {
        x: Math.random() * gl.canvas.width,
        y: Math.random() * gl.canvas.height,
        dx: Math.random() > 0.5 ? -1 : 1,
        dy: Math.random() > 0.5 ? -1 : 1,
        textureInfo: textureInfos[(Math.random() * textureInfos.length) | 0],
      };
      drawInfos.push(drawInfo);
    }

    function update(deltaTime: number) {
      console.log(drawInfos);
      drawInfos.forEach(function (drawInfo) {
        drawInfo.x += drawInfo.dx * speed * deltaTime;
        drawInfo.y += drawInfo.dy * speed * deltaTime;
        if (drawInfo.x < 0) {
          drawInfo.dx = 1;
        }
        if (drawInfo.x >= gl.canvas.width) {
          drawInfo.dx = -1;
        }
        if (drawInfo.y < 0) {
          drawInfo.dy = 1;
        }
        if (drawInfo.y >= gl.canvas.height) {
          drawInfo.dy = -1;
        }
      });
    }

    function draw() {
      // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.clear(gl.COLOR_BUFFER_BIT);

      drawInfos.forEach(function (drawInfo) {
        drawImage(drawInfo.textureInfo.texture, drawInfo.textureInfo.width, drawInfo.textureInfo.height, drawInfo.x, drawInfo.y);
      });
    }

    let then = 0;
    function render(time: number) {
      console.log(time);
      const now = time * 0.001;
      const deltaTime = Math.min(0.1, now - then);
      then = now;

      update(deltaTime);
      draw();

      // requestAnimationFrame(render );
    }
    requestAnimationFrame(render);

    // Unlike images, textures do not have a width and height associated
    // with them so we'll pass in the width and height of the texture
    function drawImage(tex: any, texWidth: any, texHeight: any, dstX: any, dstY: any) {
      gl.bindTexture(gl.TEXTURE_2D, tex);

      // Tell WebGL to use our shader program pair
      gl.useProgram(program);

      // Setup the attributes to pull data from our buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
      gl.enableVertexAttribArray(texcoordLocation);
      gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

      // this matrix will convert from pixels to clip space
      let matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

      // this matrix will translate our quad to dstX, dstY
      matrix = m4.translation(dstX, dstY, 0);

      // this matrix will scale our 1 unit quad
      // from 1 unit to texWidth, texHeight units
      matrix = m4.scaling(texWidth, texHeight, 1);

      // Set the matrix.
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

      // Tell the shader to get the texture from texture unit 0
      gl.uniform1i(textureLocation, 0);

      // draw the quad (2 triangles, 6 vertices)
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }
}
