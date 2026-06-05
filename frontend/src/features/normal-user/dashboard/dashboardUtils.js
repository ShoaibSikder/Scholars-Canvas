export function clampPercent(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

export function formatHours(value) {
  const number = Number(value) || 0;
  return `${Number.isInteger(number) ? number : number.toFixed(1)}h`;
}

export function buildChartPoints(points, width, height) {
  if (!points.length) return [];
  const max = Math.max(...points.map((point) => Number(point.hours) || 0), 1);
  const stepX = width / (points.length - 1 || 1);
  return points.map((point, index) => {
    const hours = Number(point.hours) || 0;
    const x = index * stepX;
    const y = height - (hours / max) * (height - 26) - 13;
    return { ...point, hours, x, y };
  });
}

export function buildLinePath(points) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

export function buildAreaPath(points, width, height) {
  if (!points.length) return "";
  return `${buildLinePath(points)} L ${width} ${height} L 0 ${height} Z`;
}


