function mdparse(src, opt) {
  let intmedi = ''
  intmedi = src
  .replace(/^(([^#*+-\\(\d\.\\)\\|=~_` \t].*?\n)+\n?$)/gm, '<p>$1</p>\n')
  .replace(/^\| ([^\\(-\\+ |\\)])/gm, '<table><tr><td>$1').replace(/([^\\(| -\\+\\)]) \| /gm, '$1</td><td>').replace(/([^\\(| -\\+\\)]) \|$/gm, '$1</td></tr></table>').replace(/^(\|[ :]-+[ :])+\|/gm, '</thead><tbody>')
  .replace(/^#{1} (.*)$/gm, '<h1>$1</h1>')
  .replace(/^#{2} (.*)$/gm, '<h2>$1</h2>')
  .replace(/^#{3} (.*)$/gm, '<h3>$1</h3>')
  .replace(/^#{4} (.*)$/gm, '<h4>$1</h4>')
  .replace(/^#{5} (.*)$/gm, '<h5>$1</h5>')
  .replace(/^#{6} (.*)$/gm, '<h6>$1</h6>')
  .replace(/^([ \t]*?)(\*|\+|-|\d+\.) (.*)$/gm, '$1<li>$3</li>')
  .replace(/(^|[^_])__([^_].*?[^_]?)__([^_]|$)/gm, '$1<strong>$2</strong>$3')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
  return intmedi
}
