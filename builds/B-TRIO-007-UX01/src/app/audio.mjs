// 津彩入画 · 视听与声学系统 (B-TRIO-006 Upgrade v2.0)
// 指导导师：Gemini 4 Advanced（技术与艺术策划师傅）
// 特性：
// 1. 全量按键交互音效反馈（DOM 全局事件捕获委托，木·纸·玉三级触觉声学，零遗漏覆盖）
// 2. 《运河柳色·丹青慢》F宫五声 16小节四轨程序化 BGM（古筝主奏 + 流水琶音 + 洞箫气韵 + 编钟低音）
// 3. 算法立体声木质工坊卷积混响（Algorithmic Reverb）与微避让总线（Micro-Ducking Bus）
// 4. 金笺（1400Hz温润）与素笺（2400Hz清透）声学纸色低通双模滤镜
// 5. 7 套年画民间传统物理工艺仿真音效
// 6. 零外部网络依赖（externalRequests: 0），零外部音频文件，纯代码数学合成
// 7. 实时遥测探针 window.__JINCAI_AUDIO_STATE__ 与全局 API window.JincaiAudio

const STORAGE_KEY = 'jincai:audio';
const STORAGE_VOLUME_KEY = 'jincai:audio:volume';

// F宫五声雅乐音高频率表 (F2 ~ A5)
const NOTE_FREQ = {
  'C2': 65.41,  'D2': 73.42,  'F2': 87.31,  'G2': 98.00,  'A2': 110.00,
  'C3': 130.81, 'D3': 146.83, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00
};

// 16小节主旋律乐谱（128个八分音符步进，null 代表休止或延音）
// 结构：起(1-4) · 承(5-8) · 转(9-12) · 合(13-16)
const MELODY_SCORE_128 = [
  // 【起：晨雾起运河】(Bar 1 - 4)
  'F4', null, 'G4', 'A4',   'C5', null, 'A4', null,   // Bar 1
  'D5', null, 'C5', 'A4',   'G4', null, null, null,   // Bar 2
  'A4', null, 'G4', 'F4',   'G4', 'A4', 'C5', null,   // Bar 3
  'D4', null, 'F4', 'G4',   'F4', null, null, null,   // Bar 4

  // 【承：梨木雕花影】(Bar 5 - 8)
  'C5', null, 'D5', 'F5',   'D5', null, 'C5', 'A4',   // Bar 5
  'C5', null, 'A4', 'G4',   'A4', null, null, null,   // Bar 6
  'D5', null, 'C5', 'D5',   'F5', null, 'D5', 'C5',   // Bar 7
  'A4', 'C5', 'G4', 'A4',   'G4', null, null, null,   // Bar 8

  // 【转：丹青染宣纸】(Bar 9 - 12)
  'F5', null, 'D5', 'C5',   'D5', 'C5', 'A4', 'G4',   // Bar 9
  'A4', null, 'C5', 'D5',   'C5', null, null, null,   // Bar 10
  'D5', null, 'F5', 'G5',   'F5', 'D5', 'C5', 'A4',   // Bar 11
  'C5', null, 'A4', 'G4',   'F4', null, 'G4', null,   // Bar 12

  // 【合：年画入万家】(Bar 13 - 16)
  'A4', null, 'C5', 'A4',   'G4', null, 'F4', 'D4',   // Bar 13
  'F4', 'G4', 'A4', null,   'G4', null, null, null,   // Bar 14
  'C5', null, 'A4', 'G4',   'F4', null, 'D4', 'C4',   // Bar 15
  'F4', null, 'C5', null,   'F4', null, null, null    // Bar 16
];

// 16小节和声进行与五声流水琶音音型（每小节8个八分音符）
const HARMONY_BARS = [
  // 起
  { bass: 'F2', pad: 'F3', bell: 'C5', arp: ['F3', 'C4', 'F4', 'G4', 'A4', 'G4', 'F4', 'C4'] },
  { bass: 'D2', pad: 'D3', bell: null, arp: ['D3', 'A3', 'D4', 'F4', 'G4', 'F4', 'D4', 'A3'] },
  { bass: 'G2', pad: 'G3', bell: 'D5', arp: ['G3', 'D4', 'G4', 'A4', 'C5', 'A4', 'G4', 'D4'] },
  { bass: 'F2', pad: 'C3', bell: null, arp: ['C3', 'G3', 'C4', 'D4', 'F4', 'D4', 'C4', 'G3'] },
  // 承
  { bass: 'F2', pad: 'A3', bell: 'F5', arp: ['F3', 'C4', 'G4', 'A4', 'C5', 'A4', 'G4', 'C4'] },
  { bass: 'D2', pad: 'F3', bell: null, arp: ['D3', 'A3', 'F4', 'G4', 'A4', 'G4', 'F4', 'A3'] },
  { bass: 'G2', pad: 'D3', bell: 'A4', arp: ['G3', 'D4', 'A4', 'C5', 'D5', 'C5', 'A4', 'D4'] },
  { bass: 'C2', pad: 'G3', bell: null, arp: ['C3', 'G3', 'D4', 'E4', 'G4', 'E4', 'D4', 'G3'] },
  // 转
  { bass: 'D2', pad: 'A3', bell: 'D5', arp: ['D3', 'A3', 'D4', 'F4', 'A4', 'F4', 'D4', 'A3'] },
  { bass: 'F2', pad: 'C4', bell: null, arp: ['F3', 'C4', 'F4', 'G4', 'A4', 'G4', 'F4', 'C4'] },
  { bass: 'G2', pad: 'D4', bell: 'G5', arp: ['G3', 'D4', 'G4', 'A4', 'C5', 'A4', 'G4', 'D4'] },
  { bass: 'C2', pad: 'G3', bell: null, arp: ['C3', 'G3', 'C4', 'D4', 'G4', 'D4', 'C4', 'G3'] },
  // 合
  { bass: 'F2', pad: 'F3', bell: 'C5', arp: ['F3', 'C4', 'F4', 'G4', 'A4', 'G4', 'F4', 'C4'] },
  { bass: 'G2', pad: 'D3', bell: null, arp: ['G3', 'D4', 'G4', 'A4', 'Bb4', 'A4', 'G4', 'D4'] },
  { bass: 'D2', pad: 'A3', bell: 'A4', arp: ['D3', 'A3', 'D4', 'F4', 'G4', 'F4', 'D4', 'A3'] },
  { bass: 'F2', pad: 'F3', bell: 'F5', arp: ['F3', 'C4', 'F4', 'A4', 'C5', 'A4', 'F4', 'C4'] }
];

