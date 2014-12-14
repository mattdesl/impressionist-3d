var createBunny = require('./draw-bunny')
var Promise = require('bluebird')
var loadImage = Promise.promisify(require('img'))

var css = require('dom-css')
var createApp = require('canvas-testbed')
var drawBunny, time = 0
var getCanvasPixels = require('canvas-pixels').get3d
var clear = require('gl-clear')({ color: [1,1,1,1] })
var createFBO = require('gl-fbo')
var drawParticles3D = require('./draw-particles-3d')
var createTexture = require('gl-texture2d')

var mat4 = require('gl-mat4')
var createShader = require('gl-basic-shader')
var SpriteBatch = require('gl-sprite-batch')
var vec2 = require('gl-vec2')

var FRAME_SIZE = [256, 256]
var RENDER_SIZE = [512, 512]
var buffer,
    fbo,
    dirty = false

var motion = require('../motion')({ count: 6000 })

var ortho = mat4.create(),
    tmp = [0, 0]

var batch, shader,
    showNormals = false, 
    brushImage, brushTexture


function render(gl, width, height, dt) {
    time += dt
    motion.update(1/60)
    
    //draw normals to FBO
    blit(gl, fbo, drawBunny, buffer, dt)
    
    batch.premultiplied = false
    
    shader.bind()
    shader.uniforms.texture0 = 0

    //setup ortho projection
    mat4.ortho(ortho, 0, width, height, 0, 0, 1)
    shader.uniforms.projection = ortho
    
    var translate = [(width - RENDER_SIZE[0])/2, (height - RENDER_SIZE[1])/2]

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.clear(gl.DEPTH_BUFFER_BIT)
    if (dirty) {
        clear(gl)
        dirty = false
    }
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    drawParticles(gl, translate)
    // debug(gl, fbo.color[0])
}

function debug(gl, texture) {
    batch.clear()
    batch.bind(shader)
    batch.push({
        texture: texture,
        shape: FRAME_SIZE
    })
    batch.draw()
    batch.unbind()
}

function drawParticles(gl, translate) {
          
    //clear the batch to zero
    batch.clear()

    //bind before drawing
    batch.bind(shader)

    batch.texture = brushTexture
    drawParticles3D(batch, motion.points, translate, RENDER_SIZE, buffer, FRAME_SIZE)

    batch.draw()
    batch.unbind()    
}

function blit(gl, fbo, scene, buffer, dt) {
    var shape = fbo.shape

    fbo.bind()
    clear(gl)
    gl.viewport(0, 0, shape[0], shape[1])
    scene(gl, shape[0], shape[1], dt, showNormals)

    gl.readPixels(0, 0, shape[0], shape[1], 
            gl.RGBA, gl.UNSIGNED_BYTE, buffer)
    
}

function resize() {
    //clear screen on resize
    dirty = true
}

function start(gl, width, height) {
    document.body.style.backgroundColor = '#fff'
    var info = document.querySelector('.info')
    css(info, {
        display: 'block',
        margin: 10,
        padding: 0
    })

    drawBunny = createBunny(gl)
    fbo = createFBO(gl, FRAME_SIZE, { depth: true, stencil: false })
    buffer = new Uint8Array(FRAME_SIZE[0]*FRAME_SIZE[1]*4)

    batch = SpriteBatch(gl, { capacity: motion.points.length })
    shader = createShader(gl, {
        texcoord: true,
        color: true,
        normal: false
    })

    brushTexture = createTexture(gl, brushImage)
    
    ;[brushTexture].forEach(function(t) {
        t.minFilter = gl.LINEAR_MIPMAP_LINEAR
        t.magFilter = gl.LINEAR
        t.generateMipmap()
    })

    //initially white
    clear(gl)
}

var attr = { preserveDrawingBuffer: true, premultipliedAlpha: false, alpha: false }
loadImage('brush.png')
    .then(function(img) {
        brushImage = img
        createApp(render, start, { 
            context: 'webgl', 
            contextAttributes: attr,
            onResize: resize
        })
    })

window.addEventListener('click', function(ev) {
    showNormals = !showNormals
})