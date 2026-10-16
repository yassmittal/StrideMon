"""The Sneaker drop film's hit map: every kick, clap, cowbell and hat in its music, on the 16th grid.

Run from launch-video/, after `bash scripts/fetch-audio.sh`:

    uv run --no-project --with librosa==1.0.0 python scripts/build-sneaker-drop-hits.py

`uv` builds a throwaway environment for librosa, so nothing is installed in the repo. It writes
src/sneaker-drop/hits.ts (generated: never edit it by hand) and prints the per-bar pattern, the
grid check and any onset off the grid.

How it hears the music (docs/sneaker-drop-video-prompt.md §2):

- The grid is 96.004 BPM with beat 0 on frame 0 (the clip is cut so each kick's attack starts on
  its beat; scripts/fetch-audio.sh). The script measures every kick's attack against it first.
- A harmonic/percussive split (librosa HPSS) separates the tonal cowbell from the drums.
- At each 16th, each kind's rise is measured from just before the 16th to just after it:
  - kick/808: the percussive part under 110 Hz (the 808's sustained bass doesn't rise; its
    attack does)
  - clap: the percussive part at 1.5–6 kHz, when most of the new energy sits under 5 kHz rather
    than above 7 kHz (claps measure about 4.9 kHz, open hats about 6 kHz)
  - cowbell: the largest rise of a single harmonic bin at 330–1300 Hz (a new tonal note)
  - hat: the percussive part at 8–16 kHz, when it isn't a clap
- A hit is a rise over its kind's threshold within its section. Its strength is the rise over the
  kind's loudest in the whole film, 0–1.
- The intro and build are filtered and quiet: their drums barely move in linear terms, though
  you hear every one. There, a clap or hat is a log-domain onset (librosa's onset strength in its
  band) over its threshold of the section's loudest, and its strength is that onset, 0–1 of the
  section's loudest.
- A stop is where the music falls silent: the gap before the drop and the end. It isn't an
  onset, but the film cuts on it, so it's in the map: the first 16th whose second half is more
  than STOP_DROP_DECIBELS under the bar before it and under STOP_CEILING_DECIBELS (the music
  releases over a few milliseconds, so the 16th it stops on is half sound, half silence).
- Each hit's attack is then timed on a 1 ms onset curve, and the script flags any that sits more
  than one frame from its 16th. A broadband onset that matches no 16th is flagged too.
"""

import sys
from pathlib import Path

import librosa
import numpy as np

MUSIC_FILE = Path("public/audio/sneaker-drop-music.wav")
OUTPUT_FILE = Path("src/sneaker-drop/hits.ts")

SAMPLE_RATE = 48000
FRAMES_PER_SECOND = 60
BEATS_PER_MINUTE = 96.004
BEAT_SECONDS = 60 / BEATS_PER_MINUTE
SIXTEENTH_SECONDS = BEAT_SECONDS / 4

# The film's sections, in beats: each is judged on its own scale.
SECTIONS = [("intro and build", 0, 8), ("eight bars", 8, 40), ("last bar", 40, 48)]

# Thresholds, as a fraction of the kind's loudest rise in the section.
THRESHOLDS = {"kick": 0.4, "snare": 0.45, "cowbell": 0.4, "hat": 0.35}
# The intro and build's drums, on log-domain onsets (see the docstring).
QUIET_SECTION_END_BEAT = 8
QUIET_SECTION_DRUM_THRESHOLD = 0.4
STOP_DROP_DECIBELS = 10
STOP_CEILING_DECIBELS = -40
# A clap's new energy under 5 kHz over its new energy above 7 kHz.
CLAP_MINIMUM_LOW_TO_HIGH_RATIO = 2.0
# Below these fractions of the kind's loudest rise in the film, nothing counts, however quiet its
# section.
FILM_FLOORS = {"kick": 0.15, "snare": 0.1, "cowbell": 0.15, "hat": 0.1}

STFT_SIZE = 4096
HOP_SIZE = 96
PRE_WINDOW_SECONDS = (-0.045, -0.008)
POST_WINDOW_SECONDS = (0.002, 0.04)
COWBELL_POST_WINDOW_SECONDS = (0.01, 0.06)
ATTACK_SEARCH_SECONDS = 0.04
MAXIMUM_OFFSET_FRAMES = 1

