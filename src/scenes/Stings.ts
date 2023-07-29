import 'phaser';

const addStings = (scene: Phaser.Scene) => {
  const pickupConfig = {
    mute: true,
    volume: 0.25,
    seek: 0.1,
    loop: false,
  };
  scene.sound.add('pickup1', pickupConfig);
  scene.sound.add('pickup2', pickupConfig);
  scene.sound.add('pickup3', pickupConfig);
}
