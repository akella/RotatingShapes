// @todo
// - save videos!
// - create separate demos!

import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import matcapSoul from '../img/soul.jpg';
import matcapDark from '../img/slate_grey1.jpg';
import matcapCherry from '../img/food_cherry.png';
import matcapSpecial from '../img/effect_alien_green.png';
import matcapAmber from '../img/nature_amber.png';
// import {RoundedBoxBufferGeometry} from './round.js'
// var RoundedBoxGeometry = require('three-rounded-box')(THREE);
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import * as dat from "dat.gui";
import plus from '../models/plus.glb'


export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    //this.renderer.setClearColor(0x000000, 1); 
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.getData()

    

    // Instantiate a loader
    this.loader = new GLTFLoader();



    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );


    this.camera.position.set(0, 1, 3);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;

    this.loader.load(plus,(gltf)=>{

      this.addObjects();
      this.resize();
      this.render();
      this.setupResize();
      this.settings()

      
      
      gltf.scene.traverse(o=>{
        if(o.isMesh){
          this.plus = o;
          console.log(o);
        }
      })

      this.createShapes()

      this.switchTo(this.DOMshape)
      this.switchMatcap(this.DOMcolor);

    })


    
  }

  getData(){
    this.DOMspeed = this.container.getAttribute('data-speed') || 1;
    this.DOMshape = this.container.getAttribute('data-shape') || 'sphube';
    this.DOMdistortion = this.container.getAttribute('data-distortion') || '3';
    this.DOMcolor = this.container.getAttribute('data-color') || 'amber';
    this.showSettings = this.container.getAttribute('data-showsettings')==''?true:false;
  }

  createShapes(){
    let g = new THREE.ParametricBufferGeometry( this.Sphube, 400,400 );
    g.computeVertexNormals();
    this.shapes = 
    {
      sphube:{
        title: "sphube",
      geometry: g,
        axis: new THREE.Vector3(1.,0,0.),
        flat: false
      },
      torus:{
        title: "torus",
        geometry: new THREE.TorusBufferGeometry( 1, 0.3, 50, 100 ),
        axis: new THREE.Vector3(0.,1,0.),
        flat: false
      },
      tetra:{
        title: "tetra",
        geometry: new THREE.CylinderGeometry( 1, 0.5, 1, 6 ),
        axis: new THREE.Vector3(0.,1,0.),
        flat: true,
        // material: 
      },
      plus:{
        title: "plus",
        geometry: this.plus.geometry.scale(0.01,0.01,0.01).center().rotateX(Math.PI/2),
        axis: new THREE.Vector3(1.,1,0.),
        // flat: true,
        // material: 
      },
      cube:{
        title: "cube",
        geometry: this.getCube(),
        axis: new THREE.Vector3(0.,1,0.),
        flat: false,
        // material: 
      },
      superplus:{
        title: "superplus",
        geometry: this.getSuperPlus(),
        axis: new THREE.Vector3(1.,0,0.),
        flat: false,
        // material: 
      },
      icosahedron:{
        title: "icosahedron",
        geometry: new THREE.IcosahedronBufferGeometry(1,1),
        axis: new THREE.Vector3(1.,0,0.),
        flat: true,
        // material: 
      },
      cylinder:{
        title: "cylinder",
        geometry: new THREE.CylinderBufferGeometry( 1, 1, 1, 40 ),
        axis: new THREE.Vector3(0.,0,1.),
        axis2: new THREE.Vector3(1.,0,0.),
        // flat: true,
        // material: 
      },
      cylinderlow:{
        title: "cylinderlow",
        geometry: new THREE.CylinderBufferGeometry( 1, 1, 1, 6 ),
        axis: new THREE.Vector3(1.,0,0.),
        
        flat: true,
        // material: 
      },
      cylinderhigh:{
        title: "cylinderhigh",
        geometry: new THREE.CylinderBufferGeometry( 1, 1, 1, 20 ),
        axis: new THREE.Vector3(1.,0,0.),
        flat: true,
        // material: 
      },
    }


  }

  getCube(){

    let geometry = new THREE.BoxBufferGeometry(2,2,2);
    const edges = new THREE.EdgesGeometry( geometry );

    let pos = edges.attributes.position.array;
    let geometries = []
    for (let i = 0; i < pos.length; i+=6) {
      let gg = new THREE.TubeBufferGeometry(new THREE.CatmullRomCurve3([
        new THREE.Vector3(pos[i],pos[i+1],pos[i+2]),
        new THREE.Vector3(pos[i+3],pos[i+4],pos[i+5]),
        ]), 1, 0.02, 8, false );
      geometries.push(gg)
    }
    let s = 1;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 2; k++) {
          let g = new THREE.SphereBufferGeometry(0.02,20,20);
          g.translate(i<1?-s:s,j<1?-s:s,k<1?-s:s)
          geometries.push(g)
        }
      }
    }
    let finalGeo = BufferGeometryUtils.mergeBufferGeometries(geometries)

    return finalGeo;
  }

  getSuperPlus(){
    let geometries = []
    let g = new THREE.BoxBufferGeometry(2,0.5,0.5,10,10,10);
    geometries.push(g)
    g = new THREE.BoxBufferGeometry(0.5,2,0.5,10,10,10);
    geometries.push(g)
    g = new THREE.BoxBufferGeometry(0.5,0.5,2,10,10,10);
    geometries.push(g)

  
    let finalGeo = BufferGeometryUtils.mergeBufferGeometries(geometries)

    return finalGeo;
  }

  switchTo(shape){
    if(this.shape) this.scene.remove(this.shape);
    // create obj, from this.shapes, and settings
    this.geometry = this.shapes[shape].geometry;
    this.shape = new THREE.Mesh(this.geometry, this.material);
    this.material.uniforms.axis.value = this.shapes[shape].axis;
    if(this.shapes[shape].axis2){
      this.material.uniforms.axis2.value = this.shapes[shape].axis2;
    } else{
      this.material.uniforms.axis2.value = this.shapes[shape].axis;
    }
    this.material.uniforms.axis.value = this.shapes[shape].axis;
    this.material.uniforms.flatNormals.value = this.shapes[shape].flat?1:0;
    
    // reset settings
    this.settings.progress = 0;
    this.scene.add(this.shape)

    this.matcaps = {
      "soul": new THREE.TextureLoader().load(matcapSoul),
      "cherry": new THREE.TextureLoader().load(matcapCherry),
      "dark": new THREE.TextureLoader().load(matcapDark),
      "special": new THREE.TextureLoader().load(matcapSpecial),
      "amber": new THREE.TextureLoader().load(matcapAmber),
    }
  }

  switchMatcap(name){
    this.material.uniforms.matcaptexture.value = this.matcaps[name]
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
      distortion: this.DOMdistortion,
      shape: this.DOMshape,
      color: this.DOMcolor,
      speed: this.DOMspeed,
    };
    if(!this.showSettings) return;
    this.gui = new dat.GUI();
    // this.gui.add(this.settings, "progress", 0, 1, 0.001);
    this.gui.add(this.settings, "distortion", 0, 8, 0.001);
    this.gui.add(this.settings, "speed", 0.1, 3, 0.001);
    this.gui
    .add(this.settings, "shape", [
      "sphube", 
      "torus", 
      "tetra" ,
      "plus",
      "cube" ,
      "superplus" ,
      "icosahedron" ,
      "cylinder" ,
      "cylinderlow" ,
      "cylinderhigh" ,
    ])
    .onFinishChange(function (value) {
      that.switchTo(value);
    });
    this.gui
    .add(this.settings, "color", [
      "soul", 
      "dark", 
      "cherry", 
      "special", 
      "amber", 
    ])
    .onFinishChange(function (value) {
      that.switchMatcap(value);
    });
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        progress: { value: 0 },
        flatNormals: { value: 0 },
        distortion: { value: 0 },
        speed: { value: 1 },
        axis: { value: null },
        axis2: { value: null },
        resolution: { value: new THREE.Vector4() },
        matcaptexture: { value: new THREE.TextureLoader().load(matcapSoul) },
      },
      // wireframe: true,
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });
    
  }

  Sphube(u1,v1,target){
    // https://arxiv.org/pdf/1604.02174.pdf
    let s = 0.6;
    let r = 1;
    let theta = 2*u1*Math.PI;
    let phi = v1*2*Math.PI ;

    let u = Math.cos(theta)*Math.cos(phi);
    let v = Math.cos(theta)*Math.sin(phi);
    let w = Math.sin(theta)

    let z = r*u/Math.sqrt(1 - s*v**2 - s*w**2 )
    let x = r*v/Math.sqrt(1 - s*u**2 - s*w**2 )
    let y = r*w/Math.sqrt(1 - s*Math.cos(theta)**2)

    target.set( x, y, z );
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.01;
    // if(this.shape) this.shape.rotation.y = this.time;
    // this.plane.rotation.y= this.time/2;
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.progress.value = this.settings.progress;
    this.material.uniforms.speed.value = this.settings.speed;
    this.material.uniforms.distortion.value = this.settings.distortion;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container")
});