# The per-bar pattern in words, checked against the printed grid (2026-10-14, clip A as cut by
# fetch-audio.sh). If the clip changes, read the new grid and rewrite this.
PATTERN_IN_WORDS = """\
The pattern, read off the grid below (16ths counted 0–15 from each bar's downbeat):

- Bar 0 (beats 0–3) is the quiet intro: no drums, only the cowbell melody on 16ths 0, 3 and 6
  (long notes) and soft filtered percussion after it.
- Bar 1 (beats 4–7) is the build: the cowbell on 0, 3 and 6 again, filtered claps on 16th 5 and
  on beat 6, and one hit in every band on beat 7 (16th 12, the loudest onset of the whole intro).
  Then the music drops to near silence (about −45 dB) for the last 200 ms before the drop.
- Bars 2–9 (beats 8–39) are the drop and eight bars at full energy, one pattern throughout:
  - kick/808 on every beat (16ths 0, 4, 8, 12)
  - clap on beats 2 and 4 (16ths 4 and 12), on top of the kick
  - cowbell on 16ths 3, 6, 11 and 14: the phonk syncopation, "a" of 1, "and" of 2, "a" of 3,
    "and" of 4
  - hats on the 8ths (0, 2, 4 … 14), the off-beats open
- The fills end each 4-bar phrase. Bar 5 (beats 20–23, the end of the first phrase) drops the
  open hat on its last 8th, a breath before the second phrase. Bar 9 (beats 36–39, the bar
  before the join) has a clap fill on 16ths 11, 12 and 14, and the hats stop for its last beat.
- Bar 10 (beats 40–43) is the track's last bar, after the join: the kick only on its downbeat
  (beat 40, the join), claps on beats 41 and 43, hats on the 8ths, no cowbell. The music stops
  on beat 44 and the tail decays to silence.
- The stops: the gap before the drop (16th 31, the last 16th of beat 7) and the end (beat 44).
"""


