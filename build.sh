webpack --config webpack.production.config.js
mkdir -p build/assets/sprites build/assets/tilemaps
mkdir -p build/assets/sound/boris
cp assets/sprites/*png build/assets/sprites
cp assets/tilemaps/*png build/assets/tilemaps
cp assets/tilemaps/*json build/assets/tilemaps
cp assets/sound/*mp3 build/assets/sound
cp assets/sound/boris/*m4a build/assets/sound/boris
