/*

  変数

*/
let now = Date()
let eps = location
.search
.replace(/.*?(?:eps|episode|story)=(.*?)(?:&.*|$)/gm, "$1")
let content = null
// タグの定義（タグ自身を処理の対象にする）
let arr_brkSlf = [
  {
    "before": "{",
    "after": "}",
    "replaceBefore": `<span class="curly-brks">`,
    "replaceAfter": `</span>`
  }
]
// タグの定義（タグと中身を処理の対象にする）
let arr_brkInc = [
  {
    "before": "[",
    "after": "]",
    "replaceBefore": `<span class="square-brks">`,
    "replaceAfter": `</span>`
  }
]
let prm_textSrc = null
let prm_tocSrc = null
let prm_text = null
let prm_toc = null
let opIdent = eps.replace(/(.*?)\d+\..*/, "$1")
let currIdent = eps.replace(/.*?(\d+)\..*/, "$1")
let extention = eps.replace(/.*(\..*)/, "$1")
let currNum = Number(currIdent)
let format = null
if (eps !== "README.md" && eps !== "") {
  format = 0
  if (!eps.match(/\[\d+\]\d+\.txt/)) {
    eps = `[${op}]${("00" + eps).slice(-3)}.txt`
  }
  console.log(eps)
} else {
  format = 1
}
/*

  スクリプトのロード時の動作

*/
// 本文が小説本文なら
if (format === 0) {
  // 本文の処理
  prm_text = new Promise((resolve, reject) => {
    loadContent(backhost + eps + "?" + now)
    .then(async r => {
      if (r.ok) {
        prm_textSrc = r.text()
        return procBrk(await prm_textSrc)
      }
    })
    .then(r => {
      return parseRuby(r)
    })
    .then(r => {
      return removeMd(r)
    })
    .then(r => {
      return parseParagraph(r)
    })
    .then(r => {
      resolve(content = r)
    })
    .catch(() => {
      reject()
    })
  })
  // 目次の処理
  prm_toc = new Promise((resolve, reject) => {
    let w = null
    loadContent(backhost + "README.md?" + now)
    .then(async r => {
      if (r.ok) {
        prm_tocSrc = r.text()
        resolve(makeToc(await prm_tocSrc))
      }
    })
    .catch(() => {
      reject()
    })
  })
}
// 本文が README.md なら
else {
  // 本文の処理
  prm_text = new Promise((resolve, reject) => {
    loadContent(backhost + "README.md?" + now)
    .then(async r => {
      if (r.ok) {
        prm_tocSrc = r.text()
        return makeToc(await prm_tocSrc)
      }
    })
    .then(r => {
      resolve(procReadme(r))
    })
    .catch(() => {
      reject()
    })
  })
}
/*

  ロード時の動作

*/
window.addEventListener("DOMContentLoaded", () => {
  let nod_text = document.querySelector("#text")
  let ndl_add = document.querySelectorAll(".addition")
  let ndl_toToc = document.querySelectorAll(".to-toc")
  let ndl_prev = document.querySelectorAll(".prev")
  let ndl_next = document.querySelectorAll(".next")
  let nod_len = document.querySelector("#length")
  let prm_wrote = null
  let prm_link = null
  let prm_add = null
  let prm_len = null
  let arr_prm_wrote = []
  // 本文の処理が終わったら
  prm_text
  .then(r => {
    // 本文を挿入
    prm_wrote = new Promise(resolve => {
      resolve(nod_text.innerHTML = r)
    })
    arr_prm_wrote.push(prm_wrote)
    // 本文が小説本文なら
    if (format === 0) {
      // タイトルの表示
      prm_link = new Promise(resolve => {
        prm_toc // <= 目次の処理が終わったら
        .then(r => {
          let nod_title = document.createElement("h1")
          nod_title.appendChild(document.createTextNode(r[currNum - 1][1]))
          resolve(nod_text.prepend(nod_title))
        })
      })
      arr_prm_wrote.push(prm_link)
      // 目次へのリンクの表示
      prm_add = new Promise(resolve => {
        let w = 0
        ndl_add.forEach(r => {
          r.classList.remove("hidden")
          w++
          if (w === ndl_add.length) {
            resolve(true)
          }
        })
      })
      arr_prm_wrote.push(prm_add)
      // 文字数の表示
      prm_len = new Promise(resolve => {
        prm_textSrc
        .then(r => {
          procBrk(r)
          .then(r => {
            resolve(nod_len.textContent = `${removeRuby(r).replace(/[ \t　\r\n]/g, "").length} 文字`)
          })
        })
      })
      arr_prm_wrote.push(prm_len)
      Promise.all(arr_prm_wrote)
      .then(r => {
        if (localStorage.getItem("eps") === eps) {
          document.body.scrollTop = localStorage.getItem("scrollTop")
        }
      })
   // 本文が README.md なら
    }
    else {
      let nod_toc = document.querySelector("#toc")
      nod_toc.style.width = nod_toc.getBoundingClientRect().width
      nod_toc.style.display = "block"
      prm_tocSrc
      .then(r => {
        let nod_title = document.createElement("h1")
        nod_title.appendChild(document.createTextNode(r.match(/# .*/)[0].replace(/# (.*)/, "$1")))
        nod_text.prepend(nod_title)
      })
    }
  })
  .catch(() => {
    nod_text.innerHTML = `<p style="text-align: center;">エラーが発生しました。申し訳ないことです。</p>`
  })
  // 本文が小説本文なら
  if (format === 0) {
    // 目次の処理が終わったら
    prm_toc
    .then(r => {
      // リンクの設定
      setLink(r, ndl_toToc, ndl_prev, ndl_next)
    })
  }
})
/*

  アンロード時の動作

*/
window.onunload = () => {
  // スクロール量
  localStorage.setItem("scrollTop", document.body.scrollTop)
  // リロード後にスクロール量を再現するか否かを判断するために今の話のファイル名を記録する
  localStorage.setItem("eps", eps)
}
/*

  関数

*/
// 本文の読み込み
function loadContent(url) {
  return fetch(url)
}
// ルビをパース
function parseRuby(src) {
  return src
         .replace(/｜([^｜]*?)《(.*?)》/g, `<ruby>$1<rt>$2</rt></ruby>`)
         .replace(/([々〇〻\u3400-\u9FFF\uF900-\uFAFF]+|[\uD840-\uD87F]+|[\uDC00-\uDFFF]+)（(.*?)）/g, `<ruby>$1<rt>$2</rt></ruby>`)
         .replace(/｜(（.*?）)/g, "$1")
}
// ルビを削除
function removeRuby(src) {
  return src.replace(/｜([^｜]*?)《.*?》/g, "$1")
            .replace(/([々〇〻\u3400-\u9FFF\uF900-\uFAFF]+|[\uD840-\uD87F]+|[\uDC00-\uDFFF]+)（(.*?)）/g, "$1")
            .replace(/｜(（.*?）)/g, "$1")
}// Markdown を削除
function removeMd(src) {
  return src
         .replace(/^[ \t]*[#*+\-_~=`>|].*\r?\n/gm, "")
}
// 段落の処理
function parseParagraph(src) {
  return src
         .replace(/(.+)\r?\n/g, "$1")
         .replace(/^(.*)$/gm, `<p>$1</p>`)
         .replace(/<p><\/p>/g, `<p><br></p>`)
}
// 括弧を処理 type=0 消去、tyep=1 色づけ
async function procBrk(src, type) {
  if (type === 1) {
    return markupInc(markupSelf(src))
  } else {
    return src.replace(rx_deleteSelf(), "").replace(rx_deleteInc(), "")
  }
  function rx_deleteSelf() {
    let w = ""
    let h = 0
    for (let i = 0; i < arr_brkSlf.length; i++) {
      w += esc(arr_brkSlf[i]["before"]) + esc(arr_brkSlf[i]["after"])
      h++
      if (h === arr_brkSlf.length) {
        return RegExp("[" + w + "]", "g")
      }
    }
  }
  function rx_deleteInc() {
    let w = ""
    let h = 0
    for (let i = 0; i < arr_brkInc.length; i++) {
      w += esc(arr_brkInc[i]["before"]) + ".*?" + esc(arr_brkInc[i]["after"]) + "|"
      h++
      if (h === arr_brkInc.length) {
        return RegExp("(" + w + ")", "g")
      }
    }
  }
  function markupSelf(r) {
    let g = 0
    let rx_brkBefore = RegExp(esc(arr_brkSlf[g]["before"]), "g")
    let rx_brkAfter = RegExp(esc(arr_brkSlf[g]["after"]), "g")
    let w = unEsc(r.replace(rx_brkBefore, arr_brkSlf[g]["replaceBefore"] + esc(arr_brkSlf[g]["before"]) + arr_brkSlf[g]["replaceAfter"]).replace(rx_brkAfter, arr_brkSlf[g]["replaceBefore"] + esc(arr_brkSlf[g]["after"]) + arr_brkSlf[g]["replaceAfter"]))
    g++
    if (g < arr_brkSlf.length) {
      markupSelf(w)
    } else {
      return w
    }
  }
  function markupInc(r) {
    let f = 0
    let rx_brk = RegExp(esc(arr_brkInc[f]["before"]) + "(.*?)" + esc(arr_brkInc[f]["after"]), "g")
    let w = unEsc(r.replace(rx_brk, arr_brkInc[f]["replaceBefore"] + esc(arr_brkInc[f]["before"]) + "$1" + esc(arr_brkInc[f]["after"]) + arr_brkInc[f]["replaceAfter"]))
    f++
    if (f < arr_brkInc.length) {
      markupInc(w)
    } else {
      return w
    }
  }
}
// README.md の処理
async function procReadme(arr_toc) {
  let arr_readme = []
  let sum = 0
  let arr_prm = []
  for (let i in arr_toc) {
    let prm = new Promise((resolve, reject) => {
      resolve(arr_readme[i] = `<li><a href="${arr_toc[i][2]}">${arr_toc[i][1]}</a></li>`)
    })
    arr_prm.push(prm)
  }
  return Promise.all(arr_prm)
  .then(r => {
    return `<ol id="toc">\n${r.join("\n")}\n</ol>`
  })
}
// 目次の作成
async function makeToc(src) {
  let w = src.replace(/(.*\r?\n)*(#+ 目次.*\r?\n)((.*\r?\n)*)#?/gm, "$3")
             .split(/\r?\n/)
             .filter(r => r !== "")
  for (let i in w) {
    w[i] = w[i].replace(/^(?:\*|\+|-|\d+\.) (.*)/, "$1")
               .split(/[ \t]*[:：][ \t]*/)
    if (w[i].length === 1) {
      w[i].push(w[i][0])
    }
  }
  w.map(r => r.push(linkBase + "?eps=" + r[0]))
  return await w
}
// 前の・次の作品へのリンクを表示する
function setLink(arr_toc, ndl_toToc, ndl_prev, ndl_next) {
  let prevFile = opIdent + ("0".repeat(currIdent.length) + (currNum - 1)).slice(-currIdent.length) + extention
  let nextFile = opIdent + ("0".repeat(currIdent.length) + (currNum + 1)).slice(-currIdent.length) + extention
  let arr_adjacentProc = {
    prev: async () => {
      ndl_prev.forEach(r => {
        r.href = `${linkBase}?eps=${prevFile}`
        r.innerHTML = `<< ${arr_toc[currNum - 2][1]}`
      })
    },
    next: async () => {
      ndl_next.forEach(r => {
        r.href = `${linkBase}?eps=${nextFile}`
        r.innerHTML = `${arr_toc[currNum][1]} >>`
      })
    }
  }
  if (
    currNum !== 1
    &&
    currNum !== arr_toc.length
  ) {
    arr_adjacentProc["prev"]()
    arr_adjacentProc["next"]()
  }
  else if (
    currNum !== 1
    &&
    arr_toc.length !== 1
  ) {
    arr_adjacentProc["prev"]()
  }
  else if (
    currNum === 1
    &&
    arr_toc.length >= 2
  ) {
    arr_adjacentProc["next"]()
  }
  ndl_toToc.forEach(r => {
    r.href = `${linkBase}?eps=README.md`
  })
}
// エスケープ
function esc(data) {
  return data
  .replace(/\//g, "\\/")
  .replace(/\\/g, "\\\\")
  .replace(/\^/g, "\\^")
  .replace(/\$/g, "\\$")
  .replace(/\*/g, "\\*")
  .replace(/\+/g, "\\+")
  .replace(/\?/g, "\\?")
  .replace(/\./g, "\\.")
  .replace(/\(/g, "\\(")
  .replace(/\[/g, "\\[")
}
// エスケープ解除
function unEsc(data) {
  return data
  .replace(/\\\//g, "/")
  .replace(/\\\\/g, "\\")
  .replace(/\\\^/g, "^")
  .replace(/\\\$/g, "$")
  .replace(/\\\*/g, "*")
  .replace(/\\\+/g, "+")
  .replace(/\\\?/g, "?")
  .replace(/\\\./g, ".")
  .replace(/\\\(/g, "(")
  .replace(/\\\[/g, "[")
}