// 全局可交互元素复合选择器
const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  'input:not([type="hidden"])',
  'select',
  'summary',
  'label',
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="switch"]',
  '[role="option"]',
  '[role="radio"]',
  '[role="checkbox"]',
  '[data-sfx]',
  '[data-action]',
  '[data-step]',
  '[data-modal]',
  '[onclick]',
  '.btn',
  '.tab',
  '.gallery-choice',
  '.step-item',
  '.swatch',
  '.tool-item',
  '.modal-close',
  '.read-hotspot'
].join(', ');

class AudioManager {
  constructor() {
    this._ctx = null;
    this._masterGain = null;
    this._bgmBus = null;
    this._sfxBus = null;
    this._reverbBus = null;
    this._reverbWet = null;
    this._limiter = null;
    this._paperFilter = null;
    this._pinkNoiseBuffer = null;

    this._bgmTimer = null;
    this._nextNoteTime = 0;
    this._bgmTempo = 64; // 64 BPM
    this._bgmCurrentStep = 0;
    this._bgmLoopCount = 0;
    this._bgmPlaying = false;

    // 默认开启，若 localStorage 显式存为 'false' 则静音
    let stored = true;
    try {
      const v = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (v === 'false') stored = false;
    } catch {
      // 容错
    }
    this._enabled = stored;

    // 默认音量 50 左右（50%），若 localStorage 有设置则读取
    let storedVol = 50;
    try {
      const sv = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_VOLUME_KEY) : null;
      if (sv !== null && !isNaN(Number(sv))) {
        storedVol = Math.max(0, Math.min(100, Math.round(Number(sv))));
      }
    } catch {
      // 容错
    }
    this._volume = storedVol;
    this._listeners = new Set();
    this._activeToneMode = 'antique'; // 'antique' | 'plain'

    // 全局遥测诊断探针（师傅要求：五维量化打分）
    this.stateProbe = {
      version: '2.0.0-workshop-deluxe',
      initialized: false,
      ctxState: 'uninitialized',
      muted: !this._enabled,
      isMuted: !this._enabled,
      volume: this._volume,
      bgmPlaying: false,
      bgmTempo: 64,
      bgmCurrentStep: 0,
      bgmTotalBars: 16,
      bgmLoopCount: 0,
      paperToneMode: 'antique',
      masterVolume: Number((0.85 * (this._volume / 100)).toFixed(3)),
      bgmVolume: Number((0.42 * (this._volume / 100)).toFixed(3)),
      sfxVolume: Number((0.78 * (this._volume / 100)).toFixed(3)),
      activeVoices: 0,
      sfxCounts: {
        total: 0,
        wood: 0,
        paper: 0,
        jade: 0,
        hover: 0,
        carve: 0,
        brush_print: 0,
        confirm_plate: 0,
        align_tick: 0,
        paint_bloom: 0,
        quiz_ok: 0,
        quiz_retry: 0,
        seal_stamp: 0
      },
      lastSfx: null,
      lastSfxType: null,
      lastTriggeredElement: null,
      lastTriggerTimestamp: 0,
      tracksActive: {
        guzhengLead: true,
        pentatonicArp: true,
        dongxiaoPad: true,
        bianzhongBass: true
      },
      externalRequests: 0
    };

