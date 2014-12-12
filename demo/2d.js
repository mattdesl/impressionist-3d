var Promise = require('bluebird')
var baboon = require('baboon-image-uri')
var getPixels = require('get-image-pixels')
var getCanvasPixels = require('canvas-pixels')
var loadImage = Promise.promisify(require('img'))
var create = require('canvas-testbed')
var colorStyle = require('color-style')
var vec = require('gl-vec2')
var lerp = require('lerp')

var Motion = require('../motion')

var box = [300,300]



var image,
    video,
    imageShape,
    pixels,
    tmp = [0,0],
    imageShape = box,
    tmpCanvas = document.createElement('canvas'),
    tmpContext = tmpCanvas.getContext('2d'),
    aspect,
    mouse = require('touch-position')(),
    mouseNrm = [0, 0],
    motion = Motion({ count: 1000 })

loadImage(baboon).then(function(i) {
    image = i
    motion.speed = 0.09
    pixels = getPixels(image)
    return create(render, start)
})

function start() {
    video = require('getuservideo')({
        width: 512,
        onReady: function() {
            aspect = video.width / video.height
            box[0] = video.width
            box[1] = box[0]/aspect
            tmpCanvas.width = box[0]
            tmpCanvas.height = box[1]
            motion.speed = 1
        },
        constraints: { audio: false, video: true }
    })
    setTimeout(function() {
        video.style.position = 'fixed'
        video.style.top = '0'
        video.style.left = '0'
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
    ctx.translate(width/2-box[0]/2,height/2-box[1]/2)
    motion.update(1/60)
    motion.points.forEach(function(p) {
        var s = 0
        var x = p.position[0]*box[0],
            y = p.position[1]*box[1],
            px = p.previous[0]*box[0],
            py = p.previous[1]*box[1]

        var pxX = ~~(p.position[0]*imageShape[0]) % imageShape[0],
            pxY = ~~(p.position[1]*imageShape[1]) % imageShape[1]

        var offset = (imageShape[0]-pxX-1) + (pxY * imageShape[0])
        var r = pixels[offset * 4 + 0],
            g = pixels[offset * 4 + 1],
            b = pixels[offset * 4 + 2]

        ctx.strokeStyle = colorStyle(r,g,b)
        ctx.beginPath()
        ctx.lineTo(px, py)
        ctx.lineTo(x, y)
        var dur = p.time/p.duration
        ctx.lineWidth = lerp(5.5, 30.5, (p.noise/2+0.5))*dur
        ctx.globalAlpha = 0.6
        ctx.stroke()
    })
    ctx.restore()

    // ctx.drawImage(tmpCanvas,0,0)

}