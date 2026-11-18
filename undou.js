/*
 * 自宅の運動（会員証に入れる部品）  undou.js  v1.0（2026-11-17）
 *
 * kaiin.html から読み込んで使う。会員証の中に「自宅の運動」の欄を出す。
 *  - 院からのおすすめ（スタッフが「運動の処方」シートで選んだ運動。なければ、今の症状の部位と時期から自動）
 *  - 部位から探す（腰／首・肩／足首／ひざ）
 *  - 図（2コマ：はじめ→動かしたあと）と、院で撮った動画（「運動メニュー」シートに動画のURLを入れたときだけ）
 *  - 「今日やった」を押すと院に記録が届き、今週やった日数が出る
 * 運動の内容（やり方・回数・注意・根拠）はこのファイルにまとめてある。院ごとに変えるのは、動画のURLと、出す／出さないだけ（スプレッドシート側）。
 *
 * 回数の基本（Garber 2011 ACSM の運動の指針）
 *  - 筋トレ：週2〜3日、1つの運動を8〜12回 × 1〜3セット
 *  - ストレッチ：週2〜3日以上、1回10〜30秒（60歳以上は30〜60秒）× 2〜4回
 * 痛みの目安：運動中の痛みがふだんより強くならない範囲。翌朝に痛みが強く残ったら、回数を減らす（Silbernagel 2007 の痛みを見ながら進める方法を、やさしく言い換えたもの）
 */