    if (typeof window !== 'undefined') {
      window.__JINCAI_AUDIO_STATE__ = this.stateProbe;
      window.JincaiAudio = {
        playUiSfx: (type) => this.playUiSfx(type),
        startWorkshopBgm: () => this.startBgm(),
        stopWorkshopBgm: () => this.stopBgm(),
        toggleMute: (force) => this.toggle(force),
        getVolume: () => this.getVolume(),
        setVolume: (val) => this.setVolume(val),
        classifyElementSfx: (el) => this.classifyElementSfx(el),
        getState: () => this.stateProbe
      };
      this._bindGlobalDomDelegation();
    }
  }

  ensureContext() {
    if (this._ctx) {
      if (this._ctx.state === 'suspended') {
        this._ctx.resume().catch(() => {});
      }
      this.stateProbe.ctxState = this._ctx.state;
      return this._ctx;
    }
    const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
    if (!AudioCtx) return null;

    try {
      this._ctx = new AudioCtx();
      this.stateProbe.initialized = true;
      this.stateProbe.ctxState = this._ctx.state;

      // 1. 动态限幅器（防爆音削波）
      this._limiter = this._ctx.createDynamicsCompressor();
      this._limiter.threshold.setValueAtTime(-6, this._ctx.currentTime);
      this._limiter.knee.setValueAtTime(12, this._ctx.currentTime);
      this._limiter.ratio.setValueAtTime(8, this._ctx.currentTime);
      this._limiter.attack.setValueAtTime(0.003, this._ctx.currentTime);
      this._limiter.release.setValueAtTime(0.15, this._ctx.currentTime);
      this._limiter.connect(this._ctx.destination);

      // 2. 纸色联动低通滤波器（金笺 1400Hz / 素笺 2400Hz）
      this._paperFilter = this._ctx.createBiquadFilter();
      this._paperFilter.type = 'lowpass';
      this._paperFilter.frequency.setValueAtTime(
        this._activeToneMode === 'antique' ? 1400 : 2400,
        this._ctx.currentTime
      );
      this._paperFilter.Q.setValueAtTime(0.85, this._ctx.currentTime);
      this._paperFilter.connect(this._limiter);

      // 3. 主音量总线（初始声音设定在 50% 左右）
      this._masterGain = this._ctx.createGain();
      const initialGain = this._enabled ? Number((0.85 * (this._volume / 100)).toFixed(4)) : 0;
      this._masterGain.gain.setValueAtTime(initialGain, this._ctx.currentTime);
      this._masterGain.connect(this._paperFilter);

      // 4. BGM 与 SFX 分总线
      this._bgmBus = this._ctx.createGain();
      this._bgmBus.gain.setValueAtTime(0.42, this._ctx.currentTime);
      this._bgmBus.connect(this._masterGain);

      this._sfxBus = this._ctx.createGain();
      this._sfxBus.gain.setValueAtTime(0.78, this._ctx.currentTime);
      this._sfxBus.connect(this._masterGain);

      // 5. 算法立体声工坊卷积混响（2.4秒早期木壁反射与指数衰减）
      this._reverbBus = this._createWorkshopReverb(2.4, 2.8);
      this._reverbWet = this._ctx.createGain();
      this._reverbWet.gain.setValueAtTime(0.32, this._ctx.currentTime);
      this._reverbBus.connect(this._reverbWet);
      this._reverbWet.connect(this._masterGain);

      // 6. 预生成粉红噪声 Buffer
      this._pinkNoiseBuffer = this._createPinkNoiseBuffer(2.0);

      // 首次解锁自动温柔起播 BGM
      if (this._enabled && !this._bgmPlaying) {
        this.startBgm();
      }
    } catch {
      // 容错降级
    }
    return this._ctx;
  }

  _createPinkNoiseBuffer(durationSec) {
    if (!this._ctx) return null;
    const size = Math.floor(this._ctx.sampleRate * durationSec);
    const buffer = this._ctx.createBuffer(1, size, this._ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < size; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  _createWorkshopReverb(duration, decay) {
    if (!this._ctx) return null;
    const convolver = this._ctx.createConvolver();
    const rate = this._ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = this._ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
      const n = i / length;
      const env = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * env * 0.5;
      right[i] = (Math.random() * 2 - 1) * env * 0.5;
    }
    convolver.buffer = impulse;
    return convolver;
  }

  // 师傅秘方：微避让总线（Micro-Ducking）
  triggerMicroDucking(ratio = 0.75, holdSec = 0.12) {
    if (!this._ctx || !this._bgmBus) return;
    try {
      const now = this._ctx.currentTime;
      const target = 0.42 * ratio;
      this._bgmBus.gain.cancelScheduledValues(now);
      this._bgmBus.gain.setValueAtTime(this._bgmBus.gain.value, now);
      this._bgmBus.gain.linearRampToValueAtTime(target, now + 0.015);
      this._bgmBus.gain.exponentialRampToValueAtTime(0.42, now + holdSec + 0.25);
    } catch {
      // 容错
    }
  }

  // ==================== 1. 全量按键交互音效（木·纸·玉） ====================

  playUiSfx(type = 'wood') {
    this.ensureContext();
    if (!this._enabled || !this._ctx) return;
    try {
      const now = this._ctx.currentTime;
      const pitchJitter = 1 + (Math.random() * 0.07 - 0.035); // ±3.5%
      const gainJitter = 1 + (Math.random() * 0.16 - 0.08);   // ±8%

      this.stateProbe.activeVoices++;
      setTimeout(() => { this.stateProbe.activeVoices = Math.max(0, this.stateProbe.activeVoices - 1); }, 200);

      if (type === 'wood') {
        // 【温润木扣】：老梨木雕版轻叩案几，短促温厚、无金属毛刺
        this.triggerMicroDucking(0.80, 0.08);

        // 1) 木腔共鸣体（快速俯冲正弦/三角波）
        const osc = this._ctx.createOscillator();
        const oscGain = this._ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(315 * pitchJitter, now);
        osc.frequency.exponentialRampToValueAtTime(112 * pitchJitter, now + 0.024);

        oscGain.gain.setValueAtTime(0.001, now);
        oscGain.gain.linearRampToValueAtTime(0.42 * gainJitter, now + 0.002);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(oscGain);
        oscGain.connect(this._sfxBus);
        osc.start(now);
        osc.stop(now + 0.05);

        // 2) 木纹触击瞬态（带通滤波脉冲）
        if (this._pinkNoiseBuffer) {
          const noise = this._ctx.createBufferSource();
          noise.buffer = this._pinkNoiseBuffer;
          const filter = this._ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(940 * pitchJitter, now);
          filter.Q.setValueAtTime(4.2, now);

          const nGain = this._ctx.createGain();
          nGain.gain.setValueAtTime(0.55 * gainJitter, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

          noise.connect(filter);
          filter.connect(nGain);
          nGain.connect(this._sfxBus);
          noise.start(now, Math.random() * 1.5, 0.03);
        }

        this.stateProbe.sfxCounts.wood++;
      } else if (type === 'paper') {
        // 【宣纸轻按】：选项卡、单选卡片、色卡切换的宣纸摩挲微响
        if (this._pinkNoiseBuffer) {
          const noise = this._ctx.createBufferSource();
          noise.buffer = this._pinkNoiseBuffer;

          const filter = this._ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1850 * pitchJitter, now);
          filter.frequency.exponentialRampToValueAtTime(1120 * pitchJitter, now + 0.042);
          filter.Q.setValueAtTime(2.1, now);

          const nGain = this._ctx.createGain();
          nGain.gain.setValueAtTime(0.001, now);
          nGain.gain.linearRampToValueAtTime(0.38 * gainJitter, now + 0.005);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);

          noise.connect(filter);
          filter.connect(nGain);
          nGain.connect(this._sfxBus);
          noise.start(now, Math.random() * 1.5, 0.05);
        }

        // 叠加极轻微的宣纸纸腔共鸣
        const bodyOsc = this._ctx.createOscillator();
        const bodyGain = this._ctx.createGain();
        bodyOsc.type = 'sine';
        bodyOsc.frequency.setValueAtTime(235 * pitchJitter, now);
        bodyOsc.frequency.exponentialRampToValueAtTime(150 * pitchJitter, now + 0.035);

        bodyGain.gain.setValueAtTime(0.001, now);
        bodyGain.gain.linearRampToValueAtTime(0.12 * gainJitter, now + 0.004);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

        bodyOsc.connect(bodyGain);
        bodyGain.connect(this._sfxBus);
        bodyOsc.start(now);
        bodyOsc.stop(now + 0.04);

        this.stateProbe.sfxCounts.paper++;
      } else if (type === 'jade' || type === 'jade-close') {
        // 【青玉轻触】：弹窗开关、音频开关、关闭按钮的温润玉片轻碰声
        this.triggerMicroDucking(0.85, 0.08);

        const isClose = type === 'jade-close';
        const baseF1 = (isClose ? 1318 : 1760) * pitchJitter;
        const baseF2 = (isClose ? 1975 : 2637) * pitchJitter; // 玉石清越泛音比

        [baseF1, baseF2].forEach((freq, idx) => {
          const osc = this._ctx.createOscillator();
          const gain = this._ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          const peak = (idx === 0 ? 0.24 : 0.12) * gainJitter;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(peak, now + 0.0015);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.14);

          osc.connect(gain);
          gain.connect(this._sfxBus);
          if (this._reverbBus) gain.connect(this._reverbBus);
          osc.start(now);
          osc.stop(now + 0.15);
        });

        this.stateProbe.sfxCounts.jade++;
      } else if (type === 'hover') {
        // 【丝竹微掠】：极轻量悬停微反馈
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1320 * pitchJitter, now);
        osc.frequency.exponentialRampToValueAtTime(880 * pitchJitter, now + 0.012);

        gain.gain.setValueAtTime(0.035 * gainJitter, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.014);

        osc.connect(gain);
        gain.connect(this._sfxBus);
        osc.start(now);
        osc.stop(now + 0.016);

        this.stateProbe.sfxCounts.hover++;
      }

      this.stateProbe.sfxCounts.total++;
      this.stateProbe.lastSfx = type;
      this.stateProbe.lastSfxType = type;
      this.stateProbe.lastTriggerTimestamp = Date.now();
    } catch {
      // 容错降级
    }
  }

  // ==================== 2. 全局无死角 DOM 事件嗅探与委托 ====================

  classifyElementSfx(el) {
    if (!el) return 'wood';
    const explicit = typeof el.getAttribute === 'function' ? el.getAttribute('data-sfx') : null;
    if (explicit) return explicit;

    const tag = (el.tagName || '').toLowerCase();
    const role = (typeof el.getAttribute === 'function' ? (el.getAttribute('role') || '') : '').toLowerCase();
    const cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
    const text = (el.textContent || '').trim();
    const hasModal = Boolean(
      (typeof el.hasAttribute === 'function' && el.hasAttribute('data-modal')) ||
      (typeof el.getAttribute === 'function' && el.getAttribute('data-modal'))
    );

    // 1. 弹窗开关、关闭按钮、音频切换、模态框控件 -> 青玉声 (jade)
    if (
      hasModal ||
      role === 'switch' ||
      /close|modal|dialog|audio|mute|music|sound|badge|seal|印章|关闭|弹窗|音/.test(cls + ' ' + text)
    ) {
      if (/close|cancel|关闭|取消|收起/.test(cls + ' ' + text)) {
        return 'jade-close';
      }
      return 'jade';
    }

    // 2. 选项卡、单选卡片、色卡、步骤节点、表单项 -> 宣纸声 (paper)
    if (
      tag === 'input' ||
      tag === 'label' ||
      tag === 'select' ||
      role === 'tab' ||
      role === 'radio' ||
      role === 'option' ||
      /tab|card|gallery-choice|step|swatch|color|filter|option|nav-item|画稿|色卡|工序|选/.test(cls)
    ) {
      return 'paper';
    }

    // 3. 其余所有按钮与交互控件 -> 温润木扣声 (wood)
    return 'wood';
  }

  findInteractiveTarget(target) {
    if (!target || !(target instanceof Element)) return null;
    const matched = target.closest(INTERACTIVE_SELECTOR);
    if (matched) return matched;

    // 兜底：向上检查 3 层父节点，若 computedStyle.cursor === 'pointer' 也视为交互按键
    let curr = target;
    for (let depth = 0; depth < 3 && curr && curr !== document.body; depth++) {
      try {
        const style = window.getComputedStyle(curr);
        if (style && style.cursor === 'pointer') {
          return curr;
        }
      } catch {
        break;
      }
      curr = curr.parentElement;
    }
    return null;
  }

  _bindGlobalDomDelegation() {
    let lastClickTime = 0;
    let lastHoverTime = 0;
    let lastHoveredEl = null;

    // 全局捕获阶段监听 pointerdown（零延迟，<10ms）
    document.addEventListener('pointerdown', (e) => {
      const now = performance.now();
      // 35ms 防抖节流，防 label 嵌套 input 双重触发
      if (now - lastClickTime < 35) return;

      const interactiveEl = this.findInteractiveTarget(e.target);
      if (!interactiveEl || interactiveEl.disabled || interactiveEl.getAttribute('aria-disabled') === 'true') {
        return;
      }

      lastClickTime = now;
      const sfxType = this.classifyElementSfx(interactiveEl);
      this.stateProbe.lastTriggeredElement = interactiveEl.tagName +
        (interactiveEl.id ? '#' + interactiveEl.id : '') +
        (interactiveEl.className ? '.' + String(interactiveEl.className).split(' ')[0] : '');

      this.playUiSfx(sfxType);

      // 首次交互自动解锁 AudioContext
      if (!this._ctx || this._ctx.state === 'suspended') {
        this.ensureContext();
      }
    }, { capture: true, passive: true });

    // 键盘回车与空格无障碍触发
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const interactiveEl = this.findInteractiveTarget(e.target);
        if (interactiveEl && !interactiveEl.disabled) {
          const sfxType = this.classifyElementSfx(interactiveEl);
          this.playUiSfx(sfxType);
        }
      }
    }, { capture: true, passive: true });

    // 轻量悬停丝竹微掠（120ms 节流）
    document.addEventListener('pointerover', (e) => {
      const now = performance.now();
      if (now - lastHoverTime < 120) return;
      const interactiveEl = this.findInteractiveTarget(e.target);
      if (interactiveEl && interactiveEl !== lastHoveredEl) {
        lastHoveredEl = interactiveEl;
        lastHoverTime = now;
        if (this._ctx && this._ctx.state === 'running' && this._enabled) {
          this.playUiSfx('hover');
        }
      }
    }, { capture: true, passive: true });

    // 页面切后台自动挂起音频，切回前台自动恢复
    document.addEventListener('visibilitychange', () => {
      if (!this._ctx) return;
      if (document.hidden) {
        this._ctx.suspend().catch(() => {});
        this.stateProbe.ctxState = 'suspended';
      } else if (this._enabled) {
        this._ctx.resume().catch(() => {});
        this.stateProbe.ctxState = 'running';
      }
    });
  }

  // ==================== 3. 《运河柳色·丹青慢》16小节四轨程序化 BGM ====================

  startBgm() {
    this.ensureContext();
    if (this._bgmPlaying || !this._ctx) return;
    this._bgmPlaying = true;
    this.stateProbe.bgmPlaying = true;
    this._nextNoteTime = this._ctx.currentTime + 0.08;
    this._schedulerLoop();
  }

  stopBgm() {
    this._bgmPlaying = false;
    this.stateProbe.bgmPlaying = false;
    if (this._bgmTimer) {
      clearTimeout(this._bgmTimer);
      this._bgmTimer = null;
    }
  }

  _schedulerLoop() {
    if (!this._bgmPlaying || !this._ctx) return;
    const eighthDur = (60 / this._bgmTempo) / 2; // ~0.46875s
    while (this._nextNoteTime < this._ctx.currentTime + 0.18) {
      this._scheduleBgmStep(this._bgmCurrentStep, this._nextNoteTime);
      this._nextNoteTime += eighthDur;
      this._bgmCurrentStep++;
      if (this._bgmCurrentStep >= 128) {
        this._bgmCurrentStep = 0;
        this._bgmLoopCount++;
      }
      this.stateProbe.bgmCurrentStep = this._bgmCurrentStep;
      this.stateProbe.bgmLoopCount = this._bgmLoopCount;
    }
    this._bgmTimer = setTimeout(() => this._schedulerLoop(), 45);
  }

  _scheduleBgmStep(stepIndex, stepTime) {
    const eighthDur = (60 / this._bgmTempo) / 2;
    const barIndex = Math.floor(stepIndex / 8);
    const beatInBar = stepIndex % 8;
    const barData = HARMONY_BARS[barIndex] || HARMONY_BARS[0];

    // Track 1: 古筝主旋律
    if (this.stateProbe.tracksActive.guzhengLead) {
      const leadNote = MELODY_SCORE_128[stepIndex];
      if (leadNote && NOTE_FREQ[leadNote]) {
        let holdSteps = 1;
        for (let k = stepIndex + 1; k < Math.min(stepIndex + 6, 128); k++) {
          if (MELODY_SCORE_128[k] === null) holdSteps++;
          else break;
        }
        this._synthGuzhengPluck(NOTE_FREQ[leadNote], stepTime, eighthDur * holdSteps * 1.15, 0.21, true);
      }
    }

    // Track 2: 五声流水琶音织体
    if (this.stateProbe.tracksActive.pentatonicArp) {
      const arpNote = barData.arp[beatInBar];
      if (arpNote && NOTE_FREQ[arpNote]) {
        const vel = (beatInBar === 0 || beatInBar === 4) ? 0.095 : 0.062;
        this._synthGuzhengPluck(NOTE_FREQ[arpNote], stepTime, eighthDur * 1.6, vel, false);
      }
    }

    // Track 3 & 4: 每小节首拍触发洞箫长音与青铜编钟/低音
    if (beatInBar === 0) {
      const barDur = eighthDur * 8;
      if (this.stateProbe.tracksActive.dongxiaoPad && barData.pad && NOTE_FREQ[barData.pad]) {
        this._synthDongxiaoPad(NOTE_FREQ[barData.pad], stepTime, barDur * 0.96, 0.075);
      }
      if (this.stateProbe.tracksActive.bianzhongBass) {
        this._synthBianzhongAndBass(
          NOTE_FREQ[barData.bass],
          barData.bell ? NOTE_FREQ[barData.bell] : null,
          stepTime,
          barDur
        );
      }
    }
  }

  _synthGuzhengPluck(freq, startTime, duration, velocity = 0.22, isLead = true) {
    if (!this._ctx || !freq) return;
    try {
      const oscMain = this._ctx.createOscillator();
      const oscHarm = this._ctx.createOscillator();
      const filter = this._ctx.createBiquadFilter();
      const env = this._ctx.createGain();

      oscMain.type = 'triangle';
      oscHarm.type = isLead ? 'sawtooth' : 'sine';
      oscMain.frequency.setValueAtTime(freq, startTime);
      oscHarm.frequency.setValueAtTime(freq * 2, startTime);

      // 主奏古筝左手微吟猱按弦颤音
      if (isLead && duration > 0.6) {
        oscMain.frequency.setValueAtTime(freq, startTime + 0.18);
        oscMain.frequency.linearRampToValueAtTime(freq * 1.011, startTime + 0.38);
        oscMain.frequency.linearRampToValueAtTime(freq * 0.996, startTime + 0.62);
        oscMain.frequency.linearRampToValueAtTime(freq, startTime + 0.85);
      }

      const harmGain = this._ctx.createGain();
      harmGain.gain.setValueAtTime(isLead ? 0.14 : 0.05, startTime);
      harmGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isLead ? 3600 : 2100, startTime);
      filter.frequency.exponentialRampToValueAtTime(isLead ? 880 : 620, startTime + duration * 0.75);
      filter.Q.setValueAtTime(1.8, startTime);

      env.gain.setValueAtTime(0.0008, startTime);
      env.gain.linearRampToValueAtTime(velocity, startTime + 0.008);
      env.gain.exponentialRampToValueAtTime(velocity * 0.35, startTime + 0.22);
      env.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

      oscMain.connect(filter);
      oscHarm.connect(harmGain);
      harmGain.connect(filter);
      filter.connect(env);

      env.connect(this._bgmBus);
      if (this._reverbBus) env.connect(this._reverbBus);

      oscMain.start(startTime);
      oscHarm.start(startTime);
      oscMain.stop(startTime + duration + 0.05);
      oscHarm.stop(startTime + duration + 0.05);
    } catch {
      // 容错
    }
  }

  _synthDongxiaoPad(freq, startTime, duration, velocity = 0.085) {
    if (!this._ctx || !freq) return;
    try {
      const osc = this._ctx.createOscillator();
      const subOsc = this._ctx.createOscillator();
      const lfo = this._ctx.createOscillator();
      const lfoGain = this._ctx.createGain();
      const filter = this._ctx.createBiquadFilter();
      const env = this._ctx.createGain();

      osc.type = 'sine';
      subOsc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * 2, startTime);
      subOsc.frequency.setValueAtTime(freq, startTime);

      // 4.6Hz 洞箫腹震音 LFO
      lfo.frequency.setValueAtTime(4.6, startTime);
      lfoGain.gain.setValueAtTime(0.01, startTime);
      lfoGain.gain.linearRampToValueAtTime(3.2, startTime + 0.8);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1250, startTime);

      env.gain.setValueAtTime(0.001, startTime);
      env.gain.linearRampToValueAtTime(velocity, startTime + 0.95);
      env.gain.setValueAtTime(velocity * 0.85, startTime + duration - 0.8);
      env.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(env);
      env.connect(this._bgmBus);
      if (this._reverbBus) env.connect(this._reverbBus);

      osc.start(startTime);
      subOsc.start(startTime);
      lfo.start(startTime);
      osc.stop(startTime + duration + 0.05);
      subOsc.stop(startTime + duration + 0.05);
      lfo.stop(startTime + duration + 0.05);
    } catch {
      // 容错
    }
  }

  _synthBianzhongAndBass(bassFreq, bellFreq, startTime, barDuration) {
    if (!this._ctx) return;
    try {
      // 1) 低音大弦温厚根音
      if (bassFreq) {
        const bassOsc = this._ctx.createOscillator();
        const bassFilter = this._ctx.createBiquadFilter();
        const bassEnv = this._ctx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, startTime);
        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(260, startTime);

        bassEnv.gain.setValueAtTime(0.001, startTime);
        bassEnv.gain.linearRampToValueAtTime(0.14, startTime + 0.06);
        bassEnv.gain.exponentialRampToValueAtTime(0.001, startTime + barDuration * 0.95);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassEnv);
        bassEnv.connect(this._bgmBus);
        bassOsc.start(startTime);
        bassOsc.stop(startTime + barDuration);
      }

      // 2) 青铜编钟点缀泛音（非整数倍泛音列 1 : 2.0 : 2.76）
      if (bellFreq) {
        [1, 2.0, 2.76].forEach((ratio, idx) => {
          const osc = this._ctx.createOscillator();
          const env = this._ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(bellFreq * ratio, startTime);

          const amp = [0.055, 0.025, 0.012][idx];
          const decay = [2.8, 1.9, 1.1][idx];
          env.gain.setValueAtTime(0.0005, startTime);
          env.gain.linearRampToValueAtTime(amp, startTime + 0.004);
          env.gain.exponentialRampToValueAtTime(0.0005, startTime + decay);

          osc.connect(env);
          env.connect(this._bgmBus);
          if (this._reverbBus) env.connect(this._reverbBus);
          osc.start(startTime);
          osc.stop(startTime + decay + 0.05);
        });
      }
    } catch {
      // 容错
    }
  }

  // ==================== 4. 年画 7 套传统物理工艺仿真音效 ====================

  playCarve() {
    this.ensureContext();
    if (!this._enabled || !this._ctx) return;
    try {
      this._trackSfx('carve');
      this.triggerMicroDucking(0.70, 0.20);
      const now = this._ctx.currentTime;

      // 刀口划过木纤维的干脆刮擦（滤波粉红噪声）
      if (this._pinkNoiseBuffer) {
        const noise = this._ctx.createBufferSource();
        noise.buffer = this._pinkNoiseBuffer;
        const filter = this._ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + 0.12);
        filter.Q.setValueAtTime(3.5, now);

        const gain = this._ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.48, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this._sfxBus);
        noise.start(now, 0.1, 0.15);
      }

      // 木块微脆切削音
      const osc = this._ctx.createOscillator();
      const oGain = this._ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.05);

      oGain.gain.setValueAtTime(0.22, now);
      oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(oGain);
      oGain.connect(this._sfxBus);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  playBrushAndPrint() {
    this.ensureContext();
    if (!this._enabled || !this._ctx) return;
    try {
      this._trackSfx('brush_print');
      this.triggerMicroDucking(0.65, 0.35);
      const now = this._ctx.currentTime;

      // 棕帚刷过木刻版与宣纸摩挲
      if (this._pinkNoiseBuffer) {
        const noise = this._ctx.createBufferSource();
        noise.buffer = this._pinkNoiseBuffer;
        const filter = this._ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(1600, now + 0.15);
        filter.frequency.linearRampToValueAtTime(900, now + 0.32);
        filter.Q.setValueAtTime(1.5, now);

        const gain = this._ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.45, now + 0.06);
        gain.gain.linearRampToValueAtTime(0.38, now + 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this._sfxBus);
        noise.start(now, 0.2, 0.38);
      }
    } catch {}
  }

  playConfirmPlate() {
    this.ensureContext();
    if (!this._enabled || !this._ctx) return;
    try {
      this._trackSfx('confirm_plate');
      this.triggerMicroDucking(0.65, 0.35);
      const now = this._ctx.currentTime;

      // 木耙抚纸成印浑厚质感
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(165, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.55, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this._sfxBus);
      if (this._reverbBus) gain.connect(this._reverbBus);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  playAlignmentTick() {
    this.ensureContext();
    if (!this._enabled || !this._ctx) return;
    try {
      this._trackSfx('align_tick');
      this.triggerMicroDucking(0.85, 0.08);
      const now = this._ctx.currentTime;

      // 木刻定位销微卡扣清脆微声
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.025);

      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this._sfxBus);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  playPaintBloom() {
    this.ensureContext();
    if (!this._enabled || !this._ctx) return;
    try {
      this._trackSfx('paint_bloom');
      this.triggerMicroDucking(0.75, 0.15);
      const now = this._ctx.currentTime;

      // 软羊毫饱蘸水彩轻点纸面水滴涟漪
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this._sfxBus);
      if (this._reverbBus) gain.connect(this._reverbBus);
      osc.start(now);
      osc.stop(now + 0.20);
    } catch {}
  }

  playQuizSuccess() {
    this.ensureContext();
    if (!this._enabled || !this._ctx) return;
    try {
      this._trackSfx('quiz_ok');
      this.triggerMicroDucking(0.70, 0.30);
      const now = this._ctx.currentTime;

      // 寺庙沉稳木鱼/磬声两度泛音（C5 + G5）
      [523.25, 783.99].forEach((freq, idx) => {
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.28, now + idx * 0.06 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this._sfxBus);
        if (this._reverbBus) gain.connect(this._reverbBus);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.40);
      });
    } catch {}
  }

  playQuizRetry() {
    this.ensureContext();
    if (!this._enabled || !this._ctx) return;
    try {
      this._trackSfx('quiz_retry');
      this.triggerMicroDucking(0.85, 0.15);
      const now = this._ctx.currentTime;

      // 哑板低沉微响（木片轻碰未合拍）
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(145, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);

      osc.connect(gain);
      gain.connect(this._sfxBus);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  playSealStamp() {
    this.ensureContext();
    if (!this._enabled || !this._ctx) return;
    try {
      this._trackSfx('seal_stamp');
      this.triggerMicroDucking(0.50, 0.50);
      const now = this._ctx.currentTime;

      // 沉重朱砂印泥重重下压回音
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.70, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this._sfxBus);
      if (this._reverbBus) gain.connect(this._reverbBus);
      osc.start(now);
      osc.stop(now + 0.50);
    } catch {}
  }

  // ==================== 5. 纸色低通联动与状态管控 ====================

  updatePaperTone(themeMode) {
    this._activeToneMode = themeMode === 'plain' ? 'plain' : 'antique';
    this.stateProbe.paperToneMode = this._activeToneMode;
    if (!this._ctx || !this._paperFilter) return;
    try {
      const now = this._ctx.currentTime;
      const targetFreq = this._activeToneMode === 'antique' ? 1400 : 2400;
      this._paperFilter.frequency.cancelScheduledValues(now);
      this._paperFilter.frequency.setTargetAtTime(targetFreq, now, 0.1);
    } catch {}
  }

  toggle(forceMute) {
    this.ensureContext();
    if (typeof forceMute === 'boolean') {
      this._enabled = !forceMute;
    } else {
      this._enabled = !this._enabled;
    }

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(this._enabled));
      }
    } catch {}

    this.stateProbe.muted = !this._enabled;
    this.stateProbe.isMuted = !this._enabled;

    if (this._ctx && this._masterGain) {
      try {
        const now = this._ctx.currentTime;
        const target = this._enabled ? Number((0.85 * (this._volume / 100)).toFixed(4)) : 0;
        this._masterGain.gain.cancelScheduledValues(now);
        this._masterGain.gain.setTargetAtTime(target, now, 0.05);
      } catch {}
    }

    if (this._enabled && !this._bgmPlaying) {
      this.startBgm();
    } else if (!this._enabled && this._bgmPlaying) {
      this.stopBgm();
    }

    for (const fn of this._listeners) {
      try { fn(this._enabled, this._volume); } catch {}
    }
    return this._enabled;
  }

  getVolume() {
    return this._volume;
  }

  setVolume(val) {
    const num = Math.max(0, Math.min(100, Math.round(Number(val) || 0)));
    this._volume = num;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_VOLUME_KEY, String(num));
      }
    } catch {}

    const ratio = num / 100;
    this.stateProbe.volume = num;
    this.stateProbe.masterVolume = Number((0.85 * ratio).toFixed(3));
    this.stateProbe.bgmVolume = Number((0.42 * ratio).toFixed(3));
    this.stateProbe.sfxVolume = Number((0.78 * ratio).toFixed(3));

    if (this._ctx && this._masterGain) {
      try {
        const now = this._ctx.currentTime;
        const targetGain = this._enabled ? Number((0.85 * ratio).toFixed(4)) : 0;
        this._masterGain.gain.cancelScheduledValues(now);
        this._masterGain.gain.setValueAtTime(this._masterGain.gain.value, now);
        this._masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.04);
      } catch {}
    }

    if (num > 0 && !this._enabled) {
      this.toggle(false);
    } else if (num === 0 && this._enabled) {
      this.toggle(true);
    }

    for (const fn of this._listeners) {
      try { fn(this._enabled, this._volume); } catch {}
    }
    return this._volume;
  }

  isEnabled() {
    return this._enabled;
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _trackSfx(name) {
    this.stateProbe.lastSfx = name;
    if (this.stateProbe.sfxCounts[name] !== undefined) {
      this.stateProbe.sfxCounts[name]++;
    }
    this.stateProbe.sfxCounts.total++;
  }
}