def main() -> None:
    samples, _ = librosa.load(MUSIC_FILE, sr=SAMPLE_RATE, mono=True)
    duration_seconds = len(samples) / SAMPLE_RATE
    spectrum = librosa.stft(samples, n_fft=STFT_SIZE, hop_length=HOP_SIZE)
    harmonic, percussive = (np.abs(part) for part in librosa.decompose.hpss(spectrum, margin=2.0))
    frequencies = librosa.fft_frequencies(sr=SAMPLE_RATE, n_fft=STFT_SIZE)
    times = librosa.frames_to_time(np.arange(spectrum.shape[1]), sr=SAMPLE_RATE, hop_length=HOP_SIZE)
    sixteenth_count = int(duration_seconds / SIXTEENTH_SECONDS)

    def window(start_seconds: float, end_seconds: float) -> np.ndarray:
        return (times >= start_seconds) & (times < end_seconds)

    def band_rise(magnitudes: np.ndarray, low_hertz: float, high_hertz: float, at_seconds: float) -> float:
        band = (frequencies >= low_hertz) & (frequencies < high_hertz)
        before = magnitudes[band][:, window(at_seconds + PRE_WINDOW_SECONDS[0], at_seconds + PRE_WINDOW_SECONDS[1])]
        after = magnitudes[band][:, window(at_seconds + POST_WINDOW_SECONDS[0], at_seconds + POST_WINDOW_SECONDS[1])]
        if before.size == 0 or after.size == 0:
            return 0.0
        return max(0.0, float(np.sqrt((after**2).mean()) - np.sqrt((before**2).mean())))

    def tonal_rise(at_seconds: float) -> float:
        band = (frequencies >= 330) & (frequencies < 1300)
        before = harmonic[band][:, window(at_seconds + PRE_WINDOW_SECONDS[0], at_seconds + PRE_WINDOW_SECONDS[1])]
        after = harmonic[band][:, window(at_seconds + COWBELL_POST_WINDOW_SECONDS[0], at_seconds + COWBELL_POST_WINDOW_SECONDS[1])]
        if before.size == 0 or after.size == 0:
            return 0.0
        return max(0.0, float(np.max(after.mean(1) - before.mean(1))))

    def clap_ratio(at_seconds: float) -> float:
        band = (frequencies >= 800) & (frequencies < 16000)
        before = percussive[band][:, window(at_seconds + PRE_WINDOW_SECONDS[0], at_seconds + PRE_WINDOW_SECONDS[1])]
        after = percussive[band][:, window(at_seconds + POST_WINDOW_SECONDS[0], at_seconds + 0.06)]
        if before.size == 0 or after.size == 0:
            return 0.0
        rise = np.maximum(0, after.mean(1) - before.mean(1))
        band_frequencies = frequencies[band]
        return float(rise[band_frequencies < 5000].sum() / (rise[band_frequencies >= 7000].sum() + 1e-9))

    rises: dict[str, np.ndarray] = {kind: np.zeros(sixteenth_count) for kind in THRESHOLDS}
    ratios = np.zeros(sixteenth_count)
    for sixteenth in range(sixteenth_count):
        at_seconds = sixteenth * SIXTEENTH_SECONDS
        rises["kick"][sixteenth] = band_rise(percussive, 30, 110, at_seconds)
        rises["snare"][sixteenth] = band_rise(percussive, 1500, 6000, at_seconds)
        rises["hat"][sixteenth] = band_rise(percussive, 8000, 16000, at_seconds)
        rises["cowbell"][sixteenth] = tonal_rise(at_seconds)
        ratios[sixteenth] = clap_ratio(at_seconds)

    # Each hit's attack, timed on fine onset curves: the band's own for drums, broadband otherwise.
    fine_hop = 48
    fine_curves = {
        "kick": librosa.onset.onset_strength(y=samples, sr=SAMPLE_RATE, hop_length=fine_hop, n_fft=1024, n_mels=64),
        "snare": librosa.onset.onset_strength(y=samples, sr=SAMPLE_RATE, hop_length=fine_hop, n_fft=1024, n_mels=64, fmin=1500, fmax=6000),
        "hat": librosa.onset.onset_strength(y=samples, sr=SAMPLE_RATE, hop_length=fine_hop, n_fft=1024, n_mels=32, fmin=8000, fmax=16000),
        "cowbell": librosa.onset.onset_strength(y=samples, sr=SAMPLE_RATE, hop_length=fine_hop, n_fft=2048, n_mels=64, fmin=330, fmax=1300),
    }
    fine_times = librosa.times_like(fine_curves["kick"], sr=SAMPLE_RATE, hop_length=fine_hop)

    # The intro and build's drums, judged on log-domain onsets in their band (see the docstring).
    quiet_sixteenth_count = QUIET_SECTION_END_BEAT * 4
    quiet_onsets = {}
    for kind, (low_hertz, high_hertz) in {"snare": (1500, 6000), "hat": (8000, 16000)}.items():
        curve = librosa.onset.onset_strength(
            y=samples, sr=SAMPLE_RATE, hop_length=fine_hop, n_fft=2048, n_mels=48, fmin=low_hertz, fmax=high_hertz
        )
        values = np.array([
            curve[(fine_times > step * SIXTEENTH_SECONDS - 0.01) & (fine_times < step * SIXTEENTH_SECONDS + 0.035)].max()
            # The clip's 20 ms fade-in reads as an onset on the very first 16th: it isn't one.
            if step > 0 else 0.0
            for step in range(quiet_sixteenth_count)
        ])
        quiet_onsets[kind] = values / values.max()

    def time_attack(kind: str, at_seconds: float) -> float:
        nearby = (fine_times > at_seconds - ATTACK_SEARCH_SECONDS) & (fine_times < at_seconds + ATTACK_SEARCH_SECONDS)
        return float(fine_times[nearby][np.argmax(fine_curves[kind][nearby])])

    hits = []
    for kind, threshold in THRESHOLDS.items():
        film_loudest = float(rises[kind].max())
        for _section_name, first_beat, end_beat in SECTIONS:
            first, end = first_beat * 4, min(end_beat * 4, sixteenth_count)
            section_loudest = float(rises[kind][first:end].max())
            for sixteenth in range(first, end):
                rise = rises[kind][sixteenth]
                if kind in quiet_onsets and sixteenth < quiet_sixteenth_count:
                    is_quiet_snare = quiet_onsets["snare"][sixteenth] >= QUIET_SECTION_DRUM_THRESHOLD
                    if kind == "snare" and not is_quiet_snare:
                        continue
                    if kind == "hat" and (is_quiet_snare or quiet_onsets["hat"][sixteenth] < QUIET_SECTION_DRUM_THRESHOLD):
                        continue
                else:
                    is_clap = ratios[sixteenth] >= CLAP_MINIMUM_LOW_TO_HIGH_RATIO
                    if kind == "snare" and not is_clap:
                        continue
                    if kind == "hat" and is_clap:
                        continue
                    if rise < FILM_FLOORS[kind] * film_loudest:
                        continue
                    if rise < threshold * section_loudest:
                        continue
                grid_seconds = sixteenth * SIXTEENTH_SECONDS
                attack_seconds = time_attack(kind, grid_seconds)
                strength = rise / film_loudest
                if kind in quiet_onsets and sixteenth < quiet_sixteenth_count:
                    strength = float(quiet_onsets[kind][sixteenth])
                hits.append(
                    {
                        "sixteenth": sixteenth,
                        "frame": round(grid_seconds * FRAMES_PER_SECOND),
                        "kind": kind,
                        "strength": round(strength, 2),
                        "attackFrame": round(attack_seconds * FRAMES_PER_SECOND),
                        "attackOffsetMilliseconds": round((attack_seconds - grid_seconds) * 1000, 1),
                    }
                )
    hits += find_stops(samples, sixteenth_count)
    kind_order = [*THRESHOLDS, "stop"]
    hits.sort(key=lambda hit: (hit["sixteenth"], kind_order.index(hit["kind"])))

    # The grid check: every kick's attack against its beat.
    kick_offsets = [hit["attackOffsetMilliseconds"] for hit in hits if hit["kind"] == "kick"]
    print(f"Kick attacks vs the grid: median {np.median(kick_offsets):+.1f} ms, "
          f"range {min(kick_offsets):+.1f} to {max(kick_offsets):+.1f} ms, over {len(kick_offsets)} kicks")
    off_grid = [hit for hit in hits if hit["kind"] != "stop" and abs(hit["attackFrame"] - hit["frame"]) > MAXIMUM_OFFSET_FRAMES]
    for hit in off_grid:
        print(f"FLAG: {hit['kind']} at 16th {hit['sixteenth']} attacks on frame {hit['attackFrame']}, grid frame {hit['frame']}")

    # Broadband onsets that match no 16th.
    broadband = librosa.onset.onset_strength(y=samples, sr=SAMPLE_RATE, hop_length=fine_hop)
    onset_frames = librosa.onset.onset_detect(onset_envelope=broadband, sr=SAMPLE_RATE, hop_length=fine_hop, units="frames")
    strong_onsets = [
        float(fine_times[frame]) for frame in onset_frames if broadband[frame] > 0.25 * broadband.max()
    ]
    unmatched = [
        onset for onset in strong_onsets
        if abs(onset - round(onset / SIXTEENTH_SECONDS) * SIXTEENTH_SECONDS) * FRAMES_PER_SECOND > MAXIMUM_OFFSET_FRAMES
    ]
    print(f"Strong broadband onsets: {len(strong_onsets)}, off the 16th grid by more than a frame: "
          + (", ".join(f"{onset:.3f} s" for onset in unmatched) or "none"))

    pattern_grid = build_pattern_grid(hits, sixteenth_count)
    print(PATTERN_IN_WORDS)
    print(pattern_grid)
    write_hits_file(hits, pattern_grid, kick_offsets, off_grid, unmatched)
    counts = {kind: sum(1 for hit in hits if hit["kind"] == kind) for kind in kind_order}
    print(f"Wrote {OUTPUT_FILE}: {len(hits)} hits {counts}")


