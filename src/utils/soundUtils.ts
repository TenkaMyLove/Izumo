/**
 * Plays a pleasant Windows 11 style startup chime using Web Audio API synthesizer or custom sound file data
 */
export function playStartupSound(customAudioData?: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const soundSource = (customAudioData && customAudioData.trim().length > 0) 
        ? customAudioData 
        : '/Tenka.mp3';

      const audio = new Audio(soundSource);
      audio.volume = 1.0; // Max standard HTML5 volume

      // Use Web Audio API GainNode to boost volume up to 3x (300%) if standard max is quiet
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          const source = ctx.createMediaElementSource(audio);
          const gainNode = ctx.createGain();
          gainNode.gain.value = 3.0; // 300% volume boost!
          source.connect(gainNode);
          gainNode.connect(ctx.destination);
        } catch (e) {
          console.warn('Web Audio gain boost fallback:', e);
        }
      }

      audio.play().then(() => resolve()).catch(() => {
        synthesizeWindowsChime().then(resolve);
      });
    } catch (e) {
      console.warn('Startup sound playback failed:', e);
      synthesizeWindowsChime().then(resolve);
    }
  });
}

function synthesizeWindowsChime(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        resolve();
        return;
      }

      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      // Pleasant startup chord notes (C5, G5, C6, E6)
      const frequencies = [523.25, 783.99, 1046.50, 1318.51];
      const startTime = ctx.currentTime + 0.05;

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime + idx * 0.08);

        // Gentle envelope
        gain.gain.setValueAtTime(0, startTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, startTime + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime + idx * 0.08);
        osc.stop(startTime + idx * 0.08 + 1.25);
      });

      setTimeout(() => {
        ctx.close();
        resolve();
      }, 1600);
    } catch {
      resolve();
    }
  });
}
