import React from 'react';
import './App.css';
import * as THREE from 'three';
import { GameManager } from './GameManager'
import { Inventory } from './ui/Inventory'

interface AppState {
  isUiOpened: boolean;
}

class App extends React.Component<{}, AppState> {
  height: number = window.innerHeight;
  width: number = window.innerWidth;
  gameManager: GameManager | null = null;

  public renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;

  constructor(props) {
    super(props);
    this.state = { isUiOpened: false }
  }

  public el = document.createElement('div');

  componentDidMount() {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.sceneSetup();
    this.gameManager.init()
  }

  setOpenUi = (open: boolean) => {
    this.setState({ isUiOpened: open })
  }

  sceneSetup = () => {
    this.gameManager = new GameManager(this.width, this.height, this.setOpenUi);
    this.gameManager.sceneManager.render();
  }


  render() {
    return <div>
      {this.state.isUiOpened && <Inventory setUiOpen={this.setOpenUi} />}
    </div>
  }

}

export default App;