def find_stops(samples: np.ndarray, sixteenth_count: int) -> list[dict]:
    """Each 16th where the music falls silent (see the docstring)."""
    def loudness_decibels(start_seconds: float, end_seconds: float) -> float:
        part = samples[int(start_seconds * SAMPLE_RATE) : int(end_seconds * SAMPLE_RATE)]
        return float(20 * np.log10(np.sqrt(np.mean(part**2)) + 1e-9)) if part.size else -120.0

    stops = []
    was_silent = False
    for sixteenth in range(16, sixteenth_count):
        start_seconds = sixteenth * SIXTEENTH_SECONDS
        bar_before = loudness_decibels(start_seconds - 4 * BEAT_SECONDS, start_seconds)
        second_half = loudness_decibels(start_seconds + SIXTEENTH_SECONDS / 2, start_seconds + SIXTEENTH_SECONDS)
        is_silent = second_half < min(bar_before - STOP_DROP_DECIBELS, STOP_CEILING_DECIBELS)
        if is_silent and not was_silent:
            stops.append({
                "sixteenth": sixteenth,
                "frame": round(start_seconds * FRAMES_PER_SECOND),
                "kind": "stop",
                "strength": 1.0,
                "attackFrame": round(start_seconds * FRAMES_PER_SECOND),
                "attackOffsetMilliseconds": 0.0,
            })
        was_silent = is_silent
    return stops


