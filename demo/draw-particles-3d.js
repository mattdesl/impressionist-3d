var vec3 = require('gl-vec3')
var clamp = require('clamp')
var lerp = require('lerp')

var SIZE = 7
var tmp = [0,0,0]
var particleShape = [SIZE, SIZE]

var diffuse = [1, 0.5, 0.2]
var lightDir = [2, 4, 2]

var N=[0,0,0], L=[0,0,0]
var NEGATIVE_ONE = [-1,-1,-1]

module.exports = function(batch, points, translate, size, pixels, imageShape) {
    points.forEach(function(p) {
        var s = 0
        var x = p.position[0]*size[0],
            y = p.position[1]*size[1],
            px = p.previous[0]*size[0],
            py = p.previous[1]*size[1]

        var pxX = ~~(p.position[0]*imageShape[0]) % imageShape[0],
            pxY = ~~(p.position[1]*imageShape[1]) % imageShape[1]

        var offset = (imageShape[0]-pxX-1) + (pxY * imageShape[0])
        p.fboColor[0] = pixels[offset * 4 + 0]/255
        p.fboColor[1] = pixels[offset * 4 + 1]/255
        p.fboColor[2] = pixels[offset * 4 + 2]/255
        
        vec3.copy(batch.color, p.fboColor)
        batch.color[3] = 0.65

        var mod = lerp(p.time/p.duration, 0.5, 1.5)
        particleShape[0] = SIZE*mod
        particleShape[1] = SIZE*mod

        batch.shape = particleShape
        batch.position[0] = x + translate[0]
        batch.position[1] = y + translate[1]
        batch.push()
    })
}