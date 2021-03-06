// Defines basic information for standard contracts (+ reward rates)
const contracts = {
  a: {
    name: 'Junk Asteroid',
    asteroidClass: 'a',
    price: 0,
    toughness: 100,
    rewardChances: {
      iron: { min: 10, max: 100 },
      copper: { min: 0, max: 10 },
      sapphire: { min: 0, max: 1 },
    },
  },
  b: {
    name: 'Class B Asteroid',
    asteroidClass: 'b',
    price: 100,
    toughness: 200,
    rewardChances: {
      iron: { min: 100, max: 200 },
      copper: { min: 5, max: 20 },
      sapphire: { min: 2, max: 3 },
      emerald: { min: 0, max: 1 },
    },
  },
  c: {
    name: 'Class C Asteroid',
    asteroidClass: 'c',
    price: 1000,
    toughness: 800,
    rewardChances: {
      iron: { min: 0, max: 300 },
      copper: { min: 100, max: 200 },
      sapphire: { min: 4, max: 6 },
      emerald: { min: 1, max: 2 },
      ruby: { min: 0, max: 1 },
    },
  },
  d: {
    name: 'Class D Asteroid',
    asteroidClass: 'd',
    price: 5000,
    toughness: 2500,
    rewardChances: {
      iron: { min: 0, max: 300 },
      copper: { min: 0, max: 300 },
      sapphire: { min: 50, max: 100 },
      emerald: { min: 4, max: 6 },
      ruby: { min: 1, max: 2 },
      diamond: { min: 0, max: 1 },
    },
  },
  e: {
    name: 'Class E Asteroid',
    asteroidClass: 'e',
    price: 15000,
    toughness: 7500,
    rewardChances: {
      iron: { min: 0, max: 500 },
      copper: { min: 0, max: 500 },
      sapphire: { min: 0, max: 150 },
      emerald: { min: 25, max: 50 },
      ruby: { min: 2, max: 3 },
      diamond: { min: 0, max: 1 },
    },
  },
  f: {
    name: 'Class F Asteroid',
    asteroidClass: 'f',
    price: 50000,
    toughness: 15000,
    rewardChances: {
      iron: { min: 0, max: 750 },
      copper: { min: 0, max: 750 },
      sapphire: { min: 0, max: 200 },
      emerald: { min: 50, max: 75 },
      ruby: { min: 20, max: 30 },
      diamond: { min: 0, max: 2 },
    },
  },
  g: {
    name: 'Class G Asteroid',
    asteroidClass: 'g',
    price: 100000,
    toughness: 45000,
    rewardChances: {
      iron: { min: 300, max: 2000 },
      copper: { min: 300, max: 2000 },
      sapphire: { min: 30, max: 300 },
      emerald: { min: 20, max: 80 },
      ruby: { min: 50, max: 100 },
      diamond: { min: 10, max: 20 },
    },
  },
  h: {
    name: 'Class H Asteroid',
    asteroidClass: 'h',
    price: 500000,
    toughness: 200000,
    rewardChances: {
      iron: { min: 200, max: 20000 },
      copper: { min: 300, max: 30000 },
      sapphire: { min: 1, max: 2000 },
      emerald: { min: 1, max: 1500 },
      ruby: { min: 1, max: 1000 },
      diamond: { min: 1, max: 500 },
    },
  },
};

module.exports = contracts;
