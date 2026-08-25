export const GameConfig = {
  viewport: {
    width: 1080,
    height: 1920,
  },
  map: {
    width: 2000,
    height: 3000,
    gridSize: 200,
    borderWidth: 8,
  },
  colors: {
    background: 0x0d0d10,
    mapFill: 0x1e1e26,
    mapGrid: 0xffffff,
    mapBorder: 0x4c6ef5,
    roverBody: 0xadb5bd,
    roverCabin: 0x495057,
    roverAccent: 0x74c0fc,
  },
  rover: {
    speed: 280,
    inputSmoothing: 0.18,
    rotationSmoothing: 0.2,
    bodyWidth: 56,
    bodyHeight: 72,
  },
  camera: {
    lerp: 0.08,
  },
} as const;
