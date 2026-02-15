import { useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

import catHome from "./assets/cat_home.png";
import catQuiz from "./assets/cat_quiz.png";
import catResult from "./assets/cat_result.png";

type Axis = "S" | "A" | "E";
type ResultCode = "SAE" | "SAT" | "SCE" | "SCT" | "IAE" | "IAT" | "ICE" | "ICT";

type Question = {
  prompt: string;
  options: [string, string, string, string, string]; // 1~5점에 매핑
  axis: Axis;
  reverse?: boolean; // 역문항 (E축 일부)
};

const questions: Question[] = [
  // 🐾 사회성(S)
  {
    axis: "S",
    prompt: "낯선 사람이 집에 놀러 왔다.\n우리 집 주인님의 반응은?",
    options: [
      "“여긴 내 구역이야!” 하며 경계한다",
      "바로 사라져서 숨는다",
      "멀리서 조용히 관찰한다",
      "무심한 듯 지나가지만 은근 신경 쓴다",
      "먼저 다가가 냄새 맡으며 인사한다",
    ],
  },
  {
    axis: "S",
    prompt: "집사가 다른 방으로 이동하면 우리 주인님은?",
    options: [
      "꿈쩍도 하지 않는다",
      "한 번 쳐다보고 말다",
      "잠시 고민하다가 따라온다",
      "바로 뒤에서 조용히 따라온다",
      "“어디 가?” 하며 바로 쫓아온다",
    ],
  },
  {
    axis: "S",
    prompt: "집사가 집에 들어오는 순간,\n우리 주인님의 반응은?",
    options: [
      "모르는 척 자는 척 한다",
      "힐끗 보고 다시 자기 할 일 한다",
      "천천히 다가와 냄새부터 맡는다",
      "근처에서 맴돌며 존재감을 드러낸다",
      "현관까지 마중 나와 반겨준다",
    ],
  },
  {
    axis: "S",
    prompt: "집사가 한참 자리에 앉아 있다면?",
    options: [
      "각자 인생이다",
      "같은 공간이지만 멀찍이 떨어진다",
      "가끔 슬쩍 다가왔다가 돌아간다",
      "옆자리를 차지한다",
      "무릎 위를 당연한 자리로 여긴다",
    ],
  },

  // ⚡ 활동성(A)
  {
    axis: "A",
    prompt: "새 장난감을 꺼냈을 때 우리 주인님은?",
    options: [
      "전혀 관심 없다",
      "한두 번 툭 치고 끝",
      "한참 지켜보다가 슬쩍 건드린다",
      "적극적으로 쫓아다닌다",
      "눈빛이 완전히 사냥 모드가 된다",
    ],
  },
  {
    axis: "A",
    prompt: "집 안이 조용할 때 모습은?",
    options: [
      "거의 움직이지 않는다",
      "주로 같은 자리에서 쉰다",
      "가끔 창밖을 살핀다",
      "집 안을 자주 돌아다닌다",
      "집 전체를 순찰하듯 움직인다",
    ],
  },
  {
    axis: "A",
    prompt: "밤이 되면 우리 주인님은?",
    options: [
      "더 얌전해진다",
      "낮과 크게 다르지 않다",
      "살짝 더 활발해진다",
      "갑자기 뛰기 시작한다",
      "새벽 3시에 질주가 시작된다",
    ],
  },
  {
    axis: "A",
    prompt: "낚싯대를 흔들면 반응은?",
    options: [
      "“그건 네가 해.”",
      "몇 번 툭 치고 끝낸다",
      "눈은 따라가지만 몸은 느긋하다",
      "진지하게 추적한다",
      "끝까지 집요하게 사냥한다",
    ],
  },

  // 🌙 정서안정(E) — Q9~Q11 역문항
  {
    axis: "E",
    reverse: true,
    prompt: "청소기를 켰을 때 우리 주인님은?",
    options: [
      "크게 놀라거나 공격적으로 반응한다",
      "바로 도망가 숨는다",
      "긴장한 채 멀리서 지켜본다",
      "불편해하지만 자리를 지킨다",
      "별 신경 쓰지 않는다",
    ],
  },
  {
    axis: "E",
    reverse: true,
    prompt: "갑자기 큰 소리가 났을 때 반응은?",
    options: [
      "깜짝 놀라 크게 반응한다",
      "급히 숨는다",
      "긴장 상태를 유지한다",
      "잠시 멈췄다가 금방 회복한다",
      "“뭐였지?” 하고 지나간다",
    ],
  },
  {
    axis: "E",
    reverse: true,
    prompt: "동물병원 가는 날, 우리 주인님은?",
    options: [
      "격렬하게 저항한다",
      "이동장부터 불안해한다",
      "긴장하지만 참고 버틴다",
      "비교적 얌전한 편이다",
      "생각보다 침착하다",
    ],
  },
  {
    axis: "E",
    prompt: "새로운 장소에 갔을 때 모습은?",
    options: [
      "극도로 예민해진다",
      "한동안 숨어 있다",
      "한참 관찰 후 천천히 나온다",
      "조심스럽게 탐색한다",
      "금방 자기 구역처럼 행동한다",
    ],
  },
];

type ResultPack = {
  title: string;
  oneLiner: string;
  heart: string[];
  guide: string[];
  caution: string[];
};

const results: Record<ResultCode, ResultPack> = {
  SAE: {
    title: "집사 너무 좋아 💕",
    oneLiner: "나는 네가 집이야.",
    heart: ["네가 움직이면 나도 따라가고,", "같은 공간에 있는 게 제일 편해.", "그게 내 방식의 애정이야."],
    guide: ["하루에 5~10분이라도 매일 놀아줘.", "눈을 자주 마주치고 이름을 불러줘.", "갑자기 사라지지 말고, 존재감만 있어줘."],
    caution: ["갑작스런 생활 루틴 변화는 불안할 수 있어.", "관심이 부족하면 집사 호출이 잦아질 수 있어."],
  },
  SAT: {
    title: "집사야 놀자 ⚡",
    oneLiner: "지금이야. 지금 놀아줘.",
    heart: ["에너지는 넘치는데,", "마음은 생각보다 섬세해.", "재밌으면 최고, 싫으면 바로 티 나."],
    guide: ["짧게 자주(3~5분×2~3회) 놀아줘.", "과열되면 잠깐 쉬는 시간(숨을 곳) 줘.", "소리/움직임 자극은 천천히 적응시키기."],
    caution: ["흥분이 쌓이면 공격/과잉행동으로 보일 수 있어.", "갑작스런 큰 소음은 스트레스가 될 수 있어."],
  },
  SCE: {
    title: "집사야 내가 집주인이지 😼",
    oneLiner: "루틴은 사랑이야.",
    heart: ["익숙한 게 편하고,", "내 공간이 지켜지면 마음이 안정돼.", "조용히 곁에 있는 타입이야."],
    guide: ["밥/놀이/휴식 시간을 일정하게 유지해줘.", "정해진 자리(숨는 곳/관찰 자리)를 만들어줘.", "다가갈 땐 천천히, 예고하고 움직여줘."],
    caution: ["환경 변화가 잦으면 조용히 스트레스가 쌓일 수 있어."],
  },
  SCT: {
    title: "집사야 간식이 좀 아닌데 👑",
    oneLiner: "내 취향은 분명해.",
    heart: ["낯선 건 경계하고,", "익숙한 게 제일 편해.", "마음이 열리면 오래 가는 편이야."],
    guide: ["사료/간식 바꿀 땐 7~10일에 걸쳐 천천히.", "새 물건은 한 번에 많이 두지 말고 하나씩.", "싫어하는 신호(피하기/숨기)를 존중해줘."],
    caution: ["억지로 ‘좋아해!’ 강요하면 더 거부감이 커질 수 있어."],
  },
  IAE: {
    title: "집사… 지금은 새벽이야 🌙",
    oneLiner: "밤은 나의 시간이야.",
    heart: ["조용해지면 에너지가 차오르고,", "그때가 제일 자유로워.", "그래서 갑자기 뛰기 시작해."],
    guide: ["잠들기 전 10분 ‘마지막 놀이’ 추천.", "밤에 혼자 놀 장난감(공/트랙) 준비.", "낮에 활동을 분산(창가 놀이/간식 퍼즐)."],
    caution: ["야간 활동을 억지로 막기보다 루틴으로 유도해줘."],
  },
  IAT: {
    title: "나는야 독립왕 고양이 👑",
    oneLiner: "내 생활은 내가 한다.",
    heart: ["혼자 있는 시간이 편하고,", "내가 정한 타이밍에 다가가고 싶어.", "그래도 신뢰는 천천히 쌓여."],
    guide: ["혼자 놀 거리(터널/스크래처/트랙)를 만들어줘.", "스킨십은 ‘선택권’을 줘 (다가오면 OK).", "사냥놀이(낚싯대/숨바꼭질)로 교감."],
    caution: ["억지로 안거나 붙잡으면 관계가 멀어질 수 있어."],
  },
  ICE: {
    title: "집사야 날 좀 내버려둬 😼",
    oneLiner: "좋아해. 근데 거리는 필요해.",
    heart: ["혼자가 편한데,", "네가 너무 멀어지는 건 또 싫어.", "적당한 거리가 딱 좋아."],
    guide: ["내가 먼저 다가올 때까지 기다려줘.", "같은 공간에 조용히 있어주는 게 최고.", "숨을 공간(박스/캣타워 아래) 확보해줘."],
    caution: ["억지 스킨십/갑작스런 접근은 스트레스 신호를 만들 수 있어."],
  },
  ICT: {
    title: "우리 집사 뭐하나 볼까? 👀",
    oneLiner: "난 조용히 다 보고 있어.",
    heart: ["말은 없지만 관찰은 꼼꼼하고,", "안전하다고 느끼면 천천히 다가가.", "낯선 변화는 조금 부담스러워."],
    guide: ["창가/높은 곳 같은 관찰 포인트를 만들어줘.", "새 환경/새 사람은 ‘천천히’ 적응 시간을.", "예측 가능한 루틴이 안정감을 줘."],
    caution: ["갑작스런 소음/방문객/가구 이동이 반복되면 예민해질 수 있어."],
  },
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function axisLabel(axis: Axis) {
  if (axis === "S") return "사회성";
  if (axis === "A") return "활동성";
  return "정서안정";
}

export default function App() {
  const [screen, setScreen] = useState<"home" | "quiz" | "done">("home");
  const [answers, setAnswers] = useState<number[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const shareCardRef = useRef<HTMLDivElement | null>(null);

  const currentIndex = answers.length;
  const currentQ = questions[currentIndex];

  const axisScores = useMemo(() => {
    const scores: Record<Axis, number> = { S: 0, A: 0, E: 0 };
    answers.forEach((pickedScore, i) => {
      const q = questions[i];
      const value = q.reverse ? 6 - pickedScore : pickedScore;
      scores[q.axis] += value;
    });
    return scores;
  }, [answers]);

  const resultCode = useMemo((): ResultCode | "" => {
    if (answers.length < questions.length) return "";
    const s = axisScores.S >= 12 ? "S" : "I";
    const a = axisScores.A >= 12 ? "A" : "C";
    const e = axisScores.E >= 12 ? "E" : "T";
    return (s + a + e) as ResultCode;
  }, [answers.length, axisScores]);

  const result = resultCode ? results[resultCode] : null;

  const axisBars = useMemo(() => {
    const toPct = (v: number) => Math.round(((clamp(v, 4, 20) - 4) / 16) * 100);
    return [
      { axis: "S" as Axis, value: axisScores.S, pct: toPct(axisScores.S) },
      { axis: "A" as Axis, value: axisScores.A, pct: toPct(axisScores.A) },
      { axis: "E" as Axis, value: axisScores.E, pct: toPct(axisScores.E) },
    ];
  }, [axisScores]);

  const startQuiz = () => {
    setAnswers([]);
    setManualOpen(false);
    setScreen("quiz");
  };

  const resetAll = () => {
    setAnswers([]);
    setManualOpen(false);
    setScreen("home");
  };

  const goPrev = () => {
    if (answers.length === 0) return;
    setAnswers((prev) => prev.slice(0, -1));
  };

  const pickOption = (optionIndex: number) => {
    const score = optionIndex + 1; // 1~5
    setAnswers((prev) => [...prev, score]);

    if (answers.length + 1 >= questions.length) {
      setScreen("done");
      setManualOpen(false);
    }
  };

  const makeResultPngDataUrl = async () => {
    if (!shareCardRef.current) throw new Error("shareCardRef is null");
    return htmlToImage.toPng(shareCardRef.current, { pixelRatio: 2, cacheBust: true });
  };

  const downloadResultImage = async () => {
    try {
      setIsDownloading(true);
      const dataUrl = await makeResultPngDataUrl();
      const link = document.createElement("a");
      link.download = `CatBTI_${resultCode || "result"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert("이미지 저장에 실패했어. (브라우저/확장 프로그램 영향일 수 있음)");
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  // ✅ 친구에게 공유하기
  const shareToFriends = async () => {
    const shareText = "우리집 주인님의 MBTI가 궁금하다면 😼";
    const shareUrl = window.location.href;

    try {
      setIsSharing(true);

      // 1) 결과 이미지를 만들어 File로 변환
      const dataUrl = await makeResultPngDataUrl();
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `CatBTI_${resultCode || "result"}.png`, { type: blob.type || "image/png" });

      // 2) Web Share API 지원 + 파일 공유 가능하면 공유창 열기
      const navAny = navigator as any;
      const canShareFiles = typeof navAny?.canShare === "function" && navAny.canShare({ files: [file] });
      const canShare = typeof navAny?.share === "function";

      if (canShare && canShareFiles) {
        await navAny.share({
          title: "CatBTI",
          text: shareText,
          files: [file],
          url: shareUrl,
        });
        return;
      }

      // 3) 파일 공유가 안 되면: 링크 복사 fallback
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        alert("공유 기능이 지원되지 않아 링크를 복사했어! 친구에게 붙여넣어 보내줘 😼");
        return;
      }

      // 4) 마지막 fallback: 안내창
      alert(`공유 기능이 지원되지 않아.\n아래 링크를 복사해서 친구에게 보내줘:\n\n${shareUrl}`);
    } catch (e: any) {
      // 사용자가 공유창에서 취소한 경우도 여기로 들어올 수 있음
      console.error(e);
      alert("공유를 완료하지 못했어. (공유를 취소했거나, 기기에서 지원하지 않을 수 있어)");
    } finally {
      setIsSharing(false);
    }
  };

  // UI 스타일
  const bgStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "sans-serif",
    padding: 18,
    background:
      "radial-gradient(circle at 10% 10%, #ffe7f0 0%, transparent 35%), radial-gradient(circle at 90% 20%, #e7f0ff 0%, transparent 40%), radial-gradient(circle at 50% 100%, #e8fff4 0%, transparent 45%), #f7f7f7",
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.7)",
    padding: 22,
    borderRadius: 18,
    boxShadow: "0 14px 40px rgba(0,0,0,0.10)",
    textAlign: "center",
  };

  const primaryBtn: React.CSSProperties = {
    marginTop: 14,
    padding: "12px 14px",
    width: "100%",
    borderRadius: 12,
    border: "none",
    backgroundColor: "#111",
    color: "white",
    fontSize: 16,
    cursor: "pointer",
    opacity: isDownloading || isSharing ? 0.75 : 1,
  };

  const secondaryBtn: React.CSSProperties = {
    marginTop: 10,
    padding: "12px 14px",
    width: "100%",
    borderRadius: 12,
    border: "1px solid #ddd",
    backgroundColor: "white",
    color: "#111",
    fontSize: 16,
    cursor: "pointer",
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    maxHeight: 180,
    objectFit: "cover",
    borderRadius: 16,
    border: "1px solid #eee",
    marginBottom: 12,
  };

  const optionBtnBase: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
    borderRadius: 14,
    border: "1px solid #e6e6e6",
    background: "white",
    padding: "12px 12px",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(0,0,0,0.05)",
    transition: "transform 120ms ease",
  };

  const progressPct = Math.round(((Math.min(currentIndex + 1, questions.length)) / questions.length) * 100);

  return (
    <div style={bgStyle}>
      <div style={cardStyle}>
        {screen === "home" && (
          <>
            <img src={catHome} alt="cat home" style={imageStyle} />
            <h1 style={{ margin: 0, letterSpacing: -0.3 }}>CatBTI</h1>
            <p style={{ marginTop: 10, marginBottom: 0, opacity: 0.78, fontSize: 14, lineHeight: 1.5 }}>
              우리 집 고양이의 속마음, 집사가 번역해보자 😼
            </p>

            <button onClick={startQuiz} style={primaryBtn}>
              테스트 시작하기
            </button>
          </>
        )}

        {screen === "quiz" && currentQ && (
          <>
            <img src={catQuiz} alt="cat quiz" style={imageStyle} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <button
                onClick={goPrev}
                disabled={answers.length === 0}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: answers.length === 0 ? "#f5f5f5" : "white",
                  cursor: answers.length === 0 ? "not-allowed" : "pointer",
                  fontSize: 13,
                }}
              >
                ← 이전
              </button>

              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {currentIndex + 1} / {questions.length}
              </div>
            </div>

            <div style={{ height: 8, background: "#eee", borderRadius: 999, overflow: "hidden", marginTop: 10 }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: "#111", transition: "width 200ms ease" }} />
            </div>

            <h2 style={{ marginTop: 16, marginBottom: 12, fontSize: 20, letterSpacing: -0.2, lineHeight: 1.35 }}>
              {currentQ.prompt.split("\n").map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < currentQ.prompt.split("\n").length - 1 ? <br /> : null}
                </span>
              ))}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              {currentQ.options.map((txt, idx) => (
                <button
                  key={idx}
                  onClick={() => pickOption(idx)}
                  style={optionBtnBase}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 4 }}>선택 {idx + 1}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.35 }}>{txt}</div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.6 }}>(선택하면 바로 다음 질문으로 넘어가요)</div>
          </>
        )}

        {screen === "done" && result && (
          <>
            {/* ✅ 저장/공유될 카드 영역 */}
            <div ref={shareCardRef} style={{ padding: 2 }}>
              <img src={catResult} alt="cat result" style={imageStyle} />

              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, rgba(255,231,240,0.9), rgba(231,240,255,0.9))",
                  border: "1px solid rgba(255,255,255,0.9)",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.75 }}>CatBTI 결과</div>
                <h2 style={{ margin: "8px 0 6px", letterSpacing: -0.3 }}>{result.title}</h2>

                <div
                  style={{
                    marginTop: 8,
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.88)",
                    fontSize: 14,
                  }}
                >
                  “{result.oneLiner}”
                </div>

                <div style={{ marginTop: 12, opacity: 0.85, fontSize: 14, lineHeight: 1.55 }}>
                  {result.heart.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 14, textAlign: "left" }}>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10 }}>성향 요약</div>

                {axisBars.map((b) => (
                  <div key={b.axis} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.75 }}>
                      <span>{axisLabel(b.axis)}</span>
                      <span>{b.value}/20</span>
                    </div>

                    <div style={{ height: 10, background: "#eee", borderRadius: 999, overflow: "hidden", marginTop: 6 }}>
                      <div style={{ height: "100%", width: `${b.pct}%`, background: "#111" }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10, fontSize: 11, opacity: 0.55, textAlign: "center" }}>
                catbti • 우리집 주인님의 MBTI가 궁금하다면 😼
              </div>
            </div>

            <button
              onClick={() => setManualOpen((v) => !v)}
              style={{ ...secondaryBtn, marginTop: 14, textAlign: "left", fontWeight: 600 }}
            >
              {manualOpen ? "▴ 우리 집 주인님 설명서 접기" : "▾ 우리 집 주인님 설명서 열기"}
            </button>

            {manualOpen && (
              <div
                style={{
                  marginTop: 10,
                  padding: 14,
                  borderRadius: 16,
                  border: "1px solid #eee",
                  background: "rgba(255,255,255,0.86)",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 8 }}>🧭 집사 가이드</div>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 14 }}>
                  {result.guide.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>

                <div style={{ marginTop: 12, fontSize: 13, opacity: 0.85, marginBottom: 8 }}>⚠️ 주의 포인트</div>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 14 }}>
                  {result.caution.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ✅ 공유 1순위 버튼 */}
            <button onClick={shareToFriends} style={primaryBtn} disabled={isSharing || isDownloading}>
              {isSharing ? "공유 준비 중..." : "친구 집사에게 공유하기"}
            </button>

            {/* 다운로드도 유지 */}
            <button onClick={downloadResultImage} style={secondaryBtn} disabled={isSharing || isDownloading}>
              {isDownloading ? "이미지 만드는 중..." : "이미지로 저장하기"}
            </button>

            <button onClick={resetAll} style={secondaryBtn}>
              다시 하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
