var colorStyle = require('color-style')
var lerp = require('lerp')
var rgb2hsv = require('color-convert').rgb2hsv
var hsv2rgb = require('color-convert').hsv2rgb
var vec3 = require('gl-vec3')
var clamp = require('clamp')

var tmp = [0,0,0]

module.exports = function(ctx, points, box, pixels, imageShape) {
    points.forEach(function(p) {
        var s = 0
        var x = p.position[0]*box[0],
            y = p.position[1]*box[1],
            px = p.previous[0]*box[0],
            py = p.previous[1]*box[1]

        var pxX = ~~(p.position[0]*imageShape[0]) % imageShape[0],
            pxY = ~~(p.position[1]*imageShape[1]) % imageShape[1]

        var offset = (imageShape[0]-pxX-1) + (pxY * imageShape[0])
        vec3.set(tmp, pixels[offset * 4 + 0], 
                  pixels[offset * 4 + 1],   
                  pixels[offset * 4 + 2])
        vec3.scale(tmp, tmp, lerp(1, 1.5, p.white))
        // var hsv = rgb2hsv(tmp)
        // hsv[0] = clamp(lerp(hsv[0], hsv[0]-50, p.white), 0, 360)

        // tmp = hsv2rgb(hsv)
        // r = lerp(r, 200, p.white)
        // g = lerp(g, 40, p.white)
        // b = lerp(b, 30, p.white)

        ctx.strokeStyle = colorStyle(tmp)
        ctx.beginPath()
        ctx.lineTo(px, py)
        ctx.lineTo(x, y)
        var dur = p.time/p.duration
        ctx.lineWidth = lerp(5.5, 30.5, (p.noise/2+0.5))*dur * p.size
        ctx.globalAlpha = 0.6
        ctx.stroke()
    })
}