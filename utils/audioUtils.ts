let audioContext: AudioContext | null = null;

export const getAudioContext = () => {
  if (!audioContext) {
    // Initialize AudioContext without forcing sampleRate, let the browser/hardware decide
    // We will handle resampling via buffer properties if necessary, but typically createBuffer 
    // with 24000 sampleRate works fine on standard contexts.
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Decodes raw PCM 16-bit integers to an AudioBuffer.
 * Gemini API returns raw PCM 16-bit, 24kHz, mono audio.
 */
function decodePCM(
  buffer: ArrayBuffer,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): AudioBuffer {
  const byteLength = buffer.byteLength;
  
  // Ensure we have an even number of bytes for Int16 conversion
  // If odd (unlikely), ignore the last byte
  const length = Math.floor(byteLength / 2);
  
  // Create Int16 view
  const dataInt16 = new Int16Array(buffer, 0, length);
  
  // Create AudioBuffer
  const audioBuffer = ctx.createBuffer(numChannels, length / numChannels, sampleRate);

  // Convert Int16 to Float32
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < channelData.length; i++) {
      // De-interleave if necessary (here it's likely mono so stride is 1)
      const sample = dataInt16[i * numChannels + channel];
      // Convert to [-1.0, 1.0] range
      channelData[i] = sample / 32768.0;
    }
  }
  
  return audioBuffer;
}

export const playAudioBuffer = async (audioData: ArrayBuffer): Promise<void> => {
  const ctx = getAudioContext();
  
  // If context is suspended (browser policy), resume it
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  try {
    // Manually decode raw PCM instead of using decodeAudioData (which expects WAV/MP3 headers)
    const audioBuffer = decodePCM(audioData, ctx, 24000, 1);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    return new Promise((resolve) => {
      source.onended = () => {
        resolve();
      };
      source.start(0);
    });
  } catch (error) {
    console.error("Error playing audio buffer:", error);
    // Fallback or silence
    return Promise.resolve();
  }
};

export const stopAudio = () => {
    if(audioContext) {
        audioContext.close();
        audioContext = null;
    }
}