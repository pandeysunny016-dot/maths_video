import os, json, numpy as np, soundfile as sf

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VOICES_DIR = os.path.join(BASE_DIR, "voices")
OUT_DIR = os.path.join(BASE_DIR, "out")
os.makedirs(OUT_DIR, exist_ok=True)

SR = 48000
INTRO_PAD = 4.0
OUTRO_PAD = 6.0

def create_mix():
    print("Preparing Data Storytelling audio mix...", flush=True)
    v_raw, v_sr = sf.read(os.path.join(VOICES_DIR, "all_voices.wav"))
    if v_sr != SR:
        import scipy.signal
        v_raw = scipy.signal.resample(v_raw, int(len(v_raw) * SR / v_sr))
    if v_raw.ndim > 1:
        v_raw = v_raw.mean(axis=1)

    peak = np.max(np.abs(v_raw))
    if peak > 0:
        v_raw = (v_raw / peak) * 0.92

    intro_s = int(INTRO_PAD * SR)
    outro_s = int(OUTRO_PAD * SR)
    total_len = intro_s + len(v_raw) + outro_s

    v_data = np.zeros(total_len)
    v_data[intro_s:intro_s + len(v_raw)] = v_raw

    music_src = "/Users/abhimanraj/MATHS-VIDEO/eigen-film/audio/music.wav"
    music_data = np.zeros(total_len)
    if os.path.exists(music_src):
        m_data, m_sr = sf.read(music_src)
        if m_sr != SR:
            import scipy.signal
            m_data = scipy.signal.resample(m_data, int(len(m_data) * SR / m_sr))
        if m_data.ndim > 1:
            m_data = m_data.mean(axis=1)
        n_rep = int(np.ceil(total_len / len(m_data)))
        music_data = np.tile(m_data, n_rep)[:total_len] * 0.10
        env = np.full(total_len, 1.0)
        env[:intro_s] = 1.8
        env[-outro_s:] = 1.8
        fade = int(SR * 1.5)
        music_data *= env
        music_data[:fade] *= np.linspace(0, 1, fade)
        music_data[-fade:] *= np.linspace(1, 0, fade)

    # Gentle dataviz dot-pop foley on scene changes
    foley = np.zeros(total_len)
    ev_path = os.path.join(BASE_DIR, "events.json")
    if os.path.exists(ev_path):
        for e in json.load(open(ev_path)).get("ev", []):
            pos = int(e["t"] * SR)
            if e.get("sound") == "pop" and pos + int(0.05 * SR) < total_len:
                tt = np.linspace(0, 0.05, int(0.05 * SR))
                sig = np.sin(2 * np.pi * (880 - 300 * tt * 10) * tt) * np.exp(-tt / 0.01)
                foley[pos:pos + len(sig)] += sig * 0.16

    mix_mono = v_data + music_data + foley
    final_mix = np.stack([mix_mono, mix_mono], axis=1)
    mx = np.max(np.abs(final_mix))
    if mx > 0.98:
        final_mix = final_mix / mx * 0.98

    out_path = os.path.join(OUT_DIR, "mix.wav")
    sf.write(out_path, final_mix, SR, subtype="PCM_16")
    print(f"Exported mix: {out_path} ({total_len/SR:.2f}s)", flush=True)

if __name__ == "__main__":
    create_mix()