def build_pattern_grid(hits: list[dict], sixteenth_count: int) -> str:
    """One line per bar and kind: a digit (strength in tenths) on each 16th that has a hit."""
    marks = {(hit["sixteenth"], hit["kind"]): hit["strength"] for hit in hits}
    lines = ["bar beats   kind      0123 4567 89ab cdef"]
    for bar in range((sixteenth_count + 15) // 16):
        for kind in ("kick", "snare", "cowbell", "hat", "stop"):
            cells = []
            for step in range(16):
                strength = marks.get((bar * 16 + step, kind))
                cells.append("." if strength is None else str(min(9, int(strength * 10))))
            row = "".join(cells)
            grouped = " ".join(row[index : index + 4] for index in range(0, 16, 4))
            lines.append(f"{bar:3d} {bar * 4:2d}–{bar * 4 + 3:<2d}  {kind:<8}  {grouped}")
        lines.append("")
    return "\n".join(lines).rstrip()


def write_hits_file(hits: list[dict], pattern_grid: str, kick_offsets: list[float], off_grid: list[dict], unmatched: list[float]) -> None:
    header = [
        "// GENERATED by scripts/build-sneaker-drop-hits.py from public/audio/sneaker-drop-music.wav.",
        "// Never edit by hand: re-run the script (its docstring says how) after the music changes.",
        "//",
        "// Every audible hit in the Sneaker drop film's music, snapped to the 16th grid (96.004 BPM,",
        "// beat 0 on frame 0). Every cut and move in the film names one of these (src/sneaker-drop/",
        "// content.ts), never a typed frame. Strength is the hit's rise over the loudest of its kind, 0–1.",
        "//",
        f"// Kick attacks vs the grid: median {np.median(kick_offsets):+.1f} ms over {len(kick_offsets)} kicks."
        f" Hits more than one frame off their 16th: {len(off_grid)}."
        f" Strong onsets off the 16th grid: {len(unmatched)}.",
        "//",
    ]
    header += ["// " + line if line else "//" for line in PATTERN_IN_WORDS.rstrip().split("\n")]
    header += ["//", "// The grid (a digit is the hit's strength in tenths; columns are 16ths, a to f = 10 to 15):", "//"]
    header += ["// " + line if line else "//" for line in pattern_grid.split("\n")]
    body = [
        "",
        "export type HitKind = 'kick' | 'snare' | 'cowbell' | 'hat' | 'stop'",
        "",
        "export type Hit = {",
        "  /** 16ths from the first frame: beat × 4 + the 16th inside the beat. */",
        "  sixteenth: number",
        "  /** The film frame the hit lands on (its 16th, rounded to a frame at 60 fps). */",
        "  frame: number",
        "  kind: HitKind",
        "  /** Its rise over the loudest of its kind in the film (the intro and build: in their section), 0–1. */",
        "  strength: number",
        "}",
        "",
        "export const hits: readonly Hit[] = [",
    ]
    for hit in hits:
        body.append(
            f"  {{ sixteenth: {hit['sixteenth']}, frame: {hit['frame']}, kind: '{hit['kind']}', strength: {hit['strength']} }},"
        )
    body.append("]")
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text("\n".join(header + body) + "\n")


if __name__ == "__main__":
    if not MUSIC_FILE.exists():
        sys.exit(f"Missing {MUSIC_FILE}: run bash scripts/fetch-audio.sh first")
    main()
