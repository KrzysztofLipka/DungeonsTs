import React from 'react';
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

  componentDidMount() {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.sceneSetup();
    this.gameManager.init()
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
