function mdParse(src, opt) {
  let intmedi = src
/* <p>                       */ .replace(/^((([^ \t]*?[^#*+-\\(\d\\+\.\\)|~`]|[*+-\\(\d\\+\.\\)][^ ]|[*_]{2,})(.*?)\n)+\n?)$/gm, '<p>$1\n')
/* <br>                      */ .replace(/^([^ \t]*?[^#*+-\\(\d\\+\.\\)|~`]|[*+-\\(\d\\+\.\\)][^ ]|[*_]{2,})(.*?)\n$/gm, '$1$2<br>\n')
/* <tr><td>           start  */ //.replace(/^\| ([^\\(\-\\+\[ :\]|\\)])(.*?\n[^\\(|\[ :\]\-\\)])/gm, '<table><tr><td>$1$2')
/* </td><td>          middle */ //.replace(/([^\\(|\[ :\]\-\\+\\)]) \| (.*?\n[^\\(|\[ :\]\-\\)])/gm, '$1</td><td>$2')
/* </td></tr>         end    */ //.replace(/([^\\(| \-\\+\\)]) \|(\n[^\\(|\[ :\]\-\\)])/gm, '$1</td></tr></table>$2')
/* <thead><tr><th>    start  */ //.replace(/^\|[ :](.*?)$(|\[ :\]\-)/gm, '<th>$1$2')
/* </th></tr></thead> end    */ //.replace(/<th>(.*?)[ :]\|$/gm, '<th>$1</th>')
/* </th><th>          middle */ //.replace(/^<th>((.*?)[ :]\|)+<\/th>$/gm, '<th>$2</th>')
/* <h1></h1>                 */ .replace(/^#{1} (.*)$/gm, '<h1>$1</h1>')
/* <h2></h2>                 */ .replace(/^#{2} (.*)$/gm, '<h2>$1</h2>')
/* <h3></h3>                 */ .replace(/^#{3} (.*)$/gm, '<h3>$1</h3>')
/* <h4></h4>                 */ .replace(/^#{4} (.*)$/gm, '<h4>$1</h4>')
/* <h5></h5>                 */ .replace(/^#{5} (.*)$/gm, '<h5>$1</h5>')
/* <h6></h6>                 */ .replace(/^#{6} (.*)$/gm, '<h6>$1</h6>')
/* <ul><li>                  */ //.replace(/^([ \t]*?[^*+-].*?)\n([ \t]*?[*+-]) /gm, '$1\n<ul>\n$2<li>')
/* </ul>                     */ //.replace(/^([ \t]*?[*+-] .*?)\n\n/gm, '$1\n</ul>\n')
/* <ol><li>                  */ //.replace(/^([ \t]*?[^\\(\d\\+\.\\)].*?)\n([ \t]*?\d+\.) /gm, '$1\n<ol>\n$2<li>')
/* </ol>                     */ //.replace(/^([ \t]*?\d+\. .*?)\n\n/gm, '$1\n</ol>\n')
/* <li>                      */ //.replace(/^([ \t]*?)(\*|\+|-|\d+\.) /gm, '$1<li>')
/* <strong></strong>         */ //.replace(/(^|[^_])__([^_]?.*?[^_]?)__([^_]|$)/gm, '$1<strong>$2</strong>$3')
/*                           */ //.replace(/^__([^_]?.*?[^_]?)__([^_])/gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
  let linArr = intmedi.split('\n')
  let lstUpr = 0
  let lstCrr = 0
  let lstLwr = 0
  let txtMss = '' 
  for (var i = 0; linArr.length - 1 >= i; i++) {
    if (!linArr[i].match(/^[ \t]*(\*|\+|-|\d+\.) /) === false) {
      let wrk1 = linArr[i].slice()
      let wrk2 = linArr[i + 1].slice()
      lstCrr = wrk1.replace(/^([ \t])*.*/, '$1').length
      if (i === 0 || linArr[i - 1].indexOf('<li>') < 0 || lstCrr > lstUpr) {
        linArr[i] = wrk1.replace(/^.*?[*+-] /, '\n<ul>\n<li>')
                       .replace(/^.*?\d+\. /, '\n<ol>\n<li>')
      } else {
        if (lstCrr > wrk2.replace(/^([ \t]*)(\*|\+|-|\d+\.) /, '$1').length || !wrk2.match(/^[ \t]*(\*|\+|-|\d+\.) /) || i === linArr.length - 1) {
          linArr[i] = wrk1.replace(/^.*?[*+-] (.*?)$/, '<li>$1\n</ul>\n')
                         .replace(/^.*?\d+\. (.*?)$/, '<li>$1\n</ol>\n')
        } else {
          linArr[i] = wrk1.replace(/^.*?[*+-] (.*?)$/, '<li>$1')
                         .replace(/^.*?\d+\. (.*?)$/, '<li>$1')
        }
      }
      linArr[i] = linArr[i].replace(/[ \t]*?(\*|\+|-|\d+)/, '')
      lstUpr = lstCrr
    }
    txtMss = txtMss + linArr[i]
  }
  return txtMss
}
