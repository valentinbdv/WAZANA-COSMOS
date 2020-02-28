import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import { Effect } from '@babylonjs/core/Materials/effect';
import { Vector3, Color3 } from '@babylonjs/core/Maths/math';

import { scene } from '../core/scene';
import { ow } from '../core/util';

export let Shaders: any = {}

export class FieldMaterial {

    shaderkey: string;
    shaderlist = ['forcefield', 'wave', 'portal'];
    material: any;
    constructor(key: string, shader: string, color?: string) {
        if (this.shaderlist.indexOf(shader) == -1) return;
        this.shaderkey = key + shader;

        let size = 1,
            ghostify = 2,
            opacity = 1;
        if (shader == 'forcefield') {
            size = 8;
            ghostify = 1;
            opacity = 0.3;
            this.createPortalEffect(this.shaderkey);
        } else if (shader == 'wave') {
            this.createWaveEffect(this.shaderkey, color);
        } else if (shader == 'portal') {
            size = 64;
            ghostify = 0.1;
            opacity = 0.7;
            this.createPortalEffect(this.shaderkey);
        } else if (shader == 'fire') {
            opacity = 1;
            this.createFireEffect(this.shaderkey);
        }

        this.material = new ShaderMaterial("shader", scene, {
            vertex: this.shaderkey,
            fragment: this.shaderkey,
            needAlphaBlending: true,
        }, {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "shcolor", "size", "ghostify"]
        });
        this.material.setFloat("time", 0);

        this.color = Color3.FromHexString(color);
        this.color.a = opacity;
        this.material.setColor4("shcolor", this.color);
        this.material.setFloat("size", size);
        this.material.setFloat("ghostify", ghostify);
        this.material.setVector3("cameraPosition", Vector3.Zero());
        this.material.backFaceCulling = true;
        Shaders[this.shaderkey] = this.material;

        // if (shader == 'fire') {
        //   let sphere = Mesh.CreateSphere("mesh", 16, 5, scene);
        //   sphere.material = this.material;
        //   sphere.position.x = 5;
        //   sphere.scaling = new Vector3(scale, scale, scale);
        // }


