uniform float uSize;
uniform vec2 uResolution;
void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  gl_PointSize = uSize * uResolution.y;
  gl_PointSize *= 1.0 / - viewPosition.z; // 手前の点は大きく、奥の点は小さくなるようにする計算
}
