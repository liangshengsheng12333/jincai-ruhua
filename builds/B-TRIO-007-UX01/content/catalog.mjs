import {PRINT_CONFIG} from '../src/app/engine.mjs';
import {assertContent,freezeData} from '../src/shared/contracts.mjs';
const records = [
  {
    "schemaVersion": "2",
    "artworkId": "lotus-and-carp",
    "contentVersion": "B-TRIO-004-DIGITAL-LAYERS-2",
    "art": {
      "width": 1402,
      "height": 1122,
      "version": "DIGITAL-LAYERS-2",
      "layerOrder": "line-first",
      "inkNames": [
        "青绿色版",
        "朱红色版"
      ],
      "background": "#fbe8cc",
      "overview": "/assets/artworks/lotus-and-carp/overview.png",
      "reference": "/assets/artworks/lotus-and-carp/overview.png",
      "thumbnail": "/assets/artworks/lotus-and-carp/thumbnail.png",
      "line": "/assets/artworks/lotus-and-carp/line.png",
      "plates": [
        "/assets/artworks/lotus-and-carp/plate-1.png",
        "/assets/artworks/lotus-and-carp/plate-2.png"
      ],
      "paint": [
        [
          "/assets/artworks/lotus-and-carp/paint-1-1.png",
          "/assets/artworks/lotus-and-carp/paint-1-2.png",
          "/assets/artworks/lotus-and-carp/paint-1-3.png"
        ],
        [
          "/assets/artworks/lotus-and-carp/paint-2-1.png",
          "/assets/artworks/lotus-and-carp/paint-2-2.png",
          "/assets/artworks/lotus-and-carp/paint-2-3.png"
        ]
      ],
      "trace": "/assets/artworks/lotus-and-carp/trace.png",
      "carve": "/assets/artworks/lotus-and-carp/carve.png",
      "regions": [
        {
          "id": "face",
          "title": "童子双颊",
          "x": 0.282,
          "y": 0.297,
          "rx": 0.15,
          "ry": 0.1
        },
        {
          "id": "carp",
          "title": "鱼鳞",
          "x": 0.596,
          "y": 0.68,
          "rx": 0.073,
          "ry": 0.06
        }
      ],
      "hotspots": {
        "lotus": {
          "x": 0.79,
          "y": 0.19
        },
        "fish": {
          "x": 0.44,
          "y": 0.6
        }
      }
    },
    "title": "莲年有余",
    "durationLabel": "几分钟完成一幅",
    "intro": "童子怀抱鲤鱼、身伴莲花，借“莲”谐音“连”、“鱼”谐音“余”寄托连年有余的祝愿。先套印两层色版，再为局部添彩。",
    "overviewSrc": "/assets/artworks/lotus-and-carp/overview.png",
    "overviewAlt": "莲年有余题材教学图：童子怀抱鲤鱼，周围有盛开的莲花和莲叶。",
    "identityNote": "本图为AI创作的“莲年有余”题材教学图，非馆藏原作复刻。选画页、制作过程与成画对比使用同一张原图及其数字分层。",
    "hotspots": [
      {
        "id": "lotus",
        "x": 0.79,
        "y": 0.19,
        "title": "莲花",
        "text": "“莲”与“连”谐音。画中盛开的朱红莲花与青绿莲叶相映，寄托连年不断、吉祥延续的美好祝愿。",
        "sourceIds": [
          "S5",
          "OBS"
        ]
      },
      {
        "id": "fish",
        "x": 0.44,
        "y": 0.6,
        "title": "鲤鱼",
        "text": "“鱼”与“余”谐音。童子怀抱大鲤鱼，与莲花合为“连年有余”，寓意生活富足、岁岁有余；鱼鳞细节稍后通过彩绘添色。",
        "sourceIds": [
          "S5",
          "OBS"
        ]
      }
    ],
    "preparation": [
      {
        "id": "trace",
        "title": "勾描",
        "text": "传统年画先用线条勾出画稿轮廓，作为分版依据。这张同源浅色底稿帮助先看清主体墨线走向。",
        "imageSrc": "/assets/artworks/lotus-and-carp/trace.png",
        "alt": "莲年有余同源浅色底稿教学示意",
        "sourceIds": [
          "S3",
          "S4",
          "PROJECT"
        ]
      },
      {
        "id": "carve",
        "title": "刻版",
        "text": "传统木刻依画稿雕出墨线版与套色版，版面纹样与印出画面左右相反。本页将原图转为水平镜像木色示意，不模拟真实刀法。",
        "imageSrc": "/assets/artworks/lotus-and-carp/carve.png",
        "alt": "莲年有余镜像木色纹样教学示意",
        "sourceIds": [
          "S3",
          "S4",
          "PROJECT"
        ]
      }
    ],
    "questions": [
      {
        "id": "q1",
        "title": "画中的莲花与鲤鱼合在一起，寄托了什么寓意？",
        "options": [
          {
            "id": "a",
            "text": "借“莲／连”“鱼／余”谐音，寄托连年有余、生活富足的愿望"
          },
          {
            "id": "b",
            "text": "只是记录池塘里常见的水生植物和鱼类形态"
          },
          {
            "id": "c",
            "text": "表示整幅年画只用一种颜色一次印成"
          }
        ],
        "correctId": "a",
        "explanation": "“莲”谐音“连”，“鱼”谐音“余”，莲花与鲤鱼相伴构成“连年有余”，寄托生活美好、岁岁富足的祝愿。",
        "sourceIds": [
          "S5"
        ]
      },
      {
        "id": "q2",
        "title": "套印完两层色版后，为什么还要进行局部彩绘？",
        "options": [
          {
            "id": "a",
            "text": "把已经印好的墨线轮廓全部擦除重画"
          },
          {
            "id": "b",
            "text": "在套色基础上继续描绘局部，丰富童子双颊与鱼鳞等细节层次"
          },
          {
            "id": "c",
            "text": "替代前面的勾描与刻版工序"
          }
        ],
        "correctId": "b",
        "explanation": "杨柳青木版年画结合套印与手工彩绘：色版先印出成片主色，印后再为童子双颊和鱼鳞等局部添彩，让画面更细腻传神。",
        "sourceIds": [
          "S3",
          "S4",
          "PROJECT"
        ]
      }
    ],
    "sources": [
      {
        "id": "S5",
        "title": "香港浸会大学图书馆艺术藏品：蓮年有餘",
        "publisher": "香港浸会大学图书馆（引《中国杨柳青木版年画》第125页）",
        "url": "https://bcc.lib.hkbu.edu.hk/artcollection/j218-022/",
        "summary": "离线摘要：以“莲”谐音“连”、“鱼”谐音“余”，合为“连年有余”，寄托生活美好、岁岁富足之意。馆藏条目标注Copyrighted，仅作文化寓意参考，不作为本项目图片授权。"
      },
      {
        "id": "S3",
        "title": "商务部老字号数字博物馆：天津杨柳青画社",
        "publisher": "中华人民共和国商务部",
        "url": "https://lzhbwg.mofcom.gov.cn/edi_ecms_web_front/thb/detail/e7eb337a807a413d9f29043a287f04a4",
        "summary": "离线摘要：介绍天津杨柳青画社勾描、木刻、水印、彩绘、装裱五大工作室及“勾、刻、印、绘”传统工艺体系，说明木版套印后仍需手工彩绘与装裱。"
      },
      {
        "id": "S4",
        "title": "杨柳青木版年画：四百年古老工艺的传承与坚守",
        "publisher": "中国非物质文化遗产网（2012-01-30历史报道）",
        "url": "https://www.ihchina.cn/project_details/10643",
        "summary": "离线摘要：交叉印证“勾刻印画裱”工序——先勾轮廓、刻木版、拓印墨线、套印单色版，再手工彩绘局部细节。仅作工艺流程参考，不以报道中的人数描述当前现状。"
      },
      {
        "id": "S6",
        "title": "当“莲年有余”遇上青春创意",
        "publisher": "天津日报／天津政务网（2026-02-20）",
        "url": "https://www.tj.gov.cn/sy/tjxw/202602/t20260220_7248195.html",
        "summary": "离线摘要：记录围绕“莲年有余”等传统年画题材开展青年再创作与数字AI插画实践的背景；仅作背景参考，不作为本项目独创性或素材许可证明。"
      },
      {
        "id": "OBS",
        "title": "莲年有余 · 教学画稿画面观察",
        "publisher": "本项目AI教学画稿",
        "summary": "离线摘要：画面主体为抱鱼童子与盛开莲花、莲叶，设青绿与朱红两层主色，并在童子双颊、鲤鱼鳞片两处保留印后局部彩绘细节。"
      },
      {
        "id": "PROJECT",
        "title": "数字分色与交互简化记录",
        "publisher": "津彩入画项目",
        "summary": "离线摘要：选定AI原图经确定性像素分色，形成固定浅底、两张套色版与两处各三段彩绘层；各层保持1402×1122同一画布与坐标，零偏移合成与原图逐像素一致。"
      }
    ],
    "assetLedger": [
      {
        "id": "overview",
        "name": "overview.png",
        "file": "/assets/artworks/lotus-and-carp/overview.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "thumbnail",
        "name": "thumbnail.png",
        "file": "/assets/artworks/lotus-and-carp/thumbnail.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "line",
        "name": "line.png",
        "file": "/assets/artworks/lotus-and-carp/line.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "trace",
        "name": "trace.png",
        "file": "/assets/artworks/lotus-and-carp/trace.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "carve",
        "name": "carve.png",
        "file": "/assets/artworks/lotus-and-carp/carve.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "plate-1",
        "name": "plate-1.png",
        "file": "/assets/artworks/lotus-and-carp/plate-1.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "plate-2",
        "name": "plate-2.png",
        "file": "/assets/artworks/lotus-and-carp/plate-2.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-1-1",
        "name": "paint-1-1.png",
        "file": "/assets/artworks/lotus-and-carp/paint-1-1.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-1-2",
        "name": "paint-1-2.png",
        "file": "/assets/artworks/lotus-and-carp/paint-1-2.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-1-3",
        "name": "paint-1-3.png",
        "file": "/assets/artworks/lotus-and-carp/paint-1-3.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-2-1",
        "name": "paint-2-1.png",
        "file": "/assets/artworks/lotus-and-carp/paint-2-1.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-2-2",
        "name": "paint-2-2.png",
        "file": "/assets/artworks/lotus-and-carp/paint-2-2.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-2-3",
        "name": "paint-2-3.png",
        "file": "/assets/artworks/lotus-and-carp/paint-2-3.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      }
    ],
    "simplificationNotes": [
      "真实杨柳青木版年画包含勾、刻、印、绘、裱等完整手工技艺；本页简化为几分钟完成一幅的引导体验，不模拟真实刀法与自由画笔。",
      "两张色版、对位容差与两处预设配色的渐进彩绘均为教学设计；固定浅底保留纸纹、墨线与部分低饱和底色，刻版图采用同源水平镜像木色示意。",
      "本页画稿为AI创作的年画风格教学图，非馆藏原作复刻；文化资料来源仅作事实依据，不代表馆藏图片授权。"
    ]
  },
  {
    "schemaVersion": "2",
    "artworkId": "peony-and-bird",
    "contentVersion": "B-TRIO-004-DIGITAL-LAYERS-2",
    "art": {
      "width": 1402,
      "height": 1122,
      "version": "DIGITAL-LAYERS-2",
      "layerOrder": "line-first",
      "inkNames": [
        "青绿色版",
        "朱红色版"
      ],
      "background": "#fbe8cc",
      "overview": "/assets/artworks/peony-and-bird/overview.png",
      "reference": "/assets/artworks/peony-and-bird/overview.png",
      "thumbnail": "/assets/artworks/peony-and-bird/thumbnail.png",
      "line": "/assets/artworks/peony-and-bird/line.png",
      "plates": [
        "/assets/artworks/peony-and-bird/plate-1.png",
        "/assets/artworks/peony-and-bird/plate-2.png"
      ],
      "paint": [
        [
          "/assets/artworks/peony-and-bird/paint-1-1.png",
          "/assets/artworks/peony-and-bird/paint-1-2.png",
          "/assets/artworks/peony-and-bird/paint-1-3.png"
        ],
        [
          "/assets/artworks/peony-and-bird/paint-2-1.png",
          "/assets/artworks/peony-and-bird/paint-2-2.png",
          "/assets/artworks/peony-and-bird/paint-2-3.png"
        ]
      ],
      "trace": "/assets/artworks/peony-and-bird/trace.png",
      "carve": "/assets/artworks/peony-and-bird/carve.png",
      "regions": [
        {
          "id": "center",
          "title": "牡丹花心",
          "x": 0.385,
          "y": 0.424,
          "rx": 0.074,
          "ry": 0.067
        },
        {
          "id": "wing",
          "title": "鸟翼",
          "x": 0.801,
          "y": 0.158,
          "rx": 0.09,
          "ry": 0.07
        }
      ],
      "hotspots": {
        "flower": {
          "x": 0.37,
          "y": 0.46
        },
        "bird": {
          "x": 0.76,
          "y": 0.18
        }
      }
    },
    "title": "牡丹花鸟",
    "durationLabel": "几分钟完成一幅",
    "intro": "朱红牡丹与青绿枝叶相映，小鸟停在右上枝头。先套印枝叶与花瓣主色，再通过局部彩绘补齐花心和鸟翼细节。",
    "overviewSrc": "/assets/artworks/peony-and-bird/overview.png",
    "overviewAlt": "牡丹花鸟题材教学图：朱红牡丹与青绿枝叶相映，一只小鸟停在画面右上方枝头。",
    "identityNote": "本图为AI创作的“牡丹花鸟”题材教学图，以可核验的画面观察和印绘工艺说明配文。选画页、制作过程与成画对比使用同一张原图及其数字分层。",
    "hotspots": [
      {
        "id": "flower",
        "x": 0.37,
        "y": 0.46,
        "title": "牡丹",
        "text": "层层舒展的朱红花瓣与青绿枝叶相映。套色版先印出成片花叶主色，花心处的细密蕊丝则留在印后彩绘添色。",
        "sourceIds": [
          "OBS",
          "S3",
          "PROJECT"
        ]
      },
      {
        "id": "bird",
        "x": 0.76,
        "y": 0.18,
        "title": "枝头小鸟",
        "text": "小鸟停在画面右上枝头，与下方牡丹形成呼应。墨线定形、色版铺底后，鸟翼上的细部层次将在彩绘步骤补齐。",
        "sourceIds": [
          "OBS",
          "S4",
          "PROJECT"
        ]
      }
    ],
    "preparation": [
      {
        "id": "trace",
        "title": "勾描",
        "text": "传统年画先用线条勾出画稿轮廓，作为分版依据。这张同源浅色底稿帮助先看清花叶与枝头小鸟的墨线走向。",
        "imageSrc": "/assets/artworks/peony-and-bird/trace.png",
        "alt": "牡丹花鸟同源浅色底稿教学示意",
        "sourceIds": [
          "S3",
          "S4",
          "PROJECT"
        ]
      },
      {
        "id": "carve",
        "title": "刻版",
        "text": "传统木刻依画稿雕出墨线版与套色版，版面纹样与印出画面左右相反。本页将原图转为水平镜像木色示意，不模拟真实刀法。",
        "imageSrc": "/assets/artworks/peony-and-bird/carve.png",
        "alt": "牡丹花鸟镜像木色纹样教学示意",
        "sourceIds": [
          "S3",
          "S4",
          "PROJECT"
        ]
      }
    ],
    "questions": [
      {
        "id": "q1",
        "title": "在这幅《牡丹花鸟》中，大片花叶主色与花心、鸟翼细部是怎样配合完成的？",
        "options": [
          {
            "id": "a",
            "text": "不印墨线，直接用一块木版印出全部深浅细节"
          },
          {
            "id": "b",
            "text": "先用青绿、朱红色版套印花叶大色块，再通过印后彩绘添上花心与鸟翼细节"
          },
          {
            "id": "c",
            "text": "先画完局部细节，最后再去勾描轮廓"
          }
        ],
        "correctId": "b",
        "explanation": "年画制作遵循“先印后绘”：青绿与朱红色版负责印出枝叶和花瓣主色，牡丹花心与鸟翼细部则由印后彩绘补充。",
        "sourceIds": [
          "S3",
          "S4",
          "OBS"
        ]
      },
      {
        "id": "q2",
        "title": "套色完成后，为牡丹花心和鸟翼彩绘起到了什么作用？",
        "options": [
          {
            "id": "a",
            "text": "改变了整张画的构图和纸张大小"
          },
          {
            "id": "b",
            "text": "在已印好的花叶色块上，补齐两处局部的纹理与色泽层次"
          },
          {
            "id": "c",
            "text": "把前面印好的青绿枝叶全部遮盖擦除"
          }
        ],
        "correctId": "b",
        "explanation": "套印铺陈稳定的成片色彩，印后彩绘则为牡丹花心和鸟翼分段添色，让局部层次更清晰。",
        "sourceIds": [
          "S3",
          "S4",
          "PROJECT"
        ]
      }
    ],
    "sources": [
      {
        "id": "S3",
        "title": "商务部老字号数字博物馆：天津杨柳青画社",
        "publisher": "中华人民共和国商务部",
        "url": "https://lzhbwg.mofcom.gov.cn/edi_ecms_web_front/thb/detail/e7eb337a807a413d9f29043a287f04a4",
        "summary": "离线摘要：介绍天津杨柳青画社勾描、木刻、水印、彩绘、装裱五大工作室及“勾、刻、印、绘”传统工艺体系，说明木版套印后仍需手工彩绘与装裱。"
      },
      {
        "id": "S4",
        "title": "杨柳青木版年画：四百年古老工艺的传承与坚守",
        "publisher": "中国非物质文化遗产网（2012-01-30历史报道）",
        "url": "https://www.ihchina.cn/project_details/10643",
        "summary": "离线摘要：交叉印证“勾刻印画裱”工序——先勾轮廓、刻木版、拓印墨线、套印单色版，再手工彩绘局部细节。仅作工艺流程参考，不以报道中的人数描述当前现状。"
      },
      {
        "id": "OBS",
        "title": "牡丹花鸟 · 教学画稿画面观察",
        "publisher": "本项目AI教学画稿",
        "summary": "离线摘要：画面由盛开的朱红牡丹、青绿枝叶与右上枝头小鸟构成，两处印后彩绘区域分别位于牡丹花心和鸟翼；配文仅依据可核验画面观察与工艺分工，不虚构未核实的象征典故。"
      },
      {
        "id": "PROJECT",
        "title": "数字分色与交互简化记录",
        "publisher": "津彩入画项目",
        "summary": "离线摘要：选定AI原图经确定性像素分色，形成固定浅底、两张套色版与两处各三段彩绘层；各层保持1402×1122同一画布与坐标，零偏移合成与原图逐像素一致。"
      }
    ],
    "assetLedger": [
      {
        "id": "overview",
        "name": "overview.png",
        "file": "/assets/artworks/peony-and-bird/overview.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "thumbnail",
        "name": "thumbnail.png",
        "file": "/assets/artworks/peony-and-bird/thumbnail.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "line",
        "name": "line.png",
        "file": "/assets/artworks/peony-and-bird/line.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "trace",
        "name": "trace.png",
        "file": "/assets/artworks/peony-and-bird/trace.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "carve",
        "name": "carve.png",
        "file": "/assets/artworks/peony-and-bird/carve.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "plate-1",
        "name": "plate-1.png",
        "file": "/assets/artworks/peony-and-bird/plate-1.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "plate-2",
        "name": "plate-2.png",
        "file": "/assets/artworks/peony-and-bird/plate-2.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-1-1",
        "name": "paint-1-1.png",
        "file": "/assets/artworks/peony-and-bird/paint-1-1.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-1-2",
        "name": "paint-1-2.png",
        "file": "/assets/artworks/peony-and-bird/paint-1-2.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-1-3",
        "name": "paint-1-3.png",
        "file": "/assets/artworks/peony-and-bird/paint-1-3.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-2-1",
        "name": "paint-2-1.png",
        "file": "/assets/artworks/peony-and-bird/paint-2-1.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-2-2",
        "name": "paint-2-2.png",
        "file": "/assets/artworks/peony-and-bird/paint-2-2.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-2-3",
        "name": "paint-2-3.png",
        "file": "/assets/artworks/peony-and-bird/paint-2-3.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      }
    ],
    "simplificationNotes": [
      "真实杨柳青木版年画包含勾、刻、印、绘、裱等完整手工技艺；本页简化为几分钟完成一幅的引导体验，不模拟真实刀法与自由画笔。",
      "两张色版、对位容差与两处预设配色的渐进彩绘均为教学设计；固定浅底保留纸纹、墨线与部分低饱和底色，刻版图采用同源水平镜像木色示意。",
      "本页画稿为AI创作的年画风格教学图，配文基于可核验的画面观察与传统印绘工艺关系，不虚构未核实的象征说法。"
    ]
  },
  {
    "schemaVersion": "2",
    "artworkId": "spring-children",
    "contentVersion": "B-TRIO-004-DIGITAL-LAYERS-2",
    "art": {
      "width": 1402,
      "height": 1122,
      "version": "DIGITAL-LAYERS-2",
      "layerOrder": "line-first",
      "inkNames": [
        "青绿色版",
        "朱红色版"
      ],
      "background": "#fbe8cc",
      "overview": "/assets/artworks/spring-children/overview.png",
      "reference": "/assets/artworks/spring-children/overview.png",
      "thumbnail": "/assets/artworks/spring-children/thumbnail.png",
      "line": "/assets/artworks/spring-children/line.png",
      "plates": [
        "/assets/artworks/spring-children/plate-1.png",
        "/assets/artworks/spring-children/plate-2.png"
      ],
      "paint": [
        [
          "/assets/artworks/spring-children/paint-1-1.png",
          "/assets/artworks/spring-children/paint-1-2.png",
          "/assets/artworks/spring-children/paint-1-3.png"
        ],
        [
          "/assets/artworks/spring-children/paint-2-1.png",
          "/assets/artworks/spring-children/paint-2-2.png",
          "/assets/artworks/spring-children/paint-2-3.png"
        ]
      ],
      "trace": "/assets/artworks/spring-children/trace.png",
      "carve": "/assets/artworks/spring-children/carve.png",
      "regions": [
        {
          "id": "lantern",
          "title": "兔灯纹样",
          "x": 0.492,
          "y": 0.633,
          "rx": 0.153,
          "ry": 0.115
        },
        {
          "id": "sleeve",
          "title": "右童袖口",
          "x": 0.776,
          "y": 0.436,
          "rx": 0.08,
          "ry": 0.057
        }
      ],
      "hotspots": {
        "lantern": {
          "x": 0.49,
          "y": 0.61
        },
        "children": {
          "x": 0.68,
          "y": 0.21
        }
      }
    },
    "title": "新春童趣",
    "durationLabel": "几分钟完成一幅",
    "intro": "以杨柳青年画常见的喜庆娃娃与年节题材为传统文化背景，本教学画稿描绘两位童子共赏兔形花灯的生动场景。先套印两层主色，再为兔灯与袖口添彩。",
    "overviewSrc": "/assets/artworks/spring-children/overview.png",
    "overviewAlt": "新春童趣题材教学图：两个童子围着一盏兔形花灯，画面以朱红和青绿设色。",
    "identityNote": "本图为AI创作的“新春童趣”题材教学图。配文明确区分传统年画年节祈福背景与本页教学画稿创作观察，具体画面细节不虚构固定象征。选画页、制作过程与成画对比使用同一张原图及其数字分层。",
    "hotspots": [
      {
        "id": "lantern",
        "x": 0.49,
        "y": 0.61,
        "title": "兔灯",
        "text": "兔形花灯位于两位童子之间，长耳与圆润灯身醒目。先由墨线与色版印出灯体主色，灯面纹样将在印后彩绘中添上。",
        "sourceIds": [
          "OBS",
          "S3",
          "PROJECT"
        ]
      },
      {
        "id": "children",
        "x": 0.68,
        "y": 0.21,
        "title": "双童",
        "text": "在杨柳青传统年画中，圆润饱满的娃娃常寄托辞旧迎新、生活富足的美好祝愿（见S4、S6）。本教学图借鉴该传统题材进行双童画面创作，右童袖口纹样将在彩绘环节添色。",
        "sourceIds": [
          "S4",
          "S6",
          "OBS"
        ]
      }
    ],
    "preparation": [
      {
        "id": "trace",
        "title": "勾描",
        "text": "传统年画先用线条勾出画稿轮廓，作为分版依据。这张同源浅色底稿帮助先看清双童与兔灯的墨线走向。",
        "imageSrc": "/assets/artworks/spring-children/trace.png",
        "alt": "新春童趣同源浅色底稿教学示意",
        "sourceIds": [
          "S3",
          "S4",
          "PROJECT"
        ]
      },
      {
        "id": "carve",
        "title": "刻版",
        "text": "传统木刻依画稿雕出墨线版与套色版，版面纹样与印出画面左右相反。本页将原图转为水平镜像木色示意，不模拟真实刀法。",
        "imageSrc": "/assets/artworks/spring-children/carve.png",
        "alt": "新春童趣镜像木色纹样教学示意",
        "sourceIds": [
          "S3",
          "S4",
          "PROJECT"
        ]
      }
    ],
    "questions": [
      {
        "id": "q1",
        "title": "结合资料与画面，这幅《新春童趣》教学画稿是如何借鉴杨柳青传统年画的？",
        "options": [
          {
            "id": "a",
            "text": "记录寒冬时节的农田耕作工具与劳作方式"
          },
          {
            "id": "b",
            "text": "表示传统年画只能用单色墨线印制，不能设色"
          },
          {
            "id": "c",
            "text": "借鉴传统年画中喜庆娃娃与世俗节庆题材，以教学创作呈现双童共赏花灯的年节童趣"
          }
        ],
        "correctId": "c",
        "explanation": "杨柳青年画常以娃娃与世俗年节寄托辞旧迎新、生活富足的美好祝愿；本页画稿借鉴这一传统题材，通过双童与花灯呈现具有年节氛围的教学创作。",
        "sourceIds": [
          "S4",
          "S6",
          "OBS"
        ]
      },
      {
        "id": "q2",
        "title": "在《新春童趣》中，兔灯纹样与右童袖口的印后彩绘有什么作用？",
        "options": [
          {
            "id": "a",
            "text": "替代前面的墨线版与两层套色版"
          },
          {
            "id": "b",
            "text": "在已印好的朱红、青绿大色块上，继续描绘并丰富灯面与袖口细节"
          },
          {
            "id": "c",
            "text": "把画面中两位童子的位置左右对调"
          }
        ],
        "correctId": "b",
        "explanation": "套色版先印出衣袍和背景的成片颜色，印后彩绘再为兔灯纹样和右童袖口添上局部细节，体现“印绘结合”的工艺特点。",
        "sourceIds": [
          "S3",
          "S4",
          "PROJECT"
        ]
      }
    ],
    "sources": [
      {
        "id": "S3",
        "title": "商务部老字号数字博物馆：天津杨柳青画社",
        "publisher": "中华人民共和国商务部",
        "url": "https://lzhbwg.mofcom.gov.cn/edi_ecms_web_front/thb/detail/e7eb337a807a413d9f29043a287f04a4",
        "summary": "离线摘要：介绍天津杨柳青画社勾描、木刻、水印、彩绘、装裱五大工作室及“勾、刻、印、绘”传统工艺体系，说明木版套印后仍需手工彩绘与装裱。"
      },
      {
        "id": "S4",
        "title": "杨柳青木版年画：四百年古老工艺的传承与坚守",
        "publisher": "中国非物质文化遗产网（2012-01-30历史报道）",
        "url": "https://www.ihchina.cn/project_details/10643",
        "summary": "离线摘要：说明年画是百姓辞旧迎新、祈福平安的重要载体，仕女娃娃与世俗生活题材广受欢迎，并介绍“勾刻印画裱”完整手工制作流程。"
      },
      {
        "id": "S6",
        "title": "当“莲年有余”遇上青春创意",
        "publisher": "天津日报／天津政务网（2026-02-20）",
        "url": "https://www.tj.gov.cn/sy/tjxw/202602/t20260220_7248195.html",
        "summary": "离线摘要：介绍杨柳青年画娃娃圆润饱满的传统造型特点及寄托生活富足的传统寓意，并记录当代高校结合传统题材开展数字AI插画等教学再创作的背景；仅作文化背景与教学再创作参考，不作为本画各元素特定象征的考据依据。"
      },
      {
        "id": "OBS",
        "title": "新春童趣 · 教学画稿画面观察",
        "publisher": "本项目AI教学画稿",
        "summary": "离线摘要：画面由两位童子与中间的兔形花灯组成，以朱红和青绿设色；印后彩绘区域分别位于兔灯纹样与右侧童子袖口。配文明确区分传统年画年节祈福背景与本页教学画稿创作观察，不虚构未核实的具体图像象征。"
      },
      {
        "id": "PROJECT",
        "title": "数字分色与交互简化记录",
        "publisher": "津彩入画项目",
        "summary": "离线摘要：选定AI原图经确定性像素分色，形成固定浅底、两张套色版与两处各三段彩绘层；各层保持1402×1122同一画布与坐标，零偏移合成与原图逐像素一致。"
      }
    ],
    "assetLedger": [
      {
        "id": "overview",
        "name": "overview.png",
        "file": "/assets/artworks/spring-children/overview.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "thumbnail",
        "name": "thumbnail.png",
        "file": "/assets/artworks/spring-children/thumbnail.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "line",
        "name": "line.png",
        "file": "/assets/artworks/spring-children/line.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "trace",
        "name": "trace.png",
        "file": "/assets/artworks/spring-children/trace.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "carve",
        "name": "carve.png",
        "file": "/assets/artworks/spring-children/carve.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "plate-1",
        "name": "plate-1.png",
        "file": "/assets/artworks/spring-children/plate-1.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "plate-2",
        "name": "plate-2.png",
        "file": "/assets/artworks/spring-children/plate-2.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-1-1",
        "name": "paint-1-1.png",
        "file": "/assets/artworks/spring-children/paint-1-1.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-1-2",
        "name": "paint-1-2.png",
        "file": "/assets/artworks/spring-children/paint-1-2.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-1-3",
        "name": "paint-1-3.png",
        "file": "/assets/artworks/spring-children/paint-1-3.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-2-1",
        "name": "paint-2-1.png",
        "file": "/assets/artworks/spring-children/paint-2-1.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-2-2",
        "name": "paint-2-2.png",
        "file": "/assets/artworks/spring-children/paint-2-2.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      },
      {
        "id": "paint-2-3",
        "name": "paint-2-3.png",
        "file": "/assets/artworks/spring-children/paint-2-3.png",
        "version": "DIGITAL-LAYERS-2",
        "status": "用户已确认画稿保留；九层零偏移合成与原图逐像素一致，网页交互已联测",
        "provenance": "OpenAI built-in ImageGen 生成 AI 原图（历史提示词与中间修改稿原交付未随包留存），经确定性像素分色生成各层；勾描与刻版为同源教学示意。",
        "use": "仅用于本项目网页展示与工艺教学体验，随源码和静态包离线交付；不作为馆藏复刻或外部图片授权。",
        "canExport": false
      }
    ],
    "simplificationNotes": [
      "真实杨柳青木版年画包含勾、刻、印、绘、裱等完整手工技艺；本页简化为几分钟完成一幅的引导体验，不模拟真实刀法与自由画笔。",
      "两张色版、对位容差与两处预设配色的渐进彩绘均为教学设计；固定浅底保留纸纹、墨线与部分低饱和底色，刻版图采用同源水平镜像木色示意。",
      "本页画稿为AI创作的年画风格教学图，明确区分传统年画年节祈福背景与本页教学画稿创作观察，不虚构未核实的具体图像象征。"
    ]
  }
];
export const artworks = freezeData(records.map(record => assertContent({...record,printConfig:PRINT_CONFIG})));
