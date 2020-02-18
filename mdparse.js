function mdParse(src, opt) {
  let intmedi = src.replace(/^(?!\t|#+ |\* |\+ |- |\d+ |\| )([\s\S]*?\n{2})/gm, '<p>$1')
                   .replace(/ {2}$/gm, '<br>')
                   .replace(/^#{1} (.*)$/gm, '<h1>$1</h1>')
                   .replace(/^#{2} (.*)$/gm, '<h2>$1</h2>')
                   .replace(/^#{3} (.*)$/gm, '<h3>$1</h3>')
                   .replace(/^#{4} (.*)$/gm, '<h4>$1</h4>')
                   .replace(/^#{5} (.*)$/gm, '<h5>$1</h5>')
                   .replace(/^#{6} (.*)$/gm, '<h6>$1</h6>')
                   .replace(/[\*_]{3}([^ \*_][\s\S]*?)[\*_]{3}/gm, '<strong><em>$1</em></strong>')
                   .replace(/[\*_]{2}([^ \*_][\s\S]*?)[\*_]{2}/gm, '<strong>$1</strong>')
                   .replace(/[\*_]{1}([^ \*_][\s\S]*?)[\*_]{1}/gm, '<em>$1</em>')
                   .replace(/[~]{2}([\s\S]*?)[~]{2}/gm, '<s>$1</s>')
                   .replace(/[']{1}([\s\S]*?)[']{1}/gm, '<code>$1</code>')
                   .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2">$1</a>')
                   .replace(/!\[(.*?)\]\((.*?) ?"(.*?)"\)/gm, '<img src="$2" alt="$1" name="$3">')
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
      lineObj[i]['listLv'] = lineWork0.replace(/^([ \t]*).*/, '$1').length
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
    /*
      ul, ol, li
    */
    if (lineObj[i]['list'] === 1) {
      lineWork1 = lineObj[i]['txt']
      if (i === 0 || lineObj[i - 1]['list'] === 0 || (lineObj[i]['listLv'] > lineObj[i - 1]['listLv'] && lineObj[i]['listLv'] <= lineObj[i + 1]['listLv'] && i != lineLen - 1)) {
      // リストが始まる
        if (lineObj[i]['listType'] === 'm') {
          listTypeArr.push('m')
          lineObj[i]['txt'] = lineWork1.replace(/^[ \t]*(\*|\+|-) (.*)$/, '<ul><li>$2')
        } else if (lineObj[i]['listType'] === 'd') {
          listTypeArr.push('d')
          lineObj[i]['txt'] = lineWork1.replace(/^[ \t]*(\d+\.) (.*)$/, '<ol><li>$2')
        }
      } else if (lineObj[i]['listLv'] <= lineObj[i - 1]['listLv'] && lineObj[i]['listLv'] <= lineObj[i + 1]['listLv'] && i != lineLen - 1 && i != 0) {
      // リストが続く
        lineObj[i]['txt'] = lineWork1.replace(/^[ \t]*(\*|\+|-|\d+\.) (.*)$/, '<li>$2')
      } else if ((i != 0 && lineObj[i]['listLv'] > lineObj[i + 1]['listLv'] && lineObj[i]['listLv'] <= lineObj[i - 1]['listLv']) || lineObj[i + 1]['list'] === 0) {
      // 一つ～複数のリストが終わる
        let lineWork2 = lineWork1.replace(/^[ \t]*(\*|\+|-|\d+\.) (.*)$/, '<li>$2')
        let listLvDiff = 0
        if (!lineObj[i + 1]['list'] === false && lineObj[i + 1]['list'] != 0) {
          listLvDiff = lineObj[i]['listLv'] - lineObj[i + 1]['listLv']
        } else {
          listLvDiff = lineObj[i]['listLv'] + 1
        }
        for (let j = 0; listLvDiff - 1 >= j; j++) {
          listTypeArrWork = listTypeArr.pop()
          if (listTypeArrWork === 'm') {
            lineWork2 = lineWork2.replace(/^(.*)$/, '$1</ul>')
          } else if (listTypeArrWork === 'd') {
            lineWork2 = lineWork2.replace(/^(.*)$/, '$1</ol>')
          }
        }
        lineObj[i]['txt'] = lineWork2
      } else if (
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
            lineObj[i + 1]['list'] === '0'
          )
        )
        ||
        lineLen === 1
      ) {
      // リストの始まりであり終わりである、1行だけのリスト
        if (lineObj[i]['listType'] === 'm') {
          lineObj[i]['txt'] = lineWork1.replace(/^[ \t]*(\*|\+|-) (.*)$/, '<ul><li>$2</ul>===============')
        } else if (lineObj[i]['listType'] === 'd') {
          lineObj[i]['txt'] = lineWork1.replace(/^[ \t]*(\d+\.) (.*)$/, '<ol><li>$2</ol>')
        }
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
}
