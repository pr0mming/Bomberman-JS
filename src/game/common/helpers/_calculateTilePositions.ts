/**
 * Uncomment this block to calculate the crossroads (positions in the tilemap where any sprite can take a direction)
 * Run this an any JS interpreter (like https://runjs.co) to print the results and paste it in your "tilemap.json" file, the section "Crossroads"
 *
 * NOTE: It would be strange use this file again, you should use it if you're gonna modify the tilemap (make it bigger, modify sizes, etc.)
 */

const _calculateCrossroads = () => {
  const distance = 40 * 2,
    rows = 11 / 2,
    cols = Math.floor(35 / 2),
    map = [];

  for (let i = 0, y = 120, id = 0; i < rows; i++, y += distance)
    for (let j = 0, x = 60; j <= cols; j++, x += distance, id++) {
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
 * Run this an any JS interpreter (like https://runjs.co) to print the results and paste it in your "tilemap.json" file, the section "Roads"
 *
 * NOTE: It would be strange use this file again, you should use it if you're gonna modify the tilemap (make it bigger, modify sizes, etc.)
 */

const _calculateRoads = () => {
  const distance = 40,
    rows = 11,
    cols = Math.floor(35 / 2),
    map = [];

  for (let i = 0, y = 120, id = 0; i < rows; i++, y += distance) {
    const startX = i % 2 === 0 ? 60 + distance : 60;
    const colsTmp = i % 2 === 0 ? cols : cols + 1;

    for (let j = 0, x = startX; j < colsTmp; j++, x += distance * 2, id++) {
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
