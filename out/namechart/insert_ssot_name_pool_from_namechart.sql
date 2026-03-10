-- Generated from out/namechart/namechart_chart_m.json + namechart_chart_f.json
-- Purpose: insert new names into SSOT pools with source/target dedupe and tier assignment by totalBirths using existing SSOT tier ratios (fallback to local pool ratios)

BEGIN;

-- Male import
WITH
src_json(doc) AS (
  VALUES ($mjson$[
  {
    "rank": 1,
    "name": "서준",
    "totalBirths": 43180,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 2,
    "name": "민준",
    "totalBirths": 42578,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 3,
    "name": "도윤",
    "totalBirths": 38127,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 4,
    "name": "시우",
    "totalBirths": 34970,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 5,
    "name": "하준",
    "totalBirths": 34041,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 6,
    "name": "예준",
    "totalBirths": 33197,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 7,
    "name": "지호",
    "totalBirths": 31513,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 8,
    "name": "주원",
    "totalBirths": 30969,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 9,
    "name": "도현",
    "totalBirths": 27205,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 10,
    "name": "지후",
    "totalBirths": 27050,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 11,
    "name": "준우",
    "totalBirths": 26572,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 12,
    "name": "준서",
    "totalBirths": 25504,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 13,
    "name": "우진",
    "totalBirths": 24689,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 14,
    "name": "건우",
    "totalBirths": 24514,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 15,
    "name": "현우",
    "totalBirths": 24506,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 16,
    "name": "선우",
    "totalBirths": 23742,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 17,
    "name": "지훈",
    "totalBirths": 23231,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 18,
    "name": "유준",
    "totalBirths": 22275,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 19,
    "name": "은우",
    "totalBirths": 22086,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 20,
    "name": "연우",
    "totalBirths": 21455,
    "gender": null,
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 21,
    "name": "이준",
    "totalBirths": 20409,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 22,
    "name": "서진",
    "totalBirths": 20119,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 23,
    "name": "시윤",
    "totalBirths": 18273,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 24,
    "name": "민재",
    "totalBirths": 18242,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 25,
    "name": "정우",
    "totalBirths": 17499,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 26,
    "name": "현준",
    "totalBirths": 17407,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 27,
    "name": "윤우",
    "totalBirths": 16982,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 28,
    "name": "수호",
    "totalBirths": 15932,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 29,
    "name": "승우",
    "totalBirths": 15327,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 30,
    "name": "지우",
    "totalBirths": 15314,
    "gender": "F",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 31,
    "name": "유찬",
    "totalBirths": 15211,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 32,
    "name": "이안",
    "totalBirths": 14692,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 33,
    "name": "승현",
    "totalBirths": 14376,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 34,
    "name": "지환",
    "totalBirths": 14336,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 35,
    "name": "준혁",
    "totalBirths": 14014,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 36,
    "name": "시후",
    "totalBirths": 13435,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 37,
    "name": "진우",
    "totalBirths": 13205,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 38,
    "name": "승민",
    "totalBirths": 12806,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 39,
    "name": "민성",
    "totalBirths": 12482,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 40,
    "name": "수현",
    "totalBirths": 12408,
    "gender": null,
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 41,
    "name": "지원",
    "totalBirths": 12355,
    "gender": "F",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 42,
    "name": "준영",
    "totalBirths": 11944,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 43,
    "name": "우주",
    "totalBirths": 11682,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 44,
    "name": "은호",
    "totalBirths": 11628,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 45,
    "name": "시현",
    "totalBirths": 11615,
    "gender": null,
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 46,
    "name": "재윤",
    "totalBirths": 11558,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 47,
    "name": "태윤",
    "totalBirths": 11414,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 48,
    "name": "지한",
    "totalBirths": 11353,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 49,
    "name": "한결",
    "totalBirths": 11170,
    "gender": "M",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 50,
    "name": "지안",
    "totalBirths": 11062,
    "gender": "F",
    "page": 1,
    "pageGender": "M"
  },
  {
    "rank": 51,
    "name": "시온",
    "totalBirths": 10617,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 52,
    "name": "서우",
    "totalBirths": 10611,
    "gender": null,
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 53,
    "name": "윤호",
    "totalBirths": 10452,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 54,
    "name": "은찬",
    "totalBirths": 10319,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 55,
    "name": "시원",
    "totalBirths": 10113,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 56,
    "name": "이현",
    "totalBirths": 10046,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 57,
    "name": "민우",
    "totalBirths": 9910,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 58,
    "name": "하진",
    "totalBirths": 9841,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 59,
    "name": "동현",
    "totalBirths": 9736,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 60,
    "name": "재원",
    "totalBirths": 9525,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 61,
    "name": "우빈",
    "totalBirths": 9515,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 62,
    "name": "민규",
    "totalBirths": 9505,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 63,
    "name": "민찬",
    "totalBirths": 9408,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 64,
    "name": "도하",
    "totalBirths": 9392,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 65,
    "name": "로운",
    "totalBirths": 9387,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 66,
    "name": "율",
    "totalBirths": 9365,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 67,
    "name": "재민",
    "totalBirths": 9286,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 68,
    "name": "하율",
    "totalBirths": 9101,
    "gender": "F",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 69,
    "name": "지율",
    "totalBirths": 8821,
    "gender": null,
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 70,
    "name": "준호",
    "totalBirths": 8776,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 71,
    "name": "윤재",
    "totalBirths": 8722,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 72,
    "name": "준",
    "totalBirths": 8467,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 73,
    "name": "태오",
    "totalBirths": 8385,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 74,
    "name": "하민",
    "totalBirths": 8377,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 75,
    "name": "지민",
    "totalBirths": 8336,
    "gender": "F",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 76,
    "name": "민호",
    "totalBirths": 8289,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 77,
    "name": "성민",
    "totalBirths": 8286,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 78,
    "name": "승준",
    "totalBirths": 8227,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 79,
    "name": "태민",
    "totalBirths": 8119,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 80,
    "name": "재현",
    "totalBirths": 8114,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 81,
    "name": "이든",
    "totalBirths": 7999,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 82,
    "name": "현서",
    "totalBirths": 7990,
    "gender": null,
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 83,
    "name": "지성",
    "totalBirths": 7870,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 84,
    "name": "성현",
    "totalBirths": 7839,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 85,
    "name": "하람",
    "totalBirths": 7817,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 86,
    "name": "예성",
    "totalBirths": 7812,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 87,
    "name": "태현",
    "totalBirths": 7658,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 88,
    "name": "규민",
    "totalBirths": 7652,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 89,
    "name": "다온",
    "totalBirths": 7565,
    "gender": null,
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 90,
    "name": "윤성",
    "totalBirths": 7545,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 91,
    "name": "성준",
    "totalBirths": 7525,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 92,
    "name": "태양",
    "totalBirths": 7488,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 93,
    "name": "민혁",
    "totalBirths": 7368,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 94,
    "name": "정민",
    "totalBirths": 7365,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 95,
    "name": "주안",
    "totalBirths": 7350,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 96,
    "name": "도훈",
    "totalBirths": 7347,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 97,
    "name": "지오",
    "totalBirths": 7179,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 98,
    "name": "주호",
    "totalBirths": 7142,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 99,
    "name": "은성",
    "totalBirths": 7100,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 100,
    "name": "예찬",
    "totalBirths": 7024,
    "gender": "M",
    "page": 2,
    "pageGender": "M"
  },
  {
    "rank": 101,
    "name": "도영",
    "totalBirths": 7012,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 102,
    "name": "준희",
    "totalBirths": 6970,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 103,
    "name": "준수",
    "totalBirths": 6948,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 104,
    "name": "건",
    "totalBirths": 6917,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 105,
    "name": "도율",
    "totalBirths": 6648,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 106,
    "name": "민석",
    "totalBirths": 6608,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 107,
    "name": "하랑",
    "totalBirths": 6514,
    "gender": null,
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 108,
    "name": "강민",
    "totalBirths": 6413,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 109,
    "name": "태준",
    "totalBirths": 6363,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 110,
    "name": "지완",
    "totalBirths": 6300,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 111,
    "name": "도준",
    "totalBirths": 6261,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 112,
    "name": "시율",
    "totalBirths": 6195,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 113,
    "name": "정현",
    "totalBirths": 5956,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 114,
    "name": "준성",
    "totalBirths": 5932,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 115,
    "name": "승호",
    "totalBirths": 5919,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 116,
    "name": "라온",
    "totalBirths": 5898,
    "gender": null,
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 117,
    "name": "현수",
    "totalBirths": 5893,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 118,
    "name": "재하",
    "totalBirths": 5892,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 119,
    "name": "승원",
    "totalBirths": 5849,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 120,
    "name": "성빈",
    "totalBirths": 5846,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 121,
    "name": "우현",
    "totalBirths": 5808,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 122,
    "name": "시안",
    "totalBirths": 5804,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 123,
    "name": "서율",
    "totalBirths": 5767,
    "gender": "F",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 124,
    "name": "단우",
    "totalBirths": 5764,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 125,
    "name": "시훈",
    "totalBirths": 5645,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 126,
    "name": "민서",
    "totalBirths": 5505,
    "gender": "F",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 127,
    "name": "하온",
    "totalBirths": 5497,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 128,
    "name": "시완",
    "totalBirths": 5417,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 129,
    "name": "윤",
    "totalBirths": 5381,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 130,
    "name": "도원",
    "totalBirths": 5358,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 131,
    "name": "건희",
    "totalBirths": 5351,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 132,
    "name": "주환",
    "totalBirths": 5347,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 133,
    "name": "원준",
    "totalBirths": 5299,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 134,
    "name": "유안",
    "totalBirths": 5292,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 135,
    "name": "정후",
    "totalBirths": 5261,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 136,
    "name": "이한",
    "totalBirths": 5246,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 137,
    "name": "서후",
    "totalBirths": 5174,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 138,
    "name": "도경",
    "totalBirths": 5147,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 139,
    "name": "정훈",
    "totalBirths": 5145,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 140,
    "name": "현",
    "totalBirths": 5127,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 141,
    "name": "정원",
    "totalBirths": 5122,
    "gender": null,
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 142,
    "name": "연준",
    "totalBirths": 5114,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 143,
    "name": "온유",
    "totalBirths": 5093,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 144,
    "name": "민수",
    "totalBirths": 5081,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 145,
    "name": "동하",
    "totalBirths": 5007,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 146,
    "name": "주영",
    "totalBirths": 4968,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 147,
    "name": "승윤",
    "totalBirths": 4958,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 148,
    "name": "시환",
    "totalBirths": 4937,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 149,
    "name": "유건",
    "totalBirths": 4914,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 150,
    "name": "민건",
    "totalBirths": 4906,
    "gender": "M",
    "page": 3,
    "pageGender": "M"
  },
  {
    "rank": 151,
    "name": "현민",
    "totalBirths": 4900,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 152,
    "name": "민기",
    "totalBirths": 4851,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 153,
    "name": "가온",
    "totalBirths": 4836,
    "gender": null,
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 154,
    "name": "승빈",
    "totalBirths": 4786,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 155,
    "name": "현성",
    "totalBirths": 4769,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 156,
    "name": "경민",
    "totalBirths": 4751,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 157,
    "name": "세현",
    "totalBirths": 4691,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 158,
    "name": "재준",
    "totalBirths": 4672,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 159,
    "name": "서호",
    "totalBirths": 4652,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 160,
    "name": "태율",
    "totalBirths": 4650,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 161,
    "name": "호준",
    "totalBirths": 4612,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 162,
    "name": "유현",
    "totalBirths": 4595,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 163,
    "name": "하늘",
    "totalBirths": 4569,
    "gender": null,
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 164,
    "name": "태훈",
    "totalBirths": 4558,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 165,
    "name": "태영",
    "totalBirths": 4511,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 166,
    "name": "재훈",
    "totalBirths": 4491,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 167,
    "name": "태경",
    "totalBirths": 4433,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 168,
    "name": "도겸",
    "totalBirths": 4416,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 169,
    "name": "동건",
    "totalBirths": 4386,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 170,
    "name": "찬영",
    "totalBirths": 4370,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 171,
    "name": "범준",
    "totalBirths": 4361,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 172,
    "name": "산",
    "totalBirths": 4316,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 173,
    "name": "선호",
    "totalBirths": 4300,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 174,
    "name": "지혁",
    "totalBirths": 4269,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 175,
    "name": "하윤",
    "totalBirths": 4266,
    "gender": "F",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 176,
    "name": "현진",
    "totalBirths": 4259,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 177,
    "name": "성윤",
    "totalBirths": 4226,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 178,
    "name": "세준",
    "totalBirths": 4207,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 179,
    "name": "영준",
    "totalBirths": 4189,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 180,
    "name": "윤찬",
    "totalBirths": 4185,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 181,
    "name": "재이",
    "totalBirths": 4178,
    "gender": "F",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 182,
    "name": "태하",
    "totalBirths": 4152,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 183,
    "name": "도진",
    "totalBirths": 4137,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 184,
    "name": "시호",
    "totalBirths": 4134,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 185,
    "name": "서원",
    "totalBirths": 4118,
    "gender": null,
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 186,
    "name": "연호",
    "totalBirths": 4103,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 187,
    "name": "찬",
    "totalBirths": 4101,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 188,
    "name": "지운",
    "totalBirths": 4087,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 189,
    "name": "재영",
    "totalBirths": 4065,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 190,
    "name": "건호",
    "totalBirths": 4040,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 191,
    "name": "윤후",
    "totalBirths": 4033,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 192,
    "name": "우성",
    "totalBirths": 4032,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 193,
    "name": "찬우",
    "totalBirths": 4026,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 194,
    "name": "주혁",
    "totalBirths": 4023,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 195,
    "name": "태호",
    "totalBirths": 4014,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 196,
    "name": "상현",
    "totalBirths": 4001,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 197,
    "name": "승훈",
    "totalBirths": 4000,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 197,
    "name": "로이",
    "totalBirths": 4000,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 199,
    "name": "동윤",
    "totalBirths": 3968,
    "gender": "M",
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 200,
    "name": "태이",
    "totalBirths": 3944,
    "gender": null,
    "page": 4,
    "pageGender": "M"
  },
  {
    "rank": 201,
    "name": "승재",
    "totalBirths": 3938,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 202,
    "name": "현승",
    "totalBirths": 3929,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 202,
    "name": "유진",
    "totalBirths": 3929,
    "gender": "F",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 204,
    "name": "규빈",
    "totalBirths": 3900,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 205,
    "name": "찬희",
    "totalBirths": 3851,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 206,
    "name": "은율",
    "totalBirths": 3797,
    "gender": null,
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 207,
    "name": "주한",
    "totalBirths": 3784,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 208,
    "name": "수혁",
    "totalBirths": 3736,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 209,
    "name": "승찬",
    "totalBirths": 3725,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 209,
    "name": "태우",
    "totalBirths": 3725,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 211,
    "name": "현호",
    "totalBirths": 3711,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 212,
    "name": "재희",
    "totalBirths": 3696,
    "gender": null,
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 213,
    "name": "성훈",
    "totalBirths": 3653,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 214,
    "name": "재우",
    "totalBirths": 3642,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 215,
    "name": "우찬",
    "totalBirths": 3629,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 216,
    "name": "동욱",
    "totalBirths": 3616,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 217,
    "name": "수민",
    "totalBirths": 3601,
    "gender": "F",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 218,
    "name": "현빈",
    "totalBirths": 3596,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 219,
    "name": "주완",
    "totalBirths": 3585,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 220,
    "name": "우준",
    "totalBirths": 3559,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 221,
    "name": "효준",
    "totalBirths": 3524,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 222,
    "name": "주현",
    "totalBirths": 3490,
    "gender": null,
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 223,
    "name": "시헌",
    "totalBirths": 3488,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 224,
    "name": "강현",
    "totalBirths": 3437,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 225,
    "name": "준후",
    "totalBirths": 3431,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 226,
    "name": "하성",
    "totalBirths": 3427,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 227,
    "name": "태인",
    "totalBirths": 3426,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 228,
    "name": "준석",
    "totalBirths": 3401,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 229,
    "name": "우영",
    "totalBirths": 3400,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 230,
    "name": "유민",
    "totalBirths": 3398,
    "gender": "F",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 231,
    "name": "아준",
    "totalBirths": 3389,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 232,
    "name": "강우",
    "totalBirths": 3381,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 233,
    "name": "동우",
    "totalBirths": 3375,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 234,
    "name": "재혁",
    "totalBirths": 3367,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 235,
    "name": "상윤",
    "totalBirths": 3337,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 236,
    "name": "형준",
    "totalBirths": 3323,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 237,
    "name": "아인",
    "totalBirths": 3283,
    "gender": "F",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 238,
    "name": "유빈",
    "totalBirths": 3277,
    "gender": "F",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 238,
    "name": "성우",
    "totalBirths": 3277,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 240,
    "name": "지용",
    "totalBirths": 3270,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 241,
    "name": "도연",
    "totalBirths": 3266,
    "gender": "F",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 242,
    "name": "윤서",
    "totalBirths": 3255,
    "gender": "F",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 243,
    "name": "인우",
    "totalBirths": 3239,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 244,
    "name": "은준",
    "totalBirths": 3172,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 245,
    "name": "신우",
    "totalBirths": 3161,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 246,
    "name": "진호",
    "totalBirths": 3158,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 247,
    "name": "용준",
    "totalBirths": 3129,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 248,
    "name": "원우",
    "totalBirths": 3127,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 249,
    "name": "이도",
    "totalBirths": 3099,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 250,
    "name": "승후",
    "totalBirths": 3083,
    "gender": "M",
    "page": 5,
    "pageGender": "M"
  },
  {
    "rank": 251,
    "name": "동준",
    "totalBirths": 3072,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 252,
    "name": "호진",
    "totalBirths": 3068,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 253,
    "name": "준형",
    "totalBirths": 3043,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 254,
    "name": "규현",
    "totalBirths": 2999,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 255,
    "name": "지웅",
    "totalBirths": 2998,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 256,
    "name": "상우",
    "totalBirths": 2968,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 257,
    "name": "석현",
    "totalBirths": 2961,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 258,
    "name": "해준",
    "totalBirths": 2936,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 259,
    "name": "서윤",
    "totalBirths": 2924,
    "gender": "F",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 260,
    "name": "진혁",
    "totalBirths": 2909,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 261,
    "name": "이찬",
    "totalBirths": 2906,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 262,
    "name": "승유",
    "totalBirths": 2892,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 263,
    "name": "지온",
    "totalBirths": 2846,
    "gender": "F",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 264,
    "name": "재율",
    "totalBirths": 2835,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 265,
    "name": "동훈",
    "totalBirths": 2824,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 266,
    "name": "승환",
    "totalBirths": 2800,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 267,
    "name": "재호",
    "totalBirths": 2792,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 268,
    "name": "민결",
    "totalBirths": 2791,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 269,
    "name": "선율",
    "totalBirths": 2770,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 270,
    "name": "은혁",
    "totalBirths": 2769,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 271,
    "name": "혜성",
    "totalBirths": 2737,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 272,
    "name": "대현",
    "totalBirths": 2736,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 273,
    "name": "승주",
    "totalBirths": 2718,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 274,
    "name": "하루",
    "totalBirths": 2711,
    "gender": null,
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 275,
    "name": "진서",
    "totalBirths": 2703,
    "gender": null,
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 276,
    "name": "유하",
    "totalBirths": 2702,
    "gender": "F",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 277,
    "name": "세훈",
    "totalBirths": 2697,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 278,
    "name": "여준",
    "totalBirths": 2685,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 279,
    "name": "정빈",
    "totalBirths": 2676,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 279,
    "name": "종현",
    "totalBirths": 2676,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 281,
    "name": "은수",
    "totalBirths": 2668,
    "gender": null,
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 282,
    "name": "유성",
    "totalBirths": 2658,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 283,
    "name": "성원",
    "totalBirths": 2648,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 284,
    "name": "영우",
    "totalBirths": 2627,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 285,
    "name": "윤건",
    "totalBirths": 2622,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 286,
    "name": "태건",
    "totalBirths": 2619,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 287,
    "name": "준원",
    "totalBirths": 2609,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 288,
    "name": "준현",
    "totalBirths": 2608,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 289,
    "name": "태환",
    "totalBirths": 2581,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 290,
    "name": "영민",
    "totalBirths": 2580,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 291,
    "name": "요한",
    "totalBirths": 2573,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 292,
    "name": "도건",
    "totalBirths": 2566,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 293,
    "name": "현석",
    "totalBirths": 2556,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 294,
    "name": "건후",
    "totalBirths": 2547,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 295,
    "name": "한율",
    "totalBirths": 2531,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 296,
    "name": "채민",
    "totalBirths": 2519,
    "gender": "F",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 297,
    "name": "우재",
    "totalBirths": 2501,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 298,
    "name": "서빈",
    "totalBirths": 2453,
    "gender": "F",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 299,
    "name": "동혁",
    "totalBirths": 2452,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 300,
    "name": "노아",
    "totalBirths": 2444,
    "gender": "M",
    "page": 6,
    "pageGender": "M"
  },
  {
    "rank": 301,
    "name": "태성",
    "totalBirths": 2443,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 302,
    "name": "호연",
    "totalBirths": 2440,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 303,
    "name": "희찬",
    "totalBirths": 2431,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 304,
    "name": "다원",
    "totalBirths": 2430,
    "gender": null,
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 304,
    "name": "한울",
    "totalBirths": 2430,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 306,
    "name": "유담",
    "totalBirths": 2424,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 307,
    "name": "시준",
    "totalBirths": 2411,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 308,
    "name": "리안",
    "totalBirths": 2409,
    "gender": "F",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 309,
    "name": "상민",
    "totalBirths": 2401,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 310,
    "name": "우혁",
    "totalBirths": 2371,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 311,
    "name": "준범",
    "totalBirths": 2368,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 312,
    "name": "도운",
    "totalBirths": 2364,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 313,
    "name": "윤수",
    "totalBirths": 2336,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 314,
    "name": "서현",
    "totalBirths": 2328,
    "gender": "F",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 315,
    "name": "건율",
    "totalBirths": 2325,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 316,
    "name": "성진",
    "totalBirths": 2305,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 317,
    "name": "희준",
    "totalBirths": 2302,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 318,
    "name": "해솔",
    "totalBirths": 2294,
    "gender": null,
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 319,
    "name": "동규",
    "totalBirths": 2289,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 320,
    "name": "찬민",
    "totalBirths": 2287,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 321,
    "name": "로건",
    "totalBirths": 2285,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 322,
    "name": "은재",
    "totalBirths": 2279,
    "gender": "F",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 323,
    "name": "서하",
    "totalBirths": 2268,
    "gender": "F",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 324,
    "name": "찬율",
    "totalBirths": 2247,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 325,
    "name": "정호",
    "totalBirths": 2245,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 326,
    "name": "가람",
    "totalBirths": 2221,
    "gender": null,
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 326,
    "name": "주형",
    "totalBirths": 2221,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 328,
    "name": "결",
    "totalBirths": 2207,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 328,
    "name": "원",
    "totalBirths": 2207,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 330,
    "name": "세윤",
    "totalBirths": 2202,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 331,
    "name": "세진",
    "totalBirths": 2188,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 332,
    "name": "민제",
    "totalBirths": 2183,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 333,
    "name": "태원",
    "totalBirths": 2176,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 334,
    "name": "환희",
    "totalBirths": 2160,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 335,
    "name": "성호",
    "totalBirths": 2131,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 335,
    "name": "준민",
    "totalBirths": 2131,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 337,
    "name": "승혁",
    "totalBirths": 2126,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 338,
    "name": "민승",
    "totalBirths": 2125,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 339,
    "name": "경준",
    "totalBirths": 2123,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 340,
    "name": "이수",
    "totalBirths": 2121,
    "gender": null,
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 341,
    "name": "진영",
    "totalBirths": 2118,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 342,
    "name": "인성",
    "totalBirths": 2114,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 343,
    "name": "상준",
    "totalBirths": 2105,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 344,
    "name": "승헌",
    "totalBirths": 2094,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 345,
    "name": "민",
    "totalBirths": 2092,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 346,
    "name": "태웅",
    "totalBirths": 2084,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 347,
    "name": "연후",
    "totalBirths": 2056,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 348,
    "name": "정윤",
    "totalBirths": 2054,
    "gender": "F",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 349,
    "name": "하빈",
    "totalBirths": 2053,
    "gender": null,
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 349,
    "name": "재성",
    "totalBirths": 2053,
    "gender": "M",
    "page": 7,
    "pageGender": "M"
  },
  {
    "rank": 351,
    "name": "희성",
    "totalBirths": 2019,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 352,
    "name": "윤준",
    "totalBirths": 2007,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 353,
    "name": "호영",
    "totalBirths": 1995,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 354,
    "name": "주성",
    "totalBirths": 1993,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 355,
    "name": "은후",
    "totalBirths": 1983,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 356,
    "name": "규원",
    "totalBirths": 1973,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 356,
    "name": "해성",
    "totalBirths": 1973,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 358,
    "name": "성재",
    "totalBirths": 1969,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 359,
    "name": "승기",
    "totalBirths": 1964,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 360,
    "name": "현규",
    "totalBirths": 1955,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 361,
    "name": "한별",
    "totalBirths": 1952,
    "gender": "F",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 362,
    "name": "시영",
    "totalBirths": 1947,
    "gender": null,
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 363,
    "name": "인호",
    "totalBirths": 1942,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 364,
    "name": "강",
    "totalBirths": 1932,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 365,
    "name": "준하",
    "totalBirths": 1930,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 366,
    "name": "주하",
    "totalBirths": 1929,
    "gender": "F",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 366,
    "name": "지윤",
    "totalBirths": 1929,
    "gender": "F",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 368,
    "name": "선재",
    "totalBirths": 1921,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 369,
    "name": "리우",
    "totalBirths": 1906,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 370,
    "name": "지섭",
    "totalBirths": 1878,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 370,
    "name": "진욱",
    "totalBirths": 1878,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 372,
    "name": "이담",
    "totalBirths": 1864,
    "gender": null,
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 373,
    "name": "현욱",
    "totalBirths": 1840,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 374,
    "name": "강준",
    "totalBirths": 1838,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 375,
    "name": "시언",
    "totalBirths": 1829,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 376,
    "name": "찬혁",
    "totalBirths": 1804,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 377,
    "name": "진",
    "totalBirths": 1793,
    "gender": null,
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 378,
    "name": "로하",
    "totalBirths": 1791,
    "gender": null,
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 379,
    "name": "정환",
    "totalBirths": 1786,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 380,
    "name": "세민",
    "totalBirths": 1784,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 381,
    "name": "수빈",
    "totalBirths": 1775,
    "gender": "F",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 381,
    "name": "우석",
    "totalBirths": 1775,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 383,
    "name": "다니엘",
    "totalBirths": 1772,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 384,
    "name": "동연",
    "totalBirths": 1771,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 385,
    "name": "한솔",
    "totalBirths": 1766,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 386,
    "name": "준기",
    "totalBirths": 1765,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 387,
    "name": "도형",
    "totalBirths": 1759,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 388,
    "name": "창민",
    "totalBirths": 1752,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 389,
    "name": "성찬",
    "totalBirths": 1746,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 390,
    "name": "지석",
    "totalBirths": 1732,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 391,
    "name": "한준",
    "totalBirths": 1726,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 392,
    "name": "서안",
    "totalBirths": 1724,
    "gender": null,
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 393,
    "name": "예건",
    "totalBirths": 1713,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 394,
    "name": "민후",
    "totalBirths": 1711,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 395,
    "name": "명준",
    "totalBirths": 1695,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 396,
    "name": "영훈",
    "totalBirths": 1685,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 397,
    "name": "태연",
    "totalBirths": 1681,
    "gender": "F",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 398,
    "name": "지수",
    "totalBirths": 1678,
    "gender": "F",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 399,
    "name": "도헌",
    "totalBirths": 1675,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 400,
    "name": "준휘",
    "totalBirths": 1665,
    "gender": "M",
    "page": 8,
    "pageGender": "M"
  },
  {
    "rank": 401,
    "name": "주헌",
    "totalBirths": 1659,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 402,
    "name": "기현",
    "totalBirths": 1657,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 403,
    "name": "상훈",
    "totalBirths": 1651,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 404,
    "name": "재형",
    "totalBirths": 1643,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 405,
    "name": "건하",
    "totalBirths": 1635,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 406,
    "name": "민율",
    "totalBirths": 1630,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 407,
    "name": "재인",
    "totalBirths": 1628,
    "gender": "F",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 408,
    "name": "시형",
    "totalBirths": 1623,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 409,
    "name": "환",
    "totalBirths": 1611,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 410,
    "name": "재용",
    "totalBirths": 1610,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 411,
    "name": "도빈",
    "totalBirths": 1603,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 412,
    "name": "리한",
    "totalBirths": 1599,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 413,
    "name": "은결",
    "totalBirths": 1587,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 414,
    "name": "솔",
    "totalBirths": 1585,
    "gender": "F",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 415,
    "name": "상원",
    "totalBirths": 1580,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 416,
    "name": "태규",
    "totalBirths": 1568,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 417,
    "name": "동민",
    "totalBirths": 1563,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 418,
    "name": "호윤",
    "totalBirths": 1562,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 419,
    "name": "예담",
    "totalBirths": 1559,
    "gender": "F",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 420,
    "name": "주찬",
    "totalBirths": 1541,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 421,
    "name": "해인",
    "totalBirths": 1538,
    "gender": "F",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 422,
    "name": "기범",
    "totalBirths": 1535,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 423,
    "name": "현재",
    "totalBirths": 1530,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 423,
    "name": "진성",
    "totalBirths": 1530,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 425,
    "name": "승연",
    "totalBirths": 1522,
    "gender": "F",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 426,
    "name": "영재",
    "totalBirths": 1519,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 427,
    "name": "태희",
    "totalBirths": 1505,
    "gender": "F",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 428,
    "name": "동원",
    "totalBirths": 1503,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 429,
    "name": "영진",
    "totalBirths": 1497,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 430,
    "name": "수환",
    "totalBirths": 1495,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 431,
    "name": "겸",
    "totalBirths": 1493,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 432,
    "name": "건영",
    "totalBirths": 1490,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 433,
    "name": "유신",
    "totalBirths": 1488,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 434,
    "name": "찬유",
    "totalBirths": 1486,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 435,
    "name": "동호",
    "totalBirths": 1477,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 436,
    "name": "훈",
    "totalBirths": 1476,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 437,
    "name": "서한",
    "totalBirths": 1467,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 438,
    "name": "지헌",
    "totalBirths": 1462,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 439,
    "name": "승범",
    "totalBirths": 1458,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 440,
    "name": "준모",
    "totalBirths": 1455,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 441,
    "name": "재범",
    "totalBirths": 1445,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 442,
    "name": "유호",
    "totalBirths": 1437,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 443,
    "name": "한빈",
    "totalBirths": 1396,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 444,
    "name": "재환",
    "totalBirths": 1387,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 445,
    "name": "석준",
    "totalBirths": 1384,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 446,
    "name": "태빈",
    "totalBirths": 1368,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 447,
    "name": "유겸",
    "totalBirths": 1366,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 448,
    "name": "도균",
    "totalBirths": 1364,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 449,
    "name": "수찬",
    "totalBirths": 1361,
    "gender": "M",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 450,
    "name": "연재",
    "totalBirths": 1352,
    "gender": "F",
    "page": 9,
    "pageGender": "M"
  },
  {
    "rank": 450,
    "name": "연수",
    "totalBirths": 1352,
    "gender": "F",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 452,
    "name": "재빈",
    "totalBirths": 1351,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 453,
    "name": "찬빈",
    "totalBirths": 1344,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 454,
    "name": "한서",
    "totalBirths": 1336,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 455,
    "name": "리호",
    "totalBirths": 1331,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 456,
    "name": "혁",
    "totalBirths": 1329,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 457,
    "name": "영찬",
    "totalBirths": 1328,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 457,
    "name": "상혁",
    "totalBirths": 1328,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 459,
    "name": "준환",
    "totalBirths": 1323,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 460,
    "name": "민욱",
    "totalBirths": 1322,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 461,
    "name": "다율",
    "totalBirths": 1320,
    "gender": "F",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 462,
    "name": "이진",
    "totalBirths": 1318,
    "gender": "F",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 463,
    "name": "채우",
    "totalBirths": 1317,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 464,
    "name": "의준",
    "totalBirths": 1313,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 465,
    "name": "희재",
    "totalBirths": 1308,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 466,
    "name": "경훈",
    "totalBirths": 1303,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 467,
    "name": "진원",
    "totalBirths": 1295,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 468,
    "name": "재욱",
    "totalBirths": 1293,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 468,
    "name": "유승",
    "totalBirths": 1293,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 470,
    "name": "동주",
    "totalBirths": 1283,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 471,
    "name": "시하",
    "totalBirths": 1282,
    "gender": "F",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 472,
    "name": "근우",
    "totalBirths": 1281,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 473,
    "name": "준상",
    "totalBirths": 1277,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 474,
    "name": "찬호",
    "totalBirths": 1274,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 474,
    "name": "대한",
    "totalBirths": 1274,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 476,
    "name": "준이",
    "totalBirths": 1267,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 476,
    "name": "은규",
    "totalBirths": 1267,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 478,
    "name": "제이",
    "totalBirths": 1265,
    "gender": "F",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 479,
    "name": "윤혁",
    "totalBirths": 1259,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 479,
    "name": "형우",
    "totalBirths": 1259,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 481,
    "name": "이재",
    "totalBirths": 1257,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 482,
    "name": "한",
    "totalBirths": 1256,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 483,
    "name": "성욱",
    "totalBirths": 1254,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 484,
    "name": "동환",
    "totalBirths": 1252,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 484,
    "name": "지현",
    "totalBirths": 1252,
    "gender": "F",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 486,
    "name": "종혁",
    "totalBirths": 1244,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 487,
    "name": "선준",
    "totalBirths": 1236,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 488,
    "name": "지유",
    "totalBirths": 1235,
    "gender": "F",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 489,
    "name": "하겸",
    "totalBirths": 1233,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 490,
    "name": "도담",
    "totalBirths": 1225,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 491,
    "name": "지욱",
    "totalBirths": 1213,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 492,
    "name": "재연",
    "totalBirths": 1211,
    "gender": null,
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 493,
    "name": "윤제",
    "totalBirths": 1210,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 494,
    "name": "성주",
    "totalBirths": 1206,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 495,
    "name": "강윤",
    "totalBirths": 1203,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 496,
    "name": "단",
    "totalBirths": 1201,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 497,
    "name": "보겸",
    "totalBirths": 1199,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 498,
    "name": "동휘",
    "totalBirths": 1192,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 499,
    "name": "규진",
    "totalBirths": 1191,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 499,
    "name": "승규",
    "totalBirths": 1191,
    "gender": "M",
    "page": 10,
    "pageGender": "M"
  },
  {
    "rank": 501,
    "name": "리온",
    "totalBirths": 1189,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 502,
    "name": "준오",
    "totalBirths": 1181,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 502,
    "name": "재경",
    "totalBirths": 1181,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 504,
    "name": "혁준",
    "totalBirths": 1177,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 505,
    "name": "수영",
    "totalBirths": 1175,
    "gender": "F",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 506,
    "name": "창현",
    "totalBirths": 1171,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 507,
    "name": "범수",
    "totalBirths": 1169,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 508,
    "name": "세영",
    "totalBirths": 1161,
    "gender": "F",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 509,
    "name": "성연",
    "totalBirths": 1160,
    "gender": null,
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 510,
    "name": "주언",
    "totalBirths": 1159,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 511,
    "name": "인준",
    "totalBirths": 1158,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 512,
    "name": "은석",
    "totalBirths": 1155,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 513,
    "name": "성하",
    "totalBirths": 1151,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 513,
    "name": "유한",
    "totalBirths": 1151,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 515,
    "name": "병준",
    "totalBirths": 1146,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 516,
    "name": "태겸",
    "totalBirths": 1145,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 517,
    "name": "태욱",
    "totalBirths": 1143,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 518,
    "name": "태완",
    "totalBirths": 1142,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 519,
    "name": "윤석",
    "totalBirths": 1139,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 520,
    "name": "영광",
    "totalBirths": 1127,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 521,
    "name": "관우",
    "totalBirths": 1126,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 522,
    "name": "희원",
    "totalBirths": 1125,
    "gender": "F",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 523,
    "name": "호",
    "totalBirths": 1124,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 523,
    "name": "성환",
    "totalBirths": 1124,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 525,
    "name": "미르",
    "totalBirths": 1123,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 526,
    "name": "이삭",
    "totalBirths": 1121,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 527,
    "name": "경빈",
    "totalBirths": 1120,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 528,
    "name": "민영",
    "totalBirths": 1119,
    "gender": "F",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 529,
    "name": "채운",
    "totalBirths": 1110,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 530,
    "name": "태형",
    "totalBirths": 1107,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 531,
    "name": "준용",
    "totalBirths": 1106,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 532,
    "name": "채훈",
    "totalBirths": 1102,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 533,
    "name": "정혁",
    "totalBirths": 1099,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 534,
    "name": "유환",
    "totalBirths": 1089,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 535,
    "name": "우림",
    "totalBirths": 1088,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 536,
    "name": "종윤",
    "totalBirths": 1087,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 537,
    "name": "로한",
    "totalBirths": 1076,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 538,
    "name": "혜준",
    "totalBirths": 1062,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 539,
    "name": "로빈",
    "totalBirths": 1055,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 540,
    "name": "찬서",
    "totalBirths": 1052,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 541,
    "name": "원재",
    "totalBirths": 1046,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 542,
    "name": "우민",
    "totalBirths": 1045,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 543,
    "name": "정욱",
    "totalBirths": 1043,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 543,
    "name": "종우",
    "totalBirths": 1043,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 545,
    "name": "현중",
    "totalBirths": 1035,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 546,
    "name": "진수",
    "totalBirths": 1024,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 547,
    "name": "승진",
    "totalBirths": 1023,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 548,
    "name": "해온",
    "totalBirths": 1021,
    "gender": null,
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 549,
    "name": "재헌",
    "totalBirths": 1019,
    "gender": "M",
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 549,
    "name": "승하",
    "totalBirths": 1019,
    "gender": null,
    "page": 11,
    "pageGender": "M"
  },
  {
    "rank": 551,
    "name": "희수",
    "totalBirths": 1016,
    "gender": null,
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 552,
    "name": "강희",
    "totalBirths": 1013,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 553,
    "name": "형진",
    "totalBirths": 1011,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 554,
    "name": "의찬",
    "totalBirths": 1010,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 554,
    "name": "영웅",
    "totalBirths": 1010,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 556,
    "name": "루이",
    "totalBirths": 1008,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 557,
    "name": "선후",
    "totalBirths": 1005,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 558,
    "name": "대윤",
    "totalBirths": 1004,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 559,
    "name": "태온",
    "totalBirths": 998,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 560,
    "name": "예훈",
    "totalBirths": 997,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 561,
    "name": "시혁",
    "totalBirths": 994,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 562,
    "name": "태헌",
    "totalBirths": 992,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 562,
    "name": "영빈",
    "totalBirths": 992,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 564,
    "name": "요셉",
    "totalBirths": 990,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 565,
    "name": "호성",
    "totalBirths": 979,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 566,
    "name": "찬솔",
    "totalBirths": 971,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 567,
    "name": "민형",
    "totalBirths": 966,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 568,
    "name": "범진",
    "totalBirths": 965,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 568,
    "name": "이환",
    "totalBirths": 965,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 568,
    "name": "용우",
    "totalBirths": 965,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 571,
    "name": "의진",
    "totalBirths": 963,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 572,
    "name": "민겸",
    "totalBirths": 962,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 572,
    "name": "승리",
    "totalBirths": 962,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 574,
    "name": "우솔",
    "totalBirths": 960,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 574,
    "name": "경원",
    "totalBirths": 960,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 576,
    "name": "하담",
    "totalBirths": 958,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 577,
    "name": "영현",
    "totalBirths": 957,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 578,
    "name": "용현",
    "totalBirths": 956,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 579,
    "name": "하엘",
    "totalBirths": 954,
    "gender": "F",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 580,
    "name": "다겸",
    "totalBirths": 953,
    "gender": null,
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 581,
    "name": "해찬",
    "totalBirths": 951,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 582,
    "name": "이서",
    "totalBirths": 949,
    "gender": "F",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 582,
    "name": "정연",
    "totalBirths": 949,
    "gender": "F",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 584,
    "name": "정인",
    "totalBirths": 948,
    "gender": "F",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 584,
    "name": "종민",
    "totalBirths": 948,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 586,
    "name": "도은",
    "totalBirths": 947,
    "gender": "F",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 587,
    "name": "이레",
    "totalBirths": 942,
    "gender": "F",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 588,
    "name": "우리",
    "totalBirths": 941,
    "gender": "F",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 589,
    "name": "세인",
    "totalBirths": 939,
    "gender": "F",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 589,
    "name": "다민",
    "totalBirths": 939,
    "gender": "F",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 591,
    "name": "은유",
    "totalBirths": 937,
    "gender": "F",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 592,
    "name": "인서",
    "totalBirths": 935,
    "gender": "F",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 593,
    "name": "이건",
    "totalBirths": 934,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 594,
    "name": "민섭",
    "totalBirths": 933,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 595,
    "name": "석민",
    "totalBirths": 932,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 596,
    "name": "건민",
    "totalBirths": 929,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 596,
    "name": "해든",
    "totalBirths": 929,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 596,
    "name": "상진",
    "totalBirths": 929,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 599,
    "name": "상욱",
    "totalBirths": 928,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 600,
    "name": "윤오",
    "totalBirths": 926,
    "gender": "M",
    "page": 12,
    "pageGender": "M"
  },
  {
    "rank": 600,
    "name": "명진",
    "totalBirths": 926,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 602,
    "name": "승수",
    "totalBirths": 925,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 603,
    "name": "재후",
    "totalBirths": 922,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 604,
    "name": "아론",
    "totalBirths": 919,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 605,
    "name": "다훈",
    "totalBirths": 914,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 606,
    "name": "수안",
    "totalBirths": 912,
    "gender": "F",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 607,
    "name": "원호",
    "totalBirths": 908,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 608,
    "name": "현태",
    "totalBirths": 906,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 609,
    "name": "동후",
    "totalBirths": 904,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 610,
    "name": "다현",
    "totalBirths": 902,
    "gender": "F",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 611,
    "name": "대호",
    "totalBirths": 898,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 612,
    "name": "원석",
    "totalBirths": 895,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 613,
    "name": "제민",
    "totalBirths": 890,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 614,
    "name": "지홍",
    "totalBirths": 886,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 615,
    "name": "태균",
    "totalBirths": 885,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 616,
    "name": "동희",
    "totalBirths": 884,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 617,
    "name": "현도",
    "totalBirths": 883,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 617,
    "name": "지승",
    "totalBirths": 883,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 619,
    "name": "원빈",
    "totalBirths": 879,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 620,
    "name": "담",
    "totalBirths": 876,
    "gender": null,
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 621,
    "name": "다엘",
    "totalBirths": 875,
    "gender": null,
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 622,
    "name": "종훈",
    "totalBirths": 874,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 622,
    "name": "리오",
    "totalBirths": 874,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 624,
    "name": "종원",
    "totalBirths": 872,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 625,
    "name": "시유",
    "totalBirths": 871,
    "gender": null,
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 625,
    "name": "기훈",
    "totalBirths": 871,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 627,
    "name": "기윤",
    "totalBirths": 869,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 628,
    "name": "슬우",
    "totalBirths": 868,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 629,
    "name": "진후",
    "totalBirths": 865,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 630,
    "name": "의현",
    "totalBirths": 859,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 630,
    "name": "제하",
    "totalBirths": 859,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 632,
    "name": "형주",
    "totalBirths": 858,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 633,
    "name": "진현",
    "totalBirths": 855,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 634,
    "name": "경호",
    "totalBirths": 853,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 634,
    "name": "범",
    "totalBirths": 853,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 636,
    "name": "호현",
    "totalBirths": 851,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 637,
    "name": "보성",
    "totalBirths": 849,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 637,
    "name": "시운",
    "totalBirths": 849,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 639,
    "name": "태산",
    "totalBirths": 847,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 640,
    "name": "재웅",
    "totalBirths": 846,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 641,
    "name": "민국",
    "totalBirths": 844,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 642,
    "name": "준표",
    "totalBirths": 843,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 643,
    "name": "준규",
    "totalBirths": 832,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 644,
    "name": "다빈",
    "totalBirths": 827,
    "gender": "F",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 645,
    "name": "이솔",
    "totalBirths": 826,
    "gender": "F",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 645,
    "name": "동균",
    "totalBirths": 826,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 647,
    "name": "윤상",
    "totalBirths": 825,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 648,
    "name": "재아",
    "totalBirths": 824,
    "gender": "F",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 649,
    "name": "대영",
    "totalBirths": 822,
    "gender": "M",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 650,
    "name": "루다",
    "totalBirths": 819,
    "gender": "F",
    "page": 13,
    "pageGender": "M"
  },
  {
    "rank": 651,
    "name": "주빈",
    "totalBirths": 816,
    "gender": null,
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 652,
    "name": "영서",
    "totalBirths": 813,
    "gender": "F",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 653,
    "name": "정준",
    "totalBirths": 808,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 653,
    "name": "동영",
    "totalBirths": 808,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 655,
    "name": "강빈",
    "totalBirths": 807,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 655,
    "name": "동근",
    "totalBirths": 807,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 657,
    "name": "진석",
    "totalBirths": 805,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 657,
    "name": "채호",
    "totalBirths": 805,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 659,
    "name": "세찬",
    "totalBirths": 799,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 660,
    "name": "승욱",
    "totalBirths": 798,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 661,
    "name": "하원",
    "totalBirths": 797,
    "gender": "F",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 662,
    "name": "선유",
    "totalBirths": 795,
    "gender": "F",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 663,
    "name": "온",
    "totalBirths": 793,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 664,
    "name": "예승",
    "totalBirths": 790,
    "gender": null,
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 665,
    "name": "근호",
    "totalBirths": 788,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 665,
    "name": "성율",
    "totalBirths": 788,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 665,
    "name": "어진",
    "totalBirths": 788,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 668,
    "name": "정진",
    "totalBirths": 786,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 669,
    "name": "태주",
    "totalBirths": 785,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 670,
    "name": "범서",
    "totalBirths": 784,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 671,
    "name": "강인",
    "totalBirths": 783,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 672,
    "name": "수인",
    "totalBirths": 782,
    "gender": "F",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 673,
    "name": "형민",
    "totalBirths": 780,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 673,
    "name": "효재",
    "totalBirths": 780,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 675,
    "name": "재승",
    "totalBirths": 775,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 676,
    "name": "태은",
    "totalBirths": 771,
    "gender": "F",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 677,
    "name": "대성",
    "totalBirths": 769,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 677,
    "name": "승언",
    "totalBirths": 769,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 679,
    "name": "동진",
    "totalBirths": 768,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 679,
    "name": "용진",
    "totalBirths": 768,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 679,
    "name": "도엽",
    "totalBirths": 768,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 682,
    "name": "도",
    "totalBirths": 767,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 683,
    "name": "경환",
    "totalBirths": 766,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 683,
    "name": "정운",
    "totalBirths": 766,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 685,
    "name": "지형",
    "totalBirths": 765,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 685,
    "name": "효민",
    "totalBirths": 765,
    "gender": "F",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 687,
    "name": "민균",
    "totalBirths": 764,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 687,
    "name": "슬찬",
    "totalBirths": 764,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 689,
    "name": "제현",
    "totalBirths": 763,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 690,
    "name": "태유",
    "totalBirths": 762,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 691,
    "name": "진형",
    "totalBirths": 756,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 692,
    "name": "도한",
    "totalBirths": 755,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 693,
    "name": "도혁",
    "totalBirths": 752,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 694,
    "name": "태서",
    "totalBirths": 749,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 695,
    "name": "필립",
    "totalBirths": 744,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 696,
    "name": "휘",
    "totalBirths": 742,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 696,
    "name": "규태",
    "totalBirths": 742,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 696,
    "name": "제윤",
    "totalBirths": 742,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 699,
    "name": "한빛",
    "totalBirths": 739,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 700,
    "name": "윤기",
    "totalBirths": 736,
    "gender": "M",
    "page": 14,
    "pageGender": "M"
  },
  {
    "rank": 700,
    "name": "서온",
    "totalBirths": 736,
    "gender": null,
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 700,
    "name": "채준",
    "totalBirths": 736,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 703,
    "name": "레오",
    "totalBirths": 735,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 704,
    "name": "태후",
    "totalBirths": 733,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 704,
    "name": "대원",
    "totalBirths": 733,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 704,
    "name": "태진",
    "totalBirths": 733,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 707,
    "name": "준엽",
    "totalBirths": 731,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 707,
    "name": "로윤",
    "totalBirths": 731,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 707,
    "name": "두현",
    "totalBirths": 731,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 707,
    "name": "무진",
    "totalBirths": 731,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 707,
    "name": "시진",
    "totalBirths": 731,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 712,
    "name": "선빈",
    "totalBirths": 730,
    "gender": null,
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 713,
    "name": "민철",
    "totalBirths": 728,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 714,
    "name": "진하",
    "totalBirths": 727,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 714,
    "name": "도언",
    "totalBirths": 727,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 716,
    "name": "신",
    "totalBirths": 725,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 716,
    "name": "서훈",
    "totalBirths": 725,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 718,
    "name": "수한",
    "totalBirths": 724,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 719,
    "name": "희우",
    "totalBirths": 723,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 720,
    "name": "이헌",
    "totalBirths": 722,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 721,
    "name": "정안",
    "totalBirths": 720,
    "gender": null,
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 721,
    "name": "혁진",
    "totalBirths": 720,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 723,
    "name": "영호",
    "totalBirths": 719,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 724,
    "name": "도우",
    "totalBirths": 711,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 725,
    "name": "세환",
    "totalBirths": 708,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 726,
    "name": "채환",
    "totalBirths": 707,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 726,
    "name": "선민",
    "totalBirths": 707,
    "gender": null,
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 728,
    "name": "이루",
    "totalBirths": 706,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 728,
    "name": "정재",
    "totalBirths": 706,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 730,
    "name": "도환",
    "totalBirths": 705,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 731,
    "name": "정수",
    "totalBirths": 702,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 732,
    "name": "기준",
    "totalBirths": 699,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 733,
    "name": "채윤",
    "totalBirths": 698,
    "gender": "F",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 734,
    "name": "경현",
    "totalBirths": 697,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 735,
    "name": "승완",
    "totalBirths": 694,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 736,
    "name": "세원",
    "totalBirths": 693,
    "gender": null,
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 737,
    "name": "기찬",
    "totalBirths": 690,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 737,
    "name": "준섭",
    "totalBirths": 690,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 739,
    "name": "용재",
    "totalBirths": 689,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 739,
    "name": "태강",
    "totalBirths": 689,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 741,
    "name": "기태",
    "totalBirths": 688,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 741,
    "name": "리환",
    "totalBirths": 688,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 743,
    "name": "보민",
    "totalBirths": 686,
    "gender": "F",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 744,
    "name": "민교",
    "totalBirths": 684,
    "gender": null,
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 744,
    "name": "규연",
    "totalBirths": 684,
    "gender": null,
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 746,
    "name": "민하",
    "totalBirths": 682,
    "gender": "F",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 747,
    "name": "선",
    "totalBirths": 680,
    "gender": null,
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 748,
    "name": "해담",
    "totalBirths": 679,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 749,
    "name": "주훈",
    "totalBirths": 677,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 749,
    "name": "석훈",
    "totalBirths": 677,
    "gender": "M",
    "page": 15,
    "pageGender": "M"
  },
  {
    "rank": 751,
    "name": "강호",
    "totalBirths": 676,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 752,
    "name": "동빈",
    "totalBirths": 674,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 753,
    "name": "수오",
    "totalBirths": 668,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 753,
    "name": "세빈",
    "totalBirths": 668,
    "gender": "F",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 755,
    "name": "건형",
    "totalBirths": 666,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 756,
    "name": "진규",
    "totalBirths": 664,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 756,
    "name": "빈",
    "totalBirths": 664,
    "gender": null,
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 758,
    "name": "선규",
    "totalBirths": 663,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 759,
    "name": "승엽",
    "totalBirths": 662,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 760,
    "name": "태혁",
    "totalBirths": 661,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 761,
    "name": "현웅",
    "totalBirths": 660,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 762,
    "name": "하운",
    "totalBirths": 652,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 763,
    "name": "인혁",
    "totalBirths": 651,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 764,
    "name": "원영",
    "totalBirths": 648,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 765,
    "name": "래원",
    "totalBirths": 645,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 766,
    "name": "석원",
    "totalBirths": 644,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 767,
    "name": "재진",
    "totalBirths": 642,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 768,
    "name": "성운",
    "totalBirths": 640,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 769,
    "name": "원진",
    "totalBirths": 639,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 769,
    "name": "재완",
    "totalBirths": 639,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 771,
    "name": "믿음",
    "totalBirths": 638,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 772,
    "name": "희윤",
    "totalBirths": 636,
    "gender": "F",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 773,
    "name": "보현",
    "totalBirths": 635,
    "gender": "F",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 774,
    "name": "효성",
    "totalBirths": 634,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 775,
    "name": "강산",
    "totalBirths": 633,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 776,
    "name": "승한",
    "totalBirths": 631,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 777,
    "name": "사무엘",
    "totalBirths": 626,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 778,
    "name": "윤민",
    "totalBirths": 624,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 779,
    "name": "하음",
    "totalBirths": 623,
    "gender": "F",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 779,
    "name": "광현",
    "totalBirths": 623,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 779,
    "name": "채원",
    "totalBirths": 623,
    "gender": "F",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 782,
    "name": "성혁",
    "totalBirths": 621,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 783,
    "name": "채현",
    "totalBirths": 620,
    "gender": "F",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 783,
    "name": "훤",
    "totalBirths": 620,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 785,
    "name": "건휘",
    "totalBirths": 619,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 786,
    "name": "무빈",
    "totalBirths": 618,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 786,
    "name": "루하",
    "totalBirths": 618,
    "gender": null,
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 788,
    "name": "승효",
    "totalBirths": 614,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 788,
    "name": "한성",
    "totalBirths": 614,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 790,
    "name": "세온",
    "totalBirths": 613,
    "gender": null,
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 791,
    "name": "선웅",
    "totalBirths": 612,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 792,
    "name": "성규",
    "totalBirths": 611,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 792,
    "name": "규호",
    "totalBirths": 611,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 794,
    "name": "누리",
    "totalBirths": 608,
    "gender": "F",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 795,
    "name": "병찬",
    "totalBirths": 605,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 796,
    "name": "효원",
    "totalBirths": 604,
    "gender": "F",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 797,
    "name": "도유",
    "totalBirths": 603,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 798,
    "name": "대훈",
    "totalBirths": 599,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 798,
    "name": "해원",
    "totalBirths": 599,
    "gender": "F",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 798,
    "name": "서찬",
    "totalBirths": 599,
    "gender": "M",
    "page": 16,
    "pageGender": "M"
  },
  {
    "rank": 801,
    "name": "정한",
    "totalBirths": 596,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 802,
    "name": "영후",
    "totalBirths": 594,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 802,
    "name": "윤겸",
    "totalBirths": 594,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 802,
    "name": "현종",
    "totalBirths": 594,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 805,
    "name": "윤빈",
    "totalBirths": 593,
    "gender": null,
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 806,
    "name": "서환",
    "totalBirths": 592,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 807,
    "name": "바다",
    "totalBirths": 591,
    "gender": null,
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 808,
    "name": "현율",
    "totalBirths": 590,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 809,
    "name": "주윤",
    "totalBirths": 589,
    "gender": null,
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 809,
    "name": "호수",
    "totalBirths": 589,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 811,
    "name": "희승",
    "totalBirths": 588,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 812,
    "name": "종호",
    "totalBirths": 584,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 813,
    "name": "유석",
    "totalBirths": 583,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 814,
    "name": "건욱",
    "totalBirths": 582,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 815,
    "name": "동화",
    "totalBirths": 581,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 816,
    "name": "로아",
    "totalBirths": 580,
    "gender": "F",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 816,
    "name": "예현",
    "totalBirths": 580,
    "gender": "F",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 818,
    "name": "진율",
    "totalBirths": 577,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 819,
    "name": "석진",
    "totalBirths": 576,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 820,
    "name": "용민",
    "totalBirths": 575,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 820,
    "name": "상연",
    "totalBirths": 575,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 822,
    "name": "유근",
    "totalBirths": 573,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 823,
    "name": "범석",
    "totalBirths": 572,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 823,
    "name": "형석",
    "totalBirths": 572,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 825,
    "name": "솔민",
    "totalBirths": 571,
    "gender": null,
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 825,
    "name": "현기",
    "totalBirths": 571,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 827,
    "name": "태수",
    "totalBirths": 570,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 828,
    "name": "강훈",
    "totalBirths": 569,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 829,
    "name": "성수",
    "totalBirths": 568,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 830,
    "name": "정헌",
    "totalBirths": 567,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 831,
    "name": "태용",
    "totalBirths": 564,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 831,
    "name": "서인",
    "totalBirths": 564,
    "gender": "F",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 831,
    "name": "도후",
    "totalBirths": 564,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 834,
    "name": "강유",
    "totalBirths": 562,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 835,
    "name": "용훈",
    "totalBirths": 559,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 836,
    "name": "윤슬",
    "totalBirths": 558,
    "gender": "F",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 837,
    "name": "찬휘",
    "totalBirths": 557,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 838,
    "name": "재서",
    "totalBirths": 556,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 839,
    "name": "은기",
    "totalBirths": 554,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 839,
    "name": "무성",
    "totalBirths": 554,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 839,
    "name": "동율",
    "totalBirths": 554,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 842,
    "name": "하영",
    "totalBirths": 553,
    "gender": "F",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 843,
    "name": "세연",
    "totalBirths": 552,
    "gender": "F",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 844,
    "name": "예강",
    "totalBirths": 550,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 844,
    "name": "찬웅",
    "totalBirths": 550,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 846,
    "name": "해민",
    "totalBirths": 549,
    "gender": null,
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 847,
    "name": "이겸",
    "totalBirths": 547,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 847,
    "name": "신후",
    "totalBirths": 547,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 849,
    "name": "현오",
    "totalBirths": 546,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 850,
    "name": "지상",
    "totalBirths": 544,
    "gender": "M",
    "page": 17,
    "pageGender": "M"
  },
  {
    "rank": 850,
    "name": "경태",
    "totalBirths": 544,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 850,
    "name": "채완",
    "totalBirths": 544,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 853,
    "name": "다윤",
    "totalBirths": 542,
    "gender": "F",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 854,
    "name": "유",
    "totalBirths": 541,
    "gender": null,
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 855,
    "name": "승운",
    "totalBirths": 540,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 856,
    "name": "규성",
    "totalBirths": 537,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 856,
    "name": "찬형",
    "totalBirths": 537,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 856,
    "name": "세종",
    "totalBirths": 537,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 859,
    "name": "현찬",
    "totalBirths": 534,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 859,
    "name": "은총",
    "totalBirths": 534,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 861,
    "name": "상빈",
    "totalBirths": 533,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 861,
    "name": "모건",
    "totalBirths": 533,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 863,
    "name": "하임",
    "totalBirths": 532,
    "gender": "F",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 863,
    "name": "서형",
    "totalBirths": 532,
    "gender": null,
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 865,
    "name": "은오",
    "totalBirths": 530,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 866,
    "name": "민솔",
    "totalBirths": 529,
    "gender": "F",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 867,
    "name": "해윤",
    "totalBirths": 528,
    "gender": "F",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 867,
    "name": "효찬",
    "totalBirths": 528,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 867,
    "name": "상호",
    "totalBirths": 528,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 870,
    "name": "경록",
    "totalBirths": 526,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 870,
    "name": "수",
    "totalBirths": 526,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 870,
    "name": "태랑",
    "totalBirths": 526,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 870,
    "name": "민근",
    "totalBirths": 526,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 870,
    "name": "세하",
    "totalBirths": 526,
    "gender": "F",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 870,
    "name": "찬이",
    "totalBirths": 526,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 870,
    "name": "용하",
    "totalBirths": 526,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 877,
    "name": "예한",
    "totalBirths": 525,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 878,
    "name": "주용",
    "totalBirths": 524,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 879,
    "name": "민상",
    "totalBirths": 523,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 880,
    "name": "장우",
    "totalBirths": 522,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 880,
    "name": "지효",
    "totalBirths": 522,
    "gender": "F",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 882,
    "name": "가을",
    "totalBirths": 520,
    "gender": "F",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 883,
    "name": "재유",
    "totalBirths": 519,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 884,
    "name": "희건",
    "totalBirths": 518,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 885,
    "name": "윤환",
    "totalBirths": 517,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 886,
    "name": "마루",
    "totalBirths": 516,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 887,
    "name": "경찬",
    "totalBirths": 515,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 888,
    "name": "도휘",
    "totalBirths": 514,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 889,
    "name": "용찬",
    "totalBirths": 513,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 890,
    "name": "채율",
    "totalBirths": 512,
    "gender": "F",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 890,
    "name": "인하",
    "totalBirths": 512,
    "gender": null,
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 890,
    "name": "영인",
    "totalBirths": 512,
    "gender": null,
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 893,
    "name": "이산",
    "totalBirths": 511,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 893,
    "name": "인후",
    "totalBirths": 511,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 895,
    "name": "원희",
    "totalBirths": 509,
    "gender": null,
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 895,
    "name": "지찬",
    "totalBirths": 509,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 897,
    "name": "세호",
    "totalBirths": 507,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 898,
    "name": "리원",
    "totalBirths": 506,
    "gender": "F",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 898,
    "name": "호빈",
    "totalBirths": 506,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 898,
    "name": "민권",
    "totalBirths": 506,
    "gender": "M",
    "page": 18,
    "pageGender": "M"
  },
  {
    "rank": 901,
    "name": "진환",
    "totalBirths": 503,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 902,
    "name": "대연",
    "totalBirths": 501,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 903,
    "name": "효빈",
    "totalBirths": 500,
    "gender": "F",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 904,
    "name": "수완",
    "totalBirths": 499,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 904,
    "name": "기원",
    "totalBirths": 499,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 906,
    "name": "동해",
    "totalBirths": 497,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 906,
    "name": "태한",
    "totalBirths": 497,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 906,
    "name": "든",
    "totalBirths": 497,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 909,
    "name": "재홍",
    "totalBirths": 493,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 910,
    "name": "규담",
    "totalBirths": 491,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 910,
    "name": "병현",
    "totalBirths": 491,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 912,
    "name": "우형",
    "totalBirths": 490,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 913,
    "name": "인수",
    "totalBirths": 489,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 914,
    "name": "준식",
    "totalBirths": 486,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 914,
    "name": "해진",
    "totalBirths": 486,
    "gender": null,
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 916,
    "name": "도완",
    "totalBirths": 485,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 917,
    "name": "하울",
    "totalBirths": 484,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 918,
    "name": "태리",
    "totalBirths": 483,
    "gender": "F",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 919,
    "name": "경모",
    "totalBirths": 482,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 920,
    "name": "호재",
    "totalBirths": 480,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 921,
    "name": "강율",
    "totalBirths": 478,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 922,
    "name": "인찬",
    "totalBirths": 477,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 922,
    "name": "다인",
    "totalBirths": 477,
    "gender": "F",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 924,
    "name": "태운",
    "totalBirths": 475,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 925,
    "name": "동은",
    "totalBirths": 474,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 925,
    "name": "테오",
    "totalBirths": 474,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 927,
    "name": "동찬",
    "totalBirths": 473,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 927,
    "name": "리후",
    "totalBirths": 473,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 929,
    "name": "예온",
    "totalBirths": 471,
    "gender": "F",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 930,
    "name": "상헌",
    "totalBirths": 470,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 930,
    "name": "준아",
    "totalBirths": 470,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 930,
    "name": "규범",
    "totalBirths": 470,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 933,
    "name": "휘성",
    "totalBirths": 469,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 933,
    "name": "영환",
    "totalBirths": 469,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 933,
    "name": "유온",
    "totalBirths": 469,
    "gender": null,
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 936,
    "name": "시연",
    "totalBirths": 468,
    "gender": "F",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 937,
    "name": "중현",
    "totalBirths": 465,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 938,
    "name": "해율",
    "totalBirths": 464,
    "gender": null,
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 938,
    "name": "진모",
    "totalBirths": 464,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 938,
    "name": "영주",
    "totalBirths": 464,
    "gender": "F",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 938,
    "name": "요엘",
    "totalBirths": 464,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 938,
    "name": "하승",
    "totalBirths": 464,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 938,
    "name": "한겸",
    "totalBirths": 464,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 944,
    "name": "인규",
    "totalBirths": 463,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 944,
    "name": "태림",
    "totalBirths": 463,
    "gender": "F",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 944,
    "name": "이로",
    "totalBirths": 463,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 944,
    "name": "용빈",
    "totalBirths": 463,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 944,
    "name": "세웅",
    "totalBirths": 463,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 949,
    "name": "유노",
    "totalBirths": 462,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 950,
    "name": "석우",
    "totalBirths": 460,
    "gender": "M",
    "page": 19,
    "pageGender": "M"
  },
  {
    "rank": 950,
    "name": "영석",
    "totalBirths": 460,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 952,
    "name": "서완",
    "totalBirths": 458,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 952,
    "name": "다호",
    "totalBirths": 458,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 952,
    "name": "대경",
    "totalBirths": 458,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 955,
    "name": "제우",
    "totalBirths": 457,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 956,
    "name": "광민",
    "totalBirths": 456,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 957,
    "name": "유원",
    "totalBirths": 455,
    "gender": null,
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 958,
    "name": "진유",
    "totalBirths": 453,
    "gender": null,
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 959,
    "name": "안",
    "totalBirths": 452,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 959,
    "name": "호민",
    "totalBirths": 452,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 961,
    "name": "연성",
    "totalBirths": 451,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 962,
    "name": "이언",
    "totalBirths": 450,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 963,
    "name": "승건",
    "totalBirths": 448,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 964,
    "name": "루안",
    "totalBirths": 447,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 965,
    "name": "성후",
    "totalBirths": 446,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 965,
    "name": "기주",
    "totalBirths": 446,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 967,
    "name": "명재",
    "totalBirths": 445,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 968,
    "name": "경수",
    "totalBirths": 444,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 968,
    "name": "성은",
    "totalBirths": 444,
    "gender": "F",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 968,
    "name": "대환",
    "totalBirths": 444,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 971,
    "name": "병훈",
    "totalBirths": 441,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 972,
    "name": "도아",
    "totalBirths": 439,
    "gender": "F",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 972,
    "name": "종하",
    "totalBirths": 439,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 974,
    "name": "은상",
    "totalBirths": 438,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 975,
    "name": "휘준",
    "totalBirths": 437,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 976,
    "name": "권",
    "totalBirths": 436,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 976,
    "name": "윤하",
    "totalBirths": 436,
    "gender": "F",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 976,
    "name": "주연",
    "totalBirths": 436,
    "gender": "F",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 979,
    "name": "찬욱",
    "totalBirths": 435,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 980,
    "name": "진웅",
    "totalBirths": 434,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 981,
    "name": "서혁",
    "totalBirths": 432,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 982,
    "name": "규하",
    "totalBirths": 431,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 982,
    "name": "민구",
    "totalBirths": 431,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 982,
    "name": "아진",
    "totalBirths": 431,
    "gender": "F",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 982,
    "name": "강후",
    "totalBirths": 431,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 986,
    "name": "지빈",
    "totalBirths": 430,
    "gender": null,
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 986,
    "name": "세혁",
    "totalBirths": 430,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 988,
    "name": "재겸",
    "totalBirths": 429,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 989,
    "name": "현후",
    "totalBirths": 428,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 989,
    "name": "재석",
    "totalBirths": 428,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 989,
    "name": "호원",
    "totalBirths": 428,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 992,
    "name": "장현",
    "totalBirths": 427,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 993,
    "name": "대희",
    "totalBirths": 426,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 993,
    "name": "이원",
    "totalBirths": 426,
    "gender": null,
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 995,
    "name": "준한",
    "totalBirths": 424,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 996,
    "name": "대건",
    "totalBirths": 423,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 997,
    "name": "동헌",
    "totalBirths": 422,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 998,
    "name": "운",
    "totalBirths": 421,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 999,
    "name": "홍준",
    "totalBirths": 420,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  },
  {
    "rank": 999,
    "name": "찬규",
    "totalBirths": 420,
    "gender": "M",
    "page": 20,
    "pageGender": "M"
  }
]$mjson$::jsonb)
),
raw AS (
  SELECT
    NULLIF(BTRIM(x.name), '') AS name,
    x.rank::int AS rank,
    x."totalBirths"::int AS total_births,
    NULLIF(x.gender, '') AS row_gender,
    x.page::int AS page,
    NULLIF(x."pageGender", '') AS page_gender
  FROM jsonb_to_recordset((SELECT doc FROM src_json)) AS x(
    rank int,
    name text,
    "totalBirths" int,
    gender text,
    page int,
    "pageGender" text
  )
),
source_dedup AS (
  SELECT DISTINCT ON (name)
    name,
    rank,
    total_births,
    row_gender,
    page,
    page_gender
  FROM raw
  WHERE name IS NOT NULL
    AND total_births IS NOT NULL
  ORDER BY name, total_births DESC, rank ASC, page ASC
),
candidates AS (
  SELECT s.*
  FROM source_dedup s
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.ssot_name_pool_m t
    WHERE t.name = s.name
  )
),
candidate_stats AS (
  SELECT COUNT(*)::int AS candidate_count FROM candidates
),
default_ratios AS (
  SELECT *
  FROM (VALUES
    ('A'::text, 1, 0.076667::numeric),
    ('B'::text, 2, 0.256667::numeric),
    ('C'::text, 3, 0.666667::numeric)
  ) v(tier, ord, ratio)
),
existing_ratio_raw AS (
  SELECT tier, COUNT(*)::numeric AS cnt
  FROM public.ssot_name_pool_m
  WHERE name IS NOT NULL
    AND tier IN ('A', 'B', 'C')
  GROUP BY tier
),
existing_ratios AS (
  SELECT tier, cnt / NULLIF(SUM(cnt) OVER (), 0) AS ratio
  FROM existing_ratio_raw
),
use_existing_ratio AS (
  SELECT (COUNT(*) = 3) AS ok FROM existing_ratios
),
effective_ratios AS (
  SELECT
    d.tier,
    d.ord,
    CASE
      WHEN COALESCE((SELECT ok FROM use_existing_ratio), false)
        THEN COALESCE((SELECT e.ratio FROM existing_ratios e WHERE e.tier = d.tier), d.ratio)
      ELSE d.ratio
    END AS ratio
  FROM default_ratios d
),
exact_targets AS (
  SELECT
    er.tier,
    er.ord,
    cs.candidate_count,
    (er.ratio * cs.candidate_count::numeric) AS exact_n
  FROM effective_ratios er
  CROSS JOIN candidate_stats cs
),
floor_targets AS (
  SELECT
    tier,
    ord,
    candidate_count,
    FLOOR(exact_n)::int AS base_n,
    (exact_n - FLOOR(exact_n)) AS frac_n
  FROM exact_targets
),
targets_with_remainder AS (
  SELECT
    ft.*,
    (ft.candidate_count - SUM(ft.base_n) OVER ())::int AS remainder_n,
    ROW_NUMBER() OVER (ORDER BY ft.frac_n DESC, ft.ord ASC) AS frac_rank
  FROM floor_targets ft
),
tier_targets AS (
  SELECT
    tier,
    ord,
    (base_n + CASE WHEN frac_rank <= remainder_n THEN 1 ELSE 0 END)::int AS target_n
  FROM targets_with_remainder
),
tier_bounds AS (
  SELECT
    tier,
    ord,
    target_n,
    SUM(target_n) OVER (ORDER BY ord) AS upper_seq
  FROM tier_targets
),
ranked AS (
  SELECT
    c.*,
    ROW_NUMBER() OVER (
      ORDER BY c.total_births DESC, c.rank ASC, c.name ASC
    ) AS seq
  FROM candidates c
),
assigned AS (
  SELECT
    r.seq,
    r.name,
    r.rank,
    r.total_births,
    r.row_gender,
    r.page,
    r.page_gender,
    COALESCE((
      SELECT tb.tier
      FROM tier_bounds tb
      WHERE r.seq <= tb.upper_seq
      ORDER BY tb.ord
      LIMIT 1
    ), 'C') AS tier
  FROM ranked r
),
batch_meta AS (
  SELECT
    NOW() AS generated_at,
    'https://namechart.kr/chart/all | namechart import | M'::text AS input,
    'M'::text AS gender,
    (SELECT candidate_count FROM candidate_stats) AS total_count
),
inserted AS (
  INSERT INTO public.ssot_name_pool_m (
    generated_at,
    input,
    gender,
    total_count,
    name,
    tier,
    score,
    score_breakdown,
    features
  )
  SELECT
    bm.generated_at,
    bm.input,
    bm.gender,
    bm.total_count,
    a.name,
    a.tier,
    NULL::double precision AS score,
    NULL::jsonb AS score_breakdown,
    jsonb_build_object(
      'source', 'namechart.kr',
      'rank', a.rank,
      'totalBirths', a.total_births,
      'page', a.page,
      'pageGender', a.page_gender,
      'rowGender', a.row_gender
    ) AS features
  FROM assigned a
  CROSS JOIN batch_meta bm
  ORDER BY a.seq
  RETURNING row_index, name, tier
)
SELECT
  'M' AS gender,
  (SELECT COUNT(*) FROM raw) AS raw_rows,
  (SELECT COUNT(*) FROM source_dedup) AS source_dedup_rows,
  (SELECT candidate_count FROM candidate_stats) AS insert_candidates,
  (SELECT COUNT(*) FROM inserted) AS inserted_rows,
  (SELECT COUNT(DISTINCT name) FROM inserted) AS inserted_unique_names,
  COALESCE((SELECT jsonb_object_agg(tier, cnt ORDER BY tier)
    FROM (SELECT tier, COUNT(*) AS cnt FROM inserted GROUP BY tier) q), '{}'::jsonb) AS inserted_tier_counts;


