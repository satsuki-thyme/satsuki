function mdparse(src, opt) {
  let intmedi = ''
  intmedi = src.replace(/^([^#*+-\\(\d\.\\)\\|=~_`\s\t]+)$/gm, '<p>$1</p>').replace(/^#{1}\s(.*)$/gm, '<h1>$1</h1>').replace(/^#{2}\s(.*)$/gm, '<h2>$1</h2>').replace(/^#{3}\s(.*)$/gm, '<h3>$1</h3>').replace(/^#{4}\s(.*)$/gm, '<h4>$1</h4>').replace(/^#{5}\s(.*)$/gm, '<h5>$1</h5>').replace(/^#{6}\s(.*)$/gm, '<h6>$1</h6>')
  return intmedi
}
