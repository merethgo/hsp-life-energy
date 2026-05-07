import { dimensionNames, questions } from "./config";
import type {
  AssessmentAnswerMap,
  AssessmentFormInput,
  AssessmentReportPayload,
  AssessmentScoreResult,
} from "./types";

const DISPLAY_REVERSE = new Set(["boundary", "environment"]);

type ScoreContext = AssessmentScoreResult;

type ArchetypeDefinition = {
  key: string;
  title: string;
  when: (ctx: ScoreContext) => boolean;
  summary: string;
  suggestions: {
    stop: string;
    build: string;
    practice: string;
  };
};

const archetypeDefinitions: ArchetypeDefinition[] = [
  {
    key: "input_overload",
    title: "输入过载型",
    when: (ctx) =>
      ctx.rawScores.input >= 65 &&
      ctx.displayScores.recovery <= 45 &&
      ctx.burnoutIndex >= 60,
    summary:
      "你对环境、关系和情绪的接收强度很高，很多细节会更快进入你的感受系统。真正让你辛苦的地方，往往不只是敏感，而是输入持续偏高时，恢复和缓冲的空间还没有跟上。",
    suggestions: {
      stop: "停止在已经很累的时候，还继续维持表面的正常，继续跟着外界节奏往前走。",
      build: "建立一个固定、可重复的小恢复时段，让自己每天都能回到更低刺激的状态里。",
      practice:
        "练习识别自己“开始接收不过来”的前置信号，比如发空、烦躁、反应变慢，或突然什么都不想回应。",
    },
  },
  {
    key: "boundary_loose",
    title: "边界松动型",
    when: (ctx) => ctx.displayScores.boundary <= 45 && ctx.rawScores.emotion >= 55,
    summary:
      "你很容易先顾及别人，再轮到自己。真正让你累的，不只是关系本身，而是你常常需要花很多力气，才能在关系里把自己放回同样重要的位置。",
    suggestions: {
      stop: "停止在不舒服的时候，第一反应总是先解释、先体谅、先顺从。",
      build: "建立一套最小边界句式，比如“我需要一点时间再回复你”或“这件事我现在先不答应”。",
      practice: "练习延迟答应别人，让自己先有一个短暂停顿，再决定要不要接住这件事。",
    },
  },
  {
    key: "emotion_overloaded",
    title: "情绪承压型",
    when: (ctx) => ctx.rawScores.emotion >= 65 && ctx.rawScores.risk >= 55,
    summary:
      "你的问题往往不是情绪太多，而是感受停留得更久、沉得更深。很多辛苦不会立刻爆发，而是慢慢留在身体里、注意力里和关系反应里。",
    suggestions: {
      stop: "停止把“没事”“还好”当成面对感受时唯一的回答。",
      build: "建立一个固定的情绪整理出口，比如写下来、散步、独处，或和安全的人说一说。",
      practice: "练习每天至少命名一次自己的真实感受，而不只是用“累”或“烦”一笔带过。",
    },
  },
  {
    key: "overprocessing",
    title: "过度加工型",
    when: (ctx) => ctx.rawScores.processing >= 65 && ctx.displayScores.recovery <= 55,
    summary:
      "你会比很多人更深地处理信息，也更容易在心里反复推演和确认。这种深加工本身是能力，但在持续压力下，也会变成一种明显的耗能状态。",
    suggestions: {
      stop: "停止在情绪很满的时候，还逼自己把所有事情都想清楚。",
      build: "给思考设置一个边界，比如写下问题、列出重点，然后给自己一个暂停时间。",
      practice: "练习把担忧和反复推演写出来，让它离开脑子，变成可以整理的东西。",
    },
  },
  {
    key: "environment_drained",
    title: "环境透支型",
    when: (ctx) => ctx.displayScores.environment <= 45 && ctx.rawScores.input >= 60,
    summary:
      "你的系统对环境很敏感，而你当前所处的节奏、密度或氛围，可能并不真的适合你。有时不是你不够能撑，而是环境本身就在持续提高你的消耗。",
    suggestions: {
      stop: "停止把所有疲惫都归因于自己不够强、效率不够高，或者意志力不够。",
      build: "建立一个尽可能低刺激、有边界感的小环境，让自己每天哪怕只有短时间也能从外界抽离。",
      practice: "练习识别什么样的环境最耗你，什么样的节奏最能承接你，而不是一概要求自己去适应所有场景。",
    },
  },
  {
    key: "stable_awareness",
    title: "稳定觉察型",
    when: (ctx) =>
      ctx.rawScores.input >= 60 &&
      ctx.displayScores.recovery >= 60 &&
      ctx.displayScores.boundary >= 60 &&
      ctx.burnoutIndex < 50,
    summary:
      "你的敏感并没有失控地带走你，反而更多表现为细腻、觉察和理解力。你并不是不累，而是已经逐渐建立起让自己回来、站稳和恢复的方式。",
    suggestions: {
      stop: "停止把敏感只当成一种需要被压下去的特质。",
      build: "继续稳住你已经有效的恢复和边界习惯，让它们成为更自然的日常节奏。",
      practice: "练习更主动地使用自己的觉察力为自己服务，而不只是用来理解别人和回应外界。",
    },
  },
];

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function scaleScore(effectiveMean: number) {
  return round(((effectiveMean - 1) / 4) * 100);
}

