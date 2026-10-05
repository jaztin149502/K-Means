export function cluster(points, k, maxIterations = 100) {
  if (!Number.isInteger(k) || k < 1) {
    throw new RangeError("The number of clusters must be a positive integer.");
  }
  if (points.length < k) {
    throw new RangeError("Add at least as many points as clusters.");
  }

  let centers = initializeCenters(points, k);
  let assignments = new Array(points.length).fill(-1);
  let iterations = 0;

  for (; iterations < maxIterations; iterations += 1) {
    const nextAssignments = points.map((point) => nearestCenter(point, centers));
    const nextCenters = centers.map((center, centerIndex) => {
      let xTotal = 0;
      let yTotal = 0;
      let count = 0;

      points.forEach((point, pointIndex) => {
        if (nextAssignments[pointIndex] === centerIndex) {
          xTotal += point.x;
          yTotal += point.y;
          count += 1;
        }
      });

      return count === 0 ? center : { x: xTotal / count, y: yTotal / count };
    });

    const stable = nextAssignments.every((assignment, index) => assignment === assignments[index]);
    assignments = nextAssignments;
    centers = nextCenters;

    if (stable) {
      iterations += 1;
      break;
    }
  }

  const inertia = points.reduce((total, point, index) => {
    const center = centers[assignments[index]];
    return total + squaredDistance(point, center);
  }, 0);

  return { assignments, centers, inertia, iterations };
}

function initializeCenters(points, k) {
  const selected = new Set();
  const centers = [points[Math.floor(Math.random() * points.length)]];
  selected.add(points.indexOf(centers[0]));

  while (centers.length < k) {
    const distances = points.map((point) => Math.min(...centers.map((center) => squaredDistance(point, center))));
    const total = distances.reduce((sum, distance) => sum + distance, 0);
    let chosenIndex = -1;

    if (total > 0) {
      let target = Math.random() * total;
      for (let index = 0; index < distances.length; index += 1) {
        target -= distances[index];
        if (target <= 0 && !selected.has(index)) {
          chosenIndex = index;
          break;
        }
      }
    }

    if (chosenIndex < 0) {
      chosenIndex = points.findIndex((_, index) => !selected.has(index));
    }

    selected.add(chosenIndex);
    centers.push(points[chosenIndex]);
  }

  return centers.map((point) => ({ x: point.x, y: point.y }));
}

function nearestCenter(point, centers) {
  let nearestIndex = 0;
  let nearestDistance = squaredDistance(point, centers[0]);

  for (let index = 1; index < centers.length; index += 1) {
    const distance = squaredDistance(point, centers[index]);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  }

  return nearestIndex;
}

function squaredDistance(first, second) {
  const xDifference = first.x - second.x;
  const yDifference = first.y - second.y;
  return xDifference * xDifference + yDifference * yDifference;
}