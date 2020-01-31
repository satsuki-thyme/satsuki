function mdparse(src, opt) {
  let intmedi = ''
  intmedi = src
/* <p></p>                   */ .replace(/^((([^#*+-\\(\d\.\\)|~` \t\n]|[*+-\\(\d\.\\)][^ ]|\*{2,})(.*?)\n)+\n?$)/gm, '<p>$1</p>\n')
/* <br>                      */ .replace(/^([^#*+-\\(\d\.\\)|~` \t\n]|[*+-\\(\d\.\\)][^ ]|\*{2,})(.*?)\n/gm, '$1$2<br>\n')
/* <tr><td>           start  */ .replace(/^\| ([^\\(\-\\+\[ :\]|\\)])(.*?\n[^\\(|\[ :\]\-\\)])/gm, '<table><tr><td>$1$2')
/* </td><td>          middle */ .replace(/([^\\(|\[ :\]\-\\+\\)]) \| (.*?\n[^\\(|\[ :\]\-\\)])/gm, '$1</td><td>$2')
/* </td></tr>         end    */ .replace(/([^\\(| \-\\+\\)]) \|(\n[^\\(|\[ :\]\-\\)])/gm, '$1</td></tr></table>$2')
/* <thead><tr><th>    start  */ .replace(/^\| ([^\\(-\\+ |\\)])(.*?\n[\\(|\[ :\]\-\\)])/gm, '<table><thead><tr><th>$1$2')
/* </th></tr></thead> end    */ .replace(/([^\\(| \-\\+\\)]) \|(\n[\\(|\[ :\]\-\\)])/gm, '$1</th></tr></thead>$2')
/* </th><th>          middle */ .replace(/<th>(.*?)\|/gm, '<th>$1</th><th>')
/* <h1></h1>                 */ .replace(/^#{1} (.*)$/gm, '<h1>$1</h1>')
/* <h2></h2>                 */ .replace(/^#{2} (.*)$/gm, '<h2>$1</h2>')
/* <h3></h3>                 */ .replace(/^#{3} (.*)$/gm, '<h3>$1</h3>')
/* <h4></h4>                 */ .replace(/^#{4} (.*)$/gm, '<h4>$1</h4>')
/* <h5></h5>                 */ .replace(/^#{5} (.*)$/gm, '<h5>$1</h5>')
/* <h6></h6>                 */ .replace(/^#{6} (.*)$/gm, '<h6>$1</h6>')
/* <li></li>                 */ .replace(/^([ \t]*?)(\*|\+|-|\d+\.) (.*)$/gm, '$1<li>$3</li>')
//  .replace(/(^|[^_])__([^_]?.*?[^_]?)__([^_]|$)/gm, '$1<strong>$2</strong>$3')
//  .replace(/^__([^_]?.*?[^_]?)__([^_])/gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
  return intmedi
}
