import React, { useState, useEffect } from 'react';
import AssetControl from './components/AssetControl';
import RiskSlider from './components/RiskSlider';
import OptimizeButton from './components/OptimizeButton';
import PortfolioChart from './components/PortfolioChart';
import PortfolioStats from './components/PortfolioStats';

import { loadReturnsData } from './utils/loader';
import { computeAnnualizedReturn } from './utils/compute';
import { optimizeMeanVariancePortfolio } from './utils/optimizer';

function App() {
  const [returnsData, setReturnsData] = useState(null);
  const [bounds, setBounds] = useState([]);
  const [expectedReturns, setExpectedReturns] = useState([]);
  const [targetVolatility, setTargetVolatility] = useState(0.15);
  const [weights, setWeights] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadReturnsData().then(data => {
      setReturnsData(data);
      setBounds(data.headers.map(() => [0, 1]));
      const matrix = data.data.map(d => d.returns.map(v => isNaN(v) ? 0 : v));
      setExpectedReturns(computeAnnualizedReturn(matrix));
    });
  }, []);

  const handleOptimize = () => {
    if (!returnsData) return;
    const result = optimizeMeanVariancePortfolio(returnsData, expectedReturns, targetVolatility, bounds);
    setWeights(result);

    // 統計計算（例：期待リターン、リスク、シャープレシオ）
    const portfolioReturn = result.reduce((sum, w, i) => sum + w * expectedReturns[i], 0);
    const cov = computeCovarianceMatrix(returnsData.data, returnsData.headers.length);
    const portfolioVol = Math.sqrt(dot(result, dot(cov, result)));
    const sharpe = portfolioVol > 0 ? portfolioReturn / portfolioVol : 0;

    setStats({
      expectedReturn: portfolioReturn,
      volatility: portfolioVol,
      sharpeRatio: sharpe
    });
  };

  const updateBound = (index, type, value) => {
    const newBounds = [...bounds];
    newBounds[index][type === 'lower' ? 0 : 1] = parseFloat(value);
    setBounds(newBounds);
  };

  const updateExpectedReturn = (index, value) => {
    const newReturns = [...expectedReturns];
    newReturns[index] = parseFloat(value);
    setExpectedReturns(newReturns);
  };

  if (!returnsData) return <div>読み込み中...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>ポートフォリオ最適化</h1>
      <RiskSlider value={targetVolatility} onChange={setTargetVolatility} />
      {returnsData.headers.map((name, i) => (
        <AssetControl
          key={i}
          name={name}
          index={i}
          bounds={bounds}
          expectedReturn={expectedReturns}
          onBoundChange={updateBound}
          onReturnChange={updateExpectedReturn}
        />
      ))}
      <OptimizeButton onClick={handleOptimize} />
      {weights.length > 0 && (
        <>
          <PortfolioChart headers={returnsData.headers} weights={weights} />
          <PortfolioStats stats={stats} />
        </>
      )}
    </div>
  );
}

export default App;
