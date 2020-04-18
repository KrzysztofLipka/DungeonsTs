import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as THREE from 'three';
import { GameManager } from './GameManager'

class App extends React.Component {
  height: number = window.innerHeight;
  width: number = window.innerWidth;
  gameManager: GameManager | null = null;

  //public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;

  public el = document.createElement('div');

  /**
   *
   */
  constructor(props: any) {
    super(props);
    //this.scene = new THREE.Scene();
    /*this.camera = new THREE.PerspectiveCamera(
      75, // fov = field of view
      this.width / this.height, // aspect ratio
      0.1, // near plane
      1000 // far plane
    );*/
    //this.renderer = new THREE.WebGLRenderer();

  }



  componentDidMount() {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.sceneSetup();
    this.gameManager.assetsManager.init()
  }

  sceneSetup = () => {

    this.gameManager = new GameManager(this.width, this.height);
    this.gameManager.sceneManager.render();
  }


  render() {
    return <div></div>
    //return <canvas id='c'></canvas>
  }

}

export default App;
