import { describe, expect, it } from "vitest";
import { renderSVG, listSigns, svgSizeInches } from "../src/index";
import type { SignCode } from "../src/index";
import { measureText, fitText } from "../src/font/layout";

describe("renderSVG", () => {
  it("renders every registered sign with defaults", () => {
    for (const { code } of listSigns()) {
      const svg = renderSVG(code as SignCode);
      expect(svg.startsWith("<svg"), code).toBe(true);
      const { width, height } = svgSizeInches(svg);
      expect(width, code).toBeGreaterThan(0);
      expect(height, code).toBeGreaterThan(0);
      // Every sign has visible geometry.
      expect(svg.includes("<path") || svg.includes("<rect"), code).toBe(true);
    }
  });

  it("matches snapshots for all signs at default props", () => {
    for (const { code } of listSigns()) {
      expect(renderSVG(code as SignCode)).toMatchSnapshot(code);
    }
  });

  it("applies customized props", () => {
    const s65 = renderSVG("R2-1", { speed: 65 });
    const s25 = renderSVG("R2-1", { speed: 25 });
    expect(s65).not.toEqual(s25);

    const left = renderSVG("R6-1", { direction: "left" });
    const right = renderSVG("R6-1", { direction: "right" });
    expect(left).not.toEqual(right);
  });

  it("grows variable-width signs with content", () => {
    const short = svgSizeInches(renderSVG("D3-1", { name: "Elm", suffix: "St" }));
    const long = svgSizeInches(
      renderSVG("D3-1", { name: "Constitution", suffix: "Ave" }),
    );
    expect(long.width).toBeGreaterThan(short.width);
    expect(long.height).toEqual(short.height);
  });

  it("throws on unknown codes", () => {
    expect(() => renderSVG("Z9-99" as SignCode)).toThrow(/Unknown sign code/);
  });
});

describe("text layout", () => {
  it("measures wider series as wider text", () => {
    const b = measureText("MAIN", "B");
    const e = measureText("MAIN", "E");
    expect(e).toBeGreaterThan(b);
  });

  it("steps series down before shrinking height", () => {
    const wide = fitText("BROADWAY", {
      series: "E",
      height: 6,
      x: 0,
      y: 0,
      maxWidth: 30,
    });
    // Must fit within the budget one way or another.
    expect(wide.width).toBeLessThanOrEqual(30.001);
    // A generous budget keeps the preferred series and height.
    const roomy = fitText("BROADWAY", {
      series: "E",
      height: 6,
      x: 0,
      y: 0,
      maxWidth: 500,
    });
    expect(roomy.series).toBe("E");
    expect(roomy.height).toBe(6);
  });
});
