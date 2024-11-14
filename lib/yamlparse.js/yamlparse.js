function yamlparse(rawYaml) {
  let splYaml = rawYaml.split(/\r?\n/)
  let procYaml = []
  let meaning = []
  let EOA = splYaml.length - 1
  for (let i in splYaml) {
    if (/^[ \t]*(?<!\\(\\\\)*)#.*$/.test(splYaml[i])) {
      meaning[i] = `comment`
    }
    else if (/^((?!.*\\(\\\\)*:).*?)(?<!\\(\\\\)*)(?=:)/.test(splYaml[i])) {
      meaning[i] = `key`
    }
    else if (/^[ \t]*(?!.*(\\\\)*#).+$/.test(splYaml[i])) {
      meaning[i] = `value`
    }
    else if (/^[ \t]*$/.test(splYaml[i])) {
      meaning[i] = `blank`
    }
    else {
      meaning[i] = `other`
    }
  }
  let modeSet = new Set()
  let indentVal = []
  for (let i in splYaml) {
    let w = (splYaml[i].match(/^[ \t]*/) || [])[0].length
    splYaml[i] = splYaml[i].replace(/^[ \t]*/, ``)
    if (meaning[i] === `key`) {
      modeSet.add(w)
    }
    indentVal.push(w)
  }
  let mode = Array.from(new Set(Array.from(modeSet).reduce((a, b) => [b, a[1].concat([b - a[0]])], [0, [0]])[1]))
  .filter(rly => rly !== 0)[0]
  let indentNum = []
  for (let i in indentVal) {
    indentNum[i] = Math.round(indentVal[i] / mode) + 1
  }
  let prevIndentNum = 0
  let keyAcc = []
  let classAcc = []
  let keyAgg = new Map()
  let i = 0
  return new Promise(resolve => {
    fn()
    function fn() {
      /*
      ##   ##    #######    ##    ## 
      ##  ##     ##          ##  ##  
      #####      #####        ####   
      ##  ##     ##            ##    
      ##   ##    #######       ##    
      */
      if (meaning[i] === `key`) {
        let diff = indentNum[i] - prevIndentNum
        prevIndentNum = indentNum[i]
        let keyContent = (splYaml[i].match(/^((?!\\(\\\\)*:).*)(?<!\\(\\\\)*)(?=:)/) || [``])[0]
        if (Number(keyContent.replace(/^ *| *$/, ``))) {
          keyContent = keyContent.replace(/^( *)(\d+)( *)$/, `$1<span class="number">$2</span>$3`)
        }
        let key = `${
          keyContent
          .replace(/^(- )?(.*)/, `$1<span class="key">$2</span>`)
          .replace(/^- /g, `<span class="bullet">-</span> `)
        }<span class="colon">:</span> `
        let clss = `key-group ${
          (
            splYaml[i]
            .match(/^((?!\\(\\\\)*:).*)(?<!\\(\\\\)*)(?=:)/) || [``]
          )[0]
          .replace(/^- /, ``)
          .replace(/ /g, `-`)
          .replace(/^([0-9])/, `n$1`)
        }`
        let keySrc = (splYaml[i].match(/^((?!\\(\\\\)*:).*)(?<!\\(\\\\)*)(?=:)/) || [``])[0].replace(/^- /, ``)
        keyAgg.set(keySrc, clss)
        let valueContent = (splYaml[i].match(/(?<=:)(.*)$/) || [``])[0]
        if (Number(valueContent.replace(/^ *| *$/, ``))) {
          valueContent = valueContent.replace(/^( *)(\d+)( *)$/, `$1<span class="number">$2</span>$3`)
        }
        if (/^ *\| *$/.test(valueContent)) {
          valueContent = ` <span class="vertical-bar">|</span>`
        }
        let value = `${
          valueContent
          .replace(/(.+)/, `<span class="value">$1</span>`)
        }`
        if (i > 0 && i < EOA) {
          if (diff > 0) {
            procYaml[i] = `<div class="${clss}">${key}${value}`
            keyAcc.push(keySrc)
            classAcc.push(clss)
          }
          if (diff === 0) {
            let frontEnd = `</div>`
//            if (meaning[i - 1] === `blank` || meaning[i - 1] === `comment`) {
//              frontEnd = ``
//            }
            procYaml[i] = `${frontEnd}<div class="${clss}">${key}${value}`
            keyAcc.splice(-1)
            classAcc.splice(-1)
            keyAcc.push(keySrc)
            classAcc.push(clss)
          }
          if (diff < 0) {
            let frontEnd = `</div>`.repeat(-diff + 1)
//            if (meaning[i - 1] === `blank` || meaning[i - 1] === `comment`) {
//              frontEnd = ``
//            }
            procYaml[i] = `${frontEnd}<div class="${clss}">${key}${value}`
            keyAcc.splice(diff)
            classAcc.splice(diff)
            keyAcc.push(keySrc)
            classAcc.push(clss)
          }
        }
        if (i === 0 && i < EOA) {
          procYaml[i] = `<div class="${clss}">${key}${value}`
          keyAcc.push(keySrc)
          classAcc.push(clss)
        }
        if (i > 0 && i === EOA) {
          procYaml[i] = `${`</div>`.repeat(-diff + 1)}<div class="${clss}">${key}${value}${`</div>`.repeat(indentNum[i] - 1)}`
          keyAcc.splice(diff)
          classAcc.splice(diff)
          keyAcc.push(keySrc)
          classAcc.push(clss)
        }
        if (EOA === 0) {
          procYaml[i] = `<div class="${clss}">${key}${value}${`</div>`.repeat(indentNum[i] - 1)}`
          keyAcc.push(keySrc).splice(-indentNum[i] + 1)
          classAcc.push(clss).splice(-indentNum[i] + 1)
        }
      }
      /*
      ##    ##     #####     ##         ##    ##    ####### 
      ##    ##    ##   ##    ##         ##    ##    ##      
      ##    ##    #######    ##         ##    ##    #####   
       ##  ##     ##   ##    ##         ##    ##    ##      
        ####      ##   ##    #######     ######     ####### 
      */
      if (meaning[i] === `value`) {
        let diff = indentNum[i] - prevIndentNum
        prevIndentNum = indentNum[i]
        let valueContent = splYaml[i]
        if (Number(valueContent.replace(/^ | $/, ``))) {
          valueContent = `<span class="number">${valueContent}</span>`
        }
        if (/^ *\| *$/.test(valueContent)) {
          valueContent = `<span class="vertical-bar">|</span>`
        }
        let value = `${
          valueContent
          .replace(/^(- )?(.*)$/, `$1<span class="value">$2</span>`)
          .replace(/^- /, `<span class="bullet">-</span> `)
        }`
        if (i > 0 && i < EOA) {
          if (diff > 0) {
            procYaml[i] = `<div class="value-group">${value}`
          }
          if (diff === 0) {
            procYaml[i] = `<br>${value}`
          }
          if (diff < 0) {
            procYaml[i] = `${`</div>`.repeat(-diff)}${value}`
          }
        }
        if (i === 0 && i < EOA) {
          if (meaning[i + 1] === `value`) {
            procYaml[i] = `<div>${value}`
          }
          if (meaning[i + 1] !== `value`) {
            procYaml[i] = `<div>${value}</div>`
          }
        }
        if (i > 0 && i === EOA) {
          if (meaning[i - 1] === `value`) {
            procYaml[i] = `<br>${value}${`</div>`.repeat(indentNum[i] - 1)}`
          }
          if (meaning[i - 1] !== `value`) {
            procYaml[i] = `<div>${value}${`</div>`.repeat(indentNum[i] - 1)}`
          }
        }
        if (EOA === 0) {
          procYaml[i] = `<div>${value}${`</div>`.repeat(indentNum[i] - 1)}`
        }
      }
      /*
       ######     ######     ###    ###    ###    ###    #######    ###    ##    ######## 
      ##         ##    ##    ####  ####    ####  ####    ##         ####   ##       ##    
      ##         ##    ##    ## #### ##    ## #### ##    #####      ## ##  ##       ##    
      ##         ##    ##    ##  ##  ##    ##  ##  ##    ##         ##  ## ##       ##    
       ######     ######     ##      ##    ##      ##    #######    ##   ####       ##    
      */
      if (meaning[i] === `comment`) {
        if (i > 0 && i < EOA) {
          if (meaning[i - 1] === `comment` && meaning[i + 1] === `comment`) {
            procYaml[i] = ``
          }
          if (meaning[i - 1] !== `comment` && meaning[i + 1] === `comment`) {
            procYaml[i] = ``
          }
          if (meaning[i - 1] === `comment` && meaning[i + 1] !== `comment`) {
            procYaml[i] = ``
          }
          if (meaning[i - 1] !== `comment` && meaning[i + 1] !== `comment`) {
            procYaml[i] = ``
          }
        }
        if (i === 0 && i < EOA) {
          if (meaning[i + 1] === `comment`) {
            procYaml[i] = ``
          }
          if (meaning[i + 1] !== `comment`) {
            procYaml[i] = ``
          }
        }
        if (i > 0 && i === EOA) {
          if (meaning[i - 1] === `comment`) {
            procYaml[i] = ``
          }
          if (meaning[i - 1] !== `comment`) {
            procYaml[i] = ``
          }
        }
        if (EOA === 0) {
          procYaml[i] = ``
        }
      }
      /*
      ######     ##          #####     ###    ##    ##   ## 
      ##   ##    ##         ##   ##    ####   ##    ##  ##  
      ######     ##         #######    ## ##  ##    #####   
      ##   ##    ##         ##   ##    ##  ## ##    ##  ##  
      ######     #######    ##   ##    ##   ####    ##   ## 
      */
      if (meaning[i] === `blank`) {
        if (i > 0 && i < EOA) {
          if (meaning[i - 1] === `blank` && meaning[i + 1] === `blank`) {
            procYaml[i] = `<br>`
          }
          if (meaning[i - 1] !== `blank` && meaning[i + 1] === `blank`) {
            procYaml[i] = `<br>`
          }
          if (meaning[i - 1] === `blank` && meaning[i + 1] !== `blank`) {
            procYaml[i] = `<br>`
          }
          if (meaning[i - 1] !== `blank` && meaning[i + 1] !== `blank`) {
            procYaml[i] = `<br>`
          }
        }
        if (i === 0 && i < EOA) {
          if (meaning[i + 1] === `blank`) {
            procYaml[i] = `<br>`
          }
          if (meaning[i + 1] !== `blank`) {
            procYaml[i] = `<br>`
          }
        }
        if (i > 0 && i === EOA) {
          if (meaning[i - 1] === `blank`) {
            procYaml[i] = `<br>`
          }
          if (meaning[i - 1] !== `blank`) {
            procYaml[i] = `<br>`
          }
        }
        if (EOA === 0) {
          procYaml[i] = `<br>`
        }
      }
      /*
       ######     ########    ##   ##    #######    ######  
      ##    ##       ##       ##   ##    ##         ##   ## 
      ##    ##       ##       #######    #####      ######  
      ##    ##       ##       ##   ##    ##         ##   ## 
       ######        ##       ##   ##    #######    ##   ## 
      */
       if (meaning[i] === `other`) {
        if (i > 0 && i < EOA) {
        }
        if (i === 0 && i < EOA) {
        }
        if (i > 0 && i === EOA) {
        }
        if (EOA === 0) {
        }
      }
      if (i < EOA) {
        i++
        fn()
      }
      else {
        resolve(procYaml)
      }
    }
  })
  .then(rly => {
    return [rly.join(``), keyAgg]
  })
}
