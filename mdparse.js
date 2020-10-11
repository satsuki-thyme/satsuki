function mdParse(src, opt) {
  let intmedi = src.replace(/(\r?\n|\r)/g, '\n')
                   .replace(/^(?!#+ |[ \t]*\* |[ \t]*\+ |[ \t]*- |[ \t]*\d+\. |\|)([\s\S]*?\n{2})/gm, '<p>$1')
                   .replace(/ {2}$/gm, '<br>')
                   .replace(/^#{1} (.*)$/gm, '<h1>$1</h1>')
                   .replace(/^#{2} (.*)$/gm, '<h2>$1</h2>')
                   .replace(/^#{3} (.*)$/gm, '<h3>$1</h3>')
                   .replace(/^#{4} (.*)$/gm, '<h4>$1</h4>')
                   .replace(/^#{5} (.*)$/gm, '<h5>$1</h5>')
                   .replace(/^#{6} (.*)$/gm, '<h6>$1</h6>')
                   .replace(/\*{3}([^*]+?)\*{3}/gm, '<strong><em>$1</em></strong>')
                   .replace(/_{3}([^_]+?)_{3}/gm, '<strong><em>$1</em></strong>')
                   .replace(/\*{2}([^*]+?)\*{2}/gm, '<strong>$1</strong>')
                   .replace(/_{2}([^_]+?)_{2}/gm, '<strong>$1</strong>')
                   .replace(/\*{1}([^ *][^*]*?)\*{1}/gm, '<em>$1</em>')
                   .replace(/_{1}([^_]+?)_{1}/gm, '<em>$1</em>')
                   .replace(/~{2}([\s\S]*?)~{2}/gm, '<s>$1</s>')
                   .replace(/`{1}([\s\S]*?)`{1}/gm, '<code>$1</code>')
                   .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2">$1</a>')
                   .replace(/!\[(.*?)\]\((.*?)( "(.*?)")?\)/gm, '<img src="$2" alt="$1" name="$4">')
                   //.replace(//gm, '')
                   //.replace(//gm, '')
                   //.replace(//gm, '')
                   //.replace(//gm, '')
                   //.replace(//gm, '')
                   //.replace(//gm, '')
                   //.replace(//gm, '')
                   //.replace(//gm, '')
  let lineArr = intmedi.split('\n')
  let lineObj = {}
  let lineLen = lineArr.length
  let txtMass = ''
  let listTypeArr = []
  /*

    各行を連想配列に入れ、タグ名ごとに必要な情報を追加する

  */
  for (let i = 0; lineLen - 1 >= i; i++) {
    /*
      リスト
    */
    let lineWork0 = lineArr[i]
    lineObj[i] = {}
    lineObj[i]['txt'] = lineWork0
    if (!lineWork0.match(/^[ \t]*(\*|\+|-|\d+\.) /)) {
      lineObj[i]['list'] = 0
      lineObj[i]['listLv'] = 0
    } else {
      lineObj[i]['list'] = 1
      lineObj[i]['listLv'] = lineWork0.replace(/^([ \t]*).*/, '$1').length + 1
      if (!lineWork0.match(/^[ \t]*(\*|\+|-) /) === false) {
        lineObj[i]['listType'] = 'm'
      } else if (!lineWork0.match(/^[ \t]*\d+\. /) === false) {
        lineObj[i]['listType'] = 'd'
      }
    }
    /*
      テーブル
    */
    lineObj[i]['vBar'] === lineWork0.replace(/[^|]/g, '').length
  }
  /*

    連想配列の各行について処理をする

  */
  for (let i = 0; lineLen - 1 >= i; i++) {
    /*
      リスト
    */
    let listCrr = lineObj[i]['list']
    let listLvCrr = lineObj[i]['listLv']
    let listPre = -1
    let listLvPre = -1
    let listPst = -1
    let listLvPst = -1
    if (i !== 0) {
      listPre = lineObj[i - 1]['list']
      listLvPre = lineObj[i - 1]['listLv']
    }
    if (i !== lineLen - 1) {
      listPst = lineObj[i + 1]['list']
      listLvPst = lineObj[i + 1]['listLv']
    }
    if (listCrr === 1) {
      lineWork1 = lineObj[i]['txt']
      if (
      /* リストが始まる */
        (
          i === 0
          &&
          listCrr === 1
          &&
          i !== lineLen - 1
        )
        ||
        (
          i !== 1
          &&
          i !== lineLen - 1
          &&
          listPre === 0
          &&
          listCrr === 1
          &&
          listPst === 1
        )
        ||
        (
          i !== 0
          &&
          i !== lineLen - 1
          &&
          listLvCrr > listLvPre
          &&
          listLvCrr <= listLvPst
        )
      ) {
        lineObj[i]['txt'] = listStart(lineWork1, i) // <= 処理部分
      } else if (
      /* リストが続く */
        i !== 0
        &&
        i !== lineLen - 1
        &&
        listLvCrr <= listLvPre
        &&
        listLvCrr <= listLvPst
      ) {
        lineObj[i]['txt'] = listContinue(lineWork1) // <= 処理部分
      } else if (
      /* リストが終わる */
        (
          i !== 0
          &&
          listCrr === 1
          &&
          i === lineLen - 1
        )
        ||
        (
          listPre === 1
          &&
          listCrr === 1
          &&
          listPst === 0
        )
        ||
        (
          i !== 0
          &&
          i !== lineLen - 1
          &&
          listLvCrr <= listLvPre
          &&
          listLvCrr > listLvPst
        )
      ) {
        lineObj[i]['txt'] = listEnd(lineWork1, listPst, listLvCrr, listLvPst) // <= 処理部分
      } else if (
      /* 始まりかつ終わりの行 */
        (
          i !== 0
          &&
          i !== lineLen - 1
          &&
          listPre === 0
          &&
          (
            listPst === 0
            ||
            listLvCrr > listLvPre
          )
        )
        ||
        (
          i !== 0
          &&
          i !== lineLen - 1
          &&
          listLvCrr > listLvPre
          &&
          (
            listLvCrr > listLvPst
            ||
            listPst === 0
          )
        )
      ) {
        lineObj[i]['txt'] = listEnd(listStart(lineWork1, i), listPst, listLvCrr, listLvPst) // <= 処理部分
      }
    }
    /*
      テーブル
    */
    {
      let vBar = lineObj[i]['vBar']
      if (
          (
            i === 0
            ||
            lineObj[i - 1]['vBar'] === 0
          )
        &&
        i !== lineLen + 1
        &&
        lineObj[i]['vBar'] >= 1
        &&
        lineObj[i + 1]['vBar'] >= 1
      ) {
        lineObj[i]['txt'] = tableStart()
      }
    }
    /*
      連想配列に入っている各行をつなげる
    */
    txtMass = txtMass + lineObj[i]['txt']
  }
  return txtMass
  /*

    関数

  */
  function listStart(txt, i) {
    if (lineObj[i]['listType'] === 'm') {
      listTypeArr.push('m')
      return txt.replace(/^[ \t]*(\*|\+|-) (.*)$/, '<ul><li>$2')
    } else if (lineObj[i]['listType'] === 'd') {
      listTypeArr.push('d')
      return txt.replace(/^[ \t]*(\d+\.) (.*)$/, '<ol><li>$2')
    }
  }
  function listContinue(txt) {
    return txt.replace(/^[ \t]*(\*|\+|-|\d+\.) (.*)$/, '<li>$2')
  }
  function listEnd(txt, listPst, listLvCrr, listLvPst) {
    let lineWork2 = txt.replace(/^[ \t]*(\*|\+|-|\d+\.) (.*)$/, '<li>$2')
    let listLvDiff = 0
    if (listPst === 1) {
      listLvDiff = listLvCrr - listLvPst
    } else {
      listLvDiff = listLvCrr
    }
    for (let j = 0; listLvDiff > j; j++) {
      listTypeArrWork = listTypeArr.pop()
      if (listTypeArrWork === 'm') {
        lineWork2 = lineWork2 + '<\/ul>'
      } else if (listTypeArrWork === 'd') {
        lineWork2 = lineWork2 + '<\/ol>'
      }
    }
    return lineWork2
  }
  function tableStart(i, txt) {
    
  }
}
