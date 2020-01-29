function mdparse(src, opt) {
  let intmedi = ''
  intmedi = src
  .replace(/^(([^#*+-\\(\d\.\\)\\|=~_`\s\t].*?\n)+\n?$)/gm, '<p>$1</p>\n')
  .replace(/^\|\s/gm, '<tr><td>').replace(/\s\|\s/gm, '99999999999999999999999999999999999999999999999999999999').replace(/\s\|$/gm, '/////////////////////////////////////////////')
  .replace(/^#{1}\s(.*)$/gm, '<h1>$1</h1>')
  .replace(/^#{2}\s(.*)$/gm, '<h2>$1</h2>')
  .replace(/^#{3}\s(.*)$/gm, '<h3>$1</h3>')
  .replace(/^#{4}\s(.*)$/gm, '<h4>$1</h4>')
  .replace(/^#{5}\s(.*)$/gm, '<h5>$1</h5>')
  .replace(/^#{6}\s(.*)$/gm, '<h6>$1</h6>')
  .replace(/^([\s\t]{1,})/gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
//  .replace(//gm, '')
  return intmedi
}