function averageWeighted(items: { score: number; weight: number }[]) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const totalScore = items.reduce((sum, item) => sum + item.score * item.weight, 0);
  return totalWeight === 0 ? 0 : totalScore / totalWeight;
}

function levelLabel(score: number, type: "burnout" | "regulation" | "risk") {
  if (type === "burnout") {
    if (score < 40) return "较低";
    if (score < 60) return "中等";
    if (score < 75) return "偏高";
    return "较高";
  }

  if (type === "regulation") {
    if (score < 40) return "较弱";
    if (score < 60) return "波动中";
    if (score < 75) return "初步稳定";
    return "相对稳定";
  }

  if (score < 45) return "平稳";
  if (score < 60) return "留意";
  if (score < 75) return "较高";
  return "重点关注";
}

function levelDescription(score: number, type: "burnout" | "regulation") {
  if (type === "burnout") {
    if (score < 40) {
      return "你的系统目前整体负荷相对可承受，还没有明显落在持续透支的状态里。你并不是完全没有压力，而是暂时还保留一定缓冲和回收空间。";
    }
    if (score < 60) {
      return "你的系统已经开始承担一定负荷，虽然未必到了非常吃力的程度，但恢复这件事已经变得重要。这个阶段更值得做的，是更早看见哪些地方正在慢慢累积。";
    }
    if (score < 75) {
      return "你已经有比较明显的透支迹象：输入在持续，消耗也在持续，而恢复还没有完全跟上。很多疲惫不会一下子爆出来，但会慢慢表现为耐心下降、情绪发紧或越来越需要独处。";
    }
    return "你当前很可能已经处在长期高负荷状态里。现在更重要的，不是继续逼自己做得更好，而是尽快把恢复、减负和边界重新放回更靠前的位置。";
  }

  if (score < 40) {
    return "当压力、情绪或关系波动出现时，你可能还比较难及时稳住和照顾自己。很多时候不是你不想调节，而是手里暂时还缺一套真正稳定、可重复的方法。";
  }
  if (score < 60) {
    return "你并不是完全没有调节能力，但目前还不够稳定，容易在忙乱、关系压力或持续消耗里掉下来。你已经有一些对自己有帮助的直觉，只是它们还没有完全长成一套可依靠的系统。";
  }
  if (score < 75) {
    return "你已经具备一定的自我调节基础，知道自己大概需要什么，也开始有能力在波动里把自己拉回来。接下来更重要的，是让这些方法变得更持续、更自然。";
  }
  return "你已经逐渐形成了一套比较有效的自我调节方式。你未必完全不受影响，但更知道怎么觉察自己、保护自己，并让自己慢慢回到可承受、可恢复的状态。";
}

