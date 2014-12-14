var Promise = require('bluebird')
var baboon = require('baboon-image-uri')
var getPixels = require('get-image-pixels')
var getCanvasPixels = require('canvas-pixels')
var loadImage = Promise.promisify(require('img'))
var create = require('canvas-testbed')
var vec = require('gl-vec2')
var clamp = require('clamp')
var lerp = require('lerp')
var smoothstep = require('smoothstep')
var draw = require('./draw-particles')
var Motion = require('../motion')
var style = require('dom-css')

var box = [300,300]


var image,
    video,
    imageShape,
    author,
    pixels,
    tmp = [0,0],
    imageShape = box,
    tmpCanvas = document.createElement('canvas'),
    tmpContext = tmpCanvas.getContext('2d'),
    aspect,
    mouse = require('touch-position')(),
    mouseNrm = [0, 0],
    motion = Motion({ count: 1000 })

loadImage('teapot_n.png')
    .then(function(i) {
        image = i
        motion.speed = 0.09
        pixels = getPixels(image)
        return create(render, start, { onResize: resize })
    })

function resize(width, height) {
    style(author, {
        left: width/2 - box[0]/2,
        width: box[0],
        top: height/2 + box[1]/2 + 10
    })
}

function start(ctx, width, height) {
    author = document.querySelector('.author')
    style(author, {
        display: 'block',
    })
    resize(width, height)

    // document.body.style.background = '#1e1e1e'
    video = require('getuservideo')({
        width: 512,
        onReady: function() {
            aspect = video.width / video.height
            box[0] = video.width
            box[1] = box[0]/aspect
            tmpCanvas.width = box[0]
            tmpCanvas.height = box[1]
            motion.speed = 1
            resize(width, height)
        },
        constraints: { audio: false, video: true }
    })
    setTimeout(function() {
        style(video, {
            position: 'fixed',
            top: 0,
            left: 0
        })
        // document.body.appendChild(video)
    }, 0)

    tmpCanvas.width = box[0]
    tmpCanvas.height = box[1]

}

function render(ctx, width, height) {
    // ctx.clearRect(0,0,width,height)

    // ctx.drawImage(image, 0, 0, box[0], box[1])

    tmpContext.clearRect(0,0,box[0],box[1])



    
    if (video.width > 0 && video.height > 0) {
        tmpContext.drawImage(video, 0, 0, box[0], box[1])        
    } else {
        tmpContext.drawImage(image, 0, 0, box[0], box[1])
    }
    pixels = getCanvasPixels(tmpContext)
    // pixels = getPixels(image)

    ctx.save()
    var offset = [ width/2-box[0]/2, height/2-box[1]/2 ]
    ctx.translate(offset[0],offset[1])
    motion.update(1/60)
    draw(ctx, motion.points, box, pixels, imageShape)
    ctx.restore()

    motion.points.forEach(function(p) {
        // vec.multiply(tmp, p.position, box)
        // vec.add(tmp, tmp, offset)
        // var dist = vec.distance(tmp, mouse)
        // var white = clamp(smoothstep(1.0, 0.0, dist / 100), 0, 1)
        // var force = clamp(smoothstep(1.5, 0.0, dist / 50), 0, 1)

        var nx = p.color[0]/255 * 2 - 1
        var ny = p.color[1]/255 * 2 - 1

        vec.set(tmp, nx, ny)
        vec.scale(tmp, tmp, 0.001)
        p.addForce(tmp)

        // vec.subtract(tmp, tmp, mouse)
        // vec.normalize(tmp, tmp)
        // vec.scale(tmp, tmp, 0.0001 * force)
        // p.addForce(tmp)

        // p.white = white

        // p.white *= 0.5
    })


    // ctx.drawImage(tmpCanvas,0,0)

}