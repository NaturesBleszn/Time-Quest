export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundscapeNodes: { [key: string]: AudioNode[] } = {};

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.5;
    }
  }

  setVolume(val: number) {
    if (this.masterGain) this.masterGain.gain.value = val;
  }

  playBell() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 1);

    gain.gain.setValueAtTime(1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 2);
  }

  playLevelUp() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const freqs = [440, 554.37, 659.25, 880]; // A major arpeggio
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const startTime = this.ctx!.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  startSoundscape(type: 'rain' | 'fire' | 'waves') {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    this.stopSoundscape();

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    const gainNode = this.ctx.createGain();

    if (type === 'rain') {
        // Pink noise approximation for rain
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        gainNode.gain.value = 0.5;
    } else if (type === 'fire') {
        // Brown noise approximation + crackles
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gainNode.gain.value = 0.8;
        
        // Add crackle oscillator
        const crackle = this.ctx.createOscillator();
        crackle.type = 'square';
        crackle.frequency.value = 50;
        const crackleGain = this.ctx.createGain();
        crackleGain.gain.value = 0.05;
        crackle.connect(crackleGain);
        crackleGain.connect(gainNode);
        crackle.start();
        this.soundscapeNodes['current'] = [noiseSource, filter, gainNode, crackle, crackleGain];
    } else if (type === 'waves') {
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.2; // Slow sweep
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 600;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        gainNode.gain.value = 0.3;
        this.soundscapeNodes['current'] = [noiseSource, filter, gainNode, lfo, lfoGain];
    }

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    noiseSource.start();
    if (!this.soundscapeNodes['current']) {
        this.soundscapeNodes['current'] = [noiseSource, filter, gainNode];
    }
  }

  stopSoundscape() {
    if (this.soundscapeNodes['current']) {
        this.soundscapeNodes['current'].forEach(node => {
            if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
                try { node.stop(); } catch(e){}
            }
            node.disconnect();
        });
        delete this.soundscapeNodes['current'];
    }
  }
}

export const audio = new AudioEngine();