-- Female import
WITH
src_json(doc) AS (
  VALUES ($fjson$[
  {
    "rank": 1,
    "name": "서윤",
    "totalBirths": 42084,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 2,
    "name": "서연",
    "totalBirths": 39945,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 3,
    "name": "지우",
    "totalBirths": 35663,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 4,
    "name": "하윤",
    "totalBirths": 34461,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 5,
    "name": "서현",
    "totalBirths": 32438,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 6,
    "name": "하은",
    "totalBirths": 31672,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 7,
    "name": "민서",
    "totalBirths": 30529,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 8,
    "name": "지유",
    "totalBirths": 29672,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 9,
    "name": "윤서",
    "totalBirths": 28216,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 10,
    "name": "채원",
    "totalBirths": 26128,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 11,
    "name": "수아",
    "totalBirths": 26010,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 12,
    "name": "지아",
    "totalBirths": 25743,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 13,
    "name": "지민",
    "totalBirths": 24529,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 14,
    "name": "서아",
    "totalBirths": 24240,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 15,
    "name": "지안",
    "totalBirths": 23923,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 16,
    "name": "지윤",
    "totalBirths": 23641,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 17,
    "name": "다은",
    "totalBirths": 23473,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 18,
    "name": "은서",
    "totalBirths": 23217,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 19,
    "name": "하린",
    "totalBirths": 22381,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 20,
    "name": "예린",
    "totalBirths": 21571,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 21,
    "name": "예은",
    "totalBirths": 21235,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 22,
    "name": "소율",
    "totalBirths": 21220,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 23,
    "name": "수빈",
    "totalBirths": 19741,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 24,
    "name": "소윤",
    "totalBirths": 19436,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 25,
    "name": "유나",
    "totalBirths": 19407,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 26,
    "name": "예원",
    "totalBirths": 19049,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 27,
    "name": "지원",
    "totalBirths": 18713,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 28,
    "name": "시은",
    "totalBirths": 18068,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 29,
    "name": "아린",
    "totalBirths": 17919,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 30,
    "name": "시아",
    "totalBirths": 17802,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 31,
    "name": "윤아",
    "totalBirths": 17725,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 32,
    "name": "채은",
    "totalBirths": 17678,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 33,
    "name": "유진",
    "totalBirths": 17454,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 34,
    "name": "예나",
    "totalBirths": 17363,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 35,
    "name": "아윤",
    "totalBirths": 16429,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 36,
    "name": "예서",
    "totalBirths": 16120,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 37,
    "name": "유주",
    "totalBirths": 15589,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 38,
    "name": "하율",
    "totalBirths": 15489,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 39,
    "name": "연우",
    "totalBirths": 15488,
    "gender": null,
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 40,
    "name": "가은",
    "totalBirths": 15346,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 41,
    "name": "주아",
    "totalBirths": 15077,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 42,
    "name": "다인",
    "totalBirths": 14752,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 43,
    "name": "예진",
    "totalBirths": 14700,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 44,
    "name": "서영",
    "totalBirths": 14544,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 45,
    "name": "민지",
    "totalBirths": 14412,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 46,
    "name": "연서",
    "totalBirths": 14196,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 47,
    "name": "서우",
    "totalBirths": 14121,
    "gender": null,
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 48,
    "name": "아인",
    "totalBirths": 13941,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 49,
    "name": "나은",
    "totalBirths": 13755,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 50,
    "name": "수연",
    "totalBirths": 13603,
    "gender": "F",
    "page": 1,
    "pageGender": "F"
  },
  {
    "rank": 51,
    "name": "수민",
    "totalBirths": 13595,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 52,
    "name": "서하",
    "totalBirths": 13435,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 53,
    "name": "서은",
    "totalBirths": 13373,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 54,
    "name": "채윤",
    "totalBirths": 13366,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 55,
    "name": "시연",
    "totalBirths": 13026,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 56,
    "name": "채아",
    "totalBirths": 13001,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 57,
    "name": "서율",
    "totalBirths": 12944,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 58,
    "name": "나윤",
    "totalBirths": 12791,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 59,
    "name": "하연",
    "totalBirths": 12731,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 60,
    "name": "지율",
    "totalBirths": 12615,
    "gender": null,
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 61,
    "name": "다연",
    "totalBirths": 12605,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 62,
    "name": "현서",
    "totalBirths": 11824,
    "gender": null,
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 63,
    "name": "이서",
    "totalBirths": 11808,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 64,
    "name": "다현",
    "totalBirths": 11322,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 65,
    "name": "유빈",
    "totalBirths": 11242,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 66,
    "name": "소은",
    "totalBirths": 11167,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 67,
    "name": "서진",
    "totalBirths": 11010,
    "gender": "M",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 68,
    "name": "예지",
    "totalBirths": 10945,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 69,
    "name": "사랑",
    "totalBirths": 10790,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 70,
    "name": "수현",
    "totalBirths": 10765,
    "gender": null,
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 71,
    "name": "세아",
    "totalBirths": 10617,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 72,
    "name": "나연",
    "totalBirths": 10495,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 73,
    "name": "은채",
    "totalBirths": 10311,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 74,
    "name": "지은",
    "totalBirths": 10160,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 75,
    "name": "다윤",
    "totalBirths": 9997,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 76,
    "name": "시현",
    "totalBirths": 9944,
    "gender": null,
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 77,
    "name": "예빈",
    "totalBirths": 9857,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 78,
    "name": "주하",
    "totalBirths": 9464,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 79,
    "name": "채린",
    "totalBirths": 9351,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 80,
    "name": "민주",
    "totalBirths": 9313,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 81,
    "name": "다온",
    "totalBirths": 9272,
    "gender": null,
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 82,
    "name": "지수",
    "totalBirths": 9257,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 83,
    "name": "윤지",
    "totalBirths": 9183,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 84,
    "name": "유하",
    "totalBirths": 9164,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 85,
    "name": "지현",
    "totalBirths": 9158,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 86,
    "name": "소연",
    "totalBirths": 9130,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 87,
    "name": "소민",
    "totalBirths": 9025,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 88,
    "name": "승아",
    "totalBirths": 8840,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 89,
    "name": "하영",
    "totalBirths": 8832,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 90,
    "name": "소이",
    "totalBirths": 8787,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 91,
    "name": "리아",
    "totalBirths": 8521,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 92,
    "name": "세은",
    "totalBirths": 8494,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 93,
    "name": "윤슬",
    "totalBirths": 8440,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 94,
    "name": "혜원",
    "totalBirths": 8396,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 95,
    "name": "민아",
    "totalBirths": 8391,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 96,
    "name": "서희",
    "totalBirths": 8317,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 97,
    "name": "나현",
    "totalBirths": 8265,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 98,
    "name": "아현",
    "totalBirths": 8215,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 99,
    "name": "아영",
    "totalBirths": 8193,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 100,
    "name": "재이",
    "totalBirths": 8123,
    "gender": "F",
    "page": 2,
    "pageGender": "F"
  },
  {
    "rank": 101,
    "name": "도연",
    "totalBirths": 8079,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 102,
    "name": "규리",
    "totalBirths": 7851,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 103,
    "name": "채이",
    "totalBirths": 7748,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 104,
    "name": "민채",
    "totalBirths": 7504,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 105,
    "name": "연아",
    "totalBirths": 7486,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 106,
    "name": "가윤",
    "totalBirths": 7326,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 107,
    "name": "시윤",
    "totalBirths": 7203,
    "gender": "M",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 108,
    "name": "지연",
    "totalBirths": 7166,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 109,
    "name": "태희",
    "totalBirths": 7139,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 110,
    "name": "주은",
    "totalBirths": 7109,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 111,
    "name": "예림",
    "totalBirths": 7027,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 112,
    "name": "봄",
    "totalBirths": 7007,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 113,
    "name": "설아",
    "totalBirths": 6913,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 114,
    "name": "윤하",
    "totalBirths": 6804,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 115,
    "name": "유정",
    "totalBirths": 6790,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 116,
    "name": "정원",
    "totalBirths": 6741,
    "gender": null,
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 117,
    "name": "라희",
    "totalBirths": 6646,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 118,
    "name": "소현",
    "totalBirths": 6618,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 119,
    "name": "보민",
    "totalBirths": 6575,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 120,
    "name": "로아",
    "totalBirths": 6566,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 121,
    "name": "세연",
    "totalBirths": 6423,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 122,
    "name": "수진",
    "totalBirths": 6407,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 123,
    "name": "민정",
    "totalBirths": 6358,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 124,
    "name": "하늘",
    "totalBirths": 6350,
    "gender": null,
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 125,
    "name": "현지",
    "totalBirths": 6269,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 126,
    "name": "지효",
    "totalBirths": 6189,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 127,
    "name": "가현",
    "totalBirths": 6174,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 128,
    "name": "나경",
    "totalBirths": 6141,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 129,
    "name": "하나",
    "totalBirths": 6044,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 130,
    "name": "가온",
    "totalBirths": 6042,
    "gender": null,
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 131,
    "name": "태리",
    "totalBirths": 6032,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 132,
    "name": "민경",
    "totalBirths": 6016,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 133,
    "name": "가연",
    "totalBirths": 5924,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 134,
    "name": "은지",
    "totalBirths": 5923,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 135,
    "name": "한별",
    "totalBirths": 5905,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 136,
    "name": "소희",
    "totalBirths": 5869,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 137,
    "name": "예슬",
    "totalBirths": 5832,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 138,
    "name": "태린",
    "totalBirths": 5809,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 139,
    "name": "채연",
    "totalBirths": 5793,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 140,
    "name": "단아",
    "totalBirths": 5791,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 141,
    "name": "이현",
    "totalBirths": 5778,
    "gender": "M",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 142,
    "name": "하랑",
    "totalBirths": 5681,
    "gender": null,
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 143,
    "name": "하진",
    "totalBirths": 5590,
    "gender": "M",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 144,
    "name": "은솔",
    "totalBirths": 5582,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 145,
    "name": "이나",
    "totalBirths": 5533,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 146,
    "name": "채민",
    "totalBirths": 5501,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 147,
    "name": "도아",
    "totalBirths": 5497,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 148,
    "name": "현아",
    "totalBirths": 5465,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 149,
    "name": "유리",
    "totalBirths": 5451,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 150,
    "name": "다솜",
    "totalBirths": 5395,
    "gender": "F",
    "page": 3,
    "pageGender": "F"
  },
  {
    "rank": 151,
    "name": "은유",
    "totalBirths": 5384,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 152,
    "name": "유림",
    "totalBirths": 5355,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 153,
    "name": "효주",
    "totalBirths": 5327,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 154,
    "name": "예주",
    "totalBirths": 5303,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 155,
    "name": "다희",
    "totalBirths": 5240,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 156,
    "name": "다빈",
    "totalBirths": 5221,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 157,
    "name": "이솔",
    "totalBirths": 5109,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 158,
    "name": "유민",
    "totalBirths": 5108,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 159,
    "name": "태연",
    "totalBirths": 5098,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 160,
    "name": "혜린",
    "totalBirths": 5063,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 161,
    "name": "은우",
    "totalBirths": 5047,
    "gender": "M",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 162,
    "name": "지온",
    "totalBirths": 5027,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 163,
    "name": "주연",
    "totalBirths": 4994,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 164,
    "name": "가영",
    "totalBirths": 4981,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 165,
    "name": "루아",
    "totalBirths": 4916,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 165,
    "name": "시온",
    "totalBirths": 4916,
    "gender": "M",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 167,
    "name": "하람",
    "totalBirths": 4845,
    "gender": "M",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 168,
    "name": "고은",
    "totalBirths": 4819,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 169,
    "name": "태은",
    "totalBirths": 4818,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 170,
    "name": "혜인",
    "totalBirths": 4771,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 171,
    "name": "다혜",
    "totalBirths": 4733,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 172,
    "name": "민하",
    "totalBirths": 4716,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 173,
    "name": "아라",
    "totalBirths": 4700,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 174,
    "name": "재인",
    "totalBirths": 4665,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 175,
    "name": "해인",
    "totalBirths": 4645,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 176,
    "name": "아진",
    "totalBirths": 4620,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 177,
    "name": "지혜",
    "totalBirths": 4566,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 178,
    "name": "예솔",
    "totalBirths": 4549,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 179,
    "name": "수인",
    "totalBirths": 4535,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 180,
    "name": "솔",
    "totalBirths": 4517,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 181,
    "name": "나율",
    "totalBirths": 4510,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 182,
    "name": "율",
    "totalBirths": 4506,
    "gender": "M",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 183,
    "name": "채영",
    "totalBirths": 4498,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 183,
    "name": "해나",
    "totalBirths": 4498,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 185,
    "name": "유이",
    "totalBirths": 4490,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 186,
    "name": "지영",
    "totalBirths": 4474,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 187,
    "name": "수정",
    "totalBirths": 4470,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 188,
    "name": "라온",
    "totalBirths": 4446,
    "gender": null,
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 189,
    "name": "승연",
    "totalBirths": 4422,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 190,
    "name": "주원",
    "totalBirths": 4412,
    "gender": "M",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 191,
    "name": "유은",
    "totalBirths": 4406,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 192,
    "name": "수지",
    "totalBirths": 4367,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 193,
    "name": "서인",
    "totalBirths": 4359,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 194,
    "name": "이안",
    "totalBirths": 4352,
    "gender": "M",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 195,
    "name": "도은",
    "totalBirths": 4323,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 196,
    "name": "가빈",
    "totalBirths": 4322,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 197,
    "name": "별",
    "totalBirths": 4305,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 198,
    "name": "은별",
    "totalBirths": 4303,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 199,
    "name": "서빈",
    "totalBirths": 4301,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 200,
    "name": "도희",
    "totalBirths": 4272,
    "gender": "F",
    "page": 4,
    "pageGender": "F"
  },
  {
    "rank": 201,
    "name": "리안",
    "totalBirths": 4238,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 202,
    "name": "설",
    "totalBirths": 4145,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 203,
    "name": "하리",
    "totalBirths": 4120,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 204,
    "name": "슬아",
    "totalBirths": 4111,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 205,
    "name": "지후",
    "totalBirths": 4107,
    "gender": "M",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 206,
    "name": "다율",
    "totalBirths": 4072,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 207,
    "name": "은재",
    "totalBirths": 4070,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 208,
    "name": "소영",
    "totalBirths": 4061,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 209,
    "name": "채현",
    "totalBirths": 4039,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 210,
    "name": "나영",
    "totalBirths": 4012,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 211,
    "name": "연재",
    "totalBirths": 3935,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 212,
    "name": "한나",
    "totalBirths": 3906,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 213,
    "name": "다영",
    "totalBirths": 3894,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 214,
    "name": "세빈",
    "totalBirths": 3865,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 214,
    "name": "주희",
    "totalBirths": 3865,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 216,
    "name": "리원",
    "totalBirths": 3847,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 217,
    "name": "소미",
    "totalBirths": 3845,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 218,
    "name": "서원",
    "totalBirths": 3825,
    "gender": null,
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 219,
    "name": "보미",
    "totalBirths": 3819,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 220,
    "name": "시우",
    "totalBirths": 3806,
    "gender": "M",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 221,
    "name": "채빈",
    "totalBirths": 3769,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 222,
    "name": "세린",
    "totalBirths": 3768,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 223,
    "name": "보경",
    "totalBirths": 3753,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 224,
    "name": "지호",
    "totalBirths": 3723,
    "gender": "M",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 225,
    "name": "세인",
    "totalBirths": 3721,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 226,
    "name": "정민",
    "totalBirths": 3693,
    "gender": "M",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 227,
    "name": "아연",
    "totalBirths": 3680,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 228,
    "name": "효린",
    "totalBirths": 3654,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 229,
    "name": "예담",
    "totalBirths": 3646,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 230,
    "name": "다원",
    "totalBirths": 3637,
    "gender": null,
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 231,
    "name": "하온",
    "totalBirths": 3607,
    "gender": "M",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 232,
    "name": "정윤",
    "totalBirths": 3600,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 233,
    "name": "은빈",
    "totalBirths": 3585,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 234,
    "name": "소정",
    "totalBirths": 3554,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 235,
    "name": "예인",
    "totalBirths": 3528,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 236,
    "name": "채희",
    "totalBirths": 3503,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 237,
    "name": "라윤",
    "totalBirths": 3473,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 238,
    "name": "제이",
    "totalBirths": 3454,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 239,
    "name": "재희",
    "totalBirths": 3440,
    "gender": null,
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 240,
    "name": "다경",
    "totalBirths": 3436,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 241,
    "name": "연주",
    "totalBirths": 3429,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 242,
    "name": "서정",
    "totalBirths": 3407,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 243,
    "name": "하음",
    "totalBirths": 3380,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 244,
    "name": "정연",
    "totalBirths": 3368,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 245,
    "name": "연지",
    "totalBirths": 3272,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 246,
    "name": "가을",
    "totalBirths": 3266,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 247,
    "name": "준희",
    "totalBirths": 3257,
    "gender": "M",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 248,
    "name": "태이",
    "totalBirths": 3244,
    "gender": null,
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 249,
    "name": "나린",
    "totalBirths": 3220,
    "gender": "F",
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 250,
    "name": "은율",
    "totalBirths": 3209,
    "gender": null,
    "page": 5,
    "pageGender": "F"
  },
  {
    "rank": 251,
    "name": "미소",
    "totalBirths": 3206,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 252,
    "name": "은비",
    "totalBirths": 3199,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 253,
    "name": "윤",
    "totalBirths": 3194,
    "gender": "M",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 254,
    "name": "지인",
    "totalBirths": 3182,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 255,
    "name": "라엘",
    "totalBirths": 3165,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 256,
    "name": "서린",
    "totalBirths": 3154,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 257,
    "name": "유라",
    "totalBirths": 3152,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 258,
    "name": "효은",
    "totalBirths": 3138,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 259,
    "name": "온유",
    "totalBirths": 3122,
    "gender": "M",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 260,
    "name": "새봄",
    "totalBirths": 3117,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 261,
    "name": "하민",
    "totalBirths": 3114,
    "gender": "M",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 262,
    "name": "해린",
    "totalBirths": 3110,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 263,
    "name": "채율",
    "totalBirths": 3103,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 264,
    "name": "희원",
    "totalBirths": 3096,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 265,
    "name": "하엘",
    "totalBirths": 3092,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 266,
    "name": "유안",
    "totalBirths": 3058,
    "gender": "M",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 267,
    "name": "아름",
    "totalBirths": 3049,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 268,
    "name": "가인",
    "totalBirths": 3039,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 269,
    "name": "윤주",
    "totalBirths": 3009,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 270,
    "name": "리나",
    "totalBirths": 2952,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 271,
    "name": "은하",
    "totalBirths": 2944,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 272,
    "name": "소담",
    "totalBirths": 2936,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 273,
    "name": "혜민",
    "totalBirths": 2920,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 274,
    "name": "선우",
    "totalBirths": 2913,
    "gender": "M",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 275,
    "name": "재은",
    "totalBirths": 2904,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 276,
    "name": "은수",
    "totalBirths": 2889,
    "gender": null,
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 277,
    "name": "제인",
    "totalBirths": 2883,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 278,
    "name": "은혜",
    "totalBirths": 2881,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 279,
    "name": "연수",
    "totalBirths": 2872,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 280,
    "name": "혜진",
    "totalBirths": 2871,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 281,
    "name": "윤채",
    "totalBirths": 2862,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 282,
    "name": "아율",
    "totalBirths": 2801,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 283,
    "name": "혜윤",
    "totalBirths": 2794,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 284,
    "name": "단비",
    "totalBirths": 2778,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 285,
    "name": "하루",
    "totalBirths": 2724,
    "gender": null,
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 286,
    "name": "하빈",
    "totalBirths": 2716,
    "gender": null,
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 287,
    "name": "효원",
    "totalBirths": 2703,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 288,
    "name": "민솔",
    "totalBirths": 2680,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 289,
    "name": "현진",
    "totalBirths": 2673,
    "gender": "M",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 290,
    "name": "민영",
    "totalBirths": 2656,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 291,
    "name": "소원",
    "totalBirths": 2652,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 292,
    "name": "세희",
    "totalBirths": 2650,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 293,
    "name": "서이",
    "totalBirths": 2640,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 294,
    "name": "혜빈",
    "totalBirths": 2633,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 295,
    "name": "은설",
    "totalBirths": 2610,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 296,
    "name": "정현",
    "totalBirths": 2582,
    "gender": "M",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 297,
    "name": "세영",
    "totalBirths": 2574,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 298,
    "name": "여원",
    "totalBirths": 2544,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 299,
    "name": "윤진",
    "totalBirths": 2520,
    "gender": "F",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 300,
    "name": "도경",
    "totalBirths": 2513,
    "gender": "M",
    "page": 6,
    "pageGender": "F"
  },
  {
    "rank": 301,
    "name": "가람",
    "totalBirths": 2493,
    "gender": null,
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 302,
    "name": "진서",
    "totalBirths": 2477,
    "gender": null,
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 303,
    "name": "다정",
    "totalBirths": 2472,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 304,
    "name": "혜리",
    "totalBirths": 2465,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 305,
    "name": "하임",
    "totalBirths": 2463,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 306,
    "name": "정은",
    "totalBirths": 2458,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 307,
    "name": "여진",
    "totalBirths": 2454,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 308,
    "name": "진아",
    "totalBirths": 2437,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 309,
    "name": "유경",
    "totalBirths": 2433,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 310,
    "name": "주현",
    "totalBirths": 2411,
    "gender": null,
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 311,
    "name": "다예",
    "totalBirths": 2402,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 312,
    "name": "라임",
    "totalBirths": 2379,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 313,
    "name": "은성",
    "totalBirths": 2376,
    "gender": "M",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 314,
    "name": "현주",
    "totalBirths": 2358,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 315,
    "name": "연희",
    "totalBirths": 2328,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 316,
    "name": "해솔",
    "totalBirths": 2317,
    "gender": null,
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 317,
    "name": "시하",
    "totalBirths": 2314,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 318,
    "name": "현정",
    "totalBirths": 2302,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 319,
    "name": "아림",
    "totalBirths": 2280,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 320,
    "name": "효민",
    "totalBirths": 2276,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 321,
    "name": "혜림",
    "totalBirths": 2256,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 322,
    "name": "가희",
    "totalBirths": 2236,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 323,
    "name": "규빈",
    "totalBirths": 2206,
    "gender": "M",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 323,
    "name": "다미",
    "totalBirths": 2206,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 325,
    "name": "주영",
    "totalBirths": 2200,
    "gender": "M",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 326,
    "name": "소유",
    "totalBirths": 2188,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 327,
    "name": "지예",
    "totalBirths": 2181,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 328,
    "name": "윤솔",
    "totalBirths": 2180,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 329,
    "name": "시원",
    "totalBirths": 2177,
    "gender": "M",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 330,
    "name": "가율",
    "totalBirths": 2155,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 331,
    "name": "이진",
    "totalBirths": 2151,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 331,
    "name": "예온",
    "totalBirths": 2151,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 333,
    "name": "지희",
    "totalBirths": 2144,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 333,
    "name": "시율",
    "totalBirths": 2144,
    "gender": "M",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 335,
    "name": "재아",
    "totalBirths": 2124,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 336,
    "name": "다민",
    "totalBirths": 2109,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 337,
    "name": "하정",
    "totalBirths": 2095,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 338,
    "name": "희주",
    "totalBirths": 2091,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 339,
    "name": "수영",
    "totalBirths": 2070,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 340,
    "name": "효빈",
    "totalBirths": 2063,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 340,
    "name": "우리",
    "totalBirths": 2063,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 342,
    "name": "려원",
    "totalBirths": 2062,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 343,
    "name": "선아",
    "totalBirths": 2055,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 344,
    "name": "혜주",
    "totalBirths": 2051,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 345,
    "name": "로하",
    "totalBirths": 2038,
    "gender": null,
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 346,
    "name": "리하",
    "totalBirths": 2025,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 347,
    "name": "시안",
    "totalBirths": 2020,
    "gender": "M",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 348,
    "name": "이수",
    "totalBirths": 2004,
    "gender": null,
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 349,
    "name": "은아",
    "totalBirths": 1995,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 350,
    "name": "루나",
    "totalBirths": 1981,
    "gender": "F",
    "page": 7,
    "pageGender": "F"
  },
  {
    "rank": 351,
    "name": "은진",
    "totalBirths": 1960,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 352,
    "name": "별하",
    "totalBirths": 1959,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 353,
    "name": "시영",
    "totalBirths": 1954,
    "gender": null,
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 354,
    "name": "우주",
    "totalBirths": 1953,
    "gender": "M",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 355,
    "name": "승희",
    "totalBirths": 1946,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 356,
    "name": "하경",
    "totalBirths": 1938,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 357,
    "name": "지오",
    "totalBirths": 1932,
    "gender": "M",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 358,
    "name": "윤희",
    "totalBirths": 1928,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 359,
    "name": "규린",
    "totalBirths": 1912,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 360,
    "name": "도이",
    "totalBirths": 1907,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 361,
    "name": "나희",
    "totalBirths": 1903,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 362,
    "name": "선유",
    "totalBirths": 1897,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 363,
    "name": "라율",
    "totalBirths": 1868,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 364,
    "name": "혜나",
    "totalBirths": 1865,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 365,
    "name": "루리",
    "totalBirths": 1858,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 366,
    "name": "로희",
    "totalBirths": 1844,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 367,
    "name": "하이",
    "totalBirths": 1840,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 368,
    "name": "서안",
    "totalBirths": 1824,
    "gender": null,
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 369,
    "name": "인서",
    "totalBirths": 1822,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 370,
    "name": "희진",
    "totalBirths": 1801,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 371,
    "name": "윤정",
    "totalBirths": 1794,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 372,
    "name": "효정",
    "totalBirths": 1790,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 373,
    "name": "예리",
    "totalBirths": 1785,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 374,
    "name": "정인",
    "totalBirths": 1783,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 375,
    "name": "효진",
    "totalBirths": 1763,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 376,
    "name": "승현",
    "totalBirths": 1754,
    "gender": "M",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 377,
    "name": "라은",
    "totalBirths": 1744,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 378,
    "name": "여름",
    "totalBirths": 1743,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 379,
    "name": "아정",
    "totalBirths": 1741,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 380,
    "name": "성은",
    "totalBirths": 1735,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 381,
    "name": "하늬",
    "totalBirths": 1730,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 382,
    "name": "루다",
    "totalBirths": 1723,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 383,
    "name": "해원",
    "totalBirths": 1717,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 384,
    "name": "영은",
    "totalBirths": 1696,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 385,
    "name": "세현",
    "totalBirths": 1690,
    "gender": "M",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 385,
    "name": "보영",
    "totalBirths": 1690,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 387,
    "name": "은영",
    "totalBirths": 1685,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 388,
    "name": "송현",
    "totalBirths": 1677,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 389,
    "name": "규림",
    "totalBirths": 1673,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 390,
    "name": "영서",
    "totalBirths": 1663,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 391,
    "name": "아란",
    "totalBirths": 1657,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 392,
    "name": "인아",
    "totalBirths": 1656,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 393,
    "name": "채하",
    "totalBirths": 1646,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 394,
    "name": "다솔",
    "totalBirths": 1645,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 395,
    "name": "민희",
    "totalBirths": 1639,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 395,
    "name": "선율",
    "totalBirths": 1639,
    "gender": "M",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 397,
    "name": "도윤",
    "totalBirths": 1624,
    "gender": "M",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 398,
    "name": "아리",
    "totalBirths": 1617,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 399,
    "name": "담희",
    "totalBirths": 1612,
    "gender": "F",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 400,
    "name": "유담",
    "totalBirths": 1611,
    "gender": "M",
    "page": 8,
    "pageGender": "F"
  },
  {
    "rank": 401,
    "name": "로은",
    "totalBirths": 1609,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 402,
    "name": "희서",
    "totalBirths": 1605,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 403,
    "name": "린",
    "totalBirths": 1582,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 403,
    "name": "민선",
    "totalBirths": 1582,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 405,
    "name": "유현",
    "totalBirths": 1581,
    "gender": "M",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 406,
    "name": "이레",
    "totalBirths": 1579,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 407,
    "name": "수린",
    "totalBirths": 1570,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 408,
    "name": "이담",
    "totalBirths": 1554,
    "gender": null,
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 409,
    "name": "승주",
    "totalBirths": 1539,
    "gender": "M",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 410,
    "name": "소예",
    "totalBirths": 1531,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 411,
    "name": "유미",
    "totalBirths": 1509,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 412,
    "name": "가원",
    "totalBirths": 1503,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 413,
    "name": "은",
    "totalBirths": 1499,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 414,
    "name": "다해",
    "totalBirths": 1494,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 415,
    "name": "효림",
    "totalBirths": 1485,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 416,
    "name": "해윤",
    "totalBirths": 1481,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 417,
    "name": "빛나",
    "totalBirths": 1471,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 418,
    "name": "희수",
    "totalBirths": 1466,
    "gender": null,
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 419,
    "name": "윤설",
    "totalBirths": 1465,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 420,
    "name": "선영",
    "totalBirths": 1457,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 421,
    "name": "도영",
    "totalBirths": 1453,
    "gender": "M",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 422,
    "name": "제니",
    "totalBirths": 1442,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 423,
    "name": "하라",
    "totalBirths": 1439,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 424,
    "name": "정아",
    "totalBirths": 1435,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 425,
    "name": "아람",
    "totalBirths": 1430,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 426,
    "name": "지나",
    "totalBirths": 1410,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 427,
    "name": "희연",
    "totalBirths": 1409,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 428,
    "name": "슬",
    "totalBirths": 1399,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 428,
    "name": "이은",
    "totalBirths": 1399,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 428,
    "name": "수안",
    "totalBirths": 1399,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 431,
    "name": "한비",
    "totalBirths": 1388,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 432,
    "name": "해리",
    "totalBirths": 1382,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 433,
    "name": "초아",
    "totalBirths": 1371,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 434,
    "name": "진",
    "totalBirths": 1357,
    "gender": null,
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 435,
    "name": "예람",
    "totalBirths": 1353,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 436,
    "name": "여은",
    "totalBirths": 1341,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 437,
    "name": "서유",
    "totalBirths": 1331,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 438,
    "name": "나예",
    "totalBirths": 1330,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 439,
    "name": "하원",
    "totalBirths": 1325,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 440,
    "name": "세령",
    "totalBirths": 1320,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 441,
    "name": "여울",
    "totalBirths": 1318,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 441,
    "name": "예랑",
    "totalBirths": 1318,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 443,
    "name": "은정",
    "totalBirths": 1317,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 444,
    "name": "세나",
    "totalBirths": 1307,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 445,
    "name": "혜연",
    "totalBirths": 1305,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 445,
    "name": "서경",
    "totalBirths": 1305,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 447,
    "name": "설하",
    "totalBirths": 1304,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 448,
    "name": "다겸",
    "totalBirths": 1302,
    "gender": null,
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 449,
    "name": "은주",
    "totalBirths": 1291,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 450,
    "name": "송연",
    "totalBirths": 1284,
    "gender": "F",
    "page": 9,
    "pageGender": "F"
  },
  {
    "rank": 451,
    "name": "세하",
    "totalBirths": 1283,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 452,
    "name": "예윤",
    "totalBirths": 1267,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 453,
    "name": "민",
    "totalBirths": 1264,
    "gender": "M",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 454,
    "name": "누리",
    "totalBirths": 1263,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 455,
    "name": "수하",
    "totalBirths": 1260,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 455,
    "name": "윤영",
    "totalBirths": 1260,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 457,
    "name": "세진",
    "totalBirths": 1255,
    "gender": "M",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 458,
    "name": "하선",
    "totalBirths": 1253,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 459,
    "name": "예령",
    "totalBirths": 1233,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 460,
    "name": "나원",
    "totalBirths": 1227,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 461,
    "name": "조이",
    "totalBirths": 1207,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 462,
    "name": "세라",
    "totalBirths": 1205,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 463,
    "name": "이엘",
    "totalBirths": 1187,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 464,
    "name": "다나",
    "totalBirths": 1171,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 465,
    "name": "안나",
    "totalBirths": 1168,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 465,
    "name": "진주",
    "totalBirths": 1168,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 467,
    "name": "예봄",
    "totalBirths": 1166,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 468,
    "name": "예영",
    "totalBirths": 1165,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 469,
    "name": "경민",
    "totalBirths": 1162,
    "gender": "M",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 470,
    "name": "도하",
    "totalBirths": 1149,
    "gender": "M",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 471,
    "name": "제나",
    "totalBirths": 1147,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 472,
    "name": "혜정",
    "totalBirths": 1145,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 473,
    "name": "아랑",
    "totalBirths": 1139,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 474,
    "name": "태인",
    "totalBirths": 1136,
    "gender": "M",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 475,
    "name": "이설",
    "totalBirths": 1132,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 476,
    "name": "시유",
    "totalBirths": 1125,
    "gender": null,
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 477,
    "name": "진희",
    "totalBirths": 1119,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 478,
    "name": "태경",
    "totalBirths": 1112,
    "gender": "M",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 479,
    "name": "나라",
    "totalBirths": 1109,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 480,
    "name": "수경",
    "totalBirths": 1106,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 481,
    "name": "이솜",
    "totalBirths": 1102,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 482,
    "name": "현",
    "totalBirths": 1093,
    "gender": "M",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 483,
    "name": "민진",
    "totalBirths": 1089,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 484,
    "name": "율아",
    "totalBirths": 1076,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 485,
    "name": "인영",
    "totalBirths": 1074,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 486,
    "name": "보현",
    "totalBirths": 1068,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 487,
    "name": "예현",
    "totalBirths": 1067,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 488,
    "name": "아민",
    "totalBirths": 1064,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 489,
    "name": "세이",
    "totalBirths": 1058,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 490,
    "name": "성연",
    "totalBirths": 1045,
    "gender": null,
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 490,
    "name": "가민",
    "totalBirths": 1045,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 492,
    "name": "정빈",
    "totalBirths": 1041,
    "gender": "M",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 493,
    "name": "미나",
    "totalBirths": 1039,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 494,
    "name": "로이",
    "totalBirths": 1033,
    "gender": "M",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 495,
    "name": "한솔",
    "totalBirths": 1027,
    "gender": "M",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 496,
    "name": "희윤",
    "totalBirths": 1023,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 497,
    "name": "해온",
    "totalBirths": 1022,
    "gender": null,
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 498,
    "name": "채안",
    "totalBirths": 1019,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 499,
    "name": "승은",
    "totalBirths": 1017,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 500,
    "name": "연진",
    "totalBirths": 1013,
    "gender": "F",
    "page": 10,
    "pageGender": "F"
  },
  {
    "rank": 500,
    "name": "주이",
    "totalBirths": 1013,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 502,
    "name": "나래",
    "totalBirths": 1012,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 503,
    "name": "서온",
    "totalBirths": 1010,
    "gender": null,
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 504,
    "name": "경은",
    "totalBirths": 997,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 505,
    "name": "민설",
    "totalBirths": 987,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 506,
    "name": "이랑",
    "totalBirths": 982,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 507,
    "name": "사라",
    "totalBirths": 979,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 507,
    "name": "규원",
    "totalBirths": 979,
    "gender": "M",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 509,
    "name": "로운",
    "totalBirths": 976,
    "gender": "M",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 510,
    "name": "희정",
    "totalBirths": 974,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 511,
    "name": "유솔",
    "totalBirths": 964,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 512,
    "name": "규민",
    "totalBirths": 951,
    "gender": "M",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 513,
    "name": "재연",
    "totalBirths": 950,
    "gender": null,
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 514,
    "name": "린아",
    "totalBirths": 949,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 515,
    "name": "유아",
    "totalBirths": 940,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 516,
    "name": "태림",
    "totalBirths": 925,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 517,
    "name": "세윤",
    "totalBirths": 921,
    "gender": "M",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 518,
    "name": "채령",
    "totalBirths": 918,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 519,
    "name": "솜",
    "totalBirths": 916,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 520,
    "name": "리우",
    "totalBirths": 910,
    "gender": "M",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 521,
    "name": "샛별",
    "totalBirths": 909,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 522,
    "name": "주혜",
    "totalBirths": 893,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 523,
    "name": "지선",
    "totalBirths": 891,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 524,
    "name": "라원",
    "totalBirths": 890,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 525,
    "name": "혜은",
    "totalBirths": 888,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 525,
    "name": "보라",
    "totalBirths": 888,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 527,
    "name": "초은",
    "totalBirths": 887,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 528,
    "name": "에스더",
    "totalBirths": 882,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 529,
    "name": "재윤",
    "totalBirths": 880,
    "gender": "M",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 530,
    "name": "혜영",
    "totalBirths": 877,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 531,
    "name": "기쁨",
    "totalBirths": 861,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 531,
    "name": "송이",
    "totalBirths": 861,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 533,
    "name": "보윤",
    "totalBirths": 854,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 534,
    "name": "나온",
    "totalBirths": 853,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 535,
    "name": "성아",
    "totalBirths": 850,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 536,
    "name": "슬기",
    "totalBirths": 845,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 537,
    "name": "채유",
    "totalBirths": 829,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 538,
    "name": "예하",
    "totalBirths": 827,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 539,
    "name": "미주",
    "totalBirths": 826,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 540,
    "name": "연후",
    "totalBirths": 824,
    "gender": "M",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 541,
    "name": "설희",
    "totalBirths": 823,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 542,
    "name": "보람",
    "totalBirths": 821,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 543,
    "name": "주빈",
    "totalBirths": 820,
    "gender": null,
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 544,
    "name": "세림",
    "totalBirths": 812,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 545,
    "name": "혜령",
    "totalBirths": 810,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 546,
    "name": "진영",
    "totalBirths": 808,
    "gender": "M",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 546,
    "name": "유희",
    "totalBirths": 808,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 548,
    "name": "고운",
    "totalBirths": 806,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 549,
    "name": "루하",
    "totalBirths": 794,
    "gender": null,
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 550,
    "name": "나엘",
    "totalBirths": 793,
    "gender": "F",
    "page": 11,
    "pageGender": "F"
  },
  {
    "rank": 551,
    "name": "시언",
    "totalBirths": 792,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 552,
    "name": "소망",
    "totalBirths": 791,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 553,
    "name": "채림",
    "totalBirths": 790,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 554,
    "name": "예안",
    "totalBirths": 785,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 555,
    "name": "승하",
    "totalBirths": 781,
    "gender": null,
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 556,
    "name": "도담",
    "totalBirths": 778,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 557,
    "name": "도현",
    "totalBirths": 775,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 558,
    "name": "은송",
    "totalBirths": 773,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 559,
    "name": "호연",
    "totalBirths": 767,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 560,
    "name": "율리",
    "totalBirths": 762,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 560,
    "name": "라현",
    "totalBirths": 762,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 562,
    "name": "소진",
    "totalBirths": 760,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 563,
    "name": "윤경",
    "totalBirths": 758,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 564,
    "name": "새별",
    "totalBirths": 756,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 565,
    "name": "율희",
    "totalBirths": 752,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 565,
    "name": "율하",
    "totalBirths": 752,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 567,
    "name": "지애",
    "totalBirths": 751,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 568,
    "name": "가령",
    "totalBirths": 741,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 569,
    "name": "시호",
    "totalBirths": 740,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 569,
    "name": "한결",
    "totalBirths": 740,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 571,
    "name": "서후",
    "totalBirths": 738,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 572,
    "name": "보빈",
    "totalBirths": 736,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 573,
    "name": "아은",
    "totalBirths": 734,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 574,
    "name": "민재",
    "totalBirths": 733,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 575,
    "name": "은결",
    "totalBirths": 730,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 576,
    "name": "효인",
    "totalBirths": 729,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 576,
    "name": "리윤",
    "totalBirths": 729,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 578,
    "name": "다엘",
    "totalBirths": 726,
    "gender": null,
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 578,
    "name": "은호",
    "totalBirths": 726,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 580,
    "name": "리온",
    "totalBirths": 725,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 581,
    "name": "현경",
    "totalBirths": 721,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 582,
    "name": "보아",
    "totalBirths": 720,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 582,
    "name": "나혜",
    "totalBirths": 720,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 582,
    "name": "영주",
    "totalBirths": 720,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 582,
    "name": "민유",
    "totalBirths": 720,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 586,
    "name": "제아",
    "totalBirths": 718,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 587,
    "name": "연두",
    "totalBirths": 717,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 588,
    "name": "레아",
    "totalBirths": 713,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 589,
    "name": "예음",
    "totalBirths": 710,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 590,
    "name": "예승",
    "totalBirths": 709,
    "gender": null,
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 591,
    "name": "혜지",
    "totalBirths": 707,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 592,
    "name": "하림",
    "totalBirths": 705,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 593,
    "name": "선하",
    "totalBirths": 701,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 594,
    "name": "세민",
    "totalBirths": 696,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 595,
    "name": "채리",
    "totalBirths": 695,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 596,
    "name": "담이",
    "totalBirths": 686,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 597,
    "name": "단",
    "totalBirths": 682,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 598,
    "name": "이재",
    "totalBirths": 679,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 599,
    "name": "태영",
    "totalBirths": 678,
    "gender": "M",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 600,
    "name": "세정",
    "totalBirths": 677,
    "gender": "F",
    "page": 12,
    "pageGender": "F"
  },
  {
    "rank": 601,
    "name": "루비",
    "totalBirths": 673,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 602,
    "name": "은희",
    "totalBirths": 671,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 603,
    "name": "세온",
    "totalBirths": 667,
    "gender": null,
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 604,
    "name": "나겸",
    "totalBirths": 664,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 605,
    "name": "하니",
    "totalBirths": 663,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 606,
    "name": "규연",
    "totalBirths": 659,
    "gender": null,
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 607,
    "name": "은경",
    "totalBirths": 654,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 608,
    "name": "소빈",
    "totalBirths": 648,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 609,
    "name": "담",
    "totalBirths": 643,
    "gender": null,
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 610,
    "name": "엘리",
    "totalBirths": 642,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 611,
    "name": "선민",
    "totalBirths": 641,
    "gender": null,
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 612,
    "name": "이든",
    "totalBirths": 640,
    "gender": "M",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 612,
    "name": "하솜",
    "totalBirths": 640,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 614,
    "name": "서주",
    "totalBirths": 639,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 614,
    "name": "연정",
    "totalBirths": 639,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 616,
    "name": "유연",
    "totalBirths": 638,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 617,
    "name": "예율",
    "totalBirths": 636,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 618,
    "name": "지언",
    "totalBirths": 635,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 619,
    "name": "보은",
    "totalBirths": 634,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 620,
    "name": "주윤",
    "totalBirths": 630,
    "gender": null,
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 620,
    "name": "미래",
    "totalBirths": 630,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 622,
    "name": "선",
    "totalBirths": 629,
    "gender": null,
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 623,
    "name": "나림",
    "totalBirths": 628,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 624,
    "name": "보연",
    "totalBirths": 627,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 625,
    "name": "예설",
    "totalBirths": 625,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 626,
    "name": "주안",
    "totalBirths": 621,
    "gender": "M",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 627,
    "name": "우림",
    "totalBirths": 620,
    "gender": "M",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 627,
    "name": "효리",
    "totalBirths": 620,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 629,
    "name": "희선",
    "totalBirths": 618,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 630,
    "name": "보나",
    "totalBirths": 617,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 631,
    "name": "은교",
    "totalBirths": 614,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 631,
    "name": "소을",
    "totalBirths": 614,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 631,
    "name": "이정",
    "totalBirths": 614,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 634,
    "name": "재원",
    "totalBirths": 612,
    "gender": "M",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 635,
    "name": "하현",
    "totalBirths": 610,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 636,
    "name": "영채",
    "totalBirths": 608,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 637,
    "name": "윤이",
    "totalBirths": 606,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 638,
    "name": "연",
    "totalBirths": 604,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 639,
    "name": "바다",
    "totalBirths": 602,
    "gender": null,
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 639,
    "name": "이음",
    "totalBirths": 602,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 639,
    "name": "송희",
    "totalBirths": 602,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 642,
    "name": "지음",
    "totalBirths": 601,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 643,
    "name": "희은",
    "totalBirths": 600,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 644,
    "name": "희",
    "totalBirths": 599,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 645,
    "name": "세경",
    "totalBirths": 594,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 645,
    "name": "지빈",
    "totalBirths": 594,
    "gender": null,
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 647,
    "name": "하솔",
    "totalBirths": 587,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 648,
    "name": "새론",
    "totalBirths": 585,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 648,
    "name": "나리",
    "totalBirths": 585,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 648,
    "name": "현희",
    "totalBirths": 585,
    "gender": "F",
    "page": 13,
    "pageGender": "F"
  },
  {
    "rank": 651,
    "name": "혜율",
    "totalBirths": 582,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 652,
    "name": "재경",
    "totalBirths": 581,
    "gender": "M",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 653,
    "name": "희재",
    "totalBirths": 577,
    "gender": "M",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 654,
    "name": "루미",
    "totalBirths": 573,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 654,
    "name": "한서",
    "totalBirths": 573,
    "gender": "M",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 654,
    "name": "승민",
    "totalBirths": 573,
    "gender": "M",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 657,
    "name": "강희",
    "totalBirths": 572,
    "gender": "M",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 658,
    "name": "세리",
    "totalBirths": 571,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 659,
    "name": "수희",
    "totalBirths": 568,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 660,
    "name": "이봄",
    "totalBirths": 567,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 661,
    "name": "세원",
    "totalBirths": 566,
    "gender": null,
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 661,
    "name": "민교",
    "totalBirths": 566,
    "gender": null,
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 661,
    "name": "하령",
    "totalBirths": 566,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 664,
    "name": "지이",
    "totalBirths": 561,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 665,
    "name": "그린",
    "totalBirths": 560,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 666,
    "name": "소울",
    "totalBirths": 558,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 667,
    "name": "채경",
    "totalBirths": 557,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 668,
    "name": "주미",
    "totalBirths": 556,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 668,
    "name": "재영",
    "totalBirths": 556,
    "gender": "M",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 668,
    "name": "지서",
    "totalBirths": 556,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 671,
    "name": "세미",
    "totalBirths": 555,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 672,
    "name": "선주",
    "totalBirths": 554,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 673,
    "name": "예솜",
    "totalBirths": 553,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 674,
    "name": "애린",
    "totalBirths": 550,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 675,
    "name": "리예",
    "totalBirths": 549,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 676,
    "name": "희영",
    "totalBirths": 547,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 677,
    "name": "샤론",
    "totalBirths": 545,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 678,
    "name": "승혜",
    "totalBirths": 543,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 679,
    "name": "해민",
    "totalBirths": 540,
    "gender": null,
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 680,
    "name": "민송",
    "totalBirths": 539,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 681,
    "name": "결",
    "totalBirths": 537,
    "gender": "M",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 682,
    "name": "도원",
    "totalBirths": 536,
    "gender": "M",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 682,
    "name": "연경",
    "totalBirths": 536,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 684,
    "name": "혜선",
    "totalBirths": 535,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 684,
    "name": "태윤",
    "totalBirths": 535,
    "gender": "M",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 686,
    "name": "윤선",
    "totalBirths": 534,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 687,
    "name": "예소",
    "totalBirths": 532,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 688,
    "name": "아빈",
    "totalBirths": 531,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 688,
    "name": "은선",
    "totalBirths": 531,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 690,
    "name": "경빈",
    "totalBirths": 530,
    "gender": "M",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 690,
    "name": "하얀",
    "totalBirths": 530,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 690,
    "name": "수미",
    "totalBirths": 530,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 690,
    "name": "윤우",
    "totalBirths": 530,
    "gender": "M",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 694,
    "name": "루희",
    "totalBirths": 529,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 695,
    "name": "유선",
    "totalBirths": 526,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 696,
    "name": "민혜",
    "totalBirths": 525,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 697,
    "name": "혜성",
    "totalBirths": 523,
    "gender": "M",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 698,
    "name": "유영",
    "totalBirths": 522,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 699,
    "name": "예성",
    "totalBirths": 520,
    "gender": "M",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 700,
    "name": "려은",
    "totalBirths": 519,
    "gender": "F",
    "page": 14,
    "pageGender": "F"
  },
  {
    "rank": 700,
    "name": "인혜",
    "totalBirths": 519,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 702,
    "name": "호정",
    "totalBirths": 517,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 703,
    "name": "보배",
    "totalBirths": 515,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 703,
    "name": "성현",
    "totalBirths": 515,
    "gender": "M",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 703,
    "name": "다애",
    "totalBirths": 515,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 706,
    "name": "단하",
    "totalBirths": 514,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 707,
    "name": "선빈",
    "totalBirths": 511,
    "gender": null,
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 707,
    "name": "미진",
    "totalBirths": 511,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 709,
    "name": "근영",
    "totalBirths": 509,
    "gender": null,
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 710,
    "name": "이슬",
    "totalBirths": 506,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 711,
    "name": "선미",
    "totalBirths": 505,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 712,
    "name": "윤빈",
    "totalBirths": 503,
    "gender": null,
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 713,
    "name": "성희",
    "totalBirths": 502,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 714,
    "name": "혜수",
    "totalBirths": 500,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 715,
    "name": "혜서",
    "totalBirths": 498,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 715,
    "name": "현영",
    "totalBirths": 498,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 717,
    "name": "단희",
    "totalBirths": 496,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 717,
    "name": "슬비",
    "totalBirths": 496,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 717,
    "name": "경원",
    "totalBirths": 496,
    "gender": "M",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 720,
    "name": "이지",
    "totalBirths": 494,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 721,
    "name": "민소",
    "totalBirths": 492,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 722,
    "name": "정안",
    "totalBirths": 491,
    "gender": null,
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 723,
    "name": "정하",
    "totalBirths": 490,
    "gender": null,
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 723,
    "name": "선혜",
    "totalBirths": 490,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 725,
    "name": "리현",
    "totalBirths": 489,
    "gender": null,
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 726,
    "name": "혜미",
    "totalBirths": 484,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 727,
    "name": "초원",
    "totalBirths": 483,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 728,
    "name": "예희",
    "totalBirths": 482,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 729,
    "name": "준서",
    "totalBirths": 478,
    "gender": "M",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 730,
    "name": "푸름",
    "totalBirths": 477,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 731,
    "name": "정음",
    "totalBirths": 474,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 732,
    "name": "리유",
    "totalBirths": 472,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 733,
    "name": "연화",
    "totalBirths": 471,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 734,
    "name": "진솔",
    "totalBirths": 470,
    "gender": null,
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 735,
    "name": "봄이",
    "totalBirths": 469,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 735,
    "name": "솔희",
    "totalBirths": 469,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 735,
    "name": "래아",
    "totalBirths": 469,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 735,
    "name": "원",
    "totalBirths": 469,
    "gender": "M",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 739,
    "name": "이주",
    "totalBirths": 468,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 739,
    "name": "설현",
    "totalBirths": 468,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 741,
    "name": "빈",
    "totalBirths": 464,
    "gender": null,
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 742,
    "name": "미정",
    "totalBirths": 463,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 742,
    "name": "선희",
    "totalBirths": 463,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 744,
    "name": "하담",
    "totalBirths": 460,
    "gender": "M",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 745,
    "name": "솔빈",
    "totalBirths": 459,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 745,
    "name": "규나",
    "totalBirths": 459,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 745,
    "name": "수윤",
    "totalBirths": 459,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 748,
    "name": "로라",
    "totalBirths": 458,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 749,
    "name": "유지",
    "totalBirths": 457,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 749,
    "name": "정희",
    "totalBirths": 457,
    "gender": "F",
    "page": 15,
    "pageGender": "F"
  },
  {
    "rank": 749,
    "name": "한슬",
    "totalBirths": 457,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 749,
    "name": "소리",
    "totalBirths": 457,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 753,
    "name": "서령",
    "totalBirths": 456,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 754,
    "name": "윤비",
    "totalBirths": 453,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 755,
    "name": "유원",
    "totalBirths": 452,
    "gender": null,
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 756,
    "name": "가림",
    "totalBirths": 451,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 756,
    "name": "은세",
    "totalBirths": 451,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 758,
    "name": "연하",
    "totalBirths": 449,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 758,
    "name": "조은",
    "totalBirths": 449,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 760,
    "name": "해빈",
    "totalBirths": 447,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 761,
    "name": "진하",
    "totalBirths": 446,
    "gender": "M",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 761,
    "name": "규은",
    "totalBirths": 446,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 763,
    "name": "리사",
    "totalBirths": 442,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 764,
    "name": "이린",
    "totalBirths": 440,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 764,
    "name": "어진",
    "totalBirths": 440,
    "gender": "M",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 766,
    "name": "초희",
    "totalBirths": 439,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 766,
    "name": "소라",
    "totalBirths": 439,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 766,
    "name": "신비",
    "totalBirths": 439,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 769,
    "name": "해담",
    "totalBirths": 438,
    "gender": "M",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 769,
    "name": "아원",
    "totalBirths": 438,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 771,
    "name": "유린",
    "totalBirths": 437,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 772,
    "name": "건희",
    "totalBirths": 436,
    "gender": "M",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 772,
    "name": "솔비",
    "totalBirths": 436,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 774,
    "name": "주리",
    "totalBirths": 433,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 775,
    "name": "해주",
    "totalBirths": 431,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 775,
    "name": "솔민",
    "totalBirths": 431,
    "gender": null,
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 775,
    "name": "효연",
    "totalBirths": 431,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 778,
    "name": "채인",
    "totalBirths": 430,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 779,
    "name": "시후",
    "totalBirths": 428,
    "gender": "M",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 780,
    "name": "나나",
    "totalBirths": 427,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 781,
    "name": "지솔",
    "totalBirths": 426,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 781,
    "name": "초이",
    "totalBirths": 426,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 783,
    "name": "효서",
    "totalBirths": 425,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 784,
    "name": "다운",
    "totalBirths": 422,
    "gender": null,
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 785,
    "name": "소혜",
    "totalBirths": 420,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 786,
    "name": "금비",
    "totalBirths": 419,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 787,
    "name": "소하",
    "totalBirths": 416,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 788,
    "name": "이연",
    "totalBirths": 415,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 788,
    "name": "레나",
    "totalBirths": 415,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 790,
    "name": "다올",
    "totalBirths": 414,
    "gender": null,
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 790,
    "name": "유비",
    "totalBirths": 414,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 792,
    "name": "해림",
    "totalBirths": 412,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 792,
    "name": "해이",
    "totalBirths": 412,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 794,
    "name": "유니",
    "totalBirths": 410,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 794,
    "name": "우정",
    "totalBirths": 410,
    "gender": null,
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 796,
    "name": "다슬",
    "totalBirths": 409,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 797,
    "name": "정서",
    "totalBirths": 407,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 797,
    "name": "영인",
    "totalBirths": 407,
    "gender": null,
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 799,
    "name": "은후",
    "totalBirths": 406,
    "gender": "M",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 800,
    "name": "라연",
    "totalBirths": 405,
    "gender": "F",
    "page": 16,
    "pageGender": "F"
  },
  {
    "rank": 800,
    "name": "원영",
    "totalBirths": 405,
    "gender": "M",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 802,
    "name": "효경",
    "totalBirths": 402,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 803,
    "name": "서형",
    "totalBirths": 401,
    "gender": null,
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 804,
    "name": "송하",
    "totalBirths": 400,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 805,
    "name": "환희",
    "totalBirths": 399,
    "gender": "M",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 806,
    "name": "찬희",
    "totalBirths": 398,
    "gender": "M",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 806,
    "name": "현채",
    "totalBirths": 398,
    "gender": null,
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 808,
    "name": "해진",
    "totalBirths": 397,
    "gender": null,
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 808,
    "name": "혜승",
    "totalBirths": 397,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 810,
    "name": "의진",
    "totalBirths": 396,
    "gender": "M",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 811,
    "name": "신영",
    "totalBirths": 395,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 812,
    "name": "희우",
    "totalBirths": 391,
    "gender": "M",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 813,
    "name": "우진",
    "totalBirths": 388,
    "gender": "M",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 813,
    "name": "원희",
    "totalBirths": 388,
    "gender": null,
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 813,
    "name": "현이",
    "totalBirths": 388,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 813,
    "name": "혜온",
    "totalBirths": 388,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 817,
    "name": "하유",
    "totalBirths": 387,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 818,
    "name": "리엘",
    "totalBirths": 384,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 818,
    "name": "은조",
    "totalBirths": 384,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 820,
    "name": "상아",
    "totalBirths": 383,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 820,
    "name": "서림",
    "totalBirths": 383,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 820,
    "name": "솔아",
    "totalBirths": 383,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 823,
    "name": "주예",
    "totalBirths": 382,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 824,
    "name": "해율",
    "totalBirths": 381,
    "gender": null,
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 824,
    "name": "미경",
    "totalBirths": 381,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 824,
    "name": "엘라",
    "totalBirths": 381,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 827,
    "name": "모아",
    "totalBirths": 379,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 827,
    "name": "희나",
    "totalBirths": 379,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 827,
    "name": "솔이",
    "totalBirths": 379,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 830,
    "name": "은효",
    "totalBirths": 377,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 830,
    "name": "수림",
    "totalBirths": 377,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 832,
    "name": "한빛",
    "totalBirths": 376,
    "gender": "M",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 832,
    "name": "다흰",
    "totalBirths": 376,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 834,
    "name": "승미",
    "totalBirths": 375,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 834,
    "name": "경서",
    "totalBirths": 375,
    "gender": null,
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 836,
    "name": "가린",
    "totalBirths": 374,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 837,
    "name": "겨울",
    "totalBirths": 373,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 837,
    "name": "온",
    "totalBirths": 373,
    "gender": "M",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 837,
    "name": "새나",
    "totalBirths": 373,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 840,
    "name": "유",
    "totalBirths": 372,
    "gender": null,
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 840,
    "name": "승유",
    "totalBirths": 372,
    "gender": "M",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 840,
    "name": "효재",
    "totalBirths": 372,
    "gender": "M",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 840,
    "name": "신혜",
    "totalBirths": 372,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 840,
    "name": "은미",
    "totalBirths": 372,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 845,
    "name": "새롬",
    "totalBirths": 371,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 846,
    "name": "유화",
    "totalBirths": 370,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 846,
    "name": "단우",
    "totalBirths": 370,
    "gender": "M",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 848,
    "name": "선경",
    "totalBirths": 369,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 849,
    "name": "가경",
    "totalBirths": 368,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 849,
    "name": "규아",
    "totalBirths": 368,
    "gender": "F",
    "page": 17,
    "pageGender": "F"
  },
  {
    "rank": 851,
    "name": "화영",
    "totalBirths": 367,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 851,
    "name": "여정",
    "totalBirths": 367,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 851,
    "name": "선화",
    "totalBirths": 367,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 854,
    "name": "예준",
    "totalBirths": 366,
    "gender": "M",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 854,
    "name": "혜경",
    "totalBirths": 366,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 854,
    "name": "리은",
    "totalBirths": 366,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 857,
    "name": "채우",
    "totalBirths": 364,
    "gender": "M",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 857,
    "name": "채언",
    "totalBirths": 364,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 859,
    "name": "윤성",
    "totalBirths": 362,
    "gender": "M",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 860,
    "name": "솔지",
    "totalBirths": 361,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 861,
    "name": "조안",
    "totalBirths": 360,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 861,
    "name": "연제",
    "totalBirths": 360,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 863,
    "name": "소린",
    "totalBirths": 359,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 864,
    "name": "지운",
    "totalBirths": 358,
    "gender": "M",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 864,
    "name": "유온",
    "totalBirths": 358,
    "gender": null,
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 866,
    "name": "율이",
    "totalBirths": 357,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 867,
    "name": "진경",
    "totalBirths": 354,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 867,
    "name": "수예",
    "totalBirths": 354,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 867,
    "name": "예선",
    "totalBirths": 354,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 870,
    "name": "규희",
    "totalBirths": 353,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 871,
    "name": "인하",
    "totalBirths": 352,
    "gender": null,
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 872,
    "name": "윤재",
    "totalBirths": 351,
    "gender": "M",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 872,
    "name": "상은",
    "totalBirths": 351,
    "gender": null,
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 874,
    "name": "재나",
    "totalBirths": 350,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 874,
    "name": "이룸",
    "totalBirths": 350,
    "gender": null,
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 874,
    "name": "은총",
    "totalBirths": 350,
    "gender": "M",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 874,
    "name": "승빈",
    "totalBirths": 350,
    "gender": "M",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 878,
    "name": "해랑",
    "totalBirths": 349,
    "gender": null,
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 879,
    "name": "애리",
    "totalBirths": 348,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 880,
    "name": "다유",
    "totalBirths": 347,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 881,
    "name": "제희",
    "totalBirths": 345,
    "gender": null,
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 882,
    "name": "루빈",
    "totalBirths": 344,
    "gender": null,
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 883,
    "name": "예송",
    "totalBirths": 342,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 883,
    "name": "노을",
    "totalBirths": 342,
    "gender": null,
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 883,
    "name": "벼리",
    "totalBirths": 342,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 886,
    "name": "은민",
    "totalBirths": 341,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 886,
    "name": "채온",
    "totalBirths": 341,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 888,
    "name": "민슬",
    "totalBirths": 340,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 889,
    "name": "마리",
    "totalBirths": 338,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 889,
    "name": "희경",
    "totalBirths": 338,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 889,
    "name": "영현",
    "totalBirths": 338,
    "gender": "M",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 892,
    "name": "규비",
    "totalBirths": 337,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 893,
    "name": "혜준",
    "totalBirths": 336,
    "gender": "M",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 894,
    "name": "해은",
    "totalBirths": 335,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 895,
    "name": "수",
    "totalBirths": 334,
    "gender": "M",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 895,
    "name": "찬미",
    "totalBirths": 334,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 895,
    "name": "진이",
    "totalBirths": 334,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 895,
    "name": "경아",
    "totalBirths": 334,
    "gender": "F",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 899,
    "name": "태현",
    "totalBirths": 333,
    "gender": "M",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 900,
    "name": "현수",
    "totalBirths": 332,
    "gender": "M",
    "page": 18,
    "pageGender": "F"
  },
  {
    "rank": 901,
    "name": "성주",
    "totalBirths": 331,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 901,
    "name": "미우",
    "totalBirths": 331,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 903,
    "name": "시엘",
    "totalBirths": 329,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 904,
    "name": "민성",
    "totalBirths": 328,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 904,
    "name": "주언",
    "totalBirths": 328,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 906,
    "name": "해슬",
    "totalBirths": 327,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 907,
    "name": "초연",
    "totalBirths": 325,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 908,
    "name": "이원",
    "totalBirths": 324,
    "gender": null,
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 909,
    "name": "미서",
    "totalBirths": 323,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 909,
    "name": "미연",
    "totalBirths": 323,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 911,
    "name": "승원",
    "totalBirths": 322,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 911,
    "name": "도혜",
    "totalBirths": 322,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 913,
    "name": "다니",
    "totalBirths": 320,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 913,
    "name": "아이린",
    "totalBirths": 320,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 915,
    "name": "비",
    "totalBirths": 317,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 915,
    "name": "미영",
    "totalBirths": 317,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 915,
    "name": "한울",
    "totalBirths": 317,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 918,
    "name": "연호",
    "totalBirths": 316,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 919,
    "name": "해연",
    "totalBirths": 313,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 919,
    "name": "수애",
    "totalBirths": 313,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 921,
    "name": "현선",
    "totalBirths": 312,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 922,
    "name": "한율",
    "totalBirths": 310,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 922,
    "name": "진유",
    "totalBirths": 310,
    "gender": null,
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 924,
    "name": "해든",
    "totalBirths": 309,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 924,
    "name": "자윤",
    "totalBirths": 309,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 926,
    "name": "성윤",
    "totalBirths": 308,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 926,
    "name": "해서",
    "totalBirths": 308,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 928,
    "name": "도유",
    "totalBirths": 307,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 929,
    "name": "영지",
    "totalBirths": 306,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 929,
    "name": "나빈",
    "totalBirths": 306,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 929,
    "name": "영아",
    "totalBirths": 306,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 932,
    "name": "세율",
    "totalBirths": 304,
    "gender": null,
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 933,
    "name": "수은",
    "totalBirths": 302,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 934,
    "name": "서혜",
    "totalBirths": 301,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 934,
    "name": "동희",
    "totalBirths": 301,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 936,
    "name": "조아",
    "totalBirths": 299,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 936,
    "name": "윤혜",
    "totalBirths": 299,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 936,
    "name": "하슬",
    "totalBirths": 299,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 939,
    "name": "은제",
    "totalBirths": 298,
    "gender": null,
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 939,
    "name": "혜담",
    "totalBirths": 298,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 941,
    "name": "승윤",
    "totalBirths": 297,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 941,
    "name": "리율",
    "totalBirths": 297,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 941,
    "name": "승리",
    "totalBirths": 297,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 941,
    "name": "안",
    "totalBirths": 297,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 945,
    "name": "현민",
    "totalBirths": 295,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 946,
    "name": "승지",
    "totalBirths": 294,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 946,
    "name": "성경",
    "totalBirths": 294,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 946,
    "name": "우빈",
    "totalBirths": 294,
    "gender": "M",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 946,
    "name": "인애",
    "totalBirths": 294,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 950,
    "name": "현비",
    "totalBirths": 293,
    "gender": "F",
    "page": 19,
    "pageGender": "F"
  },
  {
    "rank": 951,
    "name": "예경",
    "totalBirths": 292,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 952,
    "name": "미현",
    "totalBirths": 291,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 953,
    "name": "여빈",
    "totalBirths": 290,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 954,
    "name": "소운",
    "totalBirths": 289,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 954,
    "name": "다을",
    "totalBirths": 289,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 954,
    "name": "청아",
    "totalBirths": 289,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 954,
    "name": "송아",
    "totalBirths": 289,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 954,
    "name": "경희",
    "totalBirths": 289,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 959,
    "name": "래은",
    "totalBirths": 288,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 959,
    "name": "보름",
    "totalBirths": 288,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 961,
    "name": "이소",
    "totalBirths": 287,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 961,
    "name": "우희",
    "totalBirths": 287,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 961,
    "name": "규미",
    "totalBirths": 287,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 964,
    "name": "서휘",
    "totalBirths": 285,
    "gender": null,
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 964,
    "name": "미선",
    "totalBirths": 285,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 966,
    "name": "한아",
    "totalBirths": 284,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 967,
    "name": "엘",
    "totalBirths": 282,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 967,
    "name": "올리비아",
    "totalBirths": 282,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 969,
    "name": "소명",
    "totalBirths": 281,
    "gender": null,
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 969,
    "name": "린하",
    "totalBirths": 281,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 971,
    "name": "루이",
    "totalBirths": 279,
    "gender": "M",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 971,
    "name": "다봄",
    "totalBirths": 279,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 973,
    "name": "하서",
    "totalBirths": 278,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 974,
    "name": "정화",
    "totalBirths": 277,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 975,
    "name": "혜솔",
    "totalBirths": 275,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 976,
    "name": "비주",
    "totalBirths": 274,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 977,
    "name": "미유",
    "totalBirths": 273,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 978,
    "name": "도예",
    "totalBirths": 272,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 979,
    "name": "노아",
    "totalBirths": 271,
    "gender": "M",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 980,
    "name": "인경",
    "totalBirths": 270,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 980,
    "name": "새아",
    "totalBirths": 270,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 980,
    "name": "설린",
    "totalBirths": 270,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 983,
    "name": "준영",
    "totalBirths": 269,
    "gender": "M",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 983,
    "name": "자은",
    "totalBirths": 269,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 983,
    "name": "담비",
    "totalBirths": 269,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 983,
    "name": "설리",
    "totalBirths": 269,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 987,
    "name": "보겸",
    "totalBirths": 267,
    "gender": "M",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 988,
    "name": "솔미",
    "totalBirths": 266,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 988,
    "name": "명주",
    "totalBirths": 266,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 990,
    "name": "랑",
    "totalBirths": 263,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 991,
    "name": "준이",
    "totalBirths": 262,
    "gender": "M",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 992,
    "name": "희지",
    "totalBirths": 261,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 993,
    "name": "예정",
    "totalBirths": 259,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 993,
    "name": "희율",
    "totalBirths": 259,
    "gender": null,
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 995,
    "name": "은찬",
    "totalBirths": 257,
    "gender": "M",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 995,
    "name": "리연",
    "totalBirths": 257,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 997,
    "name": "하주",
    "totalBirths": 256,
    "gender": null,
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 998,
    "name": "보리",
    "totalBirths": 255,
    "gender": "F",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 998,
    "name": "준아",
    "totalBirths": 255,
    "gender": "M",
    "page": 20,
    "pageGender": "F"
  },
  {
    "rank": 998,
    "name": "노엘",
    "totalBirths": 255,
    "gender": null,
    "page": 20,
    "pageGender": "F"
  }
]$fjson$::jsonb)
),
raw AS (
  SELECT
    NULLIF(BTRIM(x.name), '') AS name,
    x.rank::int AS rank,
    x."totalBirths"::int AS total_births,
    NULLIF(x.gender, '') AS row_gender,
    x.page::int AS page,
    NULLIF(x."pageGender", '') AS page_gender
  FROM jsonb_to_recordset((SELECT doc FROM src_json)) AS x(
    rank int,
    name text,
    "totalBirths" int,
    gender text,
    page int,
    "pageGender" text
  )
),
source_dedup AS (
  SELECT DISTINCT ON (name)
    name,
    rank,
    total_births,
    row_gender,
    page,
    page_gender
  FROM raw
  WHERE name IS NOT NULL
    AND total_births IS NOT NULL
  ORDER BY name, total_births DESC, rank ASC, page ASC
),
candidates AS (
  SELECT s.*
  FROM source_dedup s
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.ssot_name_pool_f t
    WHERE t.name = s.name
  )
),
candidate_stats AS (
  SELECT COUNT(*)::int AS candidate_count FROM candidates
),
default_ratios AS (
  SELECT *
  FROM (VALUES
    ('A'::text, 1, 0.093333::numeric),
    ('B'::text, 2, 0.195::numeric),
    ('C'::text, 3, 0.711667::numeric)
  ) v(tier, ord, ratio)
),
existing_ratio_raw AS (
  SELECT tier, COUNT(*)::numeric AS cnt
  FROM public.ssot_name_pool_f
  WHERE name IS NOT NULL
    AND tier IN ('A', 'B', 'C')
  GROUP BY tier
),
existing_ratios AS (
  SELECT tier, cnt / NULLIF(SUM(cnt) OVER (), 0) AS ratio
  FROM existing_ratio_raw
),
use_existing_ratio AS (
  SELECT (COUNT(*) = 3) AS ok FROM existing_ratios
),
effective_ratios AS (
  SELECT
    d.tier,
    d.ord,
    CASE
      WHEN COALESCE((SELECT ok FROM use_existing_ratio), false)
        THEN COALESCE((SELECT e.ratio FROM existing_ratios e WHERE e.tier = d.tier), d.ratio)
      ELSE d.ratio
    END AS ratio
  FROM default_ratios d
),
exact_targets AS (
  SELECT
    er.tier,
    er.ord,
    cs.candidate_count,
    (er.ratio * cs.candidate_count::numeric) AS exact_n
  FROM effective_ratios er
  CROSS JOIN candidate_stats cs
),
floor_targets AS (
  SELECT
    tier,
    ord,
    candidate_count,
    FLOOR(exact_n)::int AS base_n,
    (exact_n - FLOOR(exact_n)) AS frac_n
  FROM exact_targets
),
targets_with_remainder AS (
  SELECT
    ft.*,
    (ft.candidate_count - SUM(ft.base_n) OVER ())::int AS remainder_n,
    ROW_NUMBER() OVER (ORDER BY ft.frac_n DESC, ft.ord ASC) AS frac_rank
  FROM floor_targets ft
),
tier_targets AS (
  SELECT
    tier,
    ord,
    (base_n + CASE WHEN frac_rank <= remainder_n THEN 1 ELSE 0 END)::int AS target_n
  FROM targets_with_remainder
),
tier_bounds AS (
  SELECT
    tier,
    ord,
    target_n,
    SUM(target_n) OVER (ORDER BY ord) AS upper_seq
  FROM tier_targets
),
ranked AS (
  SELECT
    c.*,
    ROW_NUMBER() OVER (
      ORDER BY c.total_births DESC, c.rank ASC, c.name ASC
    ) AS seq
  FROM candidates c
),
assigned AS (
  SELECT
    r.seq,
    r.name,
    r.rank,
    r.total_births,
    r.row_gender,
    r.page,
    r.page_gender,
    COALESCE((
      SELECT tb.tier
      FROM tier_bounds tb
      WHERE r.seq <= tb.upper_seq
      ORDER BY tb.ord
      LIMIT 1
    ), 'C') AS tier
  FROM ranked r
),
batch_meta AS (
  SELECT
    NOW() AS generated_at,
    'https://namechart.kr/chart/all | namechart import | F'::text AS input,
    'F'::text AS gender,
    (SELECT candidate_count FROM candidate_stats) AS total_count
),
inserted AS (
  INSERT INTO public.ssot_name_pool_f (
    generated_at,
    input,
    gender,
    total_count,
    name,
    tier,
    score,
    score_breakdown,
    features
  )
  SELECT
    bm.generated_at,
    bm.input,
    bm.gender,
    bm.total_count,
    a.name,
    a.tier,
    NULL::double precision AS score,
    NULL::jsonb AS score_breakdown,
    jsonb_build_object(
      'source', 'namechart.kr',
      'rank', a.rank,
      'totalBirths', a.total_births,
      'page', a.page,
      'pageGender', a.page_gender,
      'rowGender', a.row_gender
    ) AS features
  FROM assigned a
  CROSS JOIN batch_meta bm
  ORDER BY a.seq
  RETURNING row_index, name, tier
)
SELECT
  'F' AS gender,
  (SELECT COUNT(*) FROM raw) AS raw_rows,
  (SELECT COUNT(*) FROM source_dedup) AS source_dedup_rows,
  (SELECT candidate_count FROM candidate_stats) AS insert_candidates,
  (SELECT COUNT(*) FROM inserted) AS inserted_rows,
  (SELECT COUNT(DISTINCT name) FROM inserted) AS inserted_unique_names,
  COALESCE((SELECT jsonb_object_agg(tier, cnt ORDER BY tier)
    FROM (SELECT tier, COUNT(*) AS cnt FROM inserted GROUP BY tier) q), '{}'::jsonb) AS inserted_tier_counts;

COMMIT;
