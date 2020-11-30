import TheCity from './TheCity';
import { Day as Background } from '../entities/Background';
import * as json from '../../assets/tilemaps/The City II.json';

export default class TheCityII extends TheCity {
  constructor() {
		super('The CityII');
  }

  getBackground() {
    return new Background(this);
  }

  getLevelJson() {
    return json;
  }

  getMapKey() {
		return 'TheCityII';
	}

	nextScene() {
		return this.scene.start('The CityIII');
	}
}