function dimensionDetailText(key: string, score: number) {
  const ranges: Record<string, [number, string][]> = {
    input: [
      [
        70,
        "你对外界和他人的接收非常强，很多细节、变化和氛围都会比别人更早进入你的感受系统。这种细腻本身是一种能力，但如果输入持续偏多，你也会更快出现疲惫、想退开，或者怎么都安静不下来的感觉。",
      ],
      [
        45,
        "你的感知力比较细腻，既能接收到很多信息，也还保留一定缓冲。也就是说，你能感受到环境，而且不会立刻被环境影响得很深，但在疲惫或压力偏高时，这种敏感仍然会明显放大。",
      ],
      [
        0,
        "你并不是特别容易被外界信息淹没，整体输入强度相对可控。对你来说，当前更值得关注的可能不是“接收太多”，而是别的维度怎样影响了你的状态，比如恢复、边界或环境适配本身。",
      ],
    ],
    emotion: [
      [
        70,
        "你的情绪系统当前承载了比较高的重量，很多感受可能没有被及时消化和安放。它未必总是外显，但往往已经慢慢沉在身体、注意力和关系反应里。",
      ],
      [
        45,
        "你的感受虽然会被触动，但还没有明显堆积成当前的主要负担。它不是完全没有影响你，而是暂时还不算你最核心的困扰，不过仍然值得继续留意和觉察。",
      ],
      [
        0,
        "你当前的情绪负荷相对较轻，至少不是现在最主要的消耗来源。比起“情绪太多”，你眼下更可能是在别的地方感到吃力，比如恢复跟不上、环境失配，或持续对自己要求太紧。",
      ],
    ],
    processing: [
      [
        70,
        "你很容易把一件事在心里处理很多遍，这说明你的加工深度很强。你会比不少人更愿意思考、权衡、确认和理解背后的原因；但在压力之下，这种深加工也很容易变成脑内循环。",
      ],
      [
        45,
        "你会思考得比较细，但多数时候还在可承受范围里。你不是不容易多想，而是目前大致还能和这种加工深度共处，只是在疲惫、关系压力或重要选择面前，它会更容易被放大。",
      ],
      [
        0,
        "你当前不太容易被反复思考困住，脑内加工负担相对较轻。眼下最消耗你的未必是“想太多”，而更可能是情绪停留、环境失配，或者持续输入后的恢复不足。",
      ],
    ],
    boundary: [
      [
        70,
        "你在关系里更容易保有自己，不会轻易因为外界波动而完全偏离中心。你仍然会在意别人，但更知道怎样在在意别人的同时，也不把自己弄丢。",
      ],
      [
        45,
        "你有边界意识，但在压力或关系张力之下，仍然可能被带走。你知道自己需要空间、界限和停顿，只是到了具体情境里，有时还是会先被对方的需要、情绪或气氛牵动。",
      ],
      [
        0,
        "你很可能经常先顾及别人，再轮到自己。真正让你累的，未必只是“别人要求太多”，也可能是你太容易把自己的感受往后放，结果关系看起来维持住了，内里却越来越消耗。",
      ],
    ],
    recovery: [
      [
        70,
        "你已经拥有一些对自己真正有效的恢复方式，这是非常重要的保护资源。你不只是知道自己会累，也开始知道怎样让自己回来；这意味着你的敏感不再只是被动承受，而开始有了可照顾和安放的路径。",
      ],
      [
        45,
        "你有一定恢复能力，但还不够稳定。平时你可能知道什么对自己有帮助，可一旦压力、关系波动或节奏太满，这些恢复方式就容易失效，或者需要更久才能真的起作用。",
      ],
      [
        0,
        "你现在最大的辛苦之一，可能不是输入太多，而是恢复方式还没有真正建立起来。你会知道自己累，却不一定知道怎样才能有效地缓回来，于是很容易一边消耗一边硬撑。",
      ],
    ],
    environment: [
      [
        70,
        "你现在所在的环境，至少在一定程度上是能承接你的。节奏、密度和边界感没有持续把你往外推，所以你更有机会把精力留给真正重要的事情。",
      ],
      [
        45,
        "你的环境有适合你的部分，也有持续消耗你的部分。你未必要立刻换掉整个环境，但值得慢慢看清：哪些场景在支持你，哪些场景又总让你更快变累。",
      ],
      [
        0,
        "你当前很可能长期待在一个不太适合你的节奏或氛围里，环境本身就在消耗你。对高敏感的人来说，这种消耗常常不是突然的，而是日复一日慢慢累起来的：看起来没发生什么大事，但整个人会越来越容易疲惫、烦躁，或者怎么休息都缓不过来。",
      ],
    ],
  };

  const match = ranges[key]?.find(([threshold]) => score >= threshold);
  return match?.[1] ?? "";
}

