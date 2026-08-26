"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Camera + microphone capture with a live audio-level signal used for the
// volume meter AND for voice-activity / end-of-turn detection in the room.
// Raw media is never uploaded or stored; tracks are stopped on teardown.

export interface InterviewMedia {
  attachVideo: (el: HTMLVideoElement | null) => void;
  request: () => Promise<boolean>;
  ready: boolean;
  error: string | null;
  micOn: boolean;
  camOn: boolean;
  hasCamera: boolean;
  micLost: boolean;
  /** 0..1 instantaneous microphone level; read imperatively for VAD. */
  levelRef: React.MutableRefObject<number>;
  toggleMic: () => void;
  toggleCamera: () => void;
  switchCamera: () => Promise<void>;
  /** Average luminance (0..1) of the current camera frame, or null. */
  sampleBrightness: () => number | null;
  /** Resume the audio graph — must be called from a user gesture on iOS. */
  resumeAudio: () => void;
  stop: () => void;
}

export function useInterviewMedia(): InterviewMedia {
  const streamRef = useRef<MediaStream | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const levelRef = useRef<number>(0);
  const facingRef = useRef<"user" | "environment">("user");

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [hasCamera, setHasCamera] = useState(true);
  const [micLost, setMicLost] = useState(false);

  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoElRef.current = el;
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
      el.muted = true;
      void el.play().catch(() => {});
    }
  }, []);

  const buildAudioGraph = useCallback((stream: MediaStream) => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      // iOS starts the context suspended; try to resume (best effort here,
      // and again from an explicit gesture via resumeAudio()).
      if (ctx.state === "suspended") void ctx.resume().catch(() => {});
      const buf = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        // Normalise: quiet room ~0.01, speaking ~0.1-0.3.
        levelRef.current = Math.min(1, rms * 3.2);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* audio metering unavailable; VAD degrades gracefully */
    }
  }, []);

  const watchMicTrack = useCallback((stream: MediaStream) => {
    const track = stream.getAudioTracks()[0];
    if (!track) {
      setMicLost(true);
      return;
    }
    track.addEventListener("ended", () => setMicLost(true));
    track.addEventListener("mute", () => setMicLost(true));
    track.addEventListener("unmute", () => setMicLost(false));
  }, []);

  const request = useCallback(async (): Promise<boolean> => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("This browser does not support camera and microphone access.");
      return false;
    }
    try {
      // Try camera + mic first; fall back to mic-only if no camera.
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingRef.current, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        setHasCamera(true);
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        setHasCamera(false);
        setCamOn(false);
      }
      streamRef.current = stream;
      setMicLost(false);
      setMicOn(true);
      watchMicTrack(stream);
      buildAudioGraph(stream);
      if (videoElRef.current) {
        videoElRef.current.srcObject = stream;
        videoElRef.current.muted = true;
        void videoElRef.current.play().catch(() => {});
      }
      setReady(true);
      return true;
    } catch (e) {
      const name = (e as DOMException)?.name;
      setError(
        name === "NotAllowedError"
          ? "Camera and microphone permission was denied. Enable it in your browser and try again."
          : name === "NotFoundError"
            ? "No microphone was found. Connect one and try again."
            : "We couldn't access your camera and microphone.",
      );
      return false;
    }
  }, [buildAudioGraph, watchMicTrack]);

  const toggleMic = useCallback(() => {
    const t = streamRef.current?.getAudioTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setMicOn(t.enabled);
  }, []);

  const toggleCamera = useCallback(() => {
    const t = streamRef.current?.getVideoTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setCamOn(t.enabled);
  }, []);

  const switchCamera = useCallback(async () => {
    if (!streamRef.current) return;
    facingRef.current = facingRef.current === "user" ? "environment" : "user";
    try {
      const newVideo = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingRef.current },
      });
      const oldVideo = streamRef.current.getVideoTracks()[0];
      const newTrack = newVideo.getVideoTracks()[0];
      if (oldVideo) {
        streamRef.current.removeTrack(oldVideo);
        oldVideo.stop();
      }
      streamRef.current.addTrack(newTrack);
      if (videoElRef.current) videoElRef.current.srcObject = streamRef.current;
      setCamOn(true);
    } catch {
      facingRef.current = facingRef.current === "user" ? "environment" : "user";
    }
  }, []);

  const sampleBrightness = useCallback((): number | null => {
    const v = videoElRef.current;
    if (!v || !v.videoWidth) return null;
    try {
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 36;
      const ctx = c.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      return sum / (data.length / 4) / 255;
    } catch {
      return null;
    }
  }, []);

  const resumeAudio = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === "suspended") void ctx.resume().catch(() => {});
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoElRef.current) videoElRef.current.srcObject = null;
    setReady(false);
  }, []);

  // Guarantee media is released if the component unmounts.
  useEffect(() => stop, [stop]);

  return {
    attachVideo,
    request,
    ready,
    error,
    micOn,
    camOn,
    hasCamera,
    micLost,
    levelRef,
    toggleMic,
    toggleCamera,
    switchCamera,
    sampleBrightness,
    resumeAudio,
    stop,
  };
}
