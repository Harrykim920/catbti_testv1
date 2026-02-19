import { useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

import catHome from "./assets/cat_home.png";
import catQuiz from "./assets/cat_quiz.png";
import catResult from "./assets/cat_result.png";

type Axis = "S" | "A" | "E";
type ResultCode = "SAE" | "SAT" | "SCE" | "SCT" | "IAE" | "IAT" | "ICE" | "ICT";

type Lang = "ko" | "th";
const LANG_KEY = "catbti_lang";

/** ✅ 5단계 아이콘 게이지 커스텀 */
type MeterStyle = "cat" | "star";
const METER_STYLE: MeterStyle = "cat"; // "star"로 바꾸면 별 게이지로 변경됨

const uiText = {
  ko: {
    langBtnKo: "🇰🇷 한국어",
    langBtnTh: "🇹🇭 ไทย",
    brandLine: "CatBTI",
    tagline: "우리 집 고양이의 속마음, 집사가 번역해보자 😼",
    start: "테스트 시작하기",
    shareBtn: "친구 집사에게 공유하기",
    sharePreparing: "공유 준비 중...",
    downloadBtn: "이미지로 저장하기",
    downloadPreparing: "이미지 만드는 중...",
    manualOpen: "▾ 우리 집 주인님 설명서 열기",
    manualClose: "▴ 우리 집 주인님 설명서 접기",
    retry: "다시 하기",
    quizHint: "(선택하면 바로 다음 질문으로 넘어가요)",
    shareText: "우리집 주인님의 MBTI가 궁금하다면 😼",
    copiedLink: "공유 기능이 지원되지 않아 링크를 복사했어! 친구에게 붙여넣어 보내줘 😼",
    shareFailed: "공유를 완료하지 못했어. (공유를 취소했거나, 기기에서 지원하지 않을 수 있어)",
    saveFailed: "이미지 저장에 실패했어. (브라우저/확장 프로그램 영향일 수 있음)",
    prev: "← 이전",
    resultLabel: "CatBTI 결과",
    traitSummary: "성향 요약",
    behaviorsTitle: "대표 행동",
    butlerGuide: "🧭 집사 가이드",
    caution: "⚠️ 주의 포인트",
    footerShare: "catbti • 우리집 주인님의 MBTI가 궁금하다면 😼",
    choiceLabel: "선택",
  },
  th: {
    langBtnKo: "🇰🇷 한국어",
    langBtnTh: "🇹🇭 ไทย",
    brandLine: "CatBTI",
    tagline: "อยากรู้ใจ ‘เจ้านาย’ ไหมทาส 😼",
    start: "เริ่มทดสอบ",
    shareBtn: "แชร์ให้เพื่อนทาส",
    sharePreparing: "กำลังเตรียมแชร์...",
    downloadBtn: "บันทึกเป็นรูปภาพ",
    downloadPreparing: "กำลังสร้างรูป...",
    manualOpen: "▾ เปิดคู่มือเจ้านายบ้านเรา",
    manualClose: "▴ ปิดคู่มือเจ้านายบ้านเรา",
    retry: "ทำอีกครั้ง",
    quizHint: "(เลือกแล้วไปข้อถัดไปทันที)",
    shareText: "อยากรู้ MBTI ของ ‘เจ้านาย’ ไหมทาส 😼",
    copiedLink: "อุปกรณ์นี้แชร์ไฟล์ไม่ได้ เลยคัดลอกลิงก์ให้แล้วนะ! เอาไปวางส่งเพื่อนได้เลย 😼",
    shareFailed: "แชร์ไม่สำเร็จ (อาจยกเลิกหรืออุปกรณ์ไม่รองรับ)",
    saveFailed: "บันทึกรูปไม่สำเร็จ (อาจโดนส่วนเสริมหรือเบราว์เซอร์บล็อก)",
    prev: "← ย้อนกลับ",
    resultLabel: "ผลลัพธ์ CatBTI",
    traitSummary: "สรุปนิสัย",
    behaviorsTitle: "พฤติกรรมเด่น",
    butlerGuide: "🧭 คู่มือสำหรับทาส",
    caution: "⚠️ ระวังนิดนึง",
    footerShare: "catbti • อยากรู้ใจ ‘เจ้านาย’ ไหมทาส 😼",
    choiceLabel: "ตัวเลือก",
  },
} as const;

type Question = {
  prompt: { ko: string; th: string };
  options: { ko: [string, string, string, string, string]; th: [string, string, string, string, string] };
  axis: Axis;
  reverse?: boolean;
};

const questions: Question[] = [
  // 🐾 사회성(S)
  {
    axis: "S",
    prompt: { ko: "낯선 사람이 집에 놀러 왔다.\n우리 집 주인님의 반응은?", th: "มีคนแปลกหน้ามาที่บ้าน\n‘เจ้านาย’ ของเราทำไง?" },
    options: {
      ko: ["“여긴 내 구역이야!” 하며 경계한다", "바로 사라져서 숨는다", "멀리서 조용히 관찰한다", "무심한 듯 지나가지만 은근 신경 쓴다", "먼저 다가가 냄새 맡으며 인사한다"],
      th: ["“นี่ถิ่นของฉันนะ” ทำหน้าดุใส่", "หายตัวทันที ไปซ่อนก่อน", "ยืนไกลๆ เงียบๆ แล้วส่อง", "ทำเหมือนไม่สน…แต่แอบจับตาอยู่", "เดินไปดม ทำความรู้จักก่อน"],
    },
  },
  {
    axis: "S",
    prompt: { ko: "집사가 다른 방으로 이동하면 우리 주인님은?", th: "ทาสเดินไปอีกห้อง…เจ้านายทำไง?" },
    options: {
      ko: ["꿈쩍도 하지 않는다", "한 번 쳐다보고 말다", "잠시 고민하다가 따라온다", "바로 뒤에서 조용히 따라온다", "“어디 가?” 하며 바로 쫓아온다"],
      th: ["ไม่ขยับเลย เฉยมาก", "หันไปมองทีนึงแล้วจบ", "คิดแป๊บ…แล้วค่อยเดินตาม", "ตามไปเงียบๆ ติดหลังเลย", "“ไปไหน?” แล้ววิ่งตามทันที"],
    },
  },
  {
    axis: "S",
    prompt: { ko: "집사가 집에 들어오는 순간,\n우리 주인님의 반응은?", th: "ทาสกลับมาบ้านแล้ว\nเจ้านายตอบสนองยังไง?" },
    options: {
      ko: ["모르는 척 자는 척 한다", "힐끗 보고 다시 자기 할 일 한다", "천천히 다가와 냄새부터 맡는다", "근처에서 맴돌며 존재감을 드러낸다", "현관까지 마중 나와 반겨준다"],
      th: ["ทำเป็นไม่รู้ ทำเป็นหลับ", "เหลือบมองแป๊บ แล้วทำของตัวเองต่อ", "ค่อยๆ เดินมา…ขอดมก่อน", "วนๆ ใกล้ๆ ให้รู้ว่าฉันอยู่", "ออกไปรับถึงหน้าประตูเลย"],
    },
  },
  {
    axis: "S",
    prompt: { ko: "집사가 한참 자리에 앉아 있다면?", th: "ถ้าทาสนั่งนานๆ เจ้านายทำไง?" },
    options: {
      ko: ["각자 인생이다", "같은 공간이지만 멀찍이 떨어진다", "가끔 슬쩍 다가왔다가 돌아간다", "옆자리를 차지한다", "무릎 위를 당연한 자리로 여긴다"],
      th: ["ต่างคนต่างอยู่ อย่ามายุ่ง", "อยู่ห้องเดียวกัน…แต่ขอเว้นระยะ", "แวะมาดมหน่อยแล้วก็ไป", "ยึดที่ข้างๆ แบบเนียนๆ", "ตักทาส = ที่นั่งประจำ"],
    },
  },

  // ⚡ 활동성(A)
  {
    axis: "A",
    prompt: { ko: "새 장난감을 꺼냈을 때 우리 주인님은?", th: "หยิบของเล่นใหม่ออกมา เจ้านายทำไง?" },
    options: {
      ko: ["전혀 관심 없다", "한두 번 툭 치고 끝", "한참 지켜보다가 슬쩍 건드린다", "적극적으로 쫓아다닌다", "눈빛이 완전히 사냥 모드가 된다"],
      th: ["ไม่สนใจเลย", "แตะๆ สองทีพอเป็นพิธี", "มองนานมาก…แล้วค่อยแตะเบาๆ", "วิ่งไล่แบบจริงจัง", "ตาเปลี่ยนเป็นโหมดล่า 100%"],
    },
  },
  {
    axis: "A",
    prompt: { ko: "집 안이 조용할 때 모습은?", th: "บ้านเงียบๆ เจ้านายทำอะไรอยู่?" },
    options: {
      ko: ["거의 움직이지 않는다", "주로 같은 자리에서 쉰다", "가끔 창밖을 살핀다", "집 안을 자주 돌아다닌다", "집 전체를 순찰하듯 움직인다"],
      th: ["แทบไม่ขยับเลย", "อยู่มุมเดิมเป็นหลัก", "แวะไปดูหน้าต่างเป็นระยะ", "เดินสำรวจบ้านบ่อยๆ", "เดินตรวจตราทั้งบ้านเหมือนเจ้าของพื้นที่"],
    },
  },
  {
    axis: "A",
    prompt: { ko: "밤이 되면 우리 주인님은?", th: "พอกลางคืนมา เจ้านายเป็นไง?" },
    options: {
      ko: ["더 얌전해진다", "낮과 크게 다르지 않다", "살짝 더 활발해진다", "갑자기 뛰기 시작한다", "새벽 3시에 질주가 시작된다"],
      th: ["ยิ่งเงียบ ยิ่งนิ่ง", "พอๆ กับตอนกลางวัน", "คึกขึ้นนิดหน่อย", "อยู่ดีๆ ก็เริ่มวิ่ง", "ตีสาม…สนามแข่งเปิด"],
    },
  },
  {
    axis: "A",
    prompt: { ko: "낚싯대를 흔들면 반응은?", th: "ทาสแกว่งไม้ตกแมว…เจ้านายทำไง?" },
    options: {
      ko: ["“그건 네가 해.”", "몇 번 툭 치고 끝낸다", "눈은 따라가지만 몸은 느긋하다", "진지하게 추적한다", "끝까지 집요하게 사냥한다"],
      th: ["“เธอเล่นเองไป”", "แตะๆ พอเป็นพิธี", "ตาตาม…แต่ตัวขอชิล", "จ้อง-ย่อง-พุ่ง แบบจริงจัง", "ล่าไม่เลิก จนกว่าจะชนะ"],
    },
  },

  // 🌙 정서안정(E) — Q9~Q11 역문항
  {
    axis: "E",
    reverse: true,
    prompt: { ko: "청소기를 켰을 때 우리 주인님은?", th: "เปิดเครื่องดูดฝุ่นปุ๊บ เจ้านายทำไง?" },
    options: {
      ko: ["크게 놀라거나 공격적으로 반응한다", "바로 도망가 숨는다", "긴장한 채 멀리서 지켜본다", "불편해하지만 자리를 지킨다", "별 신경 쓰지 않는다"],
      th: ["ตกใจหนัก/โมโหเลย", "หนีทันที ไปซ่อน", "เกร็งๆ แล้วยืนดูห่างๆ", "ไม่ชอบนะ แต่ยังอยู่", "ช่างมัน…ไม่สน"],
    },
  },
  {
    axis: "E",
    reverse: true,
    prompt: { ko: "갑자기 큰 소리가 났을 때 반응은?", th: "มีเสียงดังปุ๊บ เจ้านายทำไง?" },
    options: {
      ko: ["깜짝 놀라 크게 반응한다", "급히 숨는다", "긴장 상태를 유지한다", "잠시 멈췄다가 금방 회복한다", "“뭐였지?” 하고 지나간다"],
      th: ["สะดุ้งสุดตัว มีอาการชัดเจน", "รีบหายไปก่อน", "เกร็งๆ คอยดูสถานการณ์", "หยุดแป๊บแล้วกลับมาได้", "“อะไรนะ?” แล้วก็ชิลต่อ"],
    },
  },
  {
    axis: "E",
    reverse: true,
    prompt: { ko: "동물병원 가는 날, 우리 주인님은?", th: "วันไปหาหมอ…เจ้านายเป็นไง?" },
    options: {
      ko: ["격렬하게 저항한다", "이동장부터 불안해한다", "긴장하지만 참고 버틴다", "비교적 얌전한 편이다", "생각보다 침착하다"],
      th: ["ต่อต้านสุดกำลัง", "เห็นกรงก็เริ่มเครียด", "เกร็งแต่ยังพอทนได้", "ค่อนข้างเรียบร้อยนะ", "นิ่งกว่าที่คิด"],
    },
  },
  {
    axis: "E",
    prompt: { ko: "새로운 장소에 갔을 때 모습은?", th: "ไปที่ใหม่ๆ แล้วเจ้านายทำไง?" },
    options: {
      ko: ["극도로 예민해진다", "한동안 숨어 있다", "한참 관찰 후 천천히 나온다", "조심스럽게 탐색한다", "금방 자기 구역처럼 행동한다"],
      th: ["ไวมาก เครียดชัดเจน", "ขอซ่อนก่อนยาวๆ", "ส่องนาน…แล้วค่อยออก", "สำรวจแบบระวังๆ", "แป๊บเดียวก็ทำเหมือนเป็นบ้านตัวเอง"],
    },
  },
];

type ResultPack = {
  characterName: { ko: string; th: string };
  oneLiner: { ko: string; th: string };
  tags: { ko: string[]; th: string[] };
  behaviors: { ko: string[]; th: string[] };
  heart: { ko: string[]; th: string[] };
  guide: { ko: string[]; th: string[] };
  caution: { ko: string[]; th: string[] };
};

const results: Record<ResultCode, ResultPack> = {
  SAE: {
    characterName: { ko: "껌딱지애교냥 💕", th: "แมวกาวใจทาส 💕" },
    oneLiner: { ko: "사람 곁이 제일 편한 안정 애착형이다.", th: "อยู่ใกล้ทาสแล้วใจนิ่งสุดๆ" },
    tags: { ko: ["#애착형", "#동행러", "#안정감"], th: ["#ติดทาส", "#ขออยู่ใกล้ๆ", "#ใจนิ่ง"] },
    behaviors: {
      ko: ["집사가 움직이면 슬쩍 따라온다.", "같은 공간에 있으면 더 편해 보인다.", "무릎/옆자리 선호도가 높다."],
      th: ["ทาสขยับ…ฉันก็ขยับตาม", "อยู่ห้องเดียวกันแล้วดูสบายใจ", "ชอบยึดข้างๆ/ตักเป็นพิเศษ"],
    },
    heart: {
      ko: ["네가 움직이면 나도 따라가고,", "같은 공간에 있는 게 제일 편해.", "그게 내 방식의 애정이야."],
      th: ["เธอขยับ…ฉันก็ขยับตาม", "แค่อยู่ห้องเดียวกันก็อุ่นใจ", "นี่แหละวิธีบอกรักของฉัน"],
    },
    guide: {
      ko: ["하루에 5~10분이라도 매일 놀아줘.", "눈을 자주 마주치고 이름을 불러줘.", "갑자기 사라지지 말고, 존재감만 있어줘."],
      th: ["เล่นด้วยกันทุกวัน 5–10 นาทีพอ", "สบตา/เรียกชื่อบ่อยๆ ฉันชอบ", "อย่าหายเงียบๆ ฉันจะงงว่าไปไหน"],
    },
    caution: {
      ko: ["갑작스런 생활 루틴 변화는 불안할 수 있어.", "관심이 부족하면 집사 호출이 잦아질 수 있어."],
      th: ["เปลี่ยนรูทีนกะทันหัน ฉันจะไม่มั่นใจ", "ถ้าถูกละเลย…ฉันจะเรียกทาสบ่อยขึ้นเอง"],
    },
  },
  SAT: {
    characterName: { ko: "텐션폭발놀자냥 ⚡", th: "แมวโหมดเล่นเดี๋ยวนี้ ⚡" },
    oneLiner: { ko: "놀 땐 풀파워, 싫으면 티가 확 나는 타입이다.", th: "สนุกคือสุด…ไม่ชอบคือเห็นชัด" },
    tags: { ko: ["#고텐션", "#사냥본능", "#예민포인트"], th: ["#พลังเต็ม", "#โหมดล่า", "#ไวต่อสิ่งกระตุ้น"] },
    behaviors: {
      ko: ["장난감만 꺼내면 눈빛이 달라진다.", "흥분하면 갑자기 뛰기 시작한다.", "큰 소음/갑작스런 자극엔 예민해질 수 있다."],
      th: ["เห็นของเล่นแล้วตาเปลี่ยนทันที", "คึกขึ้นมาแล้ววิ่งแบบไม่มีเหตุผล", "เสียงดัง/สิ่งกระตุ้นฉับพลันทำให้ไวได้"],
    },
    heart: {
      ko: ["에너지는 넘치는데,", "마음은 생각보다 섬세해.", "재밌으면 최고, 싫으면 바로 티 나."],
      th: ["พลังมีเต็มหลอด", "แต่ใจฉันบอบบางกว่าที่คิด", "สนุกก็สุด—ไม่ชอบก็ออกอาการทันที"],
    },
    guide: {
      ko: ["짧게 자주(3~5분×2~3회) 놀아줘.", "과열되면 잠깐 쉬는 시간(숨을 곳) 줘.", "소리/움직임 자극은 천천히 적응시키기."],
      th: ["เล่นสั้นๆ แต่บ่อย (3–5 นาที × 2–3 รอบ)", "คึกเกินไปให้พัก/มีที่หลบ", "เสียงดัง/การเคลื่อนไหวแรง ค่อยๆ ปรับ"],
    },
    caution: {
      ko: ["흥분이 쌓이면 공격/과잉행동으로 보일 수 있어.", "갑작스런 큰 소음은 스트레스가 될 수 있어."],
      th: ["คึกสะสมอาจดูเหมือนดุ/งับเล่นแรง", "เสียงดังฉับพลันทำให้เครียดได้"],
    },
  },
  SCE: {
    characterName: { ko: "루틴수호집주인냥 😼", th: "แมวเจ้าบ้านสายรูทีน 😼" },
    oneLiner: { ko: "루틴과 공간이 지켜지면 마음이 편한 타입이다.", th: "รูทีนกับพื้นที่ชัดๆ แล้วใจสงบ" },
    tags: { ko: ["#루틴중요", "#영역확실", "#조용한애정"], th: ["#รักรูทีน", "#พื้นที่ต้องชัด", "#รักเงียบๆ"] },
    behaviors: {
      ko: ["밥/놀이 시간이 어긋나면 표정이 달라진다.", "정해진 자리(캣타워/창가)를 고집한다.", "다가오면 조용히 곁에 머문다."],
      th: ["เวลาข้าว/เล่นเลื่อนแล้วมีงอน", "ยึดมุมประจำ (คอนโด/หน้าต่าง)", "พอไว้ใจแล้วจะอยู่ใกล้ๆ แบบเงียบๆ"],
    },
    heart: {
      ko: ["익숙한 게 편하고,", "내 공간이 지켜지면 마음이 안정돼.", "조용히 곁에 있는 타입이야."],
      th: ["ฉันชอบความคุ้นเคย", "พื้นที่ของฉันชัดๆ แล้วใจสงบ", "ไม่ต้องหวือหวา แค่อยู่ใกล้ๆ ก็พอ"],
    },
    guide: {
      ko: ["밥/놀이/휴식 시간을 일정하게 유지해줘.", "정해진 자리(숨는 곳/관찰 자리)를 만들어줘.", "다가갈 땐 천천히, 예고하고 움직여줘."],
      th: ["เวลาข้าว/เล่น/พัก ให้สม่ำเสมอ", "มีมุมประจำ (ที่หลบ/จุดส่อง)", "เข้าหาแบบช้าๆ อย่าพุ่งใส่"],
    },
    caution: { ko: ["환경 변화가 잦으면 조용히 스트레스가 쌓일 수 있어."], th: ["เปลี่ยนของ/ย้ายเฟอร์บ่อยๆ ฉันเครียดสะสมเงียบๆ ได้"] },
  },
  SCT: {
    characterName: { ko: "까다로운취향냥 👑", th: "แมวรสนิยมจัด 👑" },
    oneLiner: { ko: "낯선 건 경계하고 익숙한 걸 고르는 타입이다.", th: "ของใหม่ระแวง…ของเดิมคือที่สุด" },
    tags: { ko: ["#선택형", "#변화싫어", "#신뢰천천히"], th: ["#เลือกเก่ง", "#ไม่ชอบเปลี่ยน", "#ไว้ใจช้าแต่ชัวร์"] },
    behaviors: {
      ko: ["새 사료/간식은 바로 안 먹고 검증부터 한다.", "새 물건은 멀리서 관찰 후 슬쩍 접근한다.", "마음 열리면 오래 가는 편이다."],
      th: ["ของกินใหม่ต้องตรวจสอบก่อน", "ของใหม่ขอส่องไกลๆ แล้วค่อยแตะ", "แต่ถ้าไว้ใจแล้วจะยาวๆ เลย"],
    },
    heart: {
      ko: ["낯선 건 경계하고,", "익숙한 게 제일 편해.", "마음이 열리면 오래 가는 편이야."],
      th: ["ของใหม่ฉันระแวงนิดนึง", "ของเดิมๆ คือสบายใจ", "แต่ถ้าไว้ใจแล้ว ฉันยาวๆ เลย"],
    },
    guide: {
      ko: ["사료/간식 바꿀 땐 7~10일에 걸쳐 천천히.", "새 물건은 한 번에 많이 두지 말고 하나씩.", "싫어하는 신호(피하기/숨기)를 존중해줘."],
      th: ["เปลี่ยนอาหาร/ขนม ค่อยๆ 7–10 วัน", "ของใหม่ทีละชิ้น อย่าถาโถม", "ถ้าฉันหลบ/ไม่เอา ให้เคารพสัญญาณ"],
    },
    caution: { ko: ["억지로 ‘좋아해!’ 강요하면 더 거부감이 커질 수 있어."], th: ["บังคับให้ ‘ต้องชอบ’ จะยิ่งต่อต้านนะทาส"] },
  },
  IAE: {
    characterName: { ko: "새벽폭주냥 🌙", th: "แมวตีสามสนามแข่ง 🌙" },
    oneLiner: { ko: "조용해지면 에너지가 차오르는 야행성 타입이다.", th: "บ้านเงียบเมื่อไหร่…พลังฉันมา" },
    tags: { ko: ["#야행성", "#밤텐션", "#혼놀가능"], th: ["#สายดึก", "#คึกตอนคืน", "#เล่นคนเดียวได้"] },
    behaviors: {
      ko: ["밤에 갑자기 질주 타임이 열린다.", "낮엔 얌전하다가 밤에 각성한다.", "혼자 놀 장난감이 있으면 만족도가 오른다."],
      th: ["กลางคืนอยู่ดีๆ ก็วิ่งเหมือนมีงานแข่ง", "กลางวันชิล—กลางคืนตื่น", "มีของเล่นเล่นเองแล้วแฮปปี้ขึ้น"],
    },
    heart: {
      ko: ["조용해지면 에너지가 차오르고,", "그때가 제일 자유로워.", "그래서 갑자기 뛰기 시작해."],
      th: ["พอบ้านเงียบ…พลังฉันก็มาจ้า", "ตอนนั้นแหละอิสระสุดๆ", "เลยต้องวิ่งให้โลกรู้"],
    },
    guide: {
      ko: ["잠들기 전 10분 ‘마지막 놀이’ 추천.", "밤에 혼자 놀 장난감(공/트랙) 준비.", "낮에 활동을 분산(창가 놀이/간식 퍼즐)."],
      th: ["ก่อนนอนเล่น 10 นาที ‘รอบสุดท้าย’", "เตรียมของเล่นเล่นคนเดียวตอนกลางคืน", "กระจายกิจกรรมตอนกลางวัน (หน้าต่าง/ของเล่นปริศนา)"],
    },
    caution: { ko: ["야간 활동을 억지로 막기보다 루틴으로 유도해줘."], th: ["อย่าห้ามแบบดื้อๆ ตั้งรูทีนให้แทนจะเวิร์กกว่า"] },
  },
  IAT: {
    characterName: { ko: "독립왕냥 👑", th: "แมวราชาเดี่ยว 👑" },
    oneLiner: { ko: "내가 원할 때만 다가가는 독립형이다.", th: "จะเข้าใกล้เมื่อฉันพร้อมเท่านั้น" },
    tags: { ko: ["#독립형", "#선택적스킨십", "#신뢰천천히"], th: ["#สายเดี่ยว", "#กอดแบบเลือกได้", "#ไว้ใจค่อยๆ"] },
    behaviors: {
      ko: ["부르면 안 오다가, 자기가 원할 때만 온다.", "스킨십은 ‘내 타이밍’이 중요하다.", "혼자 놀거리만 있어도 잘 지낸다."],
      th: ["เรียกไม่มา…แต่เดี๋ยวฉันอยากมาก็มาเอง", "กอดได้เมื่อฉันอนุญาต", "มีของเล่นเล่นเองแล้วอยู่ได้สบาย"],
    },
    heart: {
      ko: ["혼자 있는 시간이 편하고,", "내가 정한 타이밍에 다가가고 싶어.", "그래도 신뢰는 천천히 쌓여."],
      th: ["อยู่คนเดียวสบายใจ", "จะเข้าใกล้เมื่อฉันพร้อม", "ไว้ใจได้…แต่ขอเวลาหน่อย"],
    },
    guide: {
      ko: ["혼자 놀 거리(터널/스크래처/트랙)를 만들어줘.", "스킨십은 ‘선택권’을 줘 (다가오면 OK).", "사냥놀이(낚싯대/숨바꼭질)로 교감."],
      th: ["มีของเล่นเล่นคนเดียว (อุโมงค์/ที่ลับเล็บ/รางบอล)", "ให้ ‘สิทธิ์เลือก’ เรื่องกอด ถ้าฉันมาเองคือโอเค", "เล่นแนวล่า (ไม้ตกแมว/ซ่อนหา) เพื่อเชื่อมใจ"],
    },
    caution: { ko: ["억지로 안거나 붙잡으면 관계가 멀어질 수 있어."], th: ["จับกอด/บังคับมากไป ความสัมพันธ์จะถอยได้นะ"] },
  },
  ICE: {
    characterName: { ko: "거리두기프로냥 😼", th: "แมวเว้นระยะมือโปร 😼" },
    oneLiner: { ko: "좋아하긴 하는데, 거리는 꼭 필요한 타입이다.", th: "ชอบนะ…แต่ต้องมีระยะ" },
    tags: { ko: ["#거리감", "#조용한동거", "#먼저오면OK"], th: ["#ต้องมีระยะ", "#อยู่ร่วมแบบเงียบๆ", "#ฉันมาก่อนค่อยกอด"] },
    behaviors: {
      ko: ["가까이 붙으면 피하고, 조금 떨어지면 곁에 온다.", "같은 공간에서 ‘동거’하는 걸 좋아한다.", "먼저 다가올 때까지 기다리면 관계가 좋아진다."],
      th: ["ติดมากไปฉันหลบ…แต่ถ้าพอดีๆ ฉันจะมาเอง", "อยู่ห้องเดียวกันแบบไม่วุ่นวายคือดีที่สุด", "รอให้ฉันเข้าหาเองแล้วจะเวิร์ก"],
    },
    heart: {
      ko: ["혼자가 편한데,", "네가 너무 멀어지는 건 또 싫어.", "적당한 거리가 딱 좋아."],
      th: ["ฉันชอบอยู่เงียบๆ", "แต่ถ้าเธอหายไปก็ไม่โอเค", "ระยะพอดีๆ คือดีที่สุด"],
    },
    guide: {
      ko: ["내가 먼저 다가올 때까지 기다려줘.", "같은 공간에 조용히 있어주는 게 최고.", "숨을 공간(박스/캣타워 아래) 확보해줘."],
      th: ["รอให้ฉันเข้าหาเอง", "อยู่ห้องเดียวกันแบบเงียบๆ คือรักแล้ว", "เตรียมที่หลบ (กล่อง/ใต้คอนโดแมว)"],
    },
    caution: { ko: ["억지 스킨십/갑작스런 접근은 스트레스 신호를 만들 수 있어."], th: ["กอดฝืนๆ / พุ่งเข้าใส่ทันที ทำให้เครียดได้"] },
  },
  ICT: {
    characterName: { ko: "감시자관찰냥 👀", th: "แมวสายส่อง 👀" },
    oneLiner: { ko: "조용히 관찰하다가 안전하면 천천히 다가가는 타입이다.", th: "เงียบๆ ส่องก่อน…ปลอดภัยค่อยเข้าใกล้" },
    tags: { ko: ["#관찰형", "#신중함", "#변화민감"], th: ["#สายส่อง", "#ระวังตัว", "#ไวต่อการเปลี่ยนแปลง"] },
    behaviors: {
      ko: ["손님/새 물건은 멀리서 관찰부터 한다.", "갑작스런 변화가 반복되면 예민해진다.", "안전하다고 느끼면 천천히 거리를 좁힌다."],
      th: ["คนใหม่/ของใหม่ ขอส่องไกลๆ ก่อน", "เปลี่ยนบ่อยๆ แล้วฉันไวขึ้นได้", "ถ้าปลอดภัยจะค่อยๆ เข้าใกล้เอง"],
    },
    heart: {
      ko: ["말은 없지만 관찰은 꼼꼼하고,", "안전하다고 느끼면 천천히 다가가.", "낯선 변화는 조금 부담스러워."],
      th: ["ฉันไม่พูดเยอะ แต่ส่องละเอียด", "ถ้ารู้สึกปลอดภัยจะค่อยๆ เข้าใกล้", "ของแปลก/การเปลี่ยนแปลงเยอะๆ ทำให้กังวล"],
    },
    guide: {
      ko: ["창가/높은 곳 같은 관찰 포인트를 만들어줘.", "새 환경/새 사람은 ‘천천히’ 적응 시간을.", "예측 가능한 루틴이 안정감을 줘."],
      th: ["ทำจุดส่อง (หน้าต่าง/ที่สูง) ให้ฉัน", "คนใหม่/ที่ใหม่ ให้เวลาปรับตัวแบบช้าๆ", "รูทีนเดิมๆ ทำให้ใจนิ่ง"],
    },
    caution: { ko: ["갑작스런 소음/방문객/가구 이동이 반복되면 예민해질 수 있어."], th: ["เสียงดัง/แขกมา/ย้ายของบ่อยๆ อาจทำให้ไวขึ้น"] },
  },
};

function axisLabel(axis: Axis, lang: Lang) {
  if (lang === "th") {
    if (axis === "S") return "เข้าสังคม";
    if (axis === "A") return "พลังงาน";
    return "ความนิ่งใจ";
  }
  if (axis === "S") return "사회성";
  if (axis === "A") return "활동성";
  return "정서안정";
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** 4~20 점수를 1~5 단계로 변환 */
function toLevel5(v: number) {
  const clamped = clamp(v, 4, 20);
  // 0~1로 정규화 후 0~4로 확장, 반올림 후 +1 => 1~5
  const normalized = (clamped - 4) / 16;
  return clamp(Math.round(normalized * 4) + 1, 1, 5);
}

function Meter({
  level,
  style = "cat",
}: {
  level: number; // 1~5
  style?: MeterStyle;
}) {
  const filled = style === "star" ? "★" : "🐱";
  const empty = style === "star" ? "☆" : "🐾";
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "flex-end" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ fontSize: 16, lineHeight: 1 }}>
          {i < level ? filled : empty}
        </span>
      ))}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(LANG_KEY) : null;
      return saved === "th" || saved === "ko" ? (saved as Lang) : "ko";
    } catch {
      return "ko";
    }
  });

  const t = uiText[lang];

  const changeLang = (next: Lang) => {
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {}
  };

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

  const resultPack = resultCode ? results[resultCode] : null;

  const axisLevels = useMemo(() => {
    return [
      { axis: "S" as Axis, level: toLevel5(axisScores.S) },
      { axis: "A" as Axis, level: toLevel5(axisScores.A) },
      { axis: "E" as Axis, level: toLevel5(axisScores.E) },
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
    const score = optionIndex + 1;
    setAnswers((prev) => [...prev, score]);

    if (answers.length + 1 >= questions.length) {
      setScreen("done");
      setManualOpen(false);
    }
  };

  const makeResultPngDataUrl = async () => {
    if (!shareCardRef.current) throw new Error("shareCardRef is null");
    // 폰트 로딩 완료 후 캡처(실패율 감소)
    // @ts-ignore
    if (document?.fonts?.ready) {
      // @ts-ignore
      await document.fonts.ready;
    }
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
      alert(t.saveFailed);
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const shareToFriends = async () => {
    const shareText = t.shareText;
    const shareUrl = window.location.href;

    try {
      setIsSharing(true);

      const dataUrl = await makeResultPngDataUrl();
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `CatBTI_${resultCode || "result"}.png`, { type: blob.type || "image/png" });

      const navAny = navigator as any;
      const canShareFiles = typeof navAny?.canShare === "function" && navAny.canShare({ files: [file] });
      const canShare = typeof navAny?.share === "function";

      if (canShare && canShareFiles) {
        await navAny.share({ title: "CatBTI", text: shareText, files: [file], url: shareUrl });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        alert(t.copiedLink);
        return;
      }

      alert(`${t.copiedLink}\n\n${shareUrl}`);
    } catch (e) {
      console.error(e);
      alert(t.shareFailed);
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

  const langBtn = (active: boolean): React.CSSProperties => ({
    padding: "8px 10px",
    borderRadius: 999,
    border: active ? "2px solid #111" : "1px solid #ddd",
    background: active ? "#111" : "white",
    color: active ? "white" : "#111",
    cursor: "pointer",
    fontSize: 13,
  });

  const chipStyle: React.CSSProperties = {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.78)",
  };

  const progressPct = Math.round(((Math.min(currentIndex + 1, questions.length)) / questions.length) * 100);

  const qPrompt = currentQ ? currentQ.prompt[lang] : "";
  const qOptions = currentQ ? currentQ.options[lang] : null;

  return (
    <div style={bgStyle}>
      <div style={cardStyle}>
        {screen === "home" && (
          <>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
              <button onClick={() => changeLang("ko")} style={langBtn(lang === "ko")}>
                {t.langBtnKo}
              </button>
              <button onClick={() => changeLang("th")} style={langBtn(lang === "th")}>
                {t.langBtnTh}
              </button>
            </div>

            <img src={catHome} alt="cat home" style={imageStyle} />
            <h1 style={{ margin: 0, letterSpacing: -0.3 }}>{t.brandLine}</h1>
            <p style={{ marginTop: 10, marginBottom: 0, opacity: 0.82, fontSize: 14, lineHeight: 1.5 }}>{t.tagline}</p>

            <button onClick={startQuiz} style={primaryBtn}>
              {t.start}
            </button>
          </>
        )}

        {screen === "quiz" && currentQ && qOptions && (
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
                {t.prev}
              </button>

              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {currentIndex + 1} / {questions.length}
              </div>
            </div>

            <div style={{ height: 8, background: "#eee", borderRadius: 999, overflow: "hidden", marginTop: 10 }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: "#111", transition: "width 200ms ease" }} />
            </div>

            <h2 style={{ marginTop: 16, marginBottom: 12, fontSize: 20, letterSpacing: -0.2, lineHeight: 1.35 }}>
              {qPrompt.split("\n").map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < qPrompt.split("\n").length - 1 ? <br /> : null}
                </span>
              ))}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              {qOptions.map((txt, idx) => (
                <button
                  key={idx}
                  onClick={() => pickOption(idx)}
                  style={optionBtnBase}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 4 }}>
                    {t.choiceLabel} {idx + 1}
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.35 }}>{txt}</div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.6 }}>{t.quizHint}</div>
          </>
        )}

        {screen === "done" && resultPack && (
          <>
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
                <div style={{ fontSize: 12, opacity: 0.75 }}>{t.resultLabel}</div>
                <h2 style={{ margin: "8px 0 6px", letterSpacing: -0.3 }}>{resultPack.characterName[lang]}</h2>

                <div
                  style={{
                    marginTop: 8,
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.88)",
                    fontSize: 14,
                  }}
                >
                  “{resultPack.oneLiner[lang]}”
                </div>

                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {resultPack.tags[lang].map((tag, i) => (
                    <span key={i} style={chipStyle}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: 12, textAlign: "left" }}>
                  <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>{t.behaviorsTitle}</div>
                  <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 14 }}>
                    {resultPack.behaviors[lang].map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: 12, opacity: 0.85, fontSize: 14, lineHeight: 1.55 }}>
                  {resultPack.heart[lang].map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>

              {/* ✅ 성향 요약: 기존 XX/20 제거 → 5개 아이콘 게이지로 변경 */}
              <div style={{ marginTop: 14, textAlign: "left" }}>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10 }}>{t.traitSummary}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {axisLevels.map((b) => (
                    <div
                      key={b.axis}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 13, opacity: 0.85 }}>{axisLabel(b.axis, lang)}</div>
                      <Meter level={b.level} style={METER_STYLE} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 10, fontSize: 11, opacity: 0.55, textAlign: "center" }}>{t.footerShare}</div>
            </div>

            <button onClick={() => setManualOpen((v) => !v)} style={{ ...secondaryBtn, marginTop: 14, textAlign: "left", fontWeight: 600 }}>
              {manualOpen ? t.manualClose : t.manualOpen}
            </button>

            {manualOpen && (
              <div style={{ marginTop: 10, padding: 14, borderRadius: 16, border: "1px solid #eee", background: "rgba(255,255,255,0.86)", textAlign: "left" }}>
                <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 8 }}>{t.butlerGuide}</div>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 14 }}>
                  {resultPack.guide[lang].map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>

                <div style={{ marginTop: 12, fontSize: 13, opacity: 0.85, marginBottom: 8 }}>{t.caution}</div>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 14 }}>
                  {resultPack.caution[lang].map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={shareToFriends} style={primaryBtn} disabled={isSharing || isDownloading}>
              {isSharing ? t.sharePreparing : t.shareBtn}
            </button>

            <button onClick={downloadResultImage} style={secondaryBtn} disabled={isSharing || isDownloading}>
              {isDownloading ? t.downloadPreparing : t.downloadBtn}
            </button>

            <button onClick={resetAll} style={secondaryBtn}>
              {t.retry}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
