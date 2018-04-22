const Ads = {
  toothbrush: {
    audio: '/assets/aud/Ad_Toothbrush.ogg',
    adTimeline: [
      {
        id: 'robo-corp-text',
        type: 'text',
        trigger: 0,
        init: {
          x: 960, y: 540, text: 'Robo Corp', font: 'Audiowide, Verdana', size: '0',
        },
        set: { color: 'grey' },
        animate: { name: 'changeSize', props: [250, 6000] },
      },
      {
        id: 'robo-corp-text',
        type: 'text',
        trigger: 6000,
        animate: { name: 'moveAndSize', props: [200, 1040, 48, 1500] },
      },
      {
        id: 'bg-circle1',
        type: 'image',
        trigger: 7500,
        init: {
          x: 960, y: 540, width: 0, height: 0, image: '/assets/img/misc/purple_circle.png',
        },
        set: {},
        animate: { name: 'expandImage', props: [800, 800, 800] },
      },
      {
        id: 'bg-circle1',
        type: 'image',
        trigger: 8300,
        set: { radians: 0 },
        animate: { name: 'rotate', props: [10000] },
      },
      {
        id: 'bg-circle2',
        type: 'circle',
        trigger: 8500,
        init: { x: 960, y: 540, size: 0 },
        set: { color: '#35d4fc' },
        animate: { name: 'changeSize', props: [300, 800] },
      },
      {
        id: 'bg-circle3',
        type: 'circle',
        trigger: 9000,
        init: { x: 960, y: 540, size: 0 },
        set: { color: '#35fc9f' },
        animate: { name: 'changeSize', props: [250, 800] },
      },
      {
        id: 'toothbrush',
        type: 'image',
        trigger: 9720,
        init: {
          x: 960, y: 540, width: 0, height: 0, image: '/assets/img/misc/toothbrush.png',
        },
        set: {},
        animate: { name: 'expandImage', props: [200, 400, 200] },
      },
      {
        id: 'toothbrush',
        type: 'image',
        trigger: 10000,
        animate: { name: 'wobbleRotate', props: [0.5, 960] },
      },
      {
        id: 'space-text',
        type: 'text',
        trigger: 19610,
        init: {
          x: 1620, y: 540, text: 'SPACE!', font: 'Audiowide, Verdana', size: '0',
        },
        set: { color: 'black' },
        animate: { name: 'changeSize', props: [96, 300] },
      },
      {
        id: '39x-text',
        type: 'text',
        trigger: 25500,
        init: {
          x: 300, y: 500, text: '39X', font: 'Audiowide, Verdana', size: '0',
        },
        set: { color: '#ffffff' },
        animate: { name: 'changeSize', props: [96, 500] },
      },
      {
        id: '19.95-text',
        type: 'text',
        trigger: 27340,
        init: {
          x: 300, y: 620, text: '$19.95', font: 'Audiowide, Verdana', size: '0',
        },
        set: { color: 'green' },
        animate: { name: 'changeSize', props: [96, 500] },
      },
      {
        id: 'call-text',
        type: 'text',
        trigger: 30610,
        init: {
          x: 1400, y: 950, text: 'Call', font: 'Audiowide, Verdana', size: '0',
        },
        set: { color: 'white' },
        animate: { name: 'changeSize', props: [96, 500] },
      },
      {
        id: 'now-text',
        type: 'text',
        trigger: 31110,
        init: {
          x: 1740, y: 950, text: 'Now!', font: 'Audiowide, Verdana', size: '0',
        },
        set: { color: 'white' },
        animate: { name: 'changeSize', props: [96, 500] },
      },
    ],
  },
};

const getRandomAd = () => {
  const adKeys = Object.keys(Ads);
  const ad = Ads[adKeys[Math.floor(Math.random() * adKeys.length)]];
  return ad;
};

module.exports.Ads = Ads;
module.exports.getRandomAd = getRandomAd;
