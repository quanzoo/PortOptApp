function computeAnnualizedReturn(returnsMatrix) {
  const n = returnsMatrix[0].length;
  const T = returnsMatrix.length;

  const annualized = Array(n).fill(0);

  for (let j = 0; j < n; j++) {
    let product = 1;
    for (let i = 0; i < T; i++) {
      const r = returnsMatrix[i][j];
      product *= (1 + (isNaN(r) ? 0 : r));
    }
    annualized[j] = Math.pow(product, 12 / T) - 1;
  }

  return annualized;
}

/**
 * 平均分散法によるポートフォリオ最適化（リスク制約＋bounds対応）
 * @param {Object} returnsData - loadReturnsData() の返り値 { headers, data }
 * @param {number[]} expectedReturns - 各資産の期待リターン（未指定ならヒストリカル年率リターン）
 * @param {number} targetVolatility - 許容リスク量（年率）
 * @param {Array<[number, number]>} bounds - 各資産の投資比率制約（例：[0, 0.3]、[0, 0]で除外）
 * @returns {number[]} weights - 最適ウェイト配列（合計1、非負、制約内）
 */
function optimizeMeanVariancePortfolio(returnsData, expectedReturns = null, targetVolatility = 0.15, bounds = null) {
  const { headers, data } = returnsData;
  const n = headers.length;
  const T = data.length;

  const returnsMatrix = data.map(d => d.returns.map(v => isNaN(v) ? 0 : v));
  const histReturn = computeAnnualizedReturn(returnsMatrix);
  const mu = expectedReturns ?? histReturn;

  // 月次平均（共分散計算用）
  const monthlyMean = Array(n).fill(0);
  for (let i = 0; i < T; i++) {
    for (let j = 0; j < n; j++) {
      monthlyMean[j] += returnsMatrix[i][j];
    }
  }
  for (let j = 0; j < n; j++) {
    monthlyMean[j] /= T;
  }

  // 共分散行列
  const cov = Array(n).fill().map(() => Array(n).fill(0));
  for (let i = 0; i < T; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        cov[j][k] += (returnsMatrix[i][j] - monthlyMean[j]) * (returnsMatrix[i][k] - monthlyMean[k]);
      }
    }
  }
  for (let j = 0; j < n; j++) {
    for (let k = 0; k < n; k++) {
      cov[j][k] /= (T - 1);
    }
  }

  // 制約設定
  const numeric = window.numeric;
  const Aeq = [Array(n).fill(1)];
  const beq = [1];

  // boundsが未指定なら [0, 1] に設定
  const finalBounds = bounds ?? Array(n).fill([0, 1]);

  // 除外資産（[0, 0]）を強制ゼロにする
  const activeIndices = finalBounds.map((b, i) => b[0] === 0 && b[1] === 0 ? false : true);

  // 目的関数（期待リターン最大化）
  const f = (w) => -numeric.dot(w, mu);

  // リスク制約
  const g = (w) => {
    const vol = Math.sqrt(numeric.dot(w, numeric.dot(cov, w)));
    return vol - targetVolatility;
  };

  // 最適化実行
  const result = numeric.solveQP(cov, mu.map(r => -r), Aeq, beq, finalBounds);
  const weights = result.solution;

  return weights;
}