function riskDescription(key: string, score: number) {
  const label = levelLabel(score, "risk");

  const ranges: Record<string, Record<string, string>> = {
    emotion_stack_risk: {
      平稳: "你的情绪虽然会被触动，但还没有明显堆积成现在最主要的负担。它不是完全没有影响你，而是暂时还不是当前最核心的困扰。",
      留意: "情绪开始有停留和堆积的迹象，值得更早给自己一些整理空间。如果这个阶段持续忽略，它很容易从“有点闷”慢慢变成“怎么都缓不过来”。",
      较高: "你现在可能已经背着不少没有真正消化掉的感受了。它们未必一下子爆出来，但会慢慢表现为心烦、疲惫、耐心下降，或对很多事情都提不起劲。",
      重点关注: "情绪堆积已经比较明显，如果持续靠自己硬撑，系统会越来越难恢复。这个阶段更需要把整理、停顿和支持放回优先级。",
    },
    social_exhaustion_risk: {
      平稳: "社交和关系目前还不是你最主要的耗能来源，你大致还能在互动之后把自己慢慢收回来。",
      留意: "社交开始有一点明显的消耗感，尤其是人多、快节奏或高情绪密度的场景。你可能表面还能配合，但结束后会比自己想象中更累。",
      较高: "你可能已经进入比较明显的社交耗竭状态。哪怕看起来还在正常互动，内里也很容易越聊越空、越处越满。",
      重点关注: "社交和关系很可能已经成为当前最主要的耗能点之一。现在比“继续配合”更重要的，是主动地保护独处和恢复空间。",
    },
    boundary_loss_risk: {
      平稳: "你在关系里大致还能保有自己，暂时没有明显失守迹象。你未必时时都很坚定，但整体还知道怎样在关系里照顾自己。",
      留意: "在关系有压力的时候，你可能会更容易先退让，也更容易把自己的感受放到后面。很多边界问题并不是大冲突才出现，而是从一次次小退让、小压抑慢慢积起来的。",
      较高: "你很可能经常先顾及别人，再轮到自己，边界已经成为当前的重要耗能点。最累的地方往往不是“别人太多”，而是你很难不被对方的需要、情绪或期待牵着走。",
      重点关注: "边界失守的风险已经比较高了。这个阶段不是要你突然变得强硬，而是慢慢把“我自己的感受也重要”重新放回关系里。",
    },
    chronic_burnout_risk: {
      平稳: "虽然你会累，但系统还没有明显进入长期透支状态。你现在仍然保留一定恢复和缓冲空间。",
      留意: "你已经开始出现透支的迹象，值得更早给自己一些整理和减负的空间。继续忽略下去，它很容易从“有点累”变成“怎么都缓不过来”。",
      较高: "长期透支的迹象已经比较明显，继续硬撑会让恢复越来越难。这个阶段越是表面维持得正常，越容易忽略系统已经在悄悄报警。",
      重点关注: "长期透支已经是当前很需要优先处理的部分了。现在更重要的，不是再逼自己多做一点，而是尽快把恢复、减负和支持放回前面。",
    },
  };

  return ranges[key]?.[label] ?? "";
}

function overviewForContext(ctx: ScoreContext) {
  if (ctx.burnoutIndex >= 75) {
    return "你的高敏感正在放大你对环境、关系和情绪的接收，而恢复和边界还没有完全跟上。对你来说，问题可能不在于“为什么我这么敏感”，而在于输入、消耗和恢复之间的比例已经开始失衡；当这个失衡持续存在时，再小的事情也会慢慢变成负担。";
  }
  if (ctx.burnoutIndex >= 60) {
    return "你的高敏感正在放大你对环境、关系和情绪的接收，而恢复和边界还没有完全跟上，所以你会比很多人更容易累。很多时候你并不是扛不住，而是系统已经开始比别人更早发出“该慢一点了”的信号。";
  }
  if (ctx.selfRegulationIndex >= 60) {
    return "你的高敏感并不只是负担，它也正在成为你的觉察力和理解力的一部分。你已经开始建立起一些让自己回来、站稳和恢复的方法，所以现在更重要的，是继续把这些方式用得更稳定、更自然。";
  }
  return "你能感受到很多，也会比不少人更早被环境、关系或情绪触动。眼下最值得优先关注的，不是“我要不要再坚强一点”，而是怎样让自己的恢复、边界和节奏更稳一些。";
}

function pickArchetype(ctx: ScoreContext) {
  return (
    archetypeDefinitions.find((definition) => definition.when(ctx)) ??
    archetypeDefinitions[archetypeDefinitions.length - 1]
  );
}

function buildRawScores(answers: AssessmentAnswerMap) {
  const buckets = new Map<string, { score: number; weight: number }[]>();

  for (const question of questions) {
    const rawAnswer = answers[question.id];
    const score = question.reverse ? 6 - rawAnswer : rawAnswer;
    const items = buckets.get(question.dimension) ?? [];
    items.push({ score, weight: question.weight });
    buckets.set(question.dimension, items);
  }

  return Object.fromEntries(
    Array.from(buckets.entries()).map(([key, items]) => [key, scaleScore(averageWeighted(items))]),
  );
}

