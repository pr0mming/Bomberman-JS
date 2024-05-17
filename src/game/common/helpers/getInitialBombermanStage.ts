import { IBombermanStage } from '../interfaces/IBombermanStage';

const getInitialBombermanStage = (): IBombermanStage => {
  return {
    stage: 1,
    lives: 3,
    points: 0,
    time: 190,
    status: 'start',
    stage_enemies: [
      ['ballon'],
      ['ballon', 'snow'],
      ['snow', 'cookie'],
      ['cookie', 'ghost'],
      ['barrel', 'bear']
    ],
    stage_points: 0,
    stage_time: 0,
    map: []
  };
};

export default getInitialBombermanStage;
