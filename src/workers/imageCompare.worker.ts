self.onmessage = (e: MessageEvent) => {
  const { prevData, currData, threshold } = e.data;
  const pixelCount = prevData.length / 4;
  let totalDiff = 0;

  for (let i = 0; i < prevData.length; i += 4) {
    totalDiff += Math.abs(prevData[i] - currData[i]);
    totalDiff += Math.abs(prevData[i + 1] - currData[i + 1]);
    totalDiff += Math.abs(prevData[i + 2] - currData[i + 2]);
  }

  const avgDiff = totalDiff / (pixelCount * 3);
  const changeDetected = avgDiff > threshold;

  self.postMessage({ avgDiff, changeDetected });
};
