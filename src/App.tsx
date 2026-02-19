import { useMemo, useState } from "react";
import catHome from "./assets/cat_home.png";
import catResult from "./assets/cat_result.png";

/* -----------------------------
   유틸
------------------------------ */

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toLevel5(v: number) {
  const clamped = clamp(v, 4, 20);
  const normalized = (clamped - 4) / 16;
  return clamp(Math.round(normalized * 4) + 1, 1, 5);
}

/* -----------------------------
   ⭐ 별 게이지
------------------------------ */

function StarMeter({ level }: { level: number }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: 20,
            lineHeight: 1,
            color: i < level ? "#111" : "#ccc",
          }}
        >
          {i < level ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

/* -----------------------------
   앱
------------------------------ */

export default function App() {
  const [screen, setScreen] = useState<"home" | "done">("home");

  // 테스트용 점수 (네 기존 로직 연결해도 됨)
  const axisScores = { S: 10, A: 7, E: 17 };

  const axisLevels = useMemo(() => {
    return [
      { axis: "사회성", level: toLevel5(axisScores.S) },
      { axis: "활동성", level: toLevel5(axisScores.A) },
      { axis: "정서안정", level: toLevel5(axisScores.E) },
    ];
  }, []);

  const cardStyle: React.CSSProperties = {
    maxWidth: 420,
    width: "100%",
    background: "white",
    padding: 24,
    borderRadius: 18,
    boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
        padding: 20,
      }}
    >
      <div style={cardStyle}>
        {screen === "home" && (
          <>
            <img
              src={catHome}
              alt=""
              style={{ width: "100%", borderRadius: 12 }}
            />
            <h1>CatBTI</h1>

            <button
              onClick={() => setScreen("done")}
              style={{
                marginTop: 20,
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: "#111",
                color: "white",
                cursor: "pointer",
              }}
            >
              테스트 결과 보기
            </button>
          </>
        )}

        {screen === "done" && (
          <>
            <img
              src={catResult}
              alt=""
              style={{ width: "100%", borderRadius: 12 }}
            />

            <h2 style={{ marginTop: 20 }}>성향 요약</h2>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {axisLevels.map((item) => (
                <div
                  key={item.axis}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: 14 }}>{item.axis}</div>
                  <StarMeter level={item.level} />
                </div>
              ))}
            </div>

            <button
              onClick={() => setScreen("home")}
              style={{
                marginTop: 24,
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "white",
                cursor: "pointer",
              }}
            >
              다시하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