let globalAudioManager = null;

export function getAudioManager() {
  if (!globalAudioManager) {
    globalAudioManager = new AudioManager();
  }
  return globalAudioManager;
}

export function createAudioSwitch(audio = getAudioManager()) {
  const group = document.createElement('div');
  group.className = 'audio-switch';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', '工坊雅乐与音量设置');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'audio-switch__btn';

  const volBox = document.createElement('div');
  volBox.className = 'audio-switch__vol-box';

  const volSlider = document.createElement('input');
  volSlider.type = 'range';
  volSlider.className = 'audio-switch__slider';
  volSlider.min = '0';
  volSlider.max = '100';
  volSlider.step = '1';
  volSlider.value = String(audio.getVolume());
  volSlider.setAttribute('aria-label', '雅乐音量');
  volSlider.setAttribute('data-sfx', 'jade');

  const volText = document.createElement('span');
  volText.className = 'audio-switch__vol-txt';
  volText.textContent = `${audio.getVolume()}%`;

  volBox.append(volSlider, volText);

  const updateView = (enabled, volume = audio.getVolume()) => {
    btn.setAttribute('aria-pressed', String(enabled));
    btn.title = enabled ? `工坊雅乐：已开启（${volume}%，点击静音）` : '工坊雅乐：已静音（点击开启）';

    let icon = '🔊';
    if (!enabled || volume === 0) {
      icon = '🔇';
    } else if (volume < 40) {
      icon = '🔉';
    }

    btn.innerHTML = enabled
      ? `<span class="audio-switch__icon" aria-hidden="true">${icon}</span><span class="audio-switch__txt">雅乐</span>`
      : `<span class="audio-switch__icon" aria-hidden="true">🔇</span><span class="audio-switch__txt">静音</span>`;

    volSlider.value = String(volume);
    volSlider.title = `雅乐音量：${volume}%`;
    volText.textContent = `${volume}%`;
    volSlider.style.opacity = enabled ? '1' : '0.45';
    volText.style.opacity = enabled ? '1' : '0.45';
  };

  btn.addEventListener('click', () => {
    audio.ensureContext();
    const nowEnabled = audio.toggle();
    updateView(nowEnabled, audio.getVolume());
  });

  volSlider.addEventListener('input', (e) => {
    audio.ensureContext();
    const newVol = Number(e.target.value);
    audio.setVolume(newVol);
    updateView(audio.isEnabled(), newVol);
  });

  volSlider.addEventListener('pointerdown', () => {
    audio.ensureContext();
  });

  audio.subscribe(updateView);
  updateView(audio.isEnabled(), audio.getVolume());

  group.append(btn, volBox);
  return group;
}

export { AudioManager };
