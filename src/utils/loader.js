// CSVファイルを読み込んで2次元配列に変換
async function loadCSV(url) {
  const response = await fetch(url);
  const text = await response.text();

  // BOM除去（UTF-8 with BOM対応）
  const cleaned = text.replace(/^\uFEFF/, '');

  // 行ごとに分割 → カンマで分割 → 配列化
  const rows = cleaned.trim().split('\n').map(row => row.split(','));

  return rows;
}

// Returns_JPY.csv を読み込んで日付と銘柄別リターンに整形
async function loadReturnsData() {
  const url = 'https://raw.githubusercontent.com/quanzoo/PortOptApp/main/data/Returns_JPY.csv';
  const rows = await loadCSV(url);

  // ヘッダー整形（改行・クォート除去）
  const headers = rows[0].map(h => h.replace(/[\r"\n]/g, ''));

  // データ整形
  const data = rows.slice(1).map(row => {
    const date = row[0].replace(/[\r"\n]/g, '');
    const returns = row.slice(1).map(val => {
      const cleanedVal = val.replace(/[\r"\n]/g, '');
      const num = parseFloat(cleanedVal);
      return isNaN(num) ? null : num;
    });
    return { date, returns };
  });

  return { headers: headers.slice(1), data }; // headers[0]は"Date"なので除外
}
