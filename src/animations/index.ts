const getFrames = (scene: Phaser.Scene, prefix: string, end: number, key: string) => {
  return scene.anims.generateFrameNames(
    key,
    {
      prefix,
      suffix: `.png`,
      start: 1,
      end,
    }
  )
};

export const createFramesForKey = (scene: Phaser.Scene) => (key: string) => {
  console.log(`setting some anim for`, key, `${key}/idle`);
  scene.anims.create({
    key: `${key}/walk`,
    frameRate: 4,
    repeat: -1,
    frames: getFrames(scene, 'walk_', 4, key),
  });
  scene.anims.create({
    key: `${key}/idle`,
    frameRate: 2,
    repeat: -1,
    frames: getFrames(scene, 'idle_', 2, key),
  });
  scene.anims.create({
    key: `${key}/jump`,
    frameRate: 6,
    repeat: -1,
    frames: getFrames(scene, 'jump_', 2, key),
  });

  scene.anims.create({
    key: `${key}/halfspin`,
    frameRate: 8,
    repeat: 0,
    frames: [
      { key, frame: 'walk_4.png' },
      { key, frame: 'walk_2.png' },
      { key, frame: 'walk_3.png' },
      { key, frame: 'walk_1.png' },
    ],
  });
};