export function calculateAssessmentScores(answers: AssessmentAnswerMap): AssessmentScoreResult {
  for (const question of questions) {
    if (typeof answers[question.id] !== "number") {
      throw new Error("问卷还没有全部完成，暂时不能生成报告。");
    }
  }

  const rawScores = buildRawScores(answers);

  const displayScores = Object.fromEntries(
    Object.entries(rawScores).map(([key, score]) => [
      key,
      DISPLAY_REVERSE.has(key) ? round(100 - score) : score,
    ]),
  );

  const burnoutIndex = round(
    rawScores.emotion * 0.25 +
      rawScores.processing * 0.25 +
      rawScores.boundary * 0.2 +
      (100 - displayScores.recovery) * 0.2 +
      rawScores.risk * 0.1,
  );

  const selfRegulationIndex = round(
    displayScores.recovery * 0.4 +
      displayScores.boundary * 0.3 +
      displayScores.environment * 0.1 +
      (100 - rawScores.processing) * 0.2,
  );

  const riskAlerts = {
    emotion_stack_risk: round(rawScores.emotion * 0.7 + (100 - displayScores.recovery) * 0.3),
    social_exhaustion_risk: round(
      rawScores.input * 0.35 +
        rawScores.emotion * 0.2 +
        rawScores.risk * 0.25 +
        (100 - displayScores.environment) * 0.2,
    ),
    boundary_loss_risk: round((100 - displayScores.boundary) * 0.7 + rawScores.emotion * 0.3),
    chronic_burnout_risk: round(burnoutIndex * 0.7 + rawScores.risk * 0.3),
  };

  const validityFlags: string[] = [];

  if ((answers[46] ?? 0) <= 2) {
    validityFlags.push("authenticity_low");
  }

  if ((answers[47] ?? 0) >= 4) {
    validityFlags.push("defensiveness_high");
  }

  if ((answers[48] ?? 0) !== 2) {
    validityFlags.push("attention_warning");
  }

  const baseResult: AssessmentScoreResult = {
    rawScores,
    displayScores,
    burnoutIndex,
    selfRegulationIndex,
    riskAlerts,
    archetype: {
      key: "",
      title: "",
      summary: "",
    },
    validityFlags,
  };

  const archetype = pickArchetype(baseResult);

  return {
    ...baseResult,
    archetype: {
      key: archetype.key,
      title: archetype.title,
      summary: archetype.summary,
    },
  };
}

export function buildAssessmentReport(
  answers: AssessmentAnswerMap,
  _form: AssessmentFormInput,
): AssessmentReportPayload {
  void _form;
  const scoreResult = calculateAssessmentScores(answers);
  const archetype = pickArchetype(scoreResult);

  const dimensionSummary = ([
    "input",
    "emotion",
    "processing",
    "boundary",
    "recovery",
    "environment",
  ] as const).map((key) => ({
    key,
    name: dimensionNames[key],
    score: scoreResult.displayScores[key],
  }));

  const report: AssessmentReportPayload = {
    ...scoreResult,
    archetype: {
      key: archetype.key,
      title: archetype.title,
      summary: archetype.summary,
    },
    overview: overviewForContext(scoreResult),
    coreIndices: {
      burnout: {
        score: scoreResult.burnoutIndex,
        label: levelLabel(scoreResult.burnoutIndex, "burnout"),
        description: levelDescription(scoreResult.burnoutIndex, "burnout"),
      },
      selfRegulation: {
        score: scoreResult.selfRegulationIndex,
        label: levelLabel(scoreResult.selfRegulationIndex, "regulation"),
        description: levelDescription(scoreResult.selfRegulationIndex, "regulation"),
      },
    },
    dimensionSummary,
    dimensionDetails: dimensionSummary.map((item) => ({
      key: item.key,
      name: item.name,
      score: item.score,
      text: dimensionDetailText(item.key, item.score),
    })),
    riskAlertDetails: [
      { key: "emotion_stack_risk", name: "情绪堆积风险" },
      { key: "social_exhaustion_risk", name: "社交耗竭风险" },
      { key: "boundary_loss_risk", name: "边界失守风险" },
      { key: "chronic_burnout_risk", name: "长期透支风险" },
    ].map((item) => {
      const score = scoreResult.riskAlerts[item.key];
      return {
        key: item.key,
        name: item.name,
        score,
        label: levelLabel(score, "risk"),
        description: riskDescription(item.key, score),
      };
    }),
    suggestions: archetype.suggestions,
    closing:
      "理解自己，不是为了给自己再贴一个标签，而是为了以后再遇到那些熟悉的疲惫、委屈、混乱和过度在意时，你能更快认出：原来我不是又做错了什么，我只是需要把自己放回来。",
  };

  return report;
}
