import { useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

import catHome from "./assets/cat_home.png";
import catQuiz from "./assets/cat_quiz.png";
import catResult from "./assets/cat_result.png";

/* -----------------------------
   타입 정의
------------------------------ */

type Axis = "S" | "A" | "E";
type ResultCode = "SAE" | "SAT" | "SCE" | "SCT" | "IAE" | "IAT" | "ICE" | "ICT";
type Lang = "ko" | "th";

const LANG_KEY = "catbti_lang";

/* -----------------------------
   ✅ 고양이 게이지 아이콘 (진짜 고양이처럼 보이게)
------------------------------ */

function CatOutline({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 귀 + 얼굴 */}
      <path
        d="M6 11L4 6L8 8
           C9 7 10.5 6.5 12 6.5
           C13.5 6.5 15 7 16 8
           L20 6L18 11
           C19 12.5 19.5 14 19.5 15.5
           C19.5 18.5 16.5 20.5 12 20.5
           C7.5 20.5 4.5 18.5 4.5 15.5
           C4.5 14 5 12.5 6 11Z"
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* 눈 */}
      <circle cx="9" cy="15" r="1" fill="rgba(0,0,0,0.4)" />
      <circle cx="15" cy="15" r="1" fill="rgba(0,0,0,0.4)" />
    </svg>
  );
}

function CatFilled({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M6 11L4 6L8 8
           C9 7 10.5 6.5 12 6.5
           C13.5 6.5 15 7 16 8
           L20 6L18 11
           C19 12.5 19.5 14 19.5 15.5
           C19.5 18.5 16.5 20.5 12 20.5
           C7.5 20.5 4.5 18.5 4.5 15.5
           C4.5 14 5 12.5 6 11Z"
        fill="#111"
      />
      <circle cx="9" cy="15" r="1" fill="white" />
      <circle cx="15" cy="15" r="1" fill="white" />
    </svg>
  );
}

function Meter({ level }: { level: number }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: 5 }).map((_, i) =>
        i < level ? <CatFilled key={i} /> : <CatOutline key={i} />
      )}
    </div>
  );
}

/* -----------------------------
   점수 변환
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
   앱 시작
------------------------------ */

export default function App() {
  const [screen, setScreen] = useState<"home" | "done">("home");
  const [axisScores] = useState({ S: 15, A: 8, E: 18 }); // 테스트용 점수

  const axisLevels = useMemo(() => {
    return [
      { axis: "사회성", level: toLevel5(axisScores.S) },
      { axis: "활동성", level: toLevel5(axisScores.A) },
      { axis: "정서안정", level: toLevel5(axisScores.E) },
    ];
  }, [axisScores]);

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
      }}
    >
      <div style={cardStyle}>
        {screen === "home" && (
          <>
            <img src={catHome} style={{ width: "100%", borderRadius: 12 }} />
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
            <img src={catResult} style={{ width: "100%", borderRadius: 12 }} />
            <h2 style={{ marginTop: 20 }}>성향 요약</h2>

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
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
                  <Meter level={item.level} />
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
