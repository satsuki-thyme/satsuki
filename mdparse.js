function mdParse(src, opt) {
  let intmedi = src
/* <p>                       */ .replace(/^((([^ \t]*?[^#*+-\\(\d\\+\.\\)|~`]|[*+-\\(\d\\+\.\\)][^ ]|[*_]{2,})(.*?)\n)+\n?)$/gm, '<p>$1\n')
/* <br>                      */ .replace(/^([^ \t]*?[^#*+-\\(\d\\+\.\\)|~`]|[*+-\\(\d\\+\.\\)][^ ]|[*_]{2,})(.*?)\n$/gm, '$1$2<br>\n')
/* <h1></h1>                 */ .replace(/^#{1} (.*)$/gm, '<h1>$1</h1>')
/* <h2></h2>                 */ .replace(/^#{2} (.*)$/gm, '<h2>$1</h2>')
/* <h3></h3>                 */ .replace(/^#{3} (.*)$/gm, '<h3>$1</h3>')
/* <h4></h4>                 */ .replace(/^#{4} (.*)$/gm, '<h4>$1</h4>')
/* <h5></h5>                 */ .replace(/^#{5} (.*)$/gm, '<h5>$1</h5>')
/* <h6></h6>                 */ .replace(/^#{6} (.*)$/gm, '<h6>$1</h6>')
/*                           */ //.replace(//gm, '')
/*                           */ //.replace(//gm, '')
/*                           */ //.replace(//gm, '')
/*                           */ //.replace(//gm, '')
/*                           */ //.replace(//gm, '')
/*                           */ //.replace(//gm, '')
  let linArr = intmedi.split('\n')
  let linObj = {}
  let linLen = linArr.length
  let txtMss = ''
  let lstTypeArr = []
  /*
    各行を連想配列に入れ、タグ名ごとに必要な情報を追加する
  */
  for (let i = 0; linLen - 1 >= i; i++) {
    linWrk = linArr[i]
    linObj[i] = {}
    linObj[i]['txt'] = linWrk
    if (!linWrk.match(/^[ \t]*(\*|\+|-|\d+\.) /)) {
      linObj[i]['lst'] = 0
    } else {
      linObj[i]['lst'] = 1
      linObj[i]['lstLv'] = linWrk.replace(/^([ \t]*).*/, '$1').length
      if (!linWrk.match(/^[ \t]*(\*|\+|-) /) === false) {
        linObj[i]['lstType'] = 'm'
      } else if (!linWrk.match(/^[ \t]*\d+\. /) === false) {
        linObj[i]['lstType'] = 'd'
      }
    }
  }
  /*
    連想配列の各行について処理をする
  */
  for (let i = 0; linLen - 1 >= i; i++) {
    /*
      カレント行がリストである場合
    */
    if (linObj[i]['lst'] === 1) {
      linWrk = linObj[i]['txt']
      if ((i === 0 || linObj[i - 1]['lst'] === 0 || (linObj[i]['lstLv'] > linObj[i - 1]['lstLv'] && linObj[i]['lstLv'] <= linObj[i + 1]['lstLv'])) && i != linLen - 1) {
      // リストが始まる
        if (linObj[i]['lstType'] === 'm') {
          lstTypeArr.push('m')
          linObj[i]['txt'] = linWrk.replace(/^[ \t]*(\*|\+|-) (.*)$/, '<ul>\n<li>$2')
        } else if (linObj[i]['lstType'] === 'd') {
          lstTypeArr.push('d')
          linObj[i]['txt'] = linWrk.replace(/^[ \t]*(\d+\.) (.*)$/, '<ol>\n<li>$2')
        }
      } else if (linObj[i]['lstLv'] <= linObj[i - 1]['lstLv'] && linObj[i]['lstLv'] <= linObj[i + 1]['lstLv'] && i != linLen - 1 && i != 0) {
      // リストが続く
        linObj[i]['txt'] = linWrk.replace(/^[ \t]*(\*|\+|-|\d+\.) (.*)$/, '<li>$2')
      } else if (i != 0 && (i === linLen - 1 || linObj[i]['lstLv'] > linObj[i + 1]['lstLv'])) {
      // 入れ子になったリストが終わる
        lstTypeArr.pop()
        if (linObj[i]['lstType'] === 'm') {
          linObj[i]['txt'] = linWrk.replace(/^[ \t]*(\*|\+|-) (.*)$/, '<li>$2\n</ul>')
        } else if (linObj[i]['lstType'] === 'd') {
          linObj[i]['txt'] = linWrk.replace(/^[ \t]*(\d+\.) (.*)$/, '<li>$2\n</ol>')
        }
      } else if (linObj[i + 1]['lst'] === 0) {
      // 入れ子も含めてリストが終わる（途切れる）
        let linWrk1 = linWrk.replace(/^[ \t]*(\*|\+|-|\d+\.) (.*)$/, '<li>$2')
        let lstTypeArrLen = 0
        for (let j in lstTypeArr) {
          lstTypeArrLen++
        }
        for (let k = 0; lstTypeArrLen - 1 >= k; k++) {
          lstTypeArrWrk = lstTypeArr.pop()
          if (lstTypeArrWrk === 'm') {
            linWrk1 = linWrk1.replace(/^(.*)$/, '$1\n</ul>')
          } else if (lstTypeArrWrk === 'd') {
            linWrk1 = linWrk1.replace(/^(.*)$/, '$1\n</ol>')
          }
        }
        linObj[i]['txt'] = linWrk1
      } else if ((linObj[i - 1]['lst'] === 0 && linObj[i + 1]['lst'] === 0) || (linObj[i]['lstLv'] > linObj[i - 1]['lstLv'] && linObj[i]['lstLv'] > linObj[i + 1]['lstLv']) || linLen - 1 === 0) {
      // リストの始まりであり終わりである、1行だけのリスト
        if (linObj[i]['lstType'] === 'm') {
          linObj[i]['txt'] = linWrk.replace(/^[ \t]*(\*|\+|-) (.*)$/, '<ul>\n<li>$2\n</ul>')
        } else if (linObj[i]['lstType'] === 'd') {
          linObj[i]['txt'] = linWrk.replace(/^[ \t]*(\d+\.) (.*)$/, '<ol>\n<li>$2\n</ol>')
        }
      }
    }
    /*
      リストじゃない他の処理
    */
    /*
      連想配列に入っている各行をつなげる
    */
    txtMss = txtMss + linObj[i]['txt']
  }
  return txtMss
}