(function () {
  'use strict';

  const PARTS = ['腰', '首・肩', '足首', 'ひざ'];
  const KIND_LABEL = { stretch: 'ストレッチ', strength: '筋トレ', balance: 'バランス', move: '動かす', aerobic: '有酸素' };

  // ===== 運動の一覧 =====
  // id：院のスプレッドシート（Undou.gs）と同じID。parts：出す部位。early：痛みが強い時期からしてよいもの
  const LIB = [
    // ---- 腰 ----
    { id: 'L1', name: '歩く', parts: ['腰'], kind: 'aerobic', early: true, fig: 'walk',
      dose: '1日10〜30分。少しずつのばす',
      steps: ['痛みの出ない速さで歩きます', '慣れたら、少しずつ時間や距離をのばします'],
      care: '脚のしびれが強くなるときは、休んでから続けてください',
      why: '長引く腰痛は、運動を続けると痛みと動きが良くなることがわかっています（Hayden 2021）' },
    { id: 'L2', name: 'ひざ抱え', parts: ['腰'], kind: 'stretch', early: true, fig: 'kneehug',
      dose: '20〜30秒 × 2〜3回',
      steps: ['あお向けで両ひざを立てます', '片方のひざを両手で胸に引き寄せ、そのまま止めます', '反対の脚も同じように'],
      care: 'お尻や脚にしびれが出たら中止してください',
      why: 'ストレッチは体を動かしやすくします。痛みを減らす効果は、筋トレや歩くことの方がはっきりしています（Hayden 2021）' },
    { id: 'L3', name: '背中を丸める・反らす', parts: ['腰'], kind: 'move', early: true, fig: 'cat',
      dose: 'ゆっくり10回',
      steps: ['四つばいになります', '息をはきながら背中を丸めます', '息をすいながら、背中をゆっくり反らします'],
      care: '痛みの出ない大きさで動かしてください',
      why: '痛みが強い時期も、できる範囲で動かす方が回復しやすいことがわかっています（Wallwork 2024）' },
    { id: 'L4', name: 'お尻上げ（ブリッジ）', parts: ['腰', 'ひざ'], kind: 'strength', early: false, fig: 'bridge',
      dose: '10回 × 2〜3セット　週2〜3日',
      steps: ['あお向けで両ひざを立てます', 'お尻を持ち上げ、肩からひざまで一直線で3秒止めます', 'ゆっくり下ろします'],
      care: '腰を反りすぎないように。お尻に力が入っているのを感じながら',
      why: '筋トレ・体幹の運動は、長引く腰痛の痛みと動きを良くします（Hayden 2021／Saragiotto 2016）' },
    { id: 'L5', name: '手足のばし', parts: ['腰'], kind: 'strength', early: false, fig: 'birddog',
      dose: '左右10回ずつ（3〜5秒止める）　週2〜3日',
      steps: ['四つばいになり、背中をまっすぐにします', '右手と左足を、床と平行になるまでのばして止めます', '戻して、反対の手足も同じように'],
      care: '背中が反ったり、体が傾いたりしない範囲で',
      why: '体幹の運動は、長引く腰痛でほかの運動と同じくらい効果がありました（Saragiotto 2016）' },
    // ---- 首・肩 ----
    { id: 'N1', name: 'あご引き', parts: ['首・肩'], kind: 'strength', early: true, fig: 'chintuck',
      dose: '5〜10秒 × 10回',
      steps: ['背すじをのばして座ります', 'うなずくように、あごを軽く引いて止めます', '首の後ろがのびるのを感じたら戻します'],
      care: '下を向くのではなく、頭を後ろへ軽くスライドする感じで',
      why: '首の深い筋肉の運動で、首の痛みと頭痛が減りました（Jull 2002）。首の痛みには運動が勧められています（Bussières 2016）' },
    { id: 'N2', name: '首の横のストレッチ', parts: ['首・肩'], kind: 'stretch', early: true, fig: 'neckside',
      dose: '20〜30秒 × 左右2回',
      steps: ['背すじをのばして座ります', '頭を真横に倒し、反対側の首すじをのばします', '手で軽くそえてもかまいません'],
      care: '腕にしびれが出たら中止してください',
      why: 'ストレッチは動かしやすさのため。痛みを減らすには、筋トレと組み合わせます（Bussières 2016）' },
    { id: 'N3', name: '肩甲骨よせ', parts: ['首・肩'], kind: 'strength', early: true, fig: 'scap',
      dose: '10回 × 2〜3セット（3秒止める）　週3日以上',
      steps: ['ひじを曲げて、わきをしめます', '胸を張って、ひじを後ろへ引き、肩甲骨を寄せます', '3秒止めて戻します'],
      care: '肩がすくまないように',
      why: '首・肩の筋トレで、仕事中の首・肩の痛みが減りました（Andersen 2008）' },
    { id: 'N4', name: '肩すくめ', parts: ['首・肩'], kind: 'strength', early: false, fig: 'shrug',
      dose: '10〜12回 × 2〜3セット　週3日',
      steps: ['水を入れたペットボトル（500ml〜2L）を両手に持ちます', '肩を耳に近づけるように持ち上げ、1秒止めます', 'ゆっくり下ろします'],
      care: '首に痛みが出ない重さで。軽いものから始めます',
      why: '首・肩の筋トレで、首・肩の痛みが減りました（Andersen 2008）' },
    { id: 'N5', name: '胸を開くストレッチ', parts: ['首・肩'], kind: 'stretch', early: true, fig: 'chest',
      dose: '20〜30秒 × 2回',
      steps: ['壁の横に立ち、ひじを肩の高さで壁につけます', '体を壁と反対へゆっくりひねり、胸の前をのばします', '反対の腕も同じように'],
      care: '肩の前が痛むときは、ひじの高さを下げてください',
      why: 'ストレッチは動かしやすさのため。肩甲骨よせなどの筋トレと組み合わせます' },
    // ---- 足首 ----
    { id: 'A1', name: '足首で字を書く', parts: ['足首'], kind: 'move', early: true, fig: 'ankleabc',
      dose: '1日に数回、あいうえお（またはA〜Z）1回分',
      steps: ['いすに座り、ケガをした足を少し浮かせます', '足の指先で、空中に大きく字を書きます'],
      care: '腫れが強いときは、足を高くしてから行います',
      why: '捻挫は、早めに動かし始めると回復が良いことがわかっています（Doherty 2017）' },
    { id: 'A2', name: '片脚立ち', parts: ['足首', 'ひざ'], kind: 'balance', early: false, fig: 'onelegstand',
      dose: '30秒 × 左右3回　週3日・8週間',
      steps: ['壁や台の近くで、片脚で立ちます', '慣れたら目を閉じる', 'さらに慣れたら、座布団などやわらかい物の上で'],
      care: 'ふらついたらすぐ手をつける場所で',
      why: '捻挫のあと、8週間の自宅でのバランス練習で再発が約3分の1減りました（Hupperets 2009）' },
    { id: 'A3', name: 'かかと上げ', parts: ['足首'], kind: 'strength', early: false, fig: 'calfraise',
      dose: '10〜15回 × 2〜3セット　週2〜3日',
      steps: ['壁に手をそえて立ちます', 'かかとをゆっくり上げ、1秒止めます', 'ゆっくり下ろします。慣れたら片脚で'],
      care: '足首に痛みが出ない高さまで',
      why: '足首の筋トレは捻挫の再発予防に役立ちます（Doherty 2017）。片脚で25回が、健康な人の目安です（Lunsford 1995）' },
    { id: 'A4', name: 'ふくらはぎのストレッチ', parts: ['足首', 'ひざ'], kind: 'stretch', early: true, fig: 'calfstretch',
      dose: '30秒 × 2〜3回',
      steps: ['壁に両手をつき、片脚を後ろに引きます', '後ろの脚のかかとを床につけたまま、体を前へ', 'ふくらはぎがのびたら止めます'],
      care: 'かかとが浮かないように',
      why: 'ストレッチで足首の動く範囲が広がります（動かしやすさのため）' },
    // ---- ひざ ----
    { id: 'K1', name: 'タオルつぶし', parts: ['ひざ'], kind: 'strength', early: true, fig: 'quadset',
      dose: '5秒 × 10回　毎日',
      steps: ['脚をのばして座り、ひざの下に丸めたタオルを置きます', '太ももに力を入れ、ひざでタオルを押しつぶして5秒', '力をぬきます'],
      care: 'ひざの皿の上の筋肉が固くなるのを確かめながら',
      why: 'ひざの痛みは、太ももの筋トレで痛みと動きが良くなります（Fransen 2015）' },
    { id: 'K2', name: 'いすから立ち上がる', parts: ['ひざ', '腰'], kind: 'strength', early: false, fig: 'sittostand',
      dose: '10回 × 2〜3セット　週2〜3日',
      steps: ['いすに浅く座ります', '腕を胸の前で組み、ゆっくり立ち上がります', 'ゆっくり座ります'],
      care: 'ひざが内側に入らないように',
      why: 'ひざの痛みは、太もも・お尻の筋トレで痛みと動きが良くなります（Fransen 2015）' },
    { id: 'K3', name: '浅いスクワット', parts: ['ひざ'], kind: 'strength', early: false, fig: 'squat',
      dose: '10回 × 2〜3セット　週2〜3日',
      steps: ['足を肩幅に開いて立ちます', 'お尻を後ろに引くように、痛みの出ない深さまでしゃがみます', 'ゆっくり立ちます'],
      care: 'ひざとつま先を同じ向きに',
      why: 'ひざの痛みは、太ももの筋トレで痛みと動きが良くなります（Fransen 2015）' },
    { id: 'K4', name: '横向き脚上げ', parts: ['ひざ', '腰'], kind: 'strength', early: false, fig: 'sidelegraise',
      dose: '10〜15回 × 2セット　週2〜3日',
      steps: ['横向きに寝て、下の脚は軽く曲げます', '上の脚をまっすぐのまま、少し後ろ気味に持ち上げます', 'ゆっくり下ろします'],
      care: '体が後ろに倒れないように',
      why: 'ひざの前の痛みは、お尻と太ももの筋トレで痛みが減りました（Lack 2015）' },
    { id: 'K5', name: '太もも裏のストレッチ', parts: ['ひざ', '腰'], kind: 'stretch', early: true, fig: 'hamstring',
      dose: '30秒 × 2〜3回',
      steps: ['いすに浅く座り、片脚をのばしてかかとを床につけます', '背すじをのばしたまま、体を前へ倒します', '太ももの裏がのびたら止めます'],
      care: '背中を丸めず、おへそを前に出すように',
      why: 'ストレッチは動かしやすさのため。痛みを減らすには、筋トレと組み合わせます' }
  ];
  const BY_ID = {}; LIB.forEach(function (x) { BY_ID[x.id] = x; });

  // ===== 図（棒人間・2コマ）=====
  // 1コマ = { h:[頭x,頭y], l:[[x,y,x,y,...], ...] (線), o:[その他のSVG] }。1コマは 100×90、床は y=84
  const P = function (h, l, o) { return { h: h, l: l, o: o || [] }; };
  const STAND = [[50, 21, 50, 50], [50, 26, 43, 39, 41, 51], [50, 26, 57, 39, 59, 51], [50, 50, 47, 67, 47, 84], [50, 50, 53, 67, 53, 84]];
  const CHAIR = ['<path d="M36 62 H62 M38 62 V84 M60 62 V84 M36 62 V40" class="ob"/>'];
  const WALL = ['<path d="M18 6 V84" class="ob"/>'];
  const ARC = function (d) { return '<path d="' + d + '" class="ar" marker-end="url(#ud-ah)"/>'; };
  const FIG = {
    walk: [P([50, 14], [[50, 21, 50, 50], [50, 26, 44, 38, 40, 48], [50, 26, 56, 38, 62, 45], [50, 50, 42, 66, 37, 84], [50, 50, 56, 66, 61, 84]]),
      P([52, 14], [[52, 21, 52, 50], [52, 26, 58, 38, 62, 48], [52, 26, 46, 38, 40, 45], [52, 50, 60, 66, 65, 84], [52, 50, 46, 66, 41, 84]])],
    kneehug: [P([12, 76], [[19, 78, 54, 80], [24, 78, 36, 80, 46, 81], [54, 80, 66, 63, 78, 82], [54, 80, 68, 65, 80, 82]]),
      P([12, 76], [[19, 78, 54, 80], [24, 78, 34, 68, 42, 62], [54, 80, 42, 60, 56, 62], [54, 80, 72, 81, 90, 82]], [ARC('M60 70 Q52 58 46 60')])],
    cat: [P([20, 62], [[28, 58, 46, 45, 64, 58], [28, 58, 27, 84], [64, 58, 64, 84, 84, 84]], [ARC('M46 38 l0 -4')]),
      P([20, 50], [[28, 58, 46, 66, 64, 58], [28, 58, 27, 84], [64, 58, 64, 84, 84, 84]])],
    bridge: [P([10, 77], [[17, 79, 50, 80], [22, 79, 40, 82], [50, 80, 64, 62, 76, 83]]),
      P([10, 77], [[17, 79, 50, 64], [22, 79, 40, 82], [50, 64, 66, 60, 76, 83]], [ARC('M44 82 l0 -10')])],
    birddog: [P([22, 52], [[30, 57, 62, 57], [30, 57, 30, 84], [36, 57, 36, 84], [62, 57, 62, 84, 80, 84], [58, 57, 58, 84, 76, 84]]),
      P([22, 52], [[30, 57, 62, 57], [30, 57, 30, 84], [30, 57, 6, 50], [62, 57, 62, 84, 80, 84], [62, 57, 95, 55]])],
    chintuck: [P([57, 18], [[51, 26, 50, 60], [50, 32, 56, 46, 60, 58], [50, 60, 70, 61, 70, 84]], CHAIR.concat([ARC('M66 12 l-8 0')])),
      P([49, 16], [[50, 24, 50, 60], [50, 32, 56, 46, 60, 58], [50, 60, 70, 61, 70, 84]], CHAIR)],
    neckside: [P([50, 14], STAND.slice(0, 3).concat([[50, 50, 47, 67, 47, 84], [50, 50, 53, 67, 53, 84]])),
      P([43, 17], [[50, 26, 50, 50], [50, 26, 43, 39, 41, 51], [50, 26, 40, 14, 38, 10], [50, 50, 47, 67, 47, 84], [50, 50, 53, 67, 53, 84]], [ARC('M55 9 Q48 6 44 9')])],
    scap: [P([50, 14], [[50, 21, 50, 50], [50, 27, 56, 40, 66, 38], [50, 50, 47, 67, 47, 84], [50, 50, 53, 67, 53, 84]]),
      P([50, 14], [[50, 21, 50, 50], [50, 27, 40, 38, 50, 40], [50, 50, 47, 67, 47, 84], [50, 50, 53, 67, 53, 84]], [ARC('M66 38 l-12 0')])],
    shrug: [P([50, 12], [[50, 19, 50, 50], [38, 28, 62, 28], [38, 28, 37, 52], [62, 28, 63, 52], [50, 50, 46, 67, 46, 84], [50, 50, 54, 67, 54, 84]], ['<rect x="34" y="52" width="6" height="11" rx="2" class="ob"/>', '<rect x="60" y="52" width="6" height="11" rx="2" class="ob"/>']),
      P([50, 12], [[50, 19, 50, 50], [38, 22, 62, 22], [38, 22, 37, 46], [62, 22, 63, 46], [50, 50, 46, 67, 46, 84], [50, 50, 54, 67, 54, 84]], ['<rect x="34" y="46" width="6" height="11" rx="2" class="ob"/>', '<rect x="60" y="46" width="6" height="11" rx="2" class="ob"/>', ARC('M72 30 l0 -8')])],
    chest: [P([50, 14], [[50, 21, 52, 50], [50, 27, 34, 27, 20, 24], [50, 27, 58, 40, 60, 51], [52, 50, 50, 67, 50, 84], [52, 50, 58, 67, 60, 84]], WALL),
      P([54, 15], [[54, 22, 54, 50], [54, 27, 36, 27, 20, 24], [54, 27, 62, 40, 64, 51], [54, 50, 52, 67, 52, 84], [54, 50, 60, 67, 62, 84]], WALL.concat([ARC('M64 10 Q70 16 66 22')]))],
    ankleabc: [P([42, 16], [[42, 23, 42, 60], [42, 30, 48, 44, 52, 56], [42, 60, 62, 61, 62, 84], [42, 60, 64, 58, 82, 62, 88, 58]], CHAIR.map(function (s) { return s.replace('M36 62 H62', 'M30 62 H56').replace('M38 62 V84', 'M32 62 V84').replace('M60 62 V84', 'M54 62 V84').replace('M36 62 V40', 'M30 62 V40'); }).concat(['<circle cx="88" cy="56" r="7" class="ar" stroke-dasharray="3 3"/>']))],
    onelegstand: [P([50, 14], STAND),
      P([50, 14], [[50, 21, 50, 50], [50, 26, 38, 34, 32, 38], [50, 26, 62, 34, 68, 38], [50, 50, 50, 67, 50, 84], [50, 50, 60, 60, 56, 72]])],
    calfraise: [P([50, 14], STAND, WALL),
      P([50, 8], [[50, 15, 50, 44], [50, 20, 43, 33, 41, 45], [50, 20, 57, 33, 59, 45], [50, 44, 47, 61, 47, 78, 49, 84], [50, 44, 53, 61, 53, 78, 55, 84]], WALL.concat([ARC('M66 40 l0 -8')]))],
    calfstretch: [P([34, 18], [[37, 25, 54, 50], [38, 30, 28, 34, 20, 30], [38, 30, 28, 38, 20, 36], [54, 50, 46, 66, 46, 84], [54, 50, 70, 66, 84, 84]], WALL)],
    quadset: [P([14, 46], [[18, 53, 30, 78], [20, 58, 26, 70, 30, 78], [30, 78, 56, 76, 88, 82]], ['<ellipse cx="56" cy="80" rx="6" ry="4" class="ob"/>']),
      P([14, 46], [[18, 53, 30, 78], [20, 58, 26, 70, 30, 78], [30, 78, 56, 80, 88, 80]], ['<ellipse cx="56" cy="82" rx="6" ry="2.5" class="ob"/>', ARC('M56 68 l0 8')])],
    sittostand: [P([48, 30], [[48, 37, 46, 62], [48, 42, 56, 48, 62, 46], [46, 62, 64, 62, 64, 84]], CHAIR.map(function (s) { return s.replace('M36 62 H62', 'M30 64 H56').replace('M38 62 V84', 'M32 64 V84').replace('M60 62 V84', 'M54 64 V84').replace('M36 62 V40', 'M30 64 V42'); })),
      P([60, 14], [[60, 21, 60, 50], [60, 27, 68, 34, 74, 32], [60, 50, 58, 67, 60, 84], [60, 50, 64, 67, 66, 84]], CHAIR.map(function (s) { return s.replace('M36 62 H62', 'M30 64 H56').replace('M38 62 V84', 'M32 64 V84').replace('M60 62 V84', 'M54 64 V84').replace('M36 62 V40', 'M30 64 V42'); }))],
    squat: [P([50, 14], [[50, 21, 50, 50], [50, 27, 62, 34, 72, 34], [50, 50, 47, 67, 47, 84], [50, 50, 53, 67, 53, 84]]),
      P([52, 30], [[52, 37, 44, 62], [52, 42, 64, 46, 74, 46], [44, 62, 60, 70, 52, 84]], [ARC('M30 40 l0 12')])],
    sidelegraise: [P([10, 74], [[17, 77, 52, 78], [24, 77, 22, 66], [52, 78, 70, 80, 90, 81], [52, 78, 68, 82, 88, 83]]),
      P([10, 74], [[17, 77, 52, 78], [24, 77, 22, 66], [52, 78, 68, 82, 88, 83], [52, 78, 72, 70, 90, 62]], [ARC('M80 78 l0 -10')])],
    hamstring: [P([46, 22], [[48, 29, 40, 60], [47, 34, 58, 48, 66, 56], [40, 60, 48, 72, 46, 84], [40, 60, 70, 70, 90, 82]], CHAIR.map(function (s) { return s.replace('M36 62 H62', 'M24 62 H50').replace('M38 62 V84', 'M26 62 V84').replace('M60 62 V84', 'M48 62 V84').replace('M36 62 V40', 'M24 62 V40'); }))]
  };

  function frameSvg(f) {
    const lines = f.l.map(function (pts) {
      let d = '';
      for (let i = 0; i < pts.length; i += 2) d += (i ? 'L' : 'M') + pts[i] + ' ' + pts[i + 1];
      return '<path d="' + d + '" class="bd"/>';
    }).join('');
    return '<g>' + '<path d="M2 84 H98" class="fl"/>' + f.o.join('') + lines + '<circle cx="' + f.h[0] + '" cy="' + f.h[1] + '" r="7" class="hd"/></g>';
  }
  function figSvg(key, name) {
    const fr = FIG[key] || [];
    if (!fr.length) return '';
    const w = fr.length * 100 + (fr.length - 1) * 16;
    let x = 0, out = '';
    fr.forEach(function (f, i) {
      out += '<g transform="translate(' + x + ',0)">' + frameSvg(f) + '</g>';
      x += 100;
      if (i < fr.length - 1) { out += '<path d="M' + (x + 3) + ' 46 h10" class="ar" marker-end="url(#ud-ah)"/>'; x += 16; }
    });
    return '<svg class="ud-fig" viewBox="0 0 ' + w + ' 90" role="img" aria-label="' + esc(name) + 'の図">' +
      '<defs><marker id="ud-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="ah"/></marker></defs>' + out + '</svg>';
  }

  // ===== 画面 =====
  function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function safeUrl(u) { u = String(u || '').trim(); return /^https:\/\/[^\s"'<>]+$/.test(u) ? u : ''; }

  const CSS = '' +
    '.ud{display:flex;flex-direction:column;gap:10px}' +
    '.ud-tabs{display:flex;flex-wrap:wrap;gap:6px}' +
    '.ud-tabs button{font:inherit;font-size:14px;border:1.5px solid var(--border);background:var(--surface);color:var(--fg);border-radius:999px;padding:6px 14px;min-height:40px;cursor:pointer}' +
    '.ud-tabs button[aria-pressed="true"]{background:var(--accent-strong);border-color:var(--accent-strong);color:#fff;font-weight:700}' +
    '.ud-ex{border:1px solid var(--border);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px}' +
    '.ud-ex h3{margin:0;font-size:17px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.ud-tag{font-size:11px;font-weight:700;border-radius:999px;padding:1px 9px;background:var(--surface2);color:var(--fg2)}' +
    '.ud-dose{font-size:14px;font-weight:700;color:var(--accent)}' +
    '.ud-fig{width:100%;height:auto;max-height:150px;background:var(--surface2);border-radius:8px}' +
    '.ud-fig .bd{fill:none;stroke:var(--fg);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}' +
    '.ud-fig .hd{fill:var(--surface);stroke:var(--fg);stroke-width:3}' +
    '.ud-fig .fl{stroke:var(--fg3);stroke-width:1.5}' +
    '.ud-fig .ob{fill:none;stroke:var(--fg3);stroke-width:2;stroke-linecap:round}' +
    '.ud-fig .ar{fill:none;stroke:var(--accent-strong);stroke-width:2.2;stroke-linecap:round}' +
    '.ud-fig .ah{fill:var(--accent-strong)}' +
    '.ud-ex ol{margin:0;padding-left:1.3em;font-size:14px}' +
    '.ud-care{font-size:13px;color:var(--fg2);margin:0}' +
    '.ud-why{font-size:12px;color:var(--fg3);margin:0}' +
    '.ud-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
    '.ud-row .btn{padding:11px 8px;font-size:14px}' +
    '.ud-done{background:var(--green-bg)!important;color:var(--green)!important;border:1.5px solid var(--green)!important}' +
    '.ud-week{display:flex;align-items:center;gap:10px;font-size:14px}' +
    '.ud-week b{font-size:22px;font-variant-numeric:tabular-nums}' +
    '.ud-rule{background:var(--surface2);border-radius:10px;padding:10px 12px;font-size:13px}' +
    '.ud-rule ul{margin:4px 0 0;padding-left:1.2em}' +
    '.ud-more{font:inherit;font-size:14px;background:none;border:none;color:var(--accent);font-weight:700;padding:4px 0;cursor:pointer;text-align:left}';

  function exCard(x, st) {
    const done = st.doneToday.indexOf(x.id) >= 0;
    const video = safeUrl(st.video[x.id]);
    const note = st.notes[x.id] ? '<p class="ud-care"><b>院から：</b>' + esc(st.notes[x.id]) + '</p>' : '';
    return '<div class="ud-ex">' +
      '<h3>' + esc(x.name) + '<span class="ud-tag">' + esc(KIND_LABEL[x.kind] || '') + '</span></h3>' +
      figSvg(x.fig, x.name) +
      '<span class="ud-dose">' + esc(st.dose[x.id] || x.dose) + '</span>' +
      '<ol>' + x.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
      '<p class="ud-care">⚠ ' + esc(x.care) + '</p>' + note +
      '<p class="ud-why">' + esc(x.why) + '</p>' +
      '<div class="ud-row">' +
        (video ? '<a class="btn sub" href="' + esc(video) + '" target="_blank" rel="noopener">動画を見る</a>' : '<span></span>') +
        (st.canLog ? '<button type="button" class="btn ' + (done ? 'ud-done' : '') + '" data-ud-done="' + esc(x.id) + '"' + (done ? ' disabled' : '') + '>' + (done ? '今日やった ✓' : '今日やった') + '</button>' : '<span></span>') +
      '</div></div>';
  }

  function view(el, st) {
    const hidden = function (x) { return st.hide.indexOf(x.id) >= 0; };
    const mine = st.mine.map(function (id) { return BY_ID[id]; }).filter(function (x) { return x && !hidden(x); });
    const part = st.part || (mine.length ? '' : PARTS[0]);
    const list = part ? LIB.filter(function (x) { return x.parts.indexOf(part) >= 0 && !hidden(x) && mine.indexOf(x) < 0; }) : [];
    let h = '<p class="h">自宅の運動</p>';
    if (st.canLog) h += '<div class="ud-week"><b>' + st.week + '</b><span>日　今週やった日（週2〜3日が目安）</span></div>';
    if (mine.length) {
      h += '<p class="stage" style="font-size:16px">' + esc(st.mineFrom === 'staff' ? '院からのおすすめ' : 'あなたの症状に合わせた運動') + '</p>' +
        (st.mineFrom === 'auto' ? '<p class="sub">今の症状の場所と時期から選んでいます。施術のときに、担当と一緒に決め直します。</p>' : '') +
        mine.map(function (x) { return exCard(x, st); }).join('');
    }
    h += '<div class="ud-rule"><b>運動のきほん</b><ul>' +
      '<li>筋トレは週2〜3日、ストレッチは週2〜3日以上が目安です</li>' +
      '<li>運動中の痛みが、ふだんより強くならない範囲で行います</li>' +
      '<li>翌朝に痛みが強く残ったら、回数を減らしてください</li>' +
      '<li>しびれ・力が入らない・熱っぽいなどがあれば中止して、院にご相談ください</li></ul></div>';
    if (mine.length && !st.part) {
      h += '<button type="button" class="ud-more" data-ud-open="1">＋ ほかの運動も見る</button>';
    } else {
      h += '<p class="stage" style="font-size:16px">部位から探す</p>' +
        '<div class="ud-tabs">' + PARTS.map(function (p) { return '<button type="button" data-ud-part="' + esc(p) + '" aria-pressed="' + (p === part) + '">' + esc(p) + '</button>'; }).join('') + '</div>' +
        (list.length ? list.map(function (x) { return exCard(x, st); }).join('') : '<p class="sub">この部位の運動は、院でお伝えしたものをご覧ください。</p>');
    }
    el.innerHTML = h;
  }

  /**
   * 会員証から呼ぶ。el：表示する場所。opt.ask：GASに問い合わせる関数（kaiin.html の ask）。opt.idt：LINEのIDトークン。opt.demo：見本
   */
  function mount(el, opt) {
    if (!el) return;
    if (!document.getElementById('ud-css')) { const s = document.createElement('style'); s.id = 'ud-css'; s.textContent = CSS; document.head.appendChild(s); }
    el.className = 'card ud';
    const st = { mine: [], mineFrom: '', hide: [], video: {}, dose: {}, notes: {}, doneToday: [], week: 0, canLog: false, part: '' };
    function draw() { view(el, st); }
    function apply(d) {
      if (!d || !d.ok) return;
      st.mine = d.mine || []; st.mineFrom = d.mineFrom || ''; st.hide = d.hide || []; st.video = d.video || {};
      st.dose = d.dose || {}; st.notes = d.notes || {}; st.doneToday = d.doneToday || []; st.week = d.week || 0; st.canLog = !!d.canLog;
    }
    el.addEventListener('click', async function (e) {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.udPart) { st.part = b.dataset.udPart; draw(); return; }
      if (b.dataset.udOpen) { st.part = PARTS[0]; draw(); return; }
      const id = b.dataset.udDone; if (!id) return;
      b.disabled = true; b.textContent = '記録しています…';
      if (opt.demo) { st.doneToday.push(id); st.week = Math.max(st.week, 1); draw(); return; }
      try {
        const d = await opt.ask({ action: 'undou', mode: 'done', id: id, idt: opt.idt });
        if (d && d.ok) { apply(d); draw(); } else { b.disabled = false; b.textContent = 'もう一度押す'; }
      } catch (err) { b.disabled = false; b.textContent = 'もう一度押す'; }
    });
    if (opt.demo) {
      Object.assign(st, { mine: ['L4', 'L5', 'L1'], mineFrom: 'staff', notes: { L4: 'まずは10回×2セットから' }, week: 2, canLog: true });
      draw(); return;
    }
    el.innerHTML = '<p class="h">自宅の運動</p><p class="sub">読み込んでいます…</p>';
    opt.ask({ action: 'undou', mode: 'list', idt: opt.idt })
      .then(function (d) { apply(d); draw(); })
      .catch(function () { draw(); });
  }

  window.UNDOU = { mount: mount, LIB: LIB, PARTS: PARTS, figSvg: figSvg };
})();
