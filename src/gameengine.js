/*---------------------------------------------------------------------------------------------------------

  Game Engine Class (extends primitive canvas): Gives callbacks Update(updticks) and Render(rndrticks)
  
  Author:    Sean Everett, but mostly known as: Talon

  IRC:       Talon (SwiftIRC: irc.swiftirc.net / Libera.Chat: irc.libera.chat)
  Discord:   talon0039
  GitHub:    https://www.github.com/Talon-1
  
---------------------------------------------------------------------------------------------------------*/

import { PrimitiveCanvas } from "./primitivecanvas.js"

export class GameEngine extends PrimitiveCanvas {
  #PrivateData;
  constructor(Parent,Width,Height,FPS = 60) {
    super(Parent,Width,Height,true,true); //Parent,width,height,hookpointers,hookkeys
    this.#PrivateData = {
      Signals: { onpause: [] , onrun: [] },
      Paused: true,
      BlurPaused: false,
      FPSLimit: FPS,
      TimeDelta: Math.max(16,Math.floor(1000 / FPS)), //Cap to 60FPS atm...
      TimeHuge: Math.max(16,Math.floor(1000 / FPS)) * 3, //Cap to 60FPS atm...
      LastUpdate: null,
      LastDraw: null,
      AnimationFrame: null,
    }
    window.addEventListener('blur', (e) => { if (!this.#PrivateData.BlurPaused) { this.#PrivateData.BlurPaused = true; this.pause(); this.onPause(); } });
    window.addEventListener('focus', (e) => { if (this.#PrivateData.BlurPaused) { this.#PrivateData.BlurPaused = false; this.run(); this.onRun(); } });
    this.addEventListener('userinput',this);
  }

  #Update(Time) {
    let DeltaTime = 0 , DeltaDraw = 0;
    if (this.#PrivateData.LastUpdate == null) { this.#PrivateData.LastUpdate = Time; }
    else { DeltaTime = Time - this.#PrivateData.LastUpdate; }
    if (this.#PrivateData.LastDraw == undefined) { this.#PrivateData.LastDraw = Time; }
    else { DeltaDraw = Time - this.#PrivateData.LastDraw; }
    //Window prolly lost focus, avoid EXTREMELY LARGE timesteps updating stuff way outta bounds...
    if (DeltaTime > this.#PrivateData.TimeHuge) { DeltaTime = this.#PrivateData.TimeHuge; }

    this.update(DeltaTime);

    //Only redraw if we meet or exceed our TimeDelta (FPS Limit) NOTE: Engine runs full tilt, this just prevents re-drawing every update which saves the time it takes to render.
    if (DeltaDraw >= this.#PrivateData.TimeDelta) {
      //Render the scene.
      this.render(DeltaDraw);	  
      //Log the time given from requestAnimationFrame so we can calculate the time passed from last draw
      this.#PrivateData.LastDraw = Time;
    }
    //Log the time given from requestAnimationFrame so we can calculate the time passed from last frame
    this.#PrivateData.LastUpdate = Time;
    //Request another animation frame
    if (!this.#PrivateData.Paused) { this.#PrivateData.AnimationFrame = requestAnimationFrame(this.#Update.bind(this)); }
  }
  //Getters/Setters
  paused() { return this.#PrivateData.Paused; }
  pause() { 
    this.#PrivateData.Paused = true;
    cancelAnimationFrame(this.#PrivateData.AnimationFrame);
    this.dispatchEvent(new CustomEvent('userinput', { bubbles: true, detail: { target: this, jsEvent: {target: this, type: "pause"} } }));
  }
  stop() { this.pause(); }
  run() { 
    this.#PrivateData.Paused = false;
    this.#PrivateData.AnimationFrame = requestAnimationFrame(this.#Update.bind(this)); 
    this.dispatchEvent(new CustomEvent('userinput', { bubbles: false, detail: { target: this, jsEvent: {target: this, type: "run"} } }));
  }

  //Default Event Handler
  handleEvent(e) { }

  //Public functions to overload later
  onPause() { }
  onRun() { }
  update(dt) { }
  render(dt) { }
}
customElements.define('game-engine', GameEngine, { extends: "canvas" });

/*---------------------------------------------------------------------------------------------------------
  Boiler Plate: Copy/Paste below to start designing your next game!

class YourGame extends GameEngine {
  constructor(Parent,Width,Height,FPS = 60) {
    super(Parent,Width,Height,FPS);
    //Your constructor code here
  }
  //Private Functions

  //Default Event Handler
  handleEvent(evt) {
    if (evt.type == 'userinput') {
      let e = evt.detail.jsEvent;
      //Events: [pointerenter,pointerdown,pointermove,pointerup,pointercancel,pointerout,pointerleave,wheel,keydown,keyup]
      //Your input handling code here
    }
  }
  //Public overloaded functions
  update(DeltaTime) { }
  render(DeltaTime) { }
}
customElements.define('game-yourgame', YourGame, { extends: "canvas" });

  ---------------------------------------------------------------------------------------------------------*/
