/*---------------------------------------------------------------------------------------------------------

  Lazy Audio Mixer Class (Still a Work in Progress)
  
  Author:    Sean Everett, but mostly known as: Talon

  IRC:       Talon (SwiftIRC: irc.swiftirc.net / Libera.Chat: irc.libera.chat)
  Discord:   talon0039
  GitHub:    https://www.github.com/Talon-1
  
---------------------------------------------------------------------------------------------------------*/

//Helper class, Wrapper for Gain Node and Sound Buffer
class LazyAudioSound {
  #Data;
  constructor(ctx,mastergain,buffer) {
    this.#Data = { Source: ctx.createBufferSource(), GainNode: ctx.createGain() };
    this.#Data.GainNode.connect(mastergain);
    this.#Data.Source.connect(this.#Data.GainNode);
    this.#Data.Source.buffer = buffer[0];
  }
  destructor() {
    this.#Data.Source.onended = null;
    this.#Data.GainNode.disconnect();
    this.#Data.Source.disconnect();
    for (let key in this.#Data) { delete this.#Data[key]; }
  }
  source() { if (this.#Data.hasOwnProperty('Source')) { return this.#Data.Source; } }
  play() { if (this.#Data.hasOwnProperty('Source')) { this.#Data.Source.start(0); } }
  stop() { if (this.#Data.hasOwnProperty('Source')) { this.#Data.Source.stop(0); this.destructor(); } }
  volume(vol) { 
    if (this.#Data.hasOwnProperty('GainNode')) { 
      if (vol === undefined) { return this.#Data.GainNode.gain.value; }
      else { this.#Data.GainNode.gain.value = vol; }
    }
  }
}

//Main Wrapper Class
export class LazyAudioMixer {
  #Data;
  constructor() {
    this.#Data = { 
      Signals: { onended: [] },
      Buffers: { },
      Mix: [],
      MixLoop: { },
      Volume: 1,
      MixVolume: 1,
    };
    this.#Data.Context = new AudioContext();
    this.#Data.MasterGain = this.#Data.Context.createGain();
    this.#Data.MasterGain.gain.value = this.#Data.Volume;
    this.#Data.MasterGain.connect(this.#Data.Context.destination);
  }
  connect(receiver,slot) { this.#Data.Signals['onended'].push({Bind: receiver, Call: slot }); }
  disconnect(receiver,slot) {
    this.#Data.Signals['onended'].reduceRight((Total,connection,i) => { 
      if (this.#Data.Signals['onended'][i].Bind == receiver && this.#Data.Signals['onended'][i].Call == slot) { this.#Data.Signals['onended'].splice(i,1); } 
    },this.#Data.Signals['onended'][this.#Data.Signals['onended'].length -1]);
  }
  emit(args = []) {
    this.#Data.Signals['onended'].forEach((func) => { 
      if (typeof func.Call != 'undefined') { func.Call.apply(func.Bind,(Array.isArray(args) ? args : [])); }
    });
  }

  //Public Functions
  loadAudioBuffer(name,src) {
    if (src) {
      let request = new XMLHttpRequest();
      this.#Data.Buffers[name] = [];
      request.open('GET', src, true);
      request.responseType = 'arraybuffer';
      request.onload = (e) => { this.#Data.Context.decodeAudioData(request.response,(buffer) => this.#Data.Buffers[name].push(buffer), (e) => 'Error with decoding audio data' + e.err); }
      request.send();
    }
  }
  play(alias,volume = 1, loop = false) {
    if (this.#Data.Buffers.hasOwnProperty(alias) && this.#Data.Buffers[alias].length > 0) {
      if (!loop) { 
        let Sound = new LazyAudioSound(this.#Data.Context,this.#Data.MasterGain,this.#Data.Buffers[alias]);
        this.#Data.Mix.push(Sound);
        Sound.volume(Math.min(this.#Data.MixVolume,volume));
        Sound.source().onended = () => { 
          if (this.#Data.Mix.includes(Sound)) {
            this.emit([alias,Sound]);
            Sound.destructor();
            this.#Data.Mix.splice(this.#Data.Mix.indexOf(Sound),1); 
          }
        }         
        Sound.play();
      }
      else { 
        if (!this.#Data.MixLoop.hasOwnProperty(alias)) {
          let Sound = new LazyAudioSound(this.#Data.Context,this.#Data.MasterGain,this.#Data.Buffers[alias]);
          this.#Data.MixLoop[alias] = Sound;
          Sound.volume(volume);
          Sound.source().loop = loop; 
          Sound.source().loopStart = 0;
          Sound.source().loopEnd = Sound.source().buffer.duration;
          Sound.play();
        }
        else {
          this.stop(alias);
          this.play(alias,volume,loop);
        }
      }
    }
  }
  sound(alias) { 
    if (!isNaN(alias) && alias >= 0 && alias < this.#Data.Mix.length) { return this.#Data.Mix[alias]; } 
    else if (this.#Data.MixLoop.hasOwnProperty(alias)) { return this.#Data.MixLoop[alias]; } 
  }
  stop(alias) {
    if (this.#Data.MixLoop.hasOwnProperty(alias)) {
      this.#Data.MixLoop[alias].stop();
      delete this.#Data.MixLoop[alias];
    }
  }
  masterVolume(vol) { 
    if (vol === undefined) { return this.#Data.MasterGain.gain.value; }
    else { this.#Data.Volume = vol; this.#Data.MasterGain.gain.value = vol; }
  }
  mixVolume(vol) { 
    if (vol === undefined) { return this.#Data.MixVolume; }
    else { this.#Data.MixVolume = vol; }
  }
  mute(muted) {
    if (muted === undefined) { return (this.#Data.MasterGain.gain.value == 0 ? true : false); }
    else { 
      if (muted) { this.#Data.MasterGain.gain.value = 0; }
      else { this.#Data.MasterGain.gain.value = this.#Data.Volume; }
    }
  }
}