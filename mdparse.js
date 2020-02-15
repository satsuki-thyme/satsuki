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
  let linArr = intmedi.split('\n')
  let linObj = {}
  let linLen = linArr.length
  let txtMss = ''
  let lstTypeArr = []
  /*
    各行を連想配列に入れ、タグ名ごとに必要な情報を追加する
  */
  for (let i = 0; linLen - 1 >= i; i++) {
    linWrk0 = linArr[i]
    linObj[i] = {}
    linObj[i]['txt'] = linWrk0
    if (!linWrk0.match(/^[ \t]*(\*|\+|-|\d+\.) /)) {
      linObj[i]['lst'] = 0
    } else {
      linObj[i]['lst'] = 1
      linObj[i]['lstLv'] = linWrk0.replace(/^([ \t]*).*/, '$1').length
      if (!linWrk0.match(/^[ \t]*(\*|\+|-) /) === false) {
        linObj[i]['lstType'] = 'm'
      } else if (!linWrk0.match(/^[ \t]*\d+\. /) === false) {
        linObj[i]['lstType'] = 'd'
      }
    }
  }
  /*
    連想配列の各行について処理をする
  */
  for (let i = 0; linLen - 1 >= i; i++) {
    /*
      ul, ol, li
    */
    if (linObj[i]['lst'] === 1) {
      linWrk1 = linObj[i]['txt']
      if ((i === 0 || linObj[i - 1]['lst'] === 0 || (linObj[i]['lstLv'] > linObj[i - 1]['lstLv'] && linObj[i]['lstLv'] <= linObj[i + 1]['lstLv'])) && i != linLen - 1) {
      // リストが始まる
        if (linObj[i]['lstType'] === 'm') {
          lstTypeArr.push('m')
          linObj[i]['txt'] = linWrk1.replace(/^[ \t]*(\*|\+|-) (.*)$/, '<ul><li>$2')
        } else if (linObj[i]['lstType'] === 'd') {
          lstTypeArr.push('d')
          linObj[i]['txt'] = linWrk1.replace(/^[ \t]*(\d+\.) (.*)$/, '<ol><li>$2')
        }
      } else if (linObj[i]['lstLv'] <= linObj[i - 1]['lstLv'] && linObj[i]['lstLv'] <= linObj[i + 1]['lstLv'] && i != linLen - 1 && i != 0) {
      // リストが続く
        linObj[i]['txt'] = linWrk1.replace(/^[ \t]*(\*|\+|-|\d+\.) (.*)$/, '<li>$2')
      } else if (i != 0 && (i === linLen - 1 || linObj[i]['lstLv'] > linObj[i + 1]['lstLv'])) {
      // 入れ子になったリストが終わる
        lstTypeArr.pop()
        if (linObj[i]['lstType'] === 'm') {
          linObj[i]['txt'] = linWrk1.replace(/^[ \t]*(\*|\+|-) (.*)$/, '<li>$2</ul>')
        } else if (linObj[i]['lstType'] === 'd') {
          linObj[i]['txt'] = linWrk1.replace(/^[ \t]*(\d+\.) (.*)$/, '<li>$2</ol>')
        }
      } else if (linObj[i + 1]['lst'] === 0) {
      // 入れ子も含めてリストが終わる（途切れる）
        let liNWrk2 = linWrk1.replace(/^[ \t]*(\*|\+|-|\d+\.) (.*)$/, '<li>$2')
        let lstTypeArrLen = 0
        for (let j in lstTypeArr) {
          lstTypeArrLen++
        }
        for (let k = 0; lstTypeArrLen - 1 >= k; k++) {
          lstTypeArrWrk = lstTypeArr.pop()
          if (lstTypeArrWrk === 'm') {
            liNWrk2 = liNWrk2.replace(/^(.*)$/, '$1</ul>')
          } else if (lstTypeArrWrk === 'd') {
            liNWrk2 = liNWrk2.replace(/^(.*)$/, '$1</ol>')
          }
        }
        linObj[i]['txt'] = liNWrk2
      } else if ((linObj[i - 1]['lst'] === 0 && linObj[i + 1]['lst'] === 0) || (linObj[i]['lstLv'] > linObj[i - 1]['lstLv'] && linObj[i]['lstLv'] > linObj[i + 1]['lstLv']) || linLen - 1 === 0) {
      // リストの始まりであり終わりである、1行だけのリスト
        if (linObj[i]['lstType'] === 'm') {
          linObj[i]['txt'] = linWrk1.replace(/^[ \t]*(\*|\+|-) (.*)$/, '<ul><li>$2</ul>')
        } else if (linObj[i]['lstType'] === 'd') {
          linObj[i]['txt'] = linWrk1.replace(/^[ \t]*(\d+\.) (.*)$/, '<ol><li>$2</ol>')
        }
      }
    }
    /*
      anything
    */
    /*
      連想配列に入っている各行をつなげる
    */
    txtMss = txtMss + linObj[i]['txt']
  }
  return txtMss
}
