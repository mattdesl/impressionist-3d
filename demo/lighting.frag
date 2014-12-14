precision mediump float;
varying vec3 anormal;
uniform int showNormals;

void main() {
  vec3 norm = mix(abs(anormal), vec3(1), 0.25);

    //quick and dirty lighting here.
  // vec3 lightDir = vec3(2.0, 4.0, 1.0);
  // vec3 diffuseColor = vec3(0.8, 0.5, 0.4);
  // vec3 lightColor = vec3(0.7, 0.8, 0.9);
  // vec3 ambientColor = vec3(0.0, 0.0, 0.0);
  // vec3 falloff = vec3(0.0, 0.5, 0.5);

  // vec3 N = normalize(norm);
  // vec3 L = normalize(lightDir);
  // float D = 0.5;

  // vec3 diffuse = lightColor * max(dot(N, L), 0.0);
  // float attenuation = 1.0 / ( falloff.x + (falloff.y*D) + (falloff.z*D*D) );

  // vec3 final = diffuseColor * (ambientColor + diffuse * attenuation);
  if (showNormals == 0)
      gl_FragColor = vec4(vec3(0.1), 1.0);
  else
      gl_FragColor = vec4(norm, 1.0);
}