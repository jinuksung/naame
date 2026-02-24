import assert from "node:assert/strict";
import { parseNamechartChartPage } from "./parse";

const SAMPLE_HTML = `
<!doctype html>
<html lang="ko">
  <body>
    <table>
      <thead>
        <tr><th>순위</th><th>이름</th><th>출생아 수</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><div><p>🥇<!-- --> <!-- -->1</p></div></td>
          <td><span class="before:bg-gender-female">서윤</span></td>
          <td><p>42,084</p></td>
        </tr>
        <tr>
          <td><div><p>12</p></div></td>
          <td><span class="before:bg-gender-male">지원</span></td>
          <td><p>31,068</p></td>
        </tr>
      </tbody>
    </table>
    <a href="/chart/all?gender=f&amp;page=2">다음<svg></svg></a>
  </body>
</html>
`;

const LAST_PAGE_HTML = `
<!doctype html>
<html><body>
  <table><tbody>
    <tr><td><p>201</p></td><td><span>하원</span></td><td><p>123</p></td></tr>
  </tbody></table>
</body></html>
`;

function runTest(): void {
  const parsed = parseNamechartChartPage(SAMPLE_HTML);
  assert.equal(parsed.rows.length, 2);
  assert.deepEqual(parsed.rows[0], { rank: 1, name: "서윤", totalBirths: 42084, gender: "F" });
  assert.deepEqual(parsed.rows[1], { rank: 12, name: "지원", totalBirths: 31068, gender: "M" });
  assert.equal(parsed.nextPath, "/chart/all?gender=f&page=2");

  const lastPage = parseNamechartChartPage(LAST_PAGE_HTML);
  assert.equal(lastPage.rows.length, 1);
  assert.equal(lastPage.rows[0]?.name, "하원");
  assert.equal(lastPage.rows[0]?.gender, null);
  assert.equal(lastPage.nextPath, null);

  console.log("[namechart-parse] tests passed");
}

runTest();
