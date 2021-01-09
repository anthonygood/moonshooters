import TheCity from './TheCity';
import { Sunset as Background } from '../entities/Background';
import * as json from '../../assets/tilemaps/The City III.json';

export default class TheCityIII extends TheCity {
  constructor() {
		super('The CityIII');
  }

  getBackground() {
    return new Background(this);
  }

  getLevelJson() {
    return json;
  }

  getMapKey() {
		return 'TheCityIII';
  }

	getMusicName() {
		return 'mellow';
  }

	nextScene() {
		return this.scene.start('The CityIV');
	}
}

