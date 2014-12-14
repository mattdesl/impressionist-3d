
var Camera  = require('canvas-orbit-camera')
var Shader  = require('gl-shader-core')
var Geom    = require('gl-geometry')
var mat4    = require('gl-matrix').mat4
var quat    = require('gl-matrix').quat
var unindex = require('unindex-mesh')
var faces   = require('face-normals')
var bunny   = require('bunny')
var lerp = require('lerp')

var fs = require('fs')
var fragSource = fs.readFileSync(__dirname+'/lighting.frag', 'utf8')

var mouse = require('touch-position')({ position: [808, 190] })
// var Camera = require('orbit-camera')

bunny = {
  positions: unindex(bunny.positions, bunny.cells)
}

bunny.normals = faces(bunny.positions)


var start = Date.now()

module.exports = function createBunny(gl) {
  var proj = mat4.create()
  var view = mat4.create()
  var rotation = 0

  var geom = Geom(gl)
    .attr('position', bunny.positions)
    .attr('normal', bunny.normals)

  var camera = Camera(gl.canvas, {
      // pan: false
    // , scale: false
    // , rotate: false
  })


  quat.identity(camera.rotation)
  quat.rotateX(camera.rotation, camera.rotation, -Math.PI)

  var uniforms = [{
      name: 'proj'
    , type: 'mat4'
  }, {
      name: 'view'
    , type: 'mat4'
  }, {
      name: 'showNormals'
    , type: 'int'
  }]

  var vertSource = [
      'precision mediump float;'
    , 'uniform mat4 proj;'
    , 'uniform mat4 view;'
    , 'varying vec3 anormal;'
    , 'attribute vec3 position;'
    , 'attribute vec3 normal;'
    , 'void main() {'
    , '  anormal = normal;'
    , '  gl_Position = proj * view * vec4(position, 1);'
    , '}'
  ].join('\n')

  // var fragSource = [
  //     'precision mediump float;'
  //   , 'varying vec3 anormal;'
  //   , 'vec3 lightDir = vec3(2.0, 3.0, 2.0);',
  //   , 'void main() {'
  //   , '  vec3 norm = mix(abs(anormal), vec3(1), 0.25);',
  //   , '  vec3 diff = vec3(0.85, 0.25, 0.25);',
  //   // , '  diff *= norm;',
  //   , '  gl_FragColor = vec4(diff, 1);'
  //   , '}'
  // ].join('\n')
  // console.log(fragSource)

  var shader = Shader(gl
    , vertSource
    , fragSource
    , uniforms
    , []
  )

  var t = 0

  return function(gl, width, height, dt, normals) {
    gl.enable(gl.DEPTH_TEST)

    shader.bind()
    shader.uniforms.showNormals = normals ? 1 : 0
    geom.bind(shader)

    mat4.perspective(proj
      , Math.PI / 4
      , width / height
      , 0.01
      , 100
    )

    t += dt||0


    quat.identity(camera.rotation)
    quat.rotateX(camera.rotation, camera.rotation, -Math.PI)

    var extent = 40 * Math.PI/180
    quat.rotateY(camera.rotation, camera.rotation, lerp(-extent, extent, mouse[0] / width))
    quat.rotateX(camera.rotation, camera.rotation, lerp(-extent, extent, mouse[1] / height))

    camera.distance = 20
    camera.center = [0, 2, 0]
    camera.view(view)
    // camera.tick()

    shader.uniforms.proj = proj
    shader.uniforms.view = view
    geom.draw(gl.TRIANGLES)
    geom.unbind()
  }
}