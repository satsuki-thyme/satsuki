/*

  変数

*/
// URL の ? の後ろ
let search = location.search.slice(1) || ``
// URL の ? の後ろで指定された op
let op = /^op[^\/]+/.test(search) ? search.match(/^op[^\/]+/)[0] : ``
// 本文データの参照先
let baseUrlArray = {
  "http://localhost:8080": `scribe/${op}/`,
  "http://satsuki.c": `scribe/${op}/`,
  "https://satsuki.me": `//raw.githubusercontent.com/satsuki-thyme/${op}/master/`
}
// インデックスデータの参照先
let indexFile = `index.json?2024-02-21`
// トップページの表の ID
let indexTableId = `table`
// トップページの表の thead
let indexTableThead = ["op", "タイトル", "説明", "状態"]
// 目次ファイル
let tocFile = "README.md"
// 目次の小見出しのレベル <h?>...</h?>
let subheadingLevel = 3
// 作品タイトルのレベル <h?>...</h?>
let opTitleLevel = 2
// 作品サブタイトルのレベル <h?>...</h?>
let opSubtitleLevel = 3
// 小見出し「本文」の リストのバレット ul or ol
let listBulletText = `ol`
// 小見出し「本文」以外の リストのバレット ul or ol
let listBulletOthers = `ul`
// シェア用のタイトル
let shareTitle = `五月タイムのサイト`
// html タグ
let html = document.querySelector(`html`)
// URL の ? の後ろで指定されたディレクトリとファイル
let file = /(?<=op[^\/]+\/).+\..+$/.test(search) ? search.match(/(?<=op[^\/]+\/).+\..+$/)[0] : ``
// サーバの URL
let server = location.origin
// 本文データの参照先
let baseUrl = baseUrlArray[server]
// 処理する括弧
let brackets = [["{", "}"], ["[", "]"], ["<", ">"]]
/*
  HTML コンテンツ
*/
// サイトのヘッダ
let header = `
<header class="site-element">
  <h1>
    <a href="/">
      <img src="attachment/satsuki-thyme-fg-green-bg-trn.svg" alt="Satsuki Thyme">
      <p>五月タイムのサイト</p>
    </a>
  </h1>
</header>
`
// サイトのフッタ
let footer = `
<aside class="site-element">
  <p><a href="https://wavebox.me/wave/2rz5vnppvponxtdz/">Wavebox に行ってメッセージを送る</a></p>
</aside>
<footer class="site-element">
  <p>&copy;Satsuki Thyme</p>
</footer>
`
// トップページへのリンク
let toTopNav = `
<div class="nav-outer">
  <a href="/" class="nav-element">トップページ</a>
</div>
`
/*

  主たる動作

*/
window.addEventListener(`DOMContentLoaded`, async () => {
  // 汎用パネル
  let etc = document.querySelector(`#etc`)
  fetch(indexFile)
  .then(async rly => {
    if (rly.ok) {
      let index = await rly.json()
      if (search === ``) {
        indexPage(index)
      }
      else if (/^op[^\/]+$/.test(search)) {
        coverPage(index)
      }
      else if (/^op[^\/]+\/.+\..+$/.test(search)) {
        textPage(index)
      }
      else {
      errorPage()
      }
    }
    else {
      errorPage()
    }
  })
  let etcSwitch = false
  window.onkeydown = e => {
    if (e.key === `s`) {
      etcSwitch = true
      etc.innerHTML = shareTitle + `\r\n${location.href.replace(/http:/, `https:`).replace(/satsuki\.c/, `satsuki.me`)}`
      etc.style.display = `inline-block`
      etcWidth = etc.getBoundingClientRect().width
      etc.style.width = etcWidth < 600 ? etcWidth + `px` : `600px`
      etc.style.height = etc.getBoundingClientRect().height + `px`
      html.classList.add(`use-popup`)
      let selectRange = document.createRange()
      selectRange.setStart(etc, 0)
      selectRange.setEnd(etc, etc.childNodes.length)
      document.getSelection().removeAllRanges()
      document.getSelection().addRange(selectRange)
    }
    else if (etcSwitch === true && !(e.key === `Control` || (e.key === `c` && e.ctrlKey === true))) {
      html.classList.remove(`use-popup`)
      etc.style.display = null
    }
  }
  document.querySelector(`#cover`).onclick = e => {
    html.classList.remove(`use-popup`)
    return false
  }
})
//========
//
//  関数
//
//========
/*

  主たる関数

*/
/*

  サイトのトップページを生成

*/
async function indexPage(index) {
  html.classList.add(`index`)
  let w = []
  for (let i of index) {
    if (i.display === true) {
      let w1 = []
      for (let i1 of Object.keys(i).splice(0, 4)) {
        if (i1 === `title`) {
          i[i1] = `<a href="?op${i[`op`]}">${i[i1]}</a>`
        }
        w1.push(String(i[i1]).replace(/under construction/, `編集中`).replace(/unfinished/, `中止`))
      }
      w.push(w1)
    }
  }
  write(`
    <div id="unit">
      ${maketable(w, indexTableThead, indexTableId)}
    </div>
  `)
  return true
}
/*

  小説のカバーページを生成

*/
async function coverPage(index) {
  html.classList.add(`cover`)
  let status = getStatus(index)
  shareTitle = `${status.title}${status.status}`
  return fetch(`${baseUrl}${tocFile}`)
  .then(async rly => {
    if (rly.ok) {
      procToc(await rly.text(), op, `all`)
      .then(rly => {
        let tocAssebmle = `
            <header class="page-element">
              <h${opTitleLevel}>
                ${status.title}${status.status}
              </h${opTitleLevel}>
              <nav>
                ${toTopNav}
              </nav>
            </header>
        `
        for (let i in rly) {
          tocAssebmle += `
            <section class="unit">
              <h${subheadingLevel}>
                ${rly[i].subheading}
              </h${subheadingLevel}>
              <${rly[i].subheading === `本文` || rly[i].subheading === `目次` ? listBulletText : listBulletOthers}>
          `
          for (let j in rly[i].contents) {
            tocAssebmle += `<li><a href="${rly[i].contents[j].href}">${rly[i].contents[j].title}</a></li>`
          }
          tocAssebmle += `
              </${rly[i].subheading === `本文` || rly[i].subheading === `目次` ? listBulletText : listBulletOthers}>
            </section>
          `
        }
        tocAssebmle += `
            <footer class="page-element">
              <nav>
                ${toTopNav}
              </nav>
            </footer>
        `
        write(tocAssebmle)
      })
    }
    return true
  })
}
/*

  小説本文のページを生成

*/
async function textPage(index) {
  html.classList.add(`text`)
  let status = getStatus(index)
  let textHtml = new Promise(resolve => {
    fetch(`${baseUrl}${file}`)
    .then(async textFile => {
      if (textFile.ok) {
        if (/\.txt$/.test(file)) {
          novelparse(await brackettool(await textFile.text(), brackets, `delete`), `few`)
          .then(textHtml => {
            resolve(textHtml)
          })
        }
        else if (/\.md$/.test(file)) {
          html.classList.add(`md`)
          mdparse(myMarkup(await textFile.text()), {"permissive": true, "section": true})
          .then(textHtml => {
            resolve(textHtml)
          })
        }
        else if (/\.ya?ml$/.test(file)) {
          html.classList.add(`yaml`)
          yamlparse(myMarkup(await textFile.text()))
          .then(rly => {
            resolve(
              rly[0]
              .replace(/(\\*)__(.+?)(?<!\\(?:\\\\)*)__/g, (match, grp1, grp2) => (!grp1 || grp1.length % 2 === 0) ? `<strong>${grp2}</strong>` : match)
              .replace(/(\\*)_(.+?)(?<!\\(?:\\\\)*)_/g, (match, grp1, grp2) => (!grp1 || grp1.length % 2 === 0) ? `<em>${grp2}</em>` : match)
              .replace(/(\\*)\*\*(.+?)(?<!\\(?:\\\\)*)\*\*/g, (match, grp1, grp2) => (!grp1 || grp1.length % 2 === 0) ? `<strong>${grp2}</strong>` : match)
              .replace(/(\\*)\*(.+?)(?<!\\(?:\\\\)*)\*/g, (match, grp1, grp2) => (!grp1 || grp1.length % 2 === 0) ? `<em>${grp2}</em>` : match)
              .replace(/(\\*)~~(.+?)(?<!\\(?:\\\\)*)~~/g, (match, grp1, grp2) => (!grp1 || grp1.length % 2 === 0) ? `<del>${grp2}</del>` : match)
              .replace(/(\\*)!\[(.+?)(?<!\\(?:\\\\)*)\]\((.+?)\)/g, (match, grp1, grp2, grp3) => (!grp1 || grp1.length % 2 === 0) ? `<img src="${grp3}" alt="${grp2}">` : match)
              .replace(/(\\*)(?<!!)\[(.+?)(?<!\\(?:\\\\)*)\]\((.+?)\)/g, (match, grp1, grp2, grp3) => (!grp1 || grp1.length % 2 === 0) ? `<a href="${grp3}">${grp2}</a>` : match)
            )
          })
        }
        else {
          resolve(`<pre>${await textFile.text()}</pre>`)
        }
      }
    })
    function myMarkup(src) {
      return src
      // number
      .replace(/^(.*?:[ \t]+)(\\d+)$/gm, `$1<span class="number">$2</span>`)
      // markup
      .replace(/<= select/g, `<span class="select">&lt;= select</span>`)
      .replace(/<= point/g, `<span class="point">&lt;= point</span>`)
      .replace(/<= decided/g, `<span class="decided">&lt;= decided</span>`)
      // arrow
      .replace(/<=/g, `<span class="arrow">=&lt;</span>`)
      .replace(/=>/g, `<span class="arrow">=&gt;</span>`)
      // aside
      .replace(/(?<!#+ )\[==(.+?)]/g, `[<a href="#$1" class="aside">$1</a>]`)
      .replace(/(?<=#+ )\[==(.+?)]/g, `[<a name="$1" class="aside">$1</a>]`)
    }
  })
  let href = new Promise(resolve => {
    fetch(`${baseUrl}${tocFile}`)
    .then(async tocFile => {
      if (tocFile.ok) {
        let tocBlob = await tocFile.text()
        procToc(tocBlob, op, `all`)
        .then(textToc => {
          let hrefArray = []
          let tocEssence = []
          for (let i in textToc) {
            for (let j in textToc[i].contents) {
              hrefArray.push(textToc[i].contents[j].href)
              let w = {}
              w.subtitle = textToc[i].contents[j].title
              w.href = textToc[i].contents[j].href
              tocEssence.push(w)
            }
          }
          let currNum = hrefArray.indexOf(`?${op}/${file}`)
          resolve([tocEssence, currNum])
        })
      }
    })
  })
  return Promise.all([textHtml, href])
  .then(rly => {
    let textHtml = rly[0]
    let tocEssence = rly[1][0]
    let currNum = rly[1][1]
    let subtitle = tocEssence[currNum].subtitle
    let prevHref = currNum !== 0 ? tocEssence[currNum - 1].href : null
    let nextHref = currNum !== tocEssence.length - 1 ? tocEssence[currNum + 1].href : null
    shareTitle = `${subtitle} | ${status.title}${status.status}`
    let opNav = `
      <nav class="nav-inner">
        <table>
          <tbody>
            <tr>
              <td>
                ${prevHref !== null ? `<a href="${prevHref}" class="nav-element">${tocEssence[currNum - 1].subtitle}</a>` : `<span class="nav-element grayout">なし</span>`}
              </td>
              <td><span class="nav-separater">|</span><a href="?${op}" class="nav-element">目次</a><span class="nav-separater">|</span></td>
              <td>
                ${nextHref !== null ? `<a href="${nextHref}" class="nav-element">${tocEssence[currNum + 1].subtitle}</a>` : `<span class="nav-element grayout">なし</span>`}
              </td>
            </tr>
          </tbody>
        </table>
      </nav>
`
    write(
      `
        <div id="unit">
        <header class="page-element">
          <div id="op-title">
            <h${opTitleLevel}>${status.title}${status.status}</h${opTitleLevel}>
              <h${opSubtitleLevel}>${subtitle}</h${opSubtitleLevel}>
            </div>
            <nav>
              ${toTopNav}
              ${opNav}
            </nav>
          </header>
          <main class="page-element">
            ${textHtml}
          </main>
          <footer class="page-element">
            <nav>
              ${opNav}
              ${toTopNav}
            </nav>
          </footer>
        </div>
      `
    )
    return true
  })
}
/*

  エラーページを生成

*/
async function errorPage() {
  return true
}
/*

  その他の補助的な関数

*/
function getStatus(index) {
  let w = index.filter(rly => String(rly.op) === op.replace(/op/, ``))[0]
  if (w.status === `under construction`) {
    w.status = ` -（編集中）`
  }
  if (w.status === `unfinished`) {
    w.status = ` -（未完）`
  }
  return w
}
function sort(src) {
  let textArray = src.split(/\r?\n/)
  let markArray = []
  let sortedArray = new Promise(resolve => {
    let i = 0
    fn()
    function fn() {
      if (/^```[ \t]*(md|makdown)$/.test(textArray[i])) {
        markArray[i] = `md`
      }
    }
  })
}
function write(contents) {
  container.innerHTML = `${header}<main class="site-element">${contents}</main>${footer}`
}
function esc(r) {
  if (typeof r === "string" || r instanceof String) return p(r)
  else if (Array.isArray(r)) return r.map(r => r = p(r))
  else return r
  function p(r) {
    return r.replace(/(\/|\\|\^|\$|\*|\+|\?|\.|\(|\)|\[|\]|\{|\})/g, "\\$1")
  }
}
function unEsc(r) {
  if (typeof r === "string" || r instanceof String) return p(r)
  else if (Array.isArray(r)) return r.map(r => r = p(r))
  else return r
  function p(r) {
    return r.replace(/\\(\/|\\|\^|\$|\*|\+|\?|\.|\(|\)|\[|\]|\{|\})/g, "$1")
  }
}
async function procToc(tocFileContents, op, type) {
  return new Promise(revolve => {
    if (type !== `text` && type !== `all` && type !== `others`) {
      type = `text`
    }
    let tocBlob = /(?<!#)## 目次[\s\S]*?(?=(?<!#)##(?!#)|$)/.test(tocFileContents) ? tocFileContents.match(/(?<!#)## 目次[\s\S]*?(?=(?<!#)##(?!#)|$)/)[0] : undefined
    let textBlob = /(?<!#)### 本文[\s\S]*?(?=(?<!#)###(?!#)|$)/.test(tocBlob) ? tocBlob.match(/(?<!#)### 本文[\s\S]*?(?=(?<!#)###(?!#)|$)/)[0] : tocBlob
    let othersBlob = /### (?!本文)[\s\S]*?(?=$|### 本文)/.test(tocBlob) ? tocBlob.match(/### (?!本文)[\s\S]*?(?=$|### 本文)/)[0] : undefined
    if (tocBlob !== undefined) {
      if (type === `text`) {
        revolve(getListSingle(textBlob))
      }
      else if (type === `all`) {
        revolve(getListMulti(tocBlob))
      }
      else if (type === `others`) {
        revolve(false)
      }
    }
    else {
      revolve(undefined)
    }
  })
  function getListSingle(src) {
    let w = {}
    w.subheading = `${/(?<=##+ ).*/.test(src) ? src.match(/(?<=##+ ).*/)[0] : undefined}`
    w.contents = src
    .split(/\r?\n/)
    .filter(rly => /^[\-+*] .+$/.test(rly))
    .map(rly => {
      let w = {}
      w.title = `${/(?<=[\-+*].*?:[ \t]+)[^ \t].*$/.test(rly) ? rly.match(/(?<=[\-+*].*?:[ \t]+)[^ \t].*$/)[0] : undefined}`
      w.href = `?${op}/${/(?<=[\-+*] ).*?(?=:)/.test(rly) ? rly.match(/(?<=[\-+*] ).*?(?=:)/)[0] : rly.match(/^(?<=[\-+*] ).*$/)[0]}`
      return w
    })
    return w
  }
  function getListMulti(src) {
    let w = src.match(/#+ .*\r?\n(?:[\-+*] .*(?:\r?\n|$))+/g)
    let w1 = []
    for (let i in w) {
      w1.push(getListSingle(w[i]))
    }
    return w1
  }
}
