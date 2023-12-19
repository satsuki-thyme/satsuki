/*

  変数

*/
/*
  定義
*/
// URL の ? の後ろ
let search = location.search.slice(1) || ``
// URL の ? の後ろで指定された op
let op = /^op[^\/]+/.test(search) ? search.match(/^op[^\/]+/)[0] : ``
let repo = op
/*
  設定
*/
// 本文データの参照先
let baseUrlArray = {}
baseUrlArray[`c`] = `scribe/${repo}/`
baseUrlArray[`satsuki.me`] = `//raw.githubusercontent.com/satsuki-thyme/${repo}/master/`
// インデックスデータの参照先
let indexFile = `index.json`
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
// 小見出し「本文」の リストのバレット？ <ul> or <ol>
let listBulletText = `ol`
// 小見出し「本文」以外の リストのバレット？ <ul> or <ol>
let listBulletOthers = `ul`
/*
  定義
*/
// html タグ
let html = document.querySelector(`html`)
// URL の ? の後ろで指定されたディレクトリとファイル
let file = /(?<=op[^\/]+\/).+\..+$/.test(search) ? search.match(/(?<=op[^\/]+\/).+\..+$/)[0] : ``
// 本文データの参照先
let baseUrl = ``
// サーバの URL
let server = location.origin
if (/\.c$/.test(server)) {
  baseUrl = baseUrlArray[`c`]
}
else if (/satsuki\.me$/.test(server)) {
  baseUrl = baseUrlArray[`satsuki.me`]
}
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
  let w1 = []
  for (let i in index) {
    let w2 = []
    for (let j in Object.keys(index[i])) {
      let w3 = ``
      if (Object.keys(index[i])[j] === `title`) {
        w3 = `<a href="?op${index[i].op}">${index[i][Object.keys(index[i])[j]]}</a>`
      }
      if (Object.keys(index[i])[j] === `status`) {
        w3 = index[i][Object.keys(index[i])[j]]
        .replace(/unfinished/, `未完`)
        .replace(/under construction/, `編集中`)
      }
      if (/op|description/.test(Object.keys(index[i])[j])) {
        w3 = index[i][Object.keys(index[i])[j]]
      }
      w2.push(w3)
    }
    w1.push(w2)
  }
  write(`
    <div id="unit">
      ${maketable(w1, indexTableThead, indexTableId)}
    </div>
  `)
}
/*

  小説のカバーページを生成

*/
async function coverPage(index) {
  html.classList.add(`cover`)
  let statusSet = getStatus(index)
  fetch(`${baseUrl}${tocFile}`)
  .then(async rly => {
    if (rly.ok) {
      procToc(await rly.text(), op, `all`)
      .then(rly => {
        let tocAssebmle = `
            <header class="page-element">
              <h${opTitleLevel}>
                ${statusSet.title}${statusSet.status}
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
  })
}
/*

  小説本文のページを生成

*/
async function textPage(index) {
  html.classList.add(`text`)
  let statusSet = getStatus(index)
  let textHtml = new Promise(resolve => {
    fetch(`${baseUrl}${file}`)
    .then(async textFile => {
      if (textFile.ok) {
        if (/\.txt$/.test(file)) {
          novelparse(await textFile.text(), `few`)
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
          html.classList.add(`yml`)
          resolve(
            yamlparse(myMarkup(await textFile.text()))
            .replace(/(\\*)__(.+?)(?<!\\(?:\\\\)*)__/g, (match, grp1, grp2) => (!grp1 || grp1.length % 2 === 0) ? `<strong>${grp2}</strong>` : match)
            .replace(/(\\*)_(.+?)(?<!\\(?:\\\\)*)_/g, (match, grp1, grp2) => (!grp1 || grp1.length % 2 === 0) ? `<em>${grp2}</em>` : match)
            .replace(/(\\*)\*\*(.+?)(?<!\\(?:\\\\)*)\*\*/g, (match, grp1, grp2) => (!grp1 || grp1.length % 2 === 0) ? `<strong>${grp2}</strong>` : match)
            .replace(/(\\*)\*(.+?)(?<!\\(?:\\\\)*)\*/g, (match, grp1, grp2) => (!grp1 || grp1.length % 2 === 0) ? `<em>${grp2}</em>` : match)
            .replace(/(\\*)~~(.+?)(?<!\\(?:\\\\)*)~~/g, (match, grp1, grp2) => (!grp1 || grp1.length % 2 === 0) ? `<del>${grp2}</del>` : match)
            .replace(/(\\*)!\[(.+?)(?<!\\(?:\\\\)*)\]\((.+?)\)/g, (match, grp1, grp2, grp3) => (!grp1 || grp1.length % 2 === 0) ? `<img src="${grp3}" alt="${grp2}">` : match)
            .replace(/(\\*)(?<!!)\[(.+?)(?<!\\(?:\\\\)*)\]\((.+?)\)/g, (match, grp1, grp2, grp3) => (!grp1 || grp1.length % 2 === 0) ? `<a href="${grp3}">${grp2}</a>` : match)
          )
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
      .replace(/<= select/g, `<span class="select"><= select</span>`)
      .replace(/<= point/g, `<span class="point"><= point</span>`)
      .replace(/<= decided/g, `<span class="decided"><= decided</span>`)
      // arrow
      .replace(/(<=|=>)/g, `<span class="arrow">$1</span>`)
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
  Promise.all([textHtml, href])
  .then(rly => {
    let textHtml = rly[0]
    let tocEssence = rly[1][0]
    let currNum = rly[1][1]
    let subtitle = tocEssence[currNum].subtitle
    let prevHref = currNum !== 0 ? tocEssence[currNum - 1].href : null
    let nextHref = currNum !== tocEssence.length - 1 ? tocEssence[currNum + 1].href : null
    let opNav = `
      <div class="nav-inner">
        ${prevHref !== null ? `<a href="${prevHref}" class="nav-element">${tocEssence[currNum - 1].subtitle}</a>` : `<span class="nav-element grayout">なし</span>`}
        <span class="nav-separater"> | </span>
        <a href="?${op}" class="nav-element">目次</a>
        <span class="nav-separater"> | </span>
        ${nextHref !== null ? `<a href="${nextHref}" class="nav-element">${tocEssence[currNum + 1].subtitle}</a>` : `<span class="nav-element grayout">なし</span>`}
      </div>
    `
    write(
      `
        <div id="unit">
        <header class="page-element">
          <div id="op-title">
            <h${opTitleLevel}>${statusSet.title}${statusSet.status}</h${opTitleLevel}>
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
  })
}
/*

  エラーページを生成

*/
async function errorPage() {

}
/*

  その他の補助的な関数

*/
function getStatus(index) {
  let w = index.filter(rly => rly.op === op.replace(/op/, ``))[0]
  if (w.status === `under construction`) {
    w.status = ` -（編集中）`
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
