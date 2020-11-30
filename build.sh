webpack --config webpack.production.config.js
mkdir -p build/assets/sprites build/assets/tilemaps
cp assets/sprites/*png build/assets/sprites
cp assets/tilemaps/{*png,*json} build/assets/tilemaps
