/**
 * Uncomment this block to calculate the crossroads (positions in the tilemap where any sprite can take a direction)
 * Run this an any JS interpreter (like https://runjs.co) to print the results and parte it in your "playing-environment.json" file
 */

const calculateCrossroads = () => {
  var distance = 40 * 2,
    rows = 11 / 2,
    cols = 35 / 2,
    map = [];

  for (var i = 0, y = 120, id = 0; i < rows; i++, y += distance)
    for (var j = 0, x = 60; j < cols; j++, x += distance, id++) {
      map.push({
        height: 1.6,
        id: id,
        name: 'item-' + id,
        rotation: 0,
        type: '',
        visible: true,
        width: 1.6,
        x: x,
        y: y
      });
    }

  console.log(map);
};

/**
 * Uncomment this block to calculate the roads (positions in the tilemap where any sprite CAN'T take a direction)
 * Run this an any JS interpreter (like https://runjs.co) to print the results and parte it in your "playing-environment.json" file
 */

const calculateRoads = () => {
  var distance = 40,
    rows = 11,
    cols = 35 / 2,
    map = [];

  for (var i = 0, y = 120, id = 0; i < rows; i++, y += distance) {
    var startX = i % 2 === 0 ? 60 + distance : 60;

    for (var j = 0, x = startX; j < cols; j++, x += distance * 2, id++) {
      map.push({
        height: 1.6,
        id: id,
        name: 'item-' + id,
        rotation: 0,
        type: '',
        visible: true,
        width: 1.6,
        x: x,
        y: y
      });
    }
  }

  console.log(map);
};
