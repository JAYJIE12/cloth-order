const COLOR_QUESTIONS = [
  { options: [["奶油白", "#F0E3C9", "warm"], ["冷白", "#E4EAF2", "cool"]] },
  { options: [["雾霾蓝", "#668097", "soft"], ["宝蓝", "#416CC3", "bright"]] },
  { options: [["冷玫瑰粉", "#CC87AA", "cool"], ["蜜桃粉", "#DB8D7C", "warm"]] },
  { options: [["鲜绿", "#409968", "bright"], ["灰绿", "#718D7A", "soft"]] },
  { options: [["砖红", "#A85648", "warm"], ["莓果红", "#A24E70", "cool"]] },
  { options: [["灰紫", "#857792", "soft"], ["亮紫", "#9263BF", "bright"]] },
];

const COLOR_AXES = {
  warmth: { name: "冷暖", choices: { warm: "偏暖", cool: "偏冷" } },
  clarity: { name: "鲜明度", choices: { bright: "鲜明", soft: "柔和" } },
};

const COLOR_PALETTES = {
  "warm-bright": ["春季方向", "珊瑚粉上衣配奶油白下装，先试一件亮色。",
    [["奶油白", "#F0E3C9"], ["珊瑚粉", "#E67D6F"], ["杏黄色", "#F0BE65"], ["嫩叶绿", "#8AAB56"], ["浅水蓝", "#65B1AE"]]],
  "cool-soft": ["夏季方向", "雾霾蓝上衣配浅灰下装，试试两种相近明度的颜色。",
    [["冷白", "#E4EAF2"], ["雾霾蓝", "#668097"], ["灰紫", "#857792"], ["浅灰", "#BDC1CB"], ["灰玫瑰粉", "#B78193"]]],
  "warm-soft": ["秋季方向", "橄榄绿上衣配燕麦色下装，两件都是柔和的暖色。",
    [["燕麦色", "#D6C2A7"], ["橄榄绿", "#838454"], ["砖红", "#A85648"], ["暖棕", "#93694F"], ["芥末黄", "#BC964E"]]],
  "cool-bright": ["冬季方向", "宝蓝上衣配炭灰下装，把鲜明的颜色留在脸附近。",
    [["冷白", "#E4EAF2"], ["宝蓝", "#416CC3"], ["玫红", "#B84779"], ["亮紫", "#9263BF"], ["炭灰", "#3D414D"]]],
  warm: ["偏暖色彩方向", "把奶油白和你常穿的牛仔裤搭在一起，先从容易入手的暖色试起。",
    [["奶油白", "#F0E3C9"], ["蜜桃粉", "#DB8D7C"], ["砖红", "#A85648"], ["燕麦色", "#D6C2A7"], ["暖棕", "#93694F"]]],
  cool: ["偏冷色彩方向", "把冷白或莓果红放在上半身，搭一条你已有的灰色下装。",
    [["冷白", "#E4EAF2"], ["冷玫瑰粉", "#CC87AA"], ["莓果红", "#A24E70"], ["雾霾蓝", "#668097"], ["炭灰", "#3D414D"]]],
  bright: ["偏鲜明色彩方向", "用一件鲜明上衣配基础色下装，试试宝蓝和炭灰。",
    [["宝蓝", "#416CC3"], ["鲜绿", "#409968"], ["亮紫", "#9263BF"], ["珊瑚粉", "#E67D6F"], ["炭灰", "#3D414D"]]],
  soft: ["偏柔和色彩方向", "灰绿上衣配燕麦色下装，试试两件低饱和的单品。",
    [["雾霾蓝", "#668097"], ["灰绿", "#718D7A"], ["灰紫", "#857792"], ["燕麦色", "#D6C2A7"], ["浅灰", "#BDC1CB"]]],
  basic: ["先试基础色", "用灰白上衣配深牛仔蓝下装，选你衣柜里最接近的两件就好。",
    [["灰白", "#ECEBE9"], ["浅灰", "#BDC1CB"], ["灰米色", "#C6BEB4"], ["深牛仔蓝", "#465A72"], ["炭灰", "#3D414D"]]],
};

function scoreColorTest(answers) {
  const votes = { warm: 0, cool: 0, bright: 0, soft: 0 };
  COLOR_QUESTIONS.forEach(({ options }, index) => {
    const option = options[answers[index]];
    if (option) votes[option[2]] += 1;
  });
  const direction = (axis) => Object.keys(COLOR_AXES[axis].choices).find((key) => votes[key] >= 2) ?? null;
  return { kind: "color-test-v2", warmth: direction("warmth"), clarity: direction("clarity"), votes };
}

function colorPalette(profile) {
  const key = [profile.warmth, profile.clarity].filter(Boolean).join("-");
  const [name, tip, colors] = COLOR_PALETTES[key] ?? COLOR_PALETTES.basic;
  return { name, tip, colors };
}

function colorAnswerReason(profile, axis) {
  const { choices } = COLOR_AXES[axis];
  const [first, second] = Object.keys(choices);
  const direction = profile[axis];
  const label = direction ? choices[direction] : "暂未确定";
  return `${label}（${profile.votes[first]} 题选${choices[first]}、${profile.votes[second]} 题选${choices[second]}）`;
}