        return this;
    }

    opacity: number = 1;
    setOpacity(op: number) {
        this.opacity = op;
        // if (!this.color) return;
        this.color.a = op;
        this.material.setColor4("shcolor", this.color);
    }

    color: any;
    setColor(color: string) {
        this.color = Color3.FromHexString(color);
        this.color.a = this.opacity;
        this.material.setColor4("shcolor", this.color);
    }

    destroy() {
        delete Shaders[this.shaderkey];
        this.material.dispose();
    }

    /*
    +------------------------------------------------------------------------+
    | PORTAL SHADER                                                            |
    +------------------------------------------------------------------------+
    */

    createPortalEffect(key: string) {
        Effect.ShadersStore[key + "VertexShader"] =
            "precision highp float;\r\n" +

            "// Attributes\r\n" +
            "attribute vec3 position;\r\n" +
            "attribute vec2 uv;\r\n" +

            "// Uniforms\r\n" +
            "uniform mat4 worldViewProjection;\r\n" +

            "// Varying\r\n" +
            "varying vec2 vUV;\r\n" +

            "void main(void) {\r\n" +
            "    gl_Position = worldViewProjection * vec4(position, 1.0);\r\n" +

            "    vUV = uv;\r\n" +
            "}\r\n";

        Effect.ShadersStore[key + "FragmentShader"] =
            "precision highp float;\r\n" +

            "varying vec2 vUV;\r\n" +

            "uniform float time;\r\n" +
            "uniform float size;\r\n" +
            "uniform float ghostify;\r\n" +
            "uniform vec4 shcolor;\r\n" +
            "uniform sampler2D textureSampler;\r\n" +

            "float mod289(float x)\r\n" +
            "{\r\n" +
            "    return x - floor(x * (1.0 / 289.0)) * 289.0;\r\n" +
            "}\r\n" +

            "vec4 mod289(vec4 x)\r\n" +
            "{\r\n" +
            "    return x - floor(x * (1.0 / 289.0)) * 289.0;\r\n" +
            "}\r\n" +

            "vec4 perm(vec4 x)\r\n" +
            "{\r\n" +
            "    return mod289(((x * 34.0) + 1.0) * x);\r\n" +
            "}\r\n" +

            "float noise3d(vec3 p)\r\n" +
            "{\r\n" +
            "    vec3 a = floor(p);\r\n" +
            "    vec3 d = p - a;\r\n" +
            "    d = d * d * (3.0 - 2.0 * d);\r\n" +

            "    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);\r\n" +
            "    vec4 k1 = perm(b.xyxy);\r\n" +
            "    vec4 k2 = perm(k1.xyxy + b.zzww);\r\n" +

            "    vec4 c = k2 + a.zzzz;\r\n" +
            "    vec4 k3 = perm(c);\r\n" +
            "    vec4 k4 = perm(c + 1.0);\r\n" +

            "    vec4 o1 = fract(k3 * (1.0 / 41.0));\r\n" +
            "    vec4 o2 = fract(k4 * (1.0 / 41.0));\r\n" +

            "    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);\r\n" +
            "    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);\r\n" +

            "    return o4.y * d.y + o4.x * (1.0 - d.y);\r\n" +
            "}\r\n" +

            "void main() {\r\n" +
            "    vec2 uv = vUV;\r\n" +
            "    float speed = 1.0;\r\n" +
            "    float brightness = 0.0;\r\n" +
            "    \r\n" +
            "    vec3 water[4];\r\n" +

            "    mat3 r = mat3(0.36, 0.48, -0.8, -0.8, 0.60, 0.0, 0.48, 0.64, 0.60);\r\n" +
            "    vec3 p_pos = r * vec3(uv * vec2(2.0 * size, size), 0.0);\r\n" +
            "    vec3 p_time = r * vec3(0.0, 0.0, time * speed);\r\n" +

            "    /* Noise sampling points for water */\r\n" +
            "    water[0] = p_pos / 2.0 + p_time;\r\n" +
            "    water[1] = p_pos / 4.0 + p_time;\r\n" +
            "    water[2] = p_pos / 8.0 + p_time;\r\n" +
            "    water[3] = p_pos / 16.0 + p_time;\r\n" +

            "    /* Compute 4 octaves of noise */\r\n" +
            "    vec3 points[4];\r\n" +
            "    points[0] = water[0];\r\n" +
            "    points[1] = water[1];\r\n" +
            "    points[2] = water[2];\r\n" +
            "    points[3] = water[3];\r\n" +
            "    vec4 n = vec4(noise3d(points[0]),\r\n" +
            "                  noise3d(points[1]),\r\n" +
            "                  noise3d(points[2]),\r\n" +
            "                  noise3d(points[3]));\r\n" +

            "    /* Use noise results for water */\r\n" +
            "    float p = dot(abs(2.0 * n - 1.0), vec4(\r\n" +
            "        0.5 * ghostify, 0.25 * ghostify, 0.125 * ghostify, 0.125 * ghostify\r\n" +
            "    ));\r\n" +
            "    float q = sqrt(p);\r\n" +
            "    \r\n" +
            "    vec2 newUV = vUV;\r\n" +
            "    newUV.x += time / 10.0;\r\n" +
            "    \r\n" +
            "    vec4 textCol = texture2D(textureSampler, newUV);\r\n" +
            "    textCol *= 0.0;\r\n" +

            "    vec4 caustic = vec4(shcolor * (brightness + 1.0-q));\r\n" +
            "    \r\n" +
            "    gl_FragColor = mix(caustic, textCol, 0.15);\r\n" +
            "}\r\n";

    }

    /*
    +------------------------------------------------------------------------+
    | FIRE SHADER                                                            |
    +------------------------------------------------------------------------+
    */

    createFireEffect(key: string) {
        Effect.ShadersStore[key + "VertexShader"] =
            "precision highp float;\r\n" +

            "// Attributes\r\n" +
            "attribute vec3 position;\r\n" +
            "attribute vec3 normal;\r\n" +
            "attribute vec2 uv;\r\n" +

            "// Uniforms\r\n" +
            "uniform mat4 worldViewProjection;\r\n" +
            "uniform float time;\r\n" +

            "// Varying\r\n" +
            "varying vec4 vPosition;\r\n" +
            "varying vec3 vNormal;\r\n" +
            "varying vec2 vUV;\r\n" +

            "mat4 rotationMatrix(vec3 axis, float angle)\r\n" +
            "{\r\n" +
            "    axis = normalize(axis);\r\n" +
            "    float s = sin(angle);\r\n" +
            "    float c = cos(angle);\r\n" +
            "    float oc = 1.0 - c;\r\n" +
            "    \r\n" +
            "    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\r\n" +
            "                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\r\n" +
            "                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\r\n" +
            "                0.0,                                0.0,                                0.0,                                1.0);\r\n" +
            "}\r\n" +

            "mat3 rotateX(float rad) {\r\n" +
            "    float c = cos(rad);\r\n" +
            "    float s = sin(rad);\r\n" +
            "    return mat3(\r\n" +
            "        1.0, 0.0, 0.0,\r\n" +
            "        0.0, c, s,\r\n" +
            "        0.0, -s, c\r\n" +
            "    );\r\n" +
            "}\r\n" +

            "mat3 rotateY(float rad) {\r\n" +
            "    float c = cos(rad);\r\n" +
            "    float s = sin(rad);\r\n" +
            "    return mat3(\r\n" +
            "        c, 0.0, -s,\r\n" +
            "        0.0, 1.0, 0.0,\r\n" +
            "        s, 0.0, c\r\n" +
            "    );\r\n" +
            "}\r\n" +

            "mat3 rotateZ(float rad) {\r\n" +
            "    float c = cos(rad);\r\n" +
            "    float s = sin(rad);\r\n" +
            "    return mat3(\r\n" +
            "        c, s, 0.0,\r\n" +
            "        -s, c, 0.0,\r\n" +
            "        0.0, 0.0, 1.0\r\n" +
            "    );\r\n" +
            "}\r\n" +

            "const float DEG_TO_RAD = 3.141592653589793 / 180.0;\r\n" +

            "void main(void) {\r\n" +
            "   vec4 p = worldViewProjection * vec4(position, 1.0);\r\n" +
            "   \r\n" +
            "   gl_Position = p * rotationMatrix(position, sin(time) / 100000.);\r\n" +
            "    vUV = uv;\r\n" +
            "}\r\n";

        Effect.ShadersStore[key + "FragmentShader"] =
            "precision highp float;\r\n" +

            "varying vec2 vUV;\r\n" +

            "uniform sampler2D textureSampler;\r\n" +
            "uniform mat4 worldView;\r\n" +
            "varying vec4 vPosition;\r\n" +
            "varying vec3 vNormal;\r\n" +

            "uniform float time;\r\n" +
            "uniform float size;\r\n" +
            "uniform float ghostify;\r\n" +
            "uniform vec4 shcolor;\r\n" +

            "// Uniforms\r\n" +
            "uniform mat4 view;\r\n" +
            "uniform vec3 cameraPosition;\r\n" +
            "uniform vec3 viewportPosition;\r\n" +

            "float snoise(vec3 uv, float res)\r\n" +
            "{\r\n" +
            "	const vec3 s = vec3(1e0, 1e2, 1e3);\r\n" +
            "	\r\n" +
            "	uv *= res;\r\n" +
            "	\r\n" +
            "	vec3 uv0 = floor(mod(uv, res))*s;\r\n" +
            "	vec3 uv1 = floor(mod(uv+vec3(1.), res))*s;\r\n" +
            "	\r\n" +
            "	vec3 f = fract(uv); f = f*f*(3.0-2.0*f);\r\n" +

            "	vec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z,\r\n" +
            "		      	  uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);\r\n" +

            "	vec4 r = fract(sin(v*1e-1)*1e3);\r\n" +
            "	float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);\r\n" +
            "	\r\n" +
            "	r = fract(sin((v + uv1.z - uv0.z)*1e-1)*1e3);\r\n" +
            "	float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);\r\n" +
            "	\r\n" +
            "	return mix(r0, r1, f.z)*2.-1.;\r\n" +
            "}\r\n" +

            "void main(void) {\r\n" +
            "    \r\n" +
            "    vec3 e = normalize( vec3( worldView * vPosition ) );\r\n" +
            "    vec2 uv = vUV.xy;\r\n" +
            "    \r\n" +
            "	vec2 p = -.5 + vUV.xy;\r\n" +

            "	float color = 1.0;\r\n" +
            "	\r\n" +
            "	vec3 coord = vec3(atan(p.x,p.y)/6.2832+.5, length(p)*.4, .5);\r\n" +
            "	\r\n" +
            "	for(int i = 1; i <= 7; i++)\r\n" +
            "	{\r\n" +
            "		float power = pow(2.0, float(i));\r\n" +
            "		color += (1.5 / power) * snoise(coord + vec3(0.,-time*.2, time*.05), power*16.);\r\n" +
            "	}\r\n" +
            "    gl_FragColor = vec4( shcolor.r, pow(max(color,0.),2.)*shcolor.g, pow(max(color,0.),3.)*shcolor.b , shcolor.a);\r\n" +
            "}\r\n";

    }

    /*
    +------------------------------------------------------------------------+
    | WAVE SHADER                                                            |
    +------------------------------------------------------------------------+
    */

    createWaveEffect(key: string, color: string) {
        let rgb = ow.hexToRgbBabylon(color);
        // vec3(0,0.5,1)
        let shadercolor = "vec3(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";

        Effect.ShadersStore[key + "VertexShader"] =
            "precision highp float;\r\n" +
            "// Attributes\r\n" +
            "attribute vec3 position;\r\n" +
            "attribute vec3 normal;\r\n" +
            "attribute vec2 uv;\r\n" +

            "// Uniforms\r\n" +
            "uniform mat4 worldViewProjection;\r\n" +
            "uniform float time;\r\n" +

            "// Varying\r\n" +
            "varying vec3 vPosition;\r\n" +
            "varying vec3 vNormal;\r\n" +
            "varying vec2 vUV;\r\n" +

            "void main(void) {\r\n" +
            "    vec3 v = position;\r\n" +
            "    v.x += sin(2.0 * position.y + (time)) * .1;\r\n" +
            "    v.z += cos(2.0 * position.y + (time)) * .1;\r\n" +
            "    gl_Position = worldViewProjection * vec4(v, 1.0);\r\n" +
            "    \r\n" +
            "    vPosition = position;\r\n" +
            "    vNormal = normal;\r\n" +
            "    vUV = uv;\r\n" +
            "}\r\n";

        Effect.ShadersStore[key + "FragmentShader"] =
            "precision highp float;\r\n" +

            "// Varying\r\n" +
            "varying vec3 vPosition;\r\n" +
            "varying vec3 vNormal;\r\n" +
            "varying vec2 vUV;\r\n" +

            "// Uniforms\r\n" +
            "uniform mat4 world;\r\n" +

            "// Refs\r\n" +
            "uniform vec3 cameraPosition;\r\n" +
            "uniform sampler2D textureSampler;\r\n" +

            "void main(void) {\r\n" +
            "    vec3 vLightPosition = vec3(0,20,10);\r\n" +
            "    \r\n" +
            "    // World values\r\n" +
            "    vec3 vPositionW = vec3(world * vec4(vPosition, 1.0));\r\n" +
            "    vec3 vNormalW = normalize(vec3(world * vec4(vNormal, 0.0)));\r\n" +
            "    vec3 viewDirectionW = normalize(cameraPosition - vPositionW);\r\n" +
            "    \r\n" +
            "    // Light\r\n" +
            "    vec3 lightVectorW = normalize(vLightPosition - vPositionW);\r\n" +
            "    vec3 color = " + shadercolor + ";\r\n" +
            // "    vec3 color = texture2D(textureSampler, vUV).rgb;\r\n"+
            "    \r\n" +
            "    // diffuse\r\n" +
            "    float ndl = max(0., dot(vNormalW, lightVectorW));\r\n" +
            "    \r\n" +
            "    // Specular\r\n" +
            "    vec3 angleW = normalize(viewDirectionW + lightVectorW);\r\n" +
            "    float specComp = max(0., dot(vNormalW, angleW));\r\n" +
            "    specComp = pow(specComp, max(1., 64.)) * 2.;\r\n" +
            "    \r\n" +
            "    gl_FragColor = vec4(color * ndl + vec3(specComp), 1.);\r\n" +
            "}\r\n";
    }


}