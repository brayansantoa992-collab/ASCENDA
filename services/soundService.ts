
// Simple Audio Synthesis Service to avoid external dependencies
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

// Store active oscillators to stop looping sounds
let activeOscillators: any[] = [];
let ringInterval: any = null;

const playTone = (freq: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle', duration: number, delay = 0, vol = 0.1) => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
    
    gain.gain.setValueAtTime(vol, audioCtx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + duration);
    
    activeOscillators.push(osc);
    osc.onended = () => {
        activeOscillators = activeOscillators.filter(o => o !== osc);
    };
};

export const stopSound = () => {
    if (ringInterval) {
        clearInterval(ringInterval);
        ringInterval = null;
    }
    activeOscillators.forEach(osc => {
        try { osc.stop(); } catch(e){}
    });
    activeOscillators = [];
};

export const playSound = (type: 'SEND' | 'RECEIVE' | 'RECORD_START' | 'RECORD_END' | 'CALL' | 'RINGING') => {
    try {
        if (audioCtx.state === 'suspended') audioCtx.resume();

        switch (type) {
            case 'SEND':
                playTone(800, 'sine', 0.15, 0, 0.05);
                break;
            case 'RECEIVE':
                playTone(440, 'sine', 0.1, 0, 0.1);
                playTone(554, 'sine', 0.4, 0.1, 0.1);
                break;
            case 'RECORD_START':
                playTone(300, 'sine', 0.1, 0, 0.1);
                playTone(600, 'sine', 0.1, 0.1, 0.1);
                break;
            case 'RECORD_END':
                playTone(600, 'sine', 0.1, 0, 0.1);
                playTone(300, 'sine', 0.1, 0.1, 0.1);
                break;
            case 'CALL': 
                playTone(440, 'sine', 0.5);
                break;
            case 'RINGING': // Continuous loop
                stopSound(); // Ensure no overlap
                const playRing = () => {
                    playTone(400, 'sine', 0.8, 0, 0.1);
                    playTone(450, 'sine', 0.8, 0, 0.1);
                    setTimeout(() => {
                        playTone(400, 'sine', 0.8, 0, 0.1); 
                        playTone(450, 'sine', 0.8, 0, 0.1);
                    }, 1200);
                };
                playRing();
                ringInterval = setInterval(playRing, 3500);
                break;
        }
    } catch (e) {
        console.error("Audio error", e);
    }
};
