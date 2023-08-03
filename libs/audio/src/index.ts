import { map } from 'nanostores';

// Track Store
interface Track {
  id: string;
  fileUrl: string;
  status: 'playing' | 'paused' | 'stopped';
  loop: boolean;
  volume: number;
  finishOnBarEnd: boolean;
}

export const tracksStore = map<{ [id: string]: Track }>({});

// Group Store
export interface Group {
  id: string;
  tracks: string[]; // Array of track IDs
  status: 'playing' | 'paused' | 'stopped';
}

export const groupsStore = map<{ [id: string]: Group }>({});

// AudioManager Store
export interface AudioManager {
  trackIds: string[];
  groupIds: string[];
}

export const audioManagerStore = map<AudioManager>({
  trackIds: [],
  groupIds: [],
});

// GameAudioManager Class
class GameAudioManager {
  static audioContext = new AudioContext();

  static createTrackManager(fileUrl: string) {
    return new TrackManager(GameAudioManager.audioContext, fileUrl);
  }
}

// TrackManager Class
class TrackManager {
  private audioContext: AudioContext;
  private audioBuffer!: AudioBuffer;
  private source: AudioBufferSourceNode | null = null;

  constructor(audioContext: AudioContext, fileUrl: string) {
    this.audioContext = audioContext;
    this.loadAudio(fileUrl);
  }

  private async loadAudio(fileUrl: string) {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  play() {
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.audioContext.destination);
    this.source.start();
  }

  pause() {
    if (this.source) {
      this.source.stop();
      this.source = null;
    }
  }

  stop() {
    this.pause(); // You may need additional logic to stop and reset the track
  }

  restart() {
    this.stop();
    this.play();
  }
}

// Add a new track
export const addTrack = (track: Track) => {
  trackManagers[track.id] = GameAudioManager.createTrackManager(track.fileUrl);
  tracksStore.setKey(track.id, track);
};

// Play a track
export const playTrack = (trackId: string) => {
  tracksStore.setKey(trackId, {
    ...tracksStore.get()[trackId],
    status: 'playing',
  });
  trackManagers[trackId].play();
};

// Pause a track
export const pauseTrack = (trackId: string) => {
  tracksStore.setKey(trackId, {
    ...tracksStore.get()[trackId],
    status: 'paused',
  });
  trackManagers[trackId].pause();
};

// Stop a track
export const stopTrack = (trackId: string) => {
  tracksStore.setKey(trackId, {
    ...tracksStore.get()[trackId],
    status: 'stopped',
  });
  trackManagers[trackId].stop();
};

// Restart a track
export const restartTrack = (trackId: string) => {
  tracksStore.setKey(trackId, {
    ...tracksStore.get()[trackId],
    status: 'playing',
  });
  trackManagers[trackId].restart();
};

// TODO: Functions to control groups
// E.g., playGroup, pauseGroup, stopGroup, etc.

// TODO: Global control functions
// E.g., playAll, pauseAll, stopAll, etc.

export const trackManagers: { [id: string]: TrackManager } = {};

// Function to play a group
export const playGroup = (groupId: string) => {
  const group = groupsStore.get()[groupId];
  group.status = 'playing';
  group.tracks.forEach((trackId) => playTrack(trackId));
  groupsStore.setKey(groupId, group);
};

// Function to pause a group
export const pauseGroup = (groupId: string) => {
  const group = groupsStore.get()[groupId];
  group.status = 'paused';
  group.tracks.forEach((trackId) => pauseTrack(trackId));
  groupsStore.setKey(groupId, group);
};

// Function to stop a group
export const stopGroup = (groupId: string) => {
  const group = groupsStore.get()[groupId];
  group.status = 'stopped';
  group.tracks.forEach((trackId) => stopTrack(trackId));
  groupsStore.setKey(groupId, group);
};

// Function to play all tracks
export const playAll = () => {
  Object.keys(tracksStore.get()).forEach((trackId) => playTrack(trackId));
};

// Function to pause all tracks
export const pauseAll = () => {
  Object.keys(tracksStore.get()).forEach((trackId) => pauseTrack(trackId));
};

// Function to stop all tracks
export const stopAll = () => {
  Object.keys(tracksStore.get()).forEach((trackId) => stopTrack(trackId));
};

// Function to restart all tracks
export const restartAll = () => {
  Object.keys(tracksStore.get()).forEach((trackId) => restartTrack(trackId));
};
