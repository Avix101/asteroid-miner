const Ads = {
  toothbrush: {
    audio: '/assets/aud/Ad_Toothbrush.ogg',
    adTimeline: [
      {
        id: 'robo-corp-text',
        type: 'text',
        trigger: 0,
        init: {
          x: 200, y: 1020, text: 'Robo Corp', font: 'Verdana', size: '48',
        },
        set: { color: 'grey' },
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
        animate: { name: 'expandCircle', props: [300, 800] },
      },
      {
        id: 'bg-circle3',
        type: 'circle',
        trigger: 9000,
        init: { x: 960, y: 540, size: 0 },
        set: { color: '#35fc9f' },
        animate: { name: 'expandCircle', props: [250, 800] },
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
