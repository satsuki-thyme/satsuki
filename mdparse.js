function mdParse(src, opt) {
  let intmedi = src.replace(/^(?!#+ |[ \t]*\* |[ \t]*\+ |[ \t]*- |[ \t]*\d+\. |\|)([\s\S]*?\n{2})/gm, '<p>$1')
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
                   //.replace(/(?!^[ \t]*\*)\*{1}([^*]+?)\*{1}/gm, '<em>$1</em>')
                   //.replace(/^\*{1}([^ *][^*]*?)\*{1}/gm, '<em>$1</em>')
                   //.replace(/_{1}([^_]+?)_{1}/gm, '<em>$1</em>')
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
                   //.replace(//gm, '')
  let lineArr = intmedi.split('\n')
  let lineObj = {}
  let lineLen = lineArr.length
  let txtMss = ''
  let listTypeArr = []
  /*
    各行を連想配列に入れ、タグ名ごとに必要な情報を追加する
  */
  for (let i = 0; lineLen - 1 >= i; i++) {
    lineWork0 = lineArr[i]
    lineObj[i] = {}
    lineObj[i]['txt'] = lineWork0
    if (!lineWork0.match(/^[ \t]*(\*|\+|-|\d+\.) /)) {
      lineObj[i]['list'] = 0
    } else {
      lineObj[i]['list'] = 1
      lineObj[i]['listLv'] = lineWork0.replace(/^([ \t]*).*$/, '$1').length + 1
      if (!lineWork0.match(/^[ \t]*(\*|\+|-) /) === false) {
        lineObj[i]['listType'] = 'm'
      } else if (!lineWork0.match(/^[ \t]*\d+\. /) === false) {
        lineObj[i]['listType'] = 'd'
      }
    }
  }
  /*
    連想配列の各行について処理をする
  */
  for (let i = 0; lineLen - 1 >= i; i++) {
let aaa = 0
let bbb = 0
if (i === 0) {
  aaa ='-'
} else if (i === lineLen - 1) {
  bbb = '-'
} else {
  aaa = lineObj[i - 1]['list']
  bbb = lineObj[i + 1]['list']
}
console.log(i + ' ' + aaa + ' ' + lineObj[i]['list'] + ' ' + bbb + ' ' + lineObj[i]['txt'].substring(0, 10))
    /*
      ul, ol, li
    */
    if (lineObj[i]['list'] === 1) {
      lineWork1 = lineObj[i]['txt']
      if (
      /*
        リストが始まる
      */
        (
          lineObj[i - 1]['list'] === 0
          &&
          lineObj[i + 1]['list'] === 1
        )
        ||
        (
          lineObj[i]['listLv'] > lineObj[i - 1]['listLv']
          &&
          lineObj[i + 1]['list'] === 1
        )
      ) {
        lineObj[i]['txt'] = listStrt(i, lineWork1) // <= 処理部分
      } else if (
      /*
        リストが続く
      */
        lineObj[i]['listLv'] <= lineObj[i - 1]['listLv']
        &&
        lineObj[i]['listLv'] <= lineObj[i + 1]['listLv']
        &&
        i != 0
        &&
        i != lineLen - 1
      ) {
        lineObj[i]['txt'] = listCont(i, lineWork1) // <= 処理部分
      } else if (
      /*
        リストが終わる
      */
        lineObj[i]['listLv'] <= lineObj[i - 1]['listLv']
        &&
        (
          lineObj[i]['listLv'] > lineObj[i + 1]['listLv']
          ||
          lineObj[i + 1]['list'] === 0
        )
      ) {
        lineObj[i]['txt'] = listEnd(i, lineWork1) // <= 処理部分
      } else if (
      /*
        始まりかつ終わりの行
      */
        (
          lineObj[i - 1]['list'] === 0
          &&
          lineObj[i + 1]['list'] === 0
        )
        ||
        (
          lineObj[i]['listLv'] > lineObj[i - 1]['listLv']
          &&
          (
            lineObj[i]['listLv'] > lineObj[i + 1]['listLv']
            ||
            lineObj[i + 1]['list'] === 0
          )
        )
        ||
        lineLen === 1
      ) {
        lineObj[i]['txt'] = listEnd(i, listStrt(i, lineWork1)) // <= 処理部分
      }
    }
    /*
      anything
    */
    /*
      連想配列に入っている各行をつなげる
    */
    txtMss = txtMss + lineObj[i]['txt']
  }
  return txtMss
  /*

    関数

  */
  function listStrt(i, txt) {
    if (lineObj[i]['listType'] === 'm') {
      listTypeArr.push('m')
      return txt.replace(/^[ \t]*(\*|\+|-) (.*)$/, '<ul><li>$2')
    } else if (lineObj[i]['listType'] === 'd') {
      listTypeArr.push('d')
      return txt.replace(/^[ \t]*(\d+\.) (.*)$/, '<ol><li>$2')
    }
  }
  function listCont(i, txt) {
    return txt.replace(/^[ \t]*(\*|\+|-|\d+\.) (.*)$/, '<li>$2')
  }
  function listEnd(i, txt) {
    let lineWork2 = txt.replace(/^[ \t]*(\*|\+|-|\d+\.) (.*)$/, '<li>$2')
    let listLvDiff = 0
    if (lineObj[i + 1]['list'] === 1) {
      listLvDiff = lineObj[i]['listLv'] - lineObj[i + 1]['listLv']
    } else {
      listLvDiff = lineObj[i]['listLv'] + 1
    }
    for (let j = 0; listLvDiff - 1 >= j; j++) {
      listTypeArrWork = listTypeArr.pop()
      if (listTypeArrWork === 'm') {
        lineWork2 = lineWork2 + '<\/ul>'
      } else if (listTypeArrWork === 'd') {
        lineWork2 = lineWork2 + '<\/ol>'
      }
    }
    return lineWork2
  }
}
