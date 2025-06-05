/*
 ##     ##       ###       ########
 ##     ##      ## ##      ##     ##
 ##     ##     ##   ##     ##     ##
 ##     ##    ##     ##    ########
  ##   ##     #########    ##   ##
   ## ##      ##     ##    ##    ##
    ###       ##     ##    ##     ##
*/
/*

  スイッチ

*/
// インターネットURLに固定する
let fixToInternetURL = false

// 文字数のローカルストレージを初期化する
let characterCountLogInitializeSwitch = false



/*

  設定値

*/
let githubRawFront = `//raw.githubusercontent.com/satsuki-thyme`
let githubRawBack = `master`
let internetSiteRepo = `satsuki`
let localTextDir = `scribe/novel`
let basePage = `index.html`
let indexFile = `etc/index.json`
let indvIndexFile = `README.md`
let libDir = `lib`
let listDir = `list`
let descriptionDir = `description`
let defaultDescriptionFile = `default.txt`
let markupFile = `etc/markup.json`
let localSever = `c`
let internetServer = `me`



/*

  基本設定

*/
// URL 関連
let search = new Map()
let laterInsertionDn = ``
location.search
.slice(1)
.split(`&`)
.map(rly => rly.split(`=`))
.forEach(rly => {
  search.set(rly[0], rly[1])
})
let q = search.get(`q`)
let dn = ((q || ``).match(/^[^/]+/) || [``])[0]
search.set(`page`, search.get(`page`) || 1)
let server = fixToInternetURL === false ? location.origin : internetServer
server = {
  "http://satsuki.c": `c`,
  "https://satsuki.me" : `me`
}[server]
let textDir = {
  "c": localTextDir,
  "me": `${githubRawFront}/${internetSiteRepo}/${githubRawBack}`
}[server]
let baseURL = {
  "c": `${textDir}/${dn}`,
  "me": `${githubRawFront}/${dn}/${githubRawBack}`
}[server]

// 変数 dn の算出語に決定
let defaultMarkupFileDir = textDir
let indivMarkupFileDir = baseURL
let reTextPage = new RegExp(`^${dn}/(?!.*${listDir}).*`)

// リスト
let markup = []
let reListURLs = null
let reDnExists = new RegExp(`^${dn}`)
let marksPOK = null
let marksEOK = null
makeReListURLs()
function makeReListURLs() {
  if (q && reDnExists.test(q)) {
    reListURLs = loadMarkupFile(indivMarkupFileDir + `/` + markupFile)
    .then(rly => {
      return rly
    })
    .then(rly => {
      return makeRegExp(rly)
    })
    .catch(() => {
      return ``
    })
    reListURLs = loadMarkupFile(defaultMarkupFileDir + `/` + markupFile)
    .then(rly => {
      return rly
    })
    .then(rly => {
      return makeRegExp(rly)
    })
    .catch(() => {
      return ``
    })
  }
  if (!q) {
    reListURLs = loadMarkupFile(defaultMarkupFileDir + `/` + markupFile)
    .then(rly => {
      return makeRegExp(rly)
    })
    .catch(() => {
      return ``
    })
  }
  function loadMarkupFile(URL) {
    return new Promise((resolve, reject) => {
      fetch(URL)
      .then(async rly => {
        if (rly.ok) {
          resolve(await rly.json())
        }
        else {
          reject(false)
        }
      })
    })
  }
  function makeRegExp(src) {
    markup = src
    marksE(src)
    marksP(src)
    return new RegExp(`^.+?/(${
      src
      .map(rly => listDir + `/` + rly.path)
      .join(`|`)
    })$`)
  }
}



/*

  表示モード設定

*/
let rubyMode = localStorage.getItem(`rubyMode`) !== null ? localStorage.getItem(`rubyMode`) : `parse`
let newLineMode = localStorage.getItem(`newLineMode`) !== null ? localStorage.getItem(`newLineMode`) : `few`
let orientationMode = localStorage.getItem(`orientationMode`) !== null ? localStorage.getItem(`orientationMode`) : `horizontal`
let infoContents = localStorage.getItem(`infoContents`) !== null ? localStorage.getItem(`infoContents`) : `normal`
let bracketMode = localStorage.getItem(`bracketMode`) !== null ? localStorage.getItem(`bracketMode`) : `delete`

let beforeNum = 30
let afterNum = 30
let localizationArray = [
  "DN",
  "タイトル",
  "説明"
]



/*

  見出し

*/
// インデックスページ
let tocHeadingInIndex = `文書|目次`
let textHeadingInIndex = `本文`
let rejectHeadingInIndex = `マインドマップ`
let reTocBlob = new RegExp(`(^|\\r?\\n)(?<sharp>#+) (${tocHeadingInIndex})([\\s\\S]*?)([^#])(\\k<sharp>(?!#)|$(?!\\r?\\n))`)
let reTextBlob = new RegExp(`(^|\\r?\\n)(?<sharp>#+) (${textHeadingInIndex})([\\s\\S]*?)([^#])(\\k<sharp>(?!#)|$(?!\\r?\\n))`)
let reRejectBlob = new RegExp(`(^|\\r?\\n)(?<sharp>#+) (${rejectHeadingInIndex})([\\s\\S]*?)([^#])(\\k<sharp>(?!#)|$(?!\\r?\\n))`)

// カバーページ
let textHeadingInCover = [
  `話`,
  `タイトル`,
  `文字数`,
  `かな : 漢字`,
  `地の文 : 台詞`,
  `平均文長`
]
let docHeadingInCover = [
  `タイトル`
]



/*

  テーブルのクラス

*/
let textTableClass = `text-table`
let docTableClass = `doc-table`



/*

  データ書き出し設定

*/
let infoContentsDir = {
  "template": `share/template`,
  "description": `${dn}/description`
}
let infoContentsFile = {
  "normal": `normal.txt`,
  "x": `x.txt`,
  "line-tori": `line-tori.txt`,
  "line-saejima": `line-saejima.txt`
}



/*

  括弧処理

*/
let marksPreposition = []
let marksEnclosure = []
function marksP(src) {
  marksPOK = new Promise(resolve => {
    marksPreposition = src
    .filter(rly => rly.markupType === `preposition`)
    .map(rly => rly.mark)
    .reduce((a, c) => a.concat([c]), [])
    resolve(marksPreposition)
  })
}
function marksE(src) {
  marksEOK = new Promise(resolve => {
    marksEnclosure = src
    .filter(rly => rly.markupType === `enclosure` && rly.delete)
    .map(rly => rly.mark.map(rly => rly[0]))
    .reduce((a, c) => a.concat(c.map(rly => rly)), [])
    resolve(marksEnclosure)
  })
}



/*

  変数の初期化

*/
let title = ``
let currNum = 0
let subtitle = ``
let textArea = null
let text = ``
let textForCopy = ``
let htmlHeight = 0
let scrollValueY = Number(localStorage.getItem(`scrollValueY`)) || 0
let scrollValueX = Number(localStorage.getItem(`scrollValueX`)) || 0
let scrollRange = 0
let PrevOp = ``
let PrevFile = ``
let characterCountLogTable = null
let notFoundField = null
let uploadDownloadField = null
let downloadButton = null
let uploadButton = ``



/*

  その他

*/
let html = document.querySelector(`html`)

if (server === internetServer) {
  html.classList.add(`internet`)
}




/*
 ##           #######        ###       ########        ########    ####    ##          ########     ######
 ##          ##     ##      ## ##      ##     ##       ##           ##     ##          ##          ##    ##
 ##          ##     ##     ##   ##     ##     ##       ##           ##     ##          ##          ##
 ##          ##     ##    ##     ##    ##     ##       ######       ##     ##          ######       ######
 ##          ##     ##    #########    ##     ##       ##           ##     ##          ##                ##
 ##          ##     ##    ##     ##    ##     ##       ##           ##     ##          ##          ##    ##
 ########     #######     ##     ##    ########        ##          ####    ########    ########     ######
*/
let loadFilesOK = null
let min = {
  "c": ``,
  "me": `.min`
}[server]
function loadFiles() {
  let CSSFiles = [
    {
      "file": `markup-special-notation${min}.css`,
      "repo": `common`
    },
    {
      "file": `yaml${min}.css`,
      "repo": `yamlparse.js`
    }
  ]
  let scriptFiles = [
    {
      "file": `brackettool${min}.js`,
      "repo": `brackettool.js`
    },
    {
      "file": `comparearray.js`,
      "repo": `comparearray.js`
    },
    {
      "file": `mdparse${min}.js`,
      "repo": `mdparse.js`
    },
    {
      "file": `novelparse${min}.js`,
      "repo": `novelparse.js`
    },
    {
      "file": `replacetool${min}.js`,
      "repo": `replacetool.js`
    },
    {
      "file": `wordcount${min}.js`,
      "repo": `wordcount.js`
    },
    {
      "file": `yamlparse${min}.js`,
      "repo": `yamlparse.js`
    }
  ]
  let CSSPromiseArray = []
  let scriptPromiseArray = []
  for (let i of CSSFiles) {
    CSSPromiseArray
    .push(
      new Promise(resolve => {
        let e = document.createElement(`link`)
        e.href = `${libDir}/${i.repo}/${i.file}`
        e.rel = `stylesheet`
        document.head.appendChild(e)
        e.onload = () => {
          resolve()
        }
      })
    )
  }
  for (let i of scriptFiles) {
    scriptPromiseArray
    .push(
      new Promise(resolve => {
        let e = document.createElement(`script`)
        e.src = `${libDir}/${i.repo}/${i.file}`
        e.async = true
        document.head.appendChild(e)
        e.onload = () => {
          resolve()
        }
      })
    )
  }
  loadFilesOK = Promise.all([
    Promise.all(CSSPromiseArray),
    Promise.all(scriptPromiseArray)
  ])
}

loadFiles()
Promise.all([
  loadFilesOK,
  marksPOK,
  marksEOK
])
.then(() => {
  /*
    要素の取得
  */
    let activeContainer = document.querySelector(`#active-container`)
    /*
   ####    ##    ##    ########     ########    ##     ##
    ##     ###   ##    ##     ##    ##           ##   ##
    ##     ####  ##    ##     ##    ##            ## ##
    ##     ## ## ##    ##     ##    ######         ###
    ##     ##  ####    ##     ##    ##            ## ##
    ##     ##   ###    ##     ##    ##           ##   ##
   ####    ##    ##    ########     ########    ##     ##
  */
  if (!q) {
    /*
      設定
    */
    html.classList.add(`index`)
    activeContainer.innerHTML =
    `<header>
      <h1>作品リスト</h1>
    </header>
    <main>
      <section id="op-field">
        <div id="status-switch">
          <label><input type="radio" name="status-switch" value="active" checked>制作中</label>
          <label><input type="radio" name="status-switch" value="archive">アーカイブ</label>
          <label><input type="radio" name="status-switch" value="both">両方</label>
        </div>
        <div id="op-list-table"></div>
      </section>
      <section id="not-found-field">
      </section>
      <section id="character-count-log-field">
        <div id="character-count-log-table"></div>
        <div id="upload-download-field"><p>アップロード・ダウンロード</p><input type="file" name="upload-button" accept=".json" id="upload-button"><a id="download-button" download="chacacterCountLog.json">Download</a></div>
      </section>
    </main>`
    let contents = document.querySelector(`#op-list-table`)
    let statusSwitch = Array.from(document.querySelectorAll(`[name="status-switch"]`))
    characterCountLogTable = document.querySelector(`#character-count-log-table`)
    notFoundField = document.querySelector(`#not-found-field`)
    /*
      実行
    */
    displayIndex(statusSwitch.filter(rly => rly.checked)[0].value)
    statusSwitch.forEach(rly => {
      rly.onchange = () => {
        displayIndex(rly.value)
      }
    })
    /*
      関数
    */
    function displayIndex(status) {
      let message = {
        "failedToFetchingIndex": "index.json の読み込みに失敗しました。"
      }
      fetch(`${textDir}/${indexFile}`)
      .then(async rly => {
        if (rly.ok) {
          let index = await rly.json()
          let filteredIndex = Array.from(
            new Set(
              index.filter(rly => {
                if (
                  (
                    status === `active` && rly.active
                  )
                  ||
                  (
                    status === `archive` && !rly.active
                  )
                  ||
                  (
                    status === `both`
                  )
                  ) {
                  return true
                }
                else {
                  return false
                }
              })
              .map(rly => [rly.dn])
            )
          )
          let tItems = await Promise.all(
            filteredIndex.map(rly0 => {
              laterInsertionDn = rly0
              let baseURLArrayNoIncludeDn = {
                "c": `${textDir}/${laterInsertionDn}`,
                "me": `${githubRawFront}/${laterInsertionDn}/${githubRawBack}`
              }
              return fetch(`${baseURLArrayNoIncludeDn[server]}/${indvIndexFile}`)
              .then(async rly1 => {
                if (rly1.ok) {
                  let tocBlob = await rly1.text()
                  let dn = rly0
                  let title = `<a href="${basePage}?q=${dn}">${(tocBlob.match(/^# .*/))[0].replace(/^# /, ``)}</a>`
                  let description = await fetch(`${baseURLArrayNoIncludeDn[server]}/${descriptionDir}/${defaultDescriptionFile}`)
                  .then(async rly2 => {
                    if (rly2.ok) {
                      return await rly2.text()
                    }
                    else {
                      return false
                    }
                  })
                  return [dn, title, description]
                }
                else {
                  return false
                }
              })
            })
          )
          return maketable(tItems, localizationArray)
        }
        else {
          console.error(message.failedToFetchingIndex)
          return false
        }
      })
      .then(rly => {
        contents.innerHTML = rly
        getContentsSize()
        getScrollValue()
      })
    }
  }
  /*
   ######      #######     ##     ##    ########    ########
  ##    ##    ##     ##    ##     ##    ##          ##     ##
  ##          ##     ##    ##     ##    ##          ##     ##
  ##          ##     ##    ##     ##    ######      ########
  ##          ##     ##     ##   ##     ##          ##   ##
  ##    ##    ##     ##      ## ##      ##          ##    ##
   ######      #######        ###       ########    ##     ##
  */
  if (q && /^[^/]+$/.test(q)) {
    html.classList.add(`cover`)
    genCover()
    .then(rly => {
      activeContainer.innerHTML = rly[0]
      document.querySelector(`title`).innerText = rly[1]
      getContentsSize()
      getScrollValue()
    })
    async function genCover() {
      let message = {
        "failedToFetchingReadme": "${indvIndexFile} の読み込みに失敗しました。",
        "failedToFetchingFile": "本文ファイルの取得に失敗しました。"
      }
      return await fetch(`${baseURL}/${indvIndexFile}`)
      .then(async rly => {
        if (rly.ok) {
          let contentsAll = await rly.text()
          return procIndex(contentsAll)
          .then(async rly => await createHTML(rly))
          .then(rly => {
            let title = contentsAll.match(/(?:# )(.*)/)[1]
            let header = `<header><h1>${title}</h1><div class="return-to-index"><a href="${basePage}">インデックスページへ戻る</a></div></header>`
            let mainFront = `<main>`
            let mainBack = `</main>`
            let footer = `<footer><div class="return-to-index"><a href="${basePage}">インデックスページへ戻る</a></div></footer>`
            let listLink = `<section id="list"><div><h3>リスト</h3><div>${
              maketable(
                markup
                .filter(e => e.active)
                .map(rly => [`<a href="?q=${dn}/${listDir}/${rly.path}">${rly.name}</a>`]),
                ``
              )
            }</div></div></section>`
            let text = rly.filter(e => e.text).map(e => e.contents).join(``)
            let doc = rly.filter(e => !e.text).map(e => e.contents).join(``)
            return [header + mainFront + text + listLink + doc + mainBack + footer, title]
          })
        }
        else {
          console.error(message.failedToFetchingReadme)
          return false
        }
        async function createHTML(src) {
          src
          .shift(1)
          let middleArray = []
          let i = 0
          let j = 0
          let prevJ = -1
          let closeSection = 0
          let existHeading = false
          return new Promise(resolve => {
            let ep = 1
            fn()
            function fn() {
              new Promise(resolve => {
                if (j !== prevJ) {
                  middleArray[j] = {}
                }
                prevJ = j
                middleArray[j].text = src[i].text
                if (!existHeading && src[i].elemType !== `heading`) {
                  src[i].headingLv = 1
                }
                resolve(middleArray)
              })
              .then(rly => {
                middleArray[j].contents = ``
                if (i === 0 && src[i].elemType !== `heading`) {
                  rly[j].contents += `<section>`
                  return rly
                }
                if (src[i].elemType === `listItem`) {
                  return new Promise(resolve => {
                    if (
                      i === 0
                      ||
                      (
                        i > 0
                        &&
                        src[i - 1].elemType !== `listItem`
                      )
                    ) {
                      rly[j].tableElem = []
                      rly[j].dataType = ``
                    }
                    resolve(rly)
                  })
                  .then(rly => {
                    if (src[i].text) {
                      rly[j].dataType = `text`
                      if (
                        (
                          i < src.length - 1
                          &&
                          src[i + 1].elemType !== `listItem`
                        )
                        ||
                        (
                          i === src.length - 1
                        )
                      ) {
                        rly[j].tableElem.push([``, src[i].name].concat(src[i].count))
                      }
                      else {
                        rly[j].tableElem.push([ep, `<a href="${basePage}?q=${dn}/${src[i].path}">${src[i].contents}</a>`].concat(src[i].count))
                      }
                      ep++
                    }
                    else {
                      rly[j].dataType = `nonText`
                      rly[j].tableElem.push([`<a href="${basePage}?q=${dn}/${src[i].path}">${src[i].contents}</a>`])
                    }
                    return rly
                  })
                }
                if (src[i].elemType === `paragraph`) {
                  rly[j].contents += `<p>${src[i].contents}</p>`
                  return rly
                }
                if (src[i].elemType === `heading`) {
                  existHeading = true
                  rly[j].contents += `<section><div><h${src[i].headingLv}>${src[i].contents}</h${src[i].headingLv}><div>`
                  return rly
                }
              })
              .then(rly => {
                if (i < src.length - 1 && src[i + 1].elemType === `heading`) {
                  let diff = src[i].headingLv - src[i + 1].headingLv
                  closeSection -= diff
                  if (diff >= 0) {
                    rly[j].contents += `</div>` + `</div></section>`.repeat(diff + 1)
                  }
                }
                if (i === src.length - 1) {
                  rly[j].contents += `</div>` + `</div></section>`.repeat(-closeSection)
                }
                return rly
              })
              .then(rly => {
                if (i < src.length - 1) {
                  if (
                    src[i].elemType !== `listItem`
                    ||
                    (
                      src[i].elemType === `listItem`
                      &&
                      src[i + 1].elemType !== `listItem`
                    )
                  ) {
                    j++
                  }
                  i++
                  fn()
                }
                else {
                  resolve(rly)
                }
              })
            }
          })
          .then(async rly => {
            rly[
              rly
              .map(e => e.dataType)
              .indexOf(`text`)
            ].contents = await maketable(
              rly[
                rly
                .map(e => e.dataType)
                .indexOf(`text`)
              ]
              .tableElem,
              textHeadingInCover,
              textTableClass
            ) + rly[
              rly
              .map(e => e.dataType)
              .indexOf(`text`)
            ].contents
            return await Promise.all(
              rly
              .map(async e => {
                if (e.dataType === `nonText`) {
                  e.contents = await maketable(e.tableElem, ``, docTableClass) + e.contents
                }
                return e
              })
            )
          })
        }
        async function procIndex(indexContents) {
          let indexArray = indexContents
          .replace(/^# .*\r?\n/, ``)
          .split(/\r?\n/)
          let propArray = await determinProp(indexArray)
          let getheringText = ``
          return await assyElem(indexArray)
          .then(async rly => countText(rly))
          .then(async rly => {
            let textPos = rly.map(e => e.text).lastIndexOf(true)
            rly
            .splice(
              textPos + 1,
              0,
              {
                "fieldType": `toc`,
                "elemType": `listItem`,
                "text": true,
                "headingLv": rly[textPos].headingLv,
                "name": `<span>合</span>計`,
                "path": ``,
                "count": await wordcountWrapper(getheringText)
              }
            )
            return rly
          })
          async function countText(indexBlobArray) {
            return Promise.all(
              indexBlobArray
              .filter(e => e.elemType === `listItem` && e.text)
              .map(e => {
                return fetch(`${baseURL}/${e.path}`)
                .then(async rly => {
                  if (rly.ok) {
                    let text = await rly.text()
                    e.count = await wordcountWrapper(text)
                    getheringText += text
                    return e
                  }
                  else {
                    e.count = 0
                    return e
                  }
                })
              })
            )
            .then(rly => {
              let i = 0
              return indexBlobArray
              .map(e => {
                if (e.elemType === `listItem` && e.text) {
                  e.count = rly[i].count
                  i++
                }
                return e
              })
            })
          }
          async function assyElem(indexArray) {
            let prevHeadingLv = 0
            return (
              await Promise.all(
                indexArray
                .map(async (e, i) => {
                  let w = {}
                  w.fieldType = propArray[i].fieldType
                  w.elemType = propArray[i].elemType
                  w.text = propArray[i].text
                  // 目次のリストアイテム
                  if (w.fieldType === `toc` && w.elemType === `listItem`) {
                    w.path = e.match(/^(?:[\-+*] )(.*?)(?=[ \t]*[:：])/)[1]
                    w.contents = e.match(/^(?:.*?:[ \t]*)(.*)/)[1]
                    w.headingLv = prevHeadingLv
                  }
                  // 目次以外のコンテンツ
                  if (w.fieldType === `nonToc`) {
                    w.contents = e
                  }
                  // 見出し
                  if (w.elemType === `heading`) {
                    w.headingLv = prevHeadingLv = e.match(/^#+/)[0].length
                    w.contents = e.match(/^(?:#+ )(.*)/)[1]
                  }
                  // 段落
                  if (w.elemType === `paragraph` || w.elemType === false) {
                    w.headingLv = prevHeadingLv
                  }
                  return w
                })
              )
            ).filter(e => e.elemType)
          }
          async function determinProp(indexArray) {
            let propArray = []
            let i = 0
            let inToc = false
            let inText = false
            let reToc0 = new RegExp(`^(?<sharp>#+) (${tocHeadingInIndex})`)
            let reText0 = new RegExp(`^(?<sharp>#+) (${textHeadingInIndex})`)
            let tocSharp = Math.min(
              ...indexArray
              .map(e => {
                if (reToc0.test(e)) {
                  return e
                  .match(reToc0)[0]
                  .match(/^#+/)[0]
                  .length
                }
              })
              .filter(e => e)
            )
            let reHeadingToc = new RegExp(`^#{${tocSharp}} (${tocHeadingInIndex})`)
            let reHeadingNonToc = new RegExp(`^#{1,${tocSharp}} (?!.*(${tocHeadingInIndex})).*`)
            let textSharp = Math.min(
              ...indexArray
              .map(e => {
                if (reText0.test(e)) {
                  return e
                  .match(reText0)[0]
                  .match(/^#+/)[0]
                  .length
                }
              })
              .filter(e => e)
            )
            let reText1 = new RegExp(`^#{${textSharp}} (${textHeadingInIndex})`)
            let reNonText = new RegExp(`^#{1,${textSharp}} (?!.*(${textHeadingInIndex}))(?!.*(${rejectHeadingInIndex})).*`)
            return new Promise(resolve => {
              fn()
              function fn() {
                /*
                  field type // 目次ブローブか否か
                */
                // 目次
                if (reHeadingToc.test(indexArray[i])) {
                  inToc = true
                  propArray[i] = {}
                  propArray[i].fieldType = `toc`
                }
                // 目次以外
                if (reHeadingNonToc.test(indexArray[i])) {
                  inToc = false
                  propArray[i] = {}
                  propArray[i].fieldType = `nonToc`
                }
                // 前のタイプを継承
                if (
                  i > 0
                  &&
                  !reHeadingToc.test(indexArray[i])
                  &&
                  !reHeadingNonToc.test(indexArray[i])
                ) {
                  propArray[i] = {}
                  propArray[i].fieldType = propArray[i - 1].fieldType
                }
                // 最初の行で目次の見出しでない
                if (
                  i === 0
                  &&
                  !reHeadingToc.test(indexArray[i])
                  &&
                  !reHeadingNonToc.test(indexArray[i])
                ) {
                  propArray[i] = {}
                  propArray[i].fieldType = `nonToc`
                }
                /*
                  element type // 見出し、リストアイテム、段落
                */
                // 見出し
                if (/^#+ .+/.test(indexArray[i])) {
                  propArray[i].elemType = `heading`
                }
                // リストアイテム
                if (inToc && /^[\-+*] .+/.test(indexArray[i])) {
                  propArray[i].elemType = `listItem`
                }
                // 段落
                if (
                  !/^#+ .+/.test(indexArray[i])
                  &&
                  !/^[\-+*] .+/.test(indexArray[i])
                  &&
                  !/^$/.test(indexArray[i])
                ) {
                  propArray[i].elemType = `paragraph`
                }
                if (/^$/.test(indexArray[i])) {
                  propArray[i].elemType = false
                }
                /*
                  text // 本文ブローブか否か
                */
                // 本文ブローブ
                  if (reText1.test(indexArray[i])) {
                  propArray[i].text = true
                  inText = true
                }
                // 非本文ブローブ
                if (reNonText.test(indexArray[i])) {
                  propArray[i].text = false
                  inText = false
                }
                // 本文ブローブの継承
                if (
                  !reText1.test(indexArray[i])
                  &&
                  !reNonText.test(indexArray[i])
                ) {
                  propArray[i].text = inText
                }
                /*
                  repeat or resolve
                */
                if (i < indexArray.length - 1) {
                  i++
                  fn()
                }
                else {
                  resolve(propArray)
                }
              }
            })
          }
        }
      })
    }
  }
  /*
   ########    ########    ##     ##    ########
      ##       ##           ##   ##        ##
      ##       ##            ## ##         ##
      ##       ######         ###          ##
      ##       ##            ## ##         ##
      ##       ##           ##   ##        ##
      ##       ########    ##     ##       ##
  */
  if (q && reTextPage.test(q)) {
    html.classList.add(`doc`)
    // change page mode to `text`
    let dirAndFile = q.match(/(?:^.*?\/)(.+)$/)[1]
    let fileType = ``
    if (/\.md$/.test(dirAndFile)) {
      fileType = `markdown`
      html.classList.add(`markdown`)
    }
    else if (/\.ya?ml$/.test(dirAndFile)) {
      fileType = `yaml`
      html.classList.add(`yaml`)
    }
    else {
      fileType = `text`
      html.classList.add(`text`)
    }
    // display text page
    let outputText = ``
    genTextPage(dirAndFile)
    .then(rly => {
      // insert text content to page
      activeContainer.innerHTML = rly[0]
      document.querySelector(`title`).innerText = rly[1]
      // get window height
      getContentsSize()
      getScrollValue()
      // get variable `textArea` for display text for copy
      textArea = document.querySelector(`#text-area`)
      if (fileType === `text`) {
        setContentsHeight(false)
        /*
          take charge of page operations
        */
        // get element
        let bracketModeSelector = document.querySelectorAll(`[name="bracket-mode"]`)
        let rubyModeSwitch = document.querySelectorAll(`[name="ruby-mode"]`)
        let newLineModeSwitch = document.querySelectorAll(`[name="new-line-mode"]`)
        let orientationModeSwitch = document.querySelector(`[name="orientation-mode"]`)
        let textSelectButton = document.querySelector(`[name="text-select"]`)
        let infoContentsSwitch = document.querySelectorAll(`[name="info-contents"]`)
        /*

          apply variable to optional value at UI

        */
        bracketModeSelector.forEach(rly => {
          rly.checked = bracketMode === rly.value ? true : false
        })
        rubyModeSwitch.forEach(rly => {
          rly.checked = rubyMode === rly.value ? true : false
        })
        newLineModeSwitch.forEach(rly => {
          rly.checked = newLineMode === rly.value ? true : false
        })
        if (orientationMode === `horizontal`) {
          orientationModeSwitch.checked = false
        }
        else {
          orientationModeSwitch.checked = true
          html.classList.add(`vertical`)
        }
        infoContentsSwitch.forEach(rly => {
          rly.checked = infoContents === rly.value ? true : false
        })
        /*

          apply optional value at UI to variable, and display results

        */
        bracketModeSelector.forEach(rly => {
          rly.onchange = async () => {
            bracketMode = rly.checked === true ? rly.value : false
            textArea.innerHTML = textForCopy = await novelparse({
              "src": await brackettool(await brackettool(text, marksPreposition, `delete-together`, `hole`, ``, beforeNum, afterNum), marksEnclosure, bracketMode, `hole`, ``, beforeNum, afterNum),
              "newLineMode": newLineMode,
              "rubyMode": rubyMode,
              "parenthesis": `normal`,
              "comment": `delete-together`
            })
            getContentsSize()
            getScrollValue()
          }
        })
        rubyModeSwitch.forEach(rly => {
          rly.onchange = async () => {
            rubyMode = rly.checked === true ? rly.value : false
            textArea.innerHTML = textForCopy = await novelparse({
              "src": await brackettool(await brackettool(text, marksPreposition, `delete-together`, `hole`, ``, beforeNum, afterNum), marksEnclosure, bracketMode, `hole`, ``, beforeNum, afterNum),
              "newLineMode": newLineMode,
              "rubyMode": rubyMode,
              "parenthesis": `normal`,
              "comment": `delete-together`
            })
            getContentsSize()
            getScrollValue()
          }
        })
        newLineModeSwitch.forEach(rly => {
          rly.onchange = async () => {
            newLineMode = rly.checked === true ? rly.value : false
            textArea.innerHTML = textForCopy = await novelparse({
              "src": await brackettool(await brackettool(text, marksPreposition, `delete-together`, `hole`, ``, beforeNum, afterNum), marksEnclosure, bracketMode, `hole`, ``, beforeNum, afterNum),
              "newLineMode": newLineMode,
              "rubyMode": rubyMode,
              "parenthesis": `normal`,
              "comment": `delete-together`
            })
            getContentsSize()
            getScrollValue()
          }
        })
        orientationModeSwitch.onchange = async () => {
          orientationMode = orientationModeSwitch.checked === false ? `horizontal` : `vertical`
          if (orientationModeSwitch.checked === false) {
            orientationMode = `horizontal`
            html.classList.remove(`vertical`)
          }
          else {
            orientationMode = `vertical`
            html.classList.add(`vertical`)
          }
          getContentsSize()
          getScrollValue()
        }
        infoContentsSwitch.forEach(rly => {
          rly.onchange = () => {
            infoContents = rly.checked === true ? rly.value : false
          }
        })
        let preArea = document.querySelector(`#pre-area`)
        textSelectButton.onclick = async () => {
          preArea.innerHTML = await getCopyContents()
          preArea.classList.add(`display`)
          let selectRange = document.createRange()
          selectRange.setStart(preArea, 0)
          selectRange.setEnd(preArea, preArea.childNodes.length)
          document.getSelection().removeAllRanges()
          document.getSelection().addRange(selectRange)
          preArea.onclick = () => {
            preArea.classList.remove(`display`)
          }
          preArea.oncopy = () => {
            setTimeout(() => {
              preArea.classList.remove(`display`)
            }, 1)
          }
          async function getCopyContents() {
            return await fetch(`${textDir}/${infoContentsDir.template}/${infoContentsFile[infoContents]}`)
            .then(async rly => {
              let w = await rly.text()
              let dnFront = dn.replace(/\d+$/, ``)
              let fileNamePrefix = ``
              let conversionTable = {
                "title": title,
                "episode_num": currNum + 1,
                "subtitle": subtitle,
                "description": await description(),
                "link_url": `https://satsuki.me/index.html?q=${dn}/${dirAndFile}`,
                "text_follow_option": textFollowOption(),
                "text_no_ruby": await textNoRuby(),
                "text_length": (await textLength()).total
              }
              conversionTable[dnFront] = dn
              async function description() {
                if (/\$description/.test(w)) {
                  return await fetch(`${textDir}/${infoContentsDir.description}/${fileNamePrefix}${infoContentsFile[infoContents]}`).then(async rly => await rly.text())
                }
                else {
                  return false
                }
              }
              function textFollowOption() {
                if (/\$text_follow_option/.test(w)) {
                  return textForCopy.replace(/(<\/p>[\s\S]*?<p>)/g, `\n`).replace(/<br>/g, ``).replace(/<.*?>/g, ``)
                }
                else {
                  return false
                }
              }
              async function textNoRuby() {
                if (/\$text_no_ruby/.test(w)) {
                  return (await novelparse({"src": await brackettool(await brackettool(text, marksPreposition, `delete-together`), marksEnclosure, `delete`, `normal`, `delete-together`)}))
                  .replace(/(<\/p>[\s\S]*?<p>)/g, `\n`).replace(/<br>/g, ``).replace(/<.*?>/g, ``)
                }
                else {
                  return false
                }
              }
              async function textLength() {
                if (/\$text_length/.test(w)) {
                  return await wordcount(await brackettool(await brackettool(text, marksPreposition, `delete-together`), marksEnclosure, `delete`))
                }
                else {
                  return false
                }
              }
              for (let i in Object.keys(conversionTable)) {
                let re = new RegExp(`\\$${Object.keys(conversionTable)[i]}(?=\\r|\\n|$|[^\\d\\w_])`, `g`)
                w = w.replace(re, `${conversionTable[Object.keys(conversionTable)[i]]}`)
              }
              return w
            })
          }
        }
      }
      //
      /*
        manipulate scroll matter

      */
      if (PrevOp === localStorage.getItem(`PrevOp`) && PrevFile === localStorage.getItem(`PrevFile`)) {
        document.scrollingElement.scrollTop = Number(localStorage.getItem(`scrollValueY`) || null)
        activeContainer.scrollLeft = Number(localStorage.getItem(`scrollValueX`) || null)
        scrollRange = Math.floor(htmlHeight - windowHeight)
      }
      /*
        set optional value

      */
      window.addEventListener(`unload`, () => {
        localStorage.setItem(`bracketMode`, bracketMode)
        localStorage.setItem(`rubyMode`, rubyMode)
        localStorage.setItem(`newLineMode`, newLineMode)
        localStorage.setItem(`orientationMode`, orientationMode)
        localStorage.setItem(`infoContents`, infoContents)
        localStorage.setItem(`PrevOp`, PrevOp)
        localStorage.setItem(`PrevFile`, PrevFile)
      })
    })
    function genTextPage(file) {
      let message = {
        "failedToFetchingFile": "本文ファイルの取得に失敗しました。"
      }
      let controlPanel = {
        "text":
          `<aside class="control-panel">
            <div class="switch-set bracket-mode">
              <span class="heading">編集用括弧</span>
              <label><input type="radio" name="bracket-mode" value="delete" checked><span class="label">削除</span></label>
              <label><input type="radio" name="bracket-mode" value="contents"><span class="label">ハイライト</span></label>
            </div>
            <div class="switch-set ruby-mode">
              <span class="heading">ルビ</span>
              <label><input type="radio" name="ruby-mode" value="parse" checked><span class="label">解釈</span></label>
              <label><input type="radio" name="ruby-mode" value="open"><span class="label">開く</span></label>
              <label><input type="radio" name="ruby-mode" value="raw"><span class="label">非解釈</span></label>
              <label><input type="radio" name="ruby-mode" value="delete"><span class="label">削除</span></label>
            </div>
            <div class="switch-set new-line-mode">
              <span class="heading">改行</span>
              <label><input type="radio" name="new-line-mode" value="few" checked><span class="label">減少</span></label>
              <label><input type="radio" name="new-line-mode" value="paper"><span class="label">紙書</span></label>
              <label><input type="radio" name="new-line-mode" value="raw"><span class="label">不変</span></label>
            </div>
            <div class="switch-set orientation-mode">
              <label><input type="checkbox" name="orientation-mode"><span class="label">縦</span></label>
            </div>
            <div class="switch-set text-select">
              <input type="button" name="text-select" value="本文選択">
              <label><input type="radio" name="info-contents" value="normal"><span class="label">通常</span></label>
              <label><input type="radio" name="info-contents" value="x"><span class="label">X</span></label>
              <label><input type="radio" name="info-contents" value="line-tori"><span class="label">とり</span></label>
              <label><input type="radio" name="info-contents" value="line-saejima"><span class="label">さえ</span></label>
            </div>
          </aside>`,
        "markdown": ``,
        "yaml": ``
      }
      PrevOp = dn
      PrevFile = file
      return fetch(`${baseURL}/${file}`)
      .then(async rly => {
        if (rly.ok) {
          let prevLink = ``
          let nextLink = ``
          text = (await rly.text())
          if (fileType === `markdown`) {
            outputText = await replacetool(await fetch(`lib/common/markup-special-notation.json`).then(async rly => await rly.json()), await mdparse(text, {"permissive": true, "section": true}))
          }
          else if (fileType === `yaml`) {
            outputText = await replacetool(await fetch(`lib/common/markup-special-notation.json`).then(async rly => await rly.json()), (await yamlparse(text))[0])
          }
          else {
            let w0 = await brackettool(text, marksPreposition, `delete-together`, `hole`, ``, beforeNum, afterNum)
            let w1 = await brackettool(w0, marksEnclosure, bracketMode, `hole`, ``, beforeNum, afterNum)
            outputText = textForCopy = await novelparse({
              "src": w1,
              "newLineMode": newLineMode,
              "rubyMode": rubyMode,
              "parenthesis": `normal`,
              "commnet": `delete-together`
            })
          }
          return getAdditionalInformation()
          .then(rly => {
            subtitle = rly[0][1]
            if (rly[1] !== false) {
              prevLink = `<a href="${basePage}?q=${dn}/${rly[1][0]}">${rly[1][1]}</a>`
            }
            else {
              prevLink = `なし`
            }
            if (rly[2] !== false) {
              nextLink = `<a href="${basePage}?q=${dn}/${rly[2][0]}">${rly[2][1]}</a>`
            }
            else {
              nextLink = `なし`
            }
            let relationLink = `<nav><div class="left">${prevLink}</div><div class="center"><span class="nav-separater">|</span><a href="${basePage}?q=${dn}">表紙</a><span class="nav-separater">|</span></div><div class="right">${nextLink}</div></nav>`
            let main = `<main id="text-area">${outputText}</main>`
            let header = `<header><p class="context-level-1">${rly[3]}</p><h1>${rly[0][1]}</h1><p>文字数<span class="rot">:</span><span class="rot"> </span><span class="char-num">${rly[4][0]}</span></p>${relationLink}</header>`
            let footer = `<footer>${relationLink}<p>文字数<span class="rot">:</span><span class="rot"> </span><span class="char-num">${rly[4][0]}</span></p></footer>`
            let preArea = `<pre id="pre-area"></pre>`
            return [header + main + footer + controlPanel[fileType] + preArea, title]
          })
        }
        else {
          console.error(message.failedToFetchingFile)
          return false
        }
      })
      function getAdditionalInformation() {
        return fetch(`${baseURL}/${indvIndexFile}`)
        .then(async rly => {
          if (rly.ok) {
            let readme = await rly.text()
            let tocOrigin = readme
            .match(reTocBlob)[0]
            .match(/([*+\-] |\d+\. ).+/g)
            .map(e => e.replace(/([*+\-] |\d+\. )/, ``))
            let tocArray = tocOrigin
            .map(rly => {return [
              rly.match(/^.+?(?=[ \t]*[:：]|$)/)[0],
              rly.match(/(?:[:：][ \t]*)([^ ].*)$/)[1]
            ]})
            title = readme.match(/(?:# )(.*)/)[1]
            let prevEps = 0
            let nextEps = 0
            for (let i in tocArray) {
              if (tocArray[i][0] === file) {
                currNum = Number(i)
              }
            }
            if (currNum > 0) {
              prevEps = tocArray[currNum - 1]
            }
            else {
              prevEps = false
            }
            if (currNum < tocArray.length - 1) {
              nextEps = tocArray[currNum + 1]
            }
            else {
              nextEps = false
            }
            return [[tocArray[currNum][0] ,`第${currNum + 1}話 ${tocArray[currNum][1]}`], prevEps, nextEps, title]
          }
          else {
            console.error(message.failedToFetchingFile)
            return false
          }
        })
        .then(async rly => {
          return await rly.concat([
            await wordcountWrapper(text)
          ])
        })
      }
    }
  }
  /*
   ##          ####     ######     ########
   ##           ##     ##    ##       ##
   ##           ##     ##             ##
   ##           ##      ######        ##
   ##           ##           ##       ##
   ##           ##     ##    ##       ##
   ########    ####     ######        ##
  */
   let reListURL = new RegExp(`${dn}/list/`)
   if (q && reListURL.test(q)) {
    reListURLs
    .then(rly => {
      if (q && rly.test(q)) {
        let targetPage = markup
        .filter(e => e.active)
        .filter(e => e.path === q.match(/([^/]*)$/)[0])[0]
        displayList(targetPage)
        document.querySelector(`title`).innerText = targetPage.contents
        async function displayList(arg) {
          let mark = arg.mark || []
          let type = arg.markupType || ``
          let listName = arg.contents || ``
          let htmlClass = arg.var[0] || ``
          let tableClass = arg.var[1] || ``
          let tableID = arg.var[2] || ``
          let tableHeading = arg.var[3] || ``
          let prefix = Number(arg.var[4]) || 0
          let postfix = Number(arg.var[5]) || 0
          let pagination = arg.pagination || false
          let listPath = arg.path || ``

          html.classList.add(htmlClass)
          let indexContents = await fetch(`${baseURL}/${indvIndexFile}`)
          .then(async rly => {
            if (rly.ok) {
              return await rly.text()
            }
            else {
              return false
            }
          })
          let header = `<header><h1>${(indexContents.match(/# .*/))[0].replace(/^# /, ``)}</h1><h2>${listName}</h2><p class="return"><a href="?q=${dn}">戻る</a></p></header>`
          let footer = `<footer><p class="return"><a href="?q=${dn}">戻る</a></p></footer>`
          Promise.all(
            indexContents
            .match(reTextBlob)[0]
            .match(/(?:([\-+*]|\d+ \.) )(.+?)(?= *[:：])/g)
            .map(e => e.replace(/([\-+*]|\d+ \.) /, ``))
            .map(async (rly, i) => {
              return fetch(`${baseURL}/${rly}`)
              .then(async rly => {
                if (rly.ok) {
                  return [await rly.text(), i]
                }
                else {
                  return false
                }
              })
            })
          )
          .then(async rly => {
            if (pagination) {
              /*
               ######## ##    ##  ######  ##        #######   ######  ##     ## ########  ######## 
               ##       ###   ## ##    ## ##       ##     ## ##    ## ##     ## ##     ## ##       
               ##       ####  ## ##       ##       ##     ## ##       ##     ## ##     ## ##       
               ######   ## ## ## ##       ##       ##     ##  ######  ##     ## ########  ######   
               ##       ##  #### ##       ##       ##     ##       ## ##     ## ##   ##   ##       
               ##       ##   ### ##    ## ##       ##     ## ##    ## ##     ## ##    ##  ##       
               ######## ##    ##  ######  ########  #######   ######   #######  ##     ## ######## 
              */
              if (type === `enclosure`) {
                Promise.all(
                  rly
                  .map(rly => {
                    return [getMarkListForEnclosure(rly[0], mark, prefix, postfix), i]
                  })
                  .filter(rly => rly[0] !== ``)
                )
                .then(rly => {
                  Promise.all(
                    rly
                    .map(async rly => {
                      [
                        header + (
                          await Promise.all(
                            rly[0]
                            .filter(rly => rly.description[0] !== undefined)
                            .map(async rly => {
                              let tableContents = []
                              for (let i in rly.keyword) {
                                tableContents.push([rly.description[i]])
                              }
                              let partialHeader = `<section><h3>${rly.attribute}</h3>`
                              let partialMain = `<main>${await maketable(tableContents, ``, tableClass, tableID)}</main>`
                              let partialFooter = `</section>`
                              return partialHeader + partialMain + partialFooter
                            })
                          )
                        ).join(``) + footer,
                        rly[1]
                      ]
                    })
                  )
                  .then(rly => {
                    console.log(rly)
                  })
                })
              }
              /*
               ########  ########  ######## ########   #######   ######  #### ######## ####  #######  ##    ##
               ##     ## ##     ## ##       ##     ## ##     ## ##    ##  ##     ##     ##  ##     ## ###   ##
               ##     ## ##     ## ##       ##     ## ##     ## ##        ##     ##     ##  ##     ## ####  ##
               ########  ########  ######   ########  ##     ##  ######   ##     ##     ##  ##     ## ## ## ##
               ##        ##   ##   ##       ##        ##     ##       ##  ##     ##     ##  ##     ## ##  ####
               ##        ##    ##  ##       ##        ##     ## ##    ##  ##     ##     ##  ##     ## ##   ###
               ##        ##     ## ######## ##         #######   ######  ####    ##    ####  #######  ##    ##
              */
              if (type === `preposition`) {
                let contentsArray = await Promise.all(
                  rly
                  .map(async (rly, i) => {
                    return [await getMarkListForPreposition(rly[0], mark), i]
                  })
                  .filter(rly => rly[0] !== ``)
                )
                let href = `?q=${dn}/list/${listPath}`
                console.log(
                )
                let prev = Number(search.get(`page`)) === 1 ? `` : `<a href="${href}&page=${Number(search.get(`page`)) - 1}">前ページ</a>`
                let next = Number(search.get(`page`)) === contentsArray.length ? `` : `<a href="${href}&page=${Number(search.get(`page`)) + 1}">次ページ</a>`
                let separater = Number(search.get(`page`)) === 1 || Number(search.get(`page`)) === contentsArray.length ? `` : ` | `
                let paging = `<header><h2>第 ${contentsArray[Number(search.get(`page`)) - 1][1] + 1} 話</h2><p>ページ: ${search.get(`page`)} / ${contentsArray.length}</p><nav>${contentsArray.map((rly, i) => {
                  return (i !== Number(search.get(`page`)) - 1 ? `<a href="${href}&page=${rly[1] + 1}">${rly[1] + 1}</a>` : i + 1)
                }).join(` | `)}</nav><nav><p class="page">${prev}${separater}${next}</p></nav></header>`
                activeContainer.innerHTML = header + paging +
                `<main>
                  <ol>${contentsArray[Number(search.get(`page`)) - 1][0].map((e, i) => `<li><a href="#anchor${i}">${e[0]}</a></li>`).join(``)}</ol>
                  ${maketable(contentsArray[Number(search.get(`page`)) - 1][0].map((e, i) => [`<span id="anchor${i}" class="anchor"></span>${e[0]}`, e[1]]), tableHeading, tableClass, tableID)}
                </main>`
                + footer
              }
            }
            else {
              text = rly.join(``)
              if (type === `enclosure`) {
                activeContainer.innerHTML = header + (
                  await Promise.all(
                    (
                      await getMarkListForEnclosure(text, mark, prefix, postfix))
                      .filter(rly => rly.description[0] !== undefined)
                      .map(async rly => {
                        let tableContents = []
                        for (let i in rly.keyword) {
                          tableContents.push([rly.description[i]])
                        }
                        let partialHeader = `<section><h3>${rly.attribute}</h3>`
                        let partialMain = `<main>${await maketable(tableContents, ``, tableClass, tableID)}</main>`
                        let partialFooter = `</section>`
                        return partialHeader + partialMain + partialFooter
                      }
                    )
                  )
                ).join(``) + footer
              }
              if (type === `preposition`) {
                let contents = await getMarkListForPreposition(text, mark)
                activeContainer.innerHTML =
                `${header}
                <main>
                  <ol>${contents.map((e, i) => `<li><a href="#anchor${i}">${e[0]}</a></li>`).join(``)}</ol>
                  ${maketable(contents.map((e, i) => [`<span id="anchor${i}" class="anchor"></span>${e[0]}`, e[1]]), tableHeading, tableClass, tableID)}
                </main>
                ${footer}`
              }
            }
          })
          /*
           ######## ##    ##  ######  ##        #######   ######  ##     ## ########  ######## 
           ##       ###   ## ##    ## ##       ##     ## ##    ## ##     ## ##     ## ##       
           ##       ####  ## ##       ##       ##     ## ##       ##     ## ##     ## ##       
           ######   ## ## ## ##       ##       ##     ##  ######  ##     ## ########  ######   
           ##       ##  #### ##       ##       ##     ##       ## ##     ## ##   ##   ##       
           ##       ##   ### ##    ## ##       ##     ## ##    ## ##     ## ##    ##  ##       
           ######## ##    ##  ######  ########  #######   ######   #######  ##     ## ######## 
          */
          async function getMarkListForEnclosure(text, mark, prefix, postfix) {
            let singleLineText = text.replace(/\r|\n/g, ``)
            let keywordList = []
            let reBCISrc = Array.from(
              new Set(
                marksPreposition
                .map(rly => rly[1])
              )
            ).join(``)
            let promiseArray = []
            for (let i in mark) {
              keywordList[i] = {}
              let importedMark = [esc(mark[i][0][0]), esc(mark[i][0][1])]
              let reKeywordSrc = []
              reKeywordSrc.push(`${importedMark[0]}.*?${importedMark[1]}`)
              let reMarkSrc = []
              reMarkSrc.push(importedMark[0])
              reMarkSrc.push(importedMark[1])
              reMarkSrc = Array.from(new Set(reMarkSrc))
              let reKeyword = new RegExp(`(${reKeywordSrc.join(`|`)})`, `g`)
              let reMark = new RegExp(`${reMarkSrc.join('|')}`, `g`)
              let keywordSrc = Array.from(new Set((singleLineText.match(reKeyword)) || [``]))
              keywordList[i].keyword = Promise.all(
                keywordSrc.map(async rly => (await novelparse({"src": rly.replace(/^.|.$/g, ``), "newLineMode": `unprocessed`, "rubyMode": `parse`, "parenthesis": `normal`, "comment": `delete-together`})).replace(/　 /, ``)),
              )
              keywordList[i].description = Promise.all(
                keywordSrc
                .map(async rly => {
                  let reDescription = new RegExp(`.{0,${prefix}}${esc(rly)}.{0,${postfix}}(?:[^《]*?》)?`)
                  let reMarklessKeyword = new RegExp(`(?!\\{[^${esc(reBCISrc)}]*)(${esc(rly.replace(reMark, ``))})`)
                  let w0 = singleLineText
                  .match(reDescription)[0]
                  .replace(reMark, ``)
                  return (await novelparse({
                    "src": (await brackettool(await brackettool(w0, marksPreposition, `delete-together`), marksEnclosure, `delete`)).replace(reMarklessKeyword, `<span class="mark">$1</span>`),
                    "newLineMode": `unprocessed`,
                    "rubyMode": `parse`,
                    "parenthesis": `normal`,
                    "comment": `delete-together`
                  })).replace(/　 /, ``)
                })
              )
              Promise.all(
                keywordList[i].keyword,
                keywordList[i].description
              )
              .then(rly => {
                promiseArray.push(rly)
              })
              keywordList[i].attribute = mark[i][1]
            }
            return Promise.all(promiseArray)
            .then(rly => {
              return rly
              .map(rly, i => {
                rly += keywowrdList[i]
              })
            })
          }
          /*
           ########  ########  ######## ########   #######   ######  #### ######## ####  #######  ##    ## 
           ##     ## ##     ## ##       ##     ## ##     ## ##    ##  ##     ##     ##  ##     ## ###   ## 
           ##     ## ##     ## ##       ##     ## ##     ## ##        ##     ##     ##  ##     ## ####  ## 
           ########  ########  ######   ########  ##     ##  ######   ##     ##     ##  ##     ## ## ## ## 
           ##        ##   ##   ##       ##        ##     ##       ##  ##     ##     ##  ##     ## ##  #### 
           ##        ##    ##  ##       ##        ##     ## ##    ##  ##     ##     ##  ##     ## ##   ### 
           ##        ##     ## ######## ##         #######   ######  ####    ##    ####  #######  ##    ## 
          */
          function getMarkListForPreposition(text, mark) {
            let reFilter = new RegExp(`${esc(mark[0])}.*?${esc(mark[1])}`)
            let markList = marksPreposition.reduce((a, c) => a.concat(c), [])
            let reRemoveMark = new RegExp(markList.join(`|`), `g`)
            let reRemoveMarkTogether = new RegExp(markList, `g`)
            let textArray = (
              (
                text
                .split(/\r?\n/)
                .filter(rly => reFilter.test(rly))
              ) || [``]
            )
            .map(rly => {
              return [
                rly
                .match(reFilter)[0]
                .replace(reRemoveMark, ``),
                rly
                .replace(reFilter, ``)
                .replace(reRemoveMarkTogether, ``)
                .replace(/^　/, ``)
              ]
            })
            return Promise.all(
              Array.from(new Set(textArray.map(rly => rly[0])))
              .map(async rly0 => {
                return [
                  rly0,
                  await novelparse({
                    "src": await brackettool(
                      await brackettool(
                        textArray
                        .filter(rly1 => rly1[0] === rly0)
                        .map(rly2 => rly2[1].replace(/^　*/, ``))
                        .join(`\n`),
                        marksPreposition,
                        `delete-together`
                      ),
                      marksEnclosure,
                      `delete`
                    ),
                    "newLineMode": `few`,
                    "rubyMode": `parse`,
                    "parenthesis": `normal`,
                    "comment": `delete-together`
                  })
                ]
              })
            )
          }
        }
      }
    })
  }




  /*
   ########    ##     ##    ##    ##     ######     ########    ####     #######     ##    ##
   ##          ##     ##    ###   ##    ##    ##       ##        ##     ##     ##    ###   ##
   ##          ##     ##    ####  ##    ##             ##        ##     ##     ##    ####  ##
   ######      ##     ##    ## ## ##    ##             ##        ##     ##     ##    ## ## ##
   ##          ##     ##    ##  ####    ##             ##        ##     ##     ##    ##  ####
   ##          ##     ##    ##   ###    ##    ##       ##        ##     ##     ##    ##   ###
   ##           #######     ##    ##     ######        ##       ####     #######     ##    ##
  */
  /*

    テキストページの文字数カウント

  */
  async function wordcountWrapper(src) {
    let kanjiRatio = `-`
    let kanaRatio = `-`
    let letterRatio = `-`
    let linesRatio = `-`
    return await wordcount(await novelparse({
      "src": await brackettool(await brackettool(src, marksPreposition, `delete-together`), marksEnclosure, `delete`),
      "newLineMode": `raw`,
      "rubyMode": `delete`,
      "parenthesis": `normal`,
      "comment": `delete-together`
    }))
    .then(rly => {
      if (rly.total > 0) {
        kanjiRatio = Math.round(rly.kanji / rly.total * 10)
        kanaRatio = 10 - kanjiRatio
        linesRatio = Math.round(rly.parenthesis / rly.total * 10)
        letterRatio = 10 - linesRatio
      }
      return [rly.total, `${kanaRatio} : ${kanjiRatio}`, `${letterRatio} : ${linesRatio}`, Math.round(rly.letterLength)]
    })
  }



  /*

    コンテンツサイズの調整

  */
  // 計測
  function getContentsSize() {
    htmlHeight = html.getBoundingClientRect().height
    scrollRange = Math.floor(htmlHeight - windowHeight)
  }
  function getScrollValue() {
    scrollValueY = document.scrollingElement.scrollTop
    scrollValueX = -(activeContainer.getBoundingClientRect().left - activeContainer.getBoundingClientRect().right + activeContainer.getBoundingClientRect().width)
  }

  // 設定
  function setContentsHeight(s) {
    if (s === `vertical`) {
      let padding = (htmlHeight - 600) / 2
      activeContainer.style.paddingTop = `${padding}px`
      activeContainer.style.paddingBottom = `${padding}px`
    }
    else {
      activeContainer.style.paddingTop = ``
      activeContainer.style.paddingBottom = ``
    }
  }



  /*

    メイクテーブル

  */
  function maketable(tbodyArray, theadArray, clss, id) {
    let insId = id ? ` id="${id}"` : ``
    let insClss = clss ? ` class="${clss}"` : ``
    let multiLines = (tbodyArray[0] instanceof Array || typeof tbodyArray[0] === `array`) ? true : false
    let theadExist = theadArray ? true : false
    let tbody = ``
    let thead = ``
    if (multiLines) {
      let tr = ``
      for (let tbItem of tbodyArray) {
        tr += `<tr><td>${tbItem.join(`</td><td>`)}</td></tr>`
      }
      tbody = `<tbody>${tr}</tbody>`
    }
    else {
      tbody = `<tbody><tr><td>${tbodyArray.join(`</td><td>`)}</td></tr></tbody>`
    }
    if (theadExist) {
      thead = `<thead><tr><th>${theadArray.join(`</th><th>`)}</th></tr></thead>`
    }
    return `<table${insId + insClss}>${thead + tbody}</table>`
  }



  /*

    エスケープ

  */
  function esc(r) {
    if (typeof r === "string" || r instanceof String) return p(r)
    else if (Array.isArray(r)) return r.map(r => p(r))
    else return r
    function p(r) {
      return r.replace(/(\/|\\|\^|\$|\*|\+|\?|\.|\(|\)|\[|\]|\{|\})/g, "\\$1")
    }
  }
  function unEsc(r) {
    if (typeof r === "string" || r instanceof String) return p(r)
    else if (Array.isArray(r)) return r.map(r => p(r))
    else return r
    function p(r) {
      return r.replace(/\\(\/|\\|\^|\$|\*|\+|\?|\.|\(|\)|\[|\]|\{|\})/g, "$1")
    }
  }



  /*

    ゼロフィル

  */
  function zeroFill(src, zeroDigits) {
    return (`0`.repeat(zeroDigits) + src).slice(-zeroDigits)
  }



  /*

    JSONを読めるように整形する

  */
  async function readableJSON(src) {
    let inQuote = false
    let JSONArray = src.split(`,`)
    let readableArray = []
    let indent = 0
    let i = 0
    return new Promise(resolve => {
      fn()
      function fn() {
        if (inQuote === false && JSONArray[i] === `"`) {
          inQuote = true
        }
        if (inQuote === true && JSONArray[i] === `"`) {
          inQuote = false
        }
        if (!inQuote && /\{|\[/.test(JSONArray[i])) {
          indent += 4
          readableArray.push(JSONArray[i] + `\n` + ` `.repeat(indent))
        }
        if (!inQuote && /\}|\]/.test(JSONArray[i])) {
          indent -= 4
          readableArray.push(`\n` + ` `.repeat(indent) + JSONArray[i])
        }
        if (!inQuote && JSONArray[i] === `,`) {
          readableArray.push(JSONArray[i] + `\n` + ` `.repeat(indent))
        }
        if (inQuote || (!inQuote && !/\{|\[|\}|\]|,/.test(JSONArray[i]))) {
          readableArray.push(JSONArray[i])
        }
        if (i < JSONArray.length - 1) {
          i++
          fn()
        }
        else {
          resolve(readableArray.join(``))
        }
      }
    })
  }


/*
  ######    ##   ##     #####     ######         ###    ##    ##    ##    ###    ###        ##          ######      ######
 ##         ##   ##    ##   ##    ##   ##        ####   ##    ##    ##    ####  ####        ##         ##    ##    ##
 ##         #######    #######    ######         ## ##  ##    ##    ##    ## #### ##        ##         ##    ##    ##   ###
 ##         ##   ##    ##   ##    ##   ##        ##  ## ##    ##    ##    ##  ##  ##        ##         ##    ##    ##    ##
  ######    ##   ##    ##   ##    ##   ##        ##   ####     ######     ##      ##        #######     ######      ######
*/
Promise.all([
  loadFilesOK,
  marksPOK,
  marksEOK
])
.then(() => {
  if (server === localSever) {
    let array = null
    characterCountLog()
    function characterCountLog() {
      let notFound = []



      /*
        ローカルストレージからの読み出し、または配列の初期化処理
      */
      array = localStorage.getItem(`characterCountLog`)
      if (characterCountLogInitializeSwitch) {
        localStorage.removeItem(`characterCountLog`)
        array = null
      }
      if (array !== null) {
        array = JSON.parse(array)
      }
      else {
        array = [
          {
            "date": ``,
            "textTotal": 0,
            "docTotal": 0,
            "textDiff": 0,
            "docDiff": 0,
            "writeDate": ``
          }
        ]
      }





      /*

        初回カウント実行

      */
      procCount()





      /*

        タイマーでカウント実行

      */
      hourly()
      // daily()





      /*

        アワリー

      */
      function hourly() {



      /*
        今
      */
        let now = new Date(Date.now())



        /*
          実行時間
        */
        let executionMinutes = 59 // 通常は 59 と設定しておく



        /*
          今時の実行までの時間
        */
        let timeToExecution =

        // 今時の実行日時
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours(),
          executionMinutes
        ).getTime()

        // 今の日時
        - now.getTime()



        /*
          次の 00 分の日時
        */
        let next = new Date(
          new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours()
          ).getTime()
          + 60 * 60 * 1000
        )



        /*
          次の実行までの時間
        */
        let timeToNextExecution =

        // 次の実行日時
        new Date(
          next.getFullYear(),
          next.getMonth(),
          next.getDate(),
          next.getHours(),
          executionMinutes
        ).getTime()

        // 今の日時
        - now.getTime()



        /*
          実際の実行までの時間
        */
        timeToExecution = timeToExecution > 0 ? timeToExecution : timeToNextExecution



        /*
          タイマー
        */
        setTimeout(() => {
          procCount()
          hourly()
        }, timeToExecution)
      }





      /*

        デイリー

      */
      function daily() {



        /*
          今
        */
        let now = new Date(Date.now())



        /*
          実行時間
        */
        let executionTime = `23:59` // 通常は 23:59 と設定しておく



        /*
          今日の実行までの時間
        */
        let timeToExecution =

        // 今日の実行日時
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          Number(executionTime.slice(0, 2).replace(/:/, ``)),
          Number(executionTime.slice(-2).replace(/:/, ``))
        ).getTime()

        // 今の日時
        - now.getTime()



        /*
          翌日の 00:00 の日時
        */
        let tomorrow = new Date(
          new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          ).getTime()
          + 60 * 60 * 24 * 1000
        )



        /*
          翌日の実行までの時間
        */
        let timeToTomorrowExecution =

        // 翌日の実行日時
        new Date(
          tomorrow.getFullYear(),
          tomorrow.getMonth(),
          tomorrow.getDate(),
          Number(executionTime.slice(0, 2).replace(/:/, ``)),
          Number(executionTime.slice(-2).replace(/:/, ``))
        ).getTime()

        // 今の日時
        - now.getTime()
        timeToExecution = timeToExecution > 0 ? timeToExecution : timeToTomorrowExecution



        /*
          タイマー
        */
        setTimeout(() => {
          procCount()
          daily()
        }, timeToExecution)
      }





      /*

        文字数カウンター本体

      */
      async function procCount() {



        /*
          インデックスの読み込みと、個別インデックスの処理
        */
        fetch(`${textDir}/${indexFile}`)
        .then(async rly => {
          if (rly.ok) {
            return Promise.all(
              (await rly.json())
              .map(e => {
                return fetch(`${textDir}/${e.dn}/${indvIndexFile}`)
                .then(async rly => {
                  if (rly.ok) {
                    let tocBlob = (await rly.text())
                    .match(reTocBlob)[0]
                    let textBlobArray = (tocBlob
                    .match(reTextBlob) || [false])
                    let docBlob = false
                    let sharpLen = 0
                    if (textBlobArray && textBlobArray[2] !== undefined) {
                      sharpLen = textBlobArray[2].length
                      docBlob = tocBlob
                      .replace(reTextBlob, ``)
                      .replace(reRejectBlob, ``)
                    }
                    else {
                      docBlob = tocBlob
                    }
                    return [
                      e.dn,
                      pickup(textBlobArray[0]),
                      pickup(docBlob)
                    ]
                    function pickup(blob) {
                      if (blob) {
                        return blob
                        .split(/\r?\n|\r(?!\n)/)
                        .map(e => (e.match(/^(?=[\-+*]|\d\.).*? (.*?)(?= *[:：])/) || [false, false])[1])
                        .filter(e => e)
                      }
                      else {
                        return false
                      }
                    }
                  }
                  else {
                    notFound.push(`${e.dn}/${indvIndexFile}`)
                    return false
                  }
                })
              })
            )
          }
          else {
            notFound.push(`${textDir}/${indexFile}`)
            return false
          }
        })



        /*
          ファイルの読み込みと、文字数カウント
        */
        .then(async rly => {
          let textLen = await Promise.all(
            rly
            .map(async e => await count(e[0], e[1], true))
          )
          .then(rly => rly.reduce((a, c) => a + c, 0))
          let docLen = await Promise.all(
            rly
            .map(async e => await count(e[0], e[2], false))
          )
          .then(rly => rly.reduce((a, c) => a + c, 0))
          return [textLen, docLen]
          function count(dn, dirAndFileArray, isText) {
            if (dirAndFileArray) {



              /*
                各ファイルの文章の処理
              */
              return Promise.all(
                dirAndFileArray
                .map(e => {
                  if (e) {

                    // 個別ファイルの処理
                    return fetch(`${textDir}/${dn}/${e}`)
                    .then(async rly => {
                      if (rly.ok) {
                        if (isText) {
                          return await novelparse({
                            "src": await brackettool(await brackettool(await rly.text(), marksPreposition, `delete-together`, `hole`, ``), marksEnclosure, `delete`, `hole`, ``),
                            "newLineMode": `raw`,
                            "rubyMode": `delete`
                          })
                        }
                        else {
                          return await rly.text()
                        }
                      }
                      else {
                        notFound.push(`${dn}/${e}`)
                        return false
                      }
                    })
                  }
                  else {
                    return false
                  }
                })
              )



              /*
                各ファイルの文字数の合計
              */
              .then(rly => {
                return rly
                .map(e => {
                  if (e) {
                    return e.replace(/[\s]/g, ``).length
                  }
                  else {
                    return 0
                  }
                })
                .reduce((a, c) => a + c, 0)
              })
            }
            else {
              return 0
            }
          }
        })



        /*
          集計その他
        */
        .then(rly => {
          let now = new Date(Date.now())
          let today = `${now.getFullYear()}-${zeroFill(now.getMonth() + 1, 2)}-${zeroFill(now.getDate(), 2)}`

          // 配列に同じ日の集計があれば削除する
          new Promise(resolve => {
            fn()
            function fn() {
              if (array.length > 0 && array[array.length - 1].date === today) {
                array.pop()
                fn()
              }
              else {
                resolve(array[array.length - 1])
              }
            }
          })

          // 集計結果を配列に追加
          .then(rly1 => {
            let writeDate = new Date(Date.now())
            array.push(
              {
                "date": today,
                "textTotal": rly[0],
                "docTotal": rly[1],
                "textDiff": rly[0] - rly1.textTotal,
                "docDiff": rly[1] - rly1.docTotal,
                "writeDate": `${writeDate.getFullYear()}-${zeroFill(writeDate.getMonth() + 1, 2)}-${zeroFill(writeDate.getDate(), 2)}T${zeroFill(writeDate.getHours(), 2)}:${zeroFill(writeDate.getMinutes(), 2)}:${zeroFill(writeDate.getSeconds(), 2)}UTC+9`
              }
            )

            // ローカルストレージへの書き込み
            localStorage.setItem(`characterCountLog`, JSON.stringify(array))

            // 書き出し
            if (!q) {
              write()
            }
          })
        })
      }



      /*
        書き出し
      */
      async function write() {
        let data = [[`<span>合</span>計`, array[array.length - 1].textTotal, array[array.length - 1].docTotal]]
        .concat(
          array
          .slice(0)
          .reverse()
          .splice(0, array.length - 2)
          .map(e => [e.date, e.textDiff, e.docDiff])
        )
        let notFoundAccum = ``
        if (notFound.length > 0) {
          notFoundAccum = `<section><ul><li>Not Found: ${notFound.join(`</li><li>Not found: `)}</li></ul></section>`
          notFoundField.classList.add(`not-found`)
        }
        characterCountLogTable.innerHTML = `<p>小説制作 文字数ログ</p>
        <div id="status-switch">
          <label><input type="radio" name="period-switch" value="d7" checked>7日</label>
          <label><input type="radio" name="period-switch" value="d30">30日</label>
          <label><input type="radio" name="period-switch" value="all">全期間</label>
        </div>
        <div>
          ${maketable(data, [`日付`, `本文`, `その他`], `d7`, `data-table`)}
        </div>`
        downloadButton = document.querySelector(`#download-button`)
        downloadButton.href = URL.createObjectURL(new Blob([await readableJSON(JSON.stringify(array))], {type: `text/plain`}))
        notFoundField.innerHTML += notFoundAccum
        let dataTable = document.querySelector(`#data-table`)
        document.querySelectorAll(`#status-switch input`).forEach(e => {
          e.onchange = () => {
            dataTable.classList = e.value
          }
        })
      }
    }





    /*

      文字数カウンターのデータのアップロード

    */
    if (!q) {
      uploadButton = document.querySelector(`#upload-button`)
      let fr = new FileReader()
      uploadButton.onchange = e => {
        if (e) {
          fr.readAsText(e.target.files[0])
        }
        fr.onload = () => {
          array = JSON.parse(fr.result)
          localStorage.setItem(`characterCountLog`, JSON.stringify(array))
          characterCountLog()
        }
      }
    }
  }
})





  /*
      ###        ######     ########    ####     #######     ##    ##
     ## ##      ##    ##       ##        ##     ##     ##    ###   ##
    ##   ##     ##             ##        ##     ##     ##    ####  ##
   ##     ##    ##             ##        ##     ##     ##    ## ## ##
   #########    ##             ##        ##     ##     ##    ##  ####
   ##     ##    ##    ##       ##        ##     ##     ##    ##   ###
   ##     ##     ######        ##       ####     #######     ##    ##
  */
  /*

    スクロール

  */
  let windowHeight = window.innerHeight
  window.onscroll = () => {
    getScrollValue()
  }
  document.onscroll = () => {
    getScrollValue()
  }
  window.addEventListener(`unload`, () => {
    localStorage.setItem(`scrollValueY`, scrollValueY)
    localStorage.setItem(`scrollValueX`, scrollValueX)
  })





  /*

    トップ

  */
  document.querySelector(`#return-to-top`).onclick = () => {
    document.scrollingElement.scroll({
      top: 0,
      left: 0,
      behavior: `smooth`
    })
  }
})





/*

  マウス操作

*/
window.addEventListener(`mousedown`, function(e0) {
  if (e0.button === 0) {
    let t = Date.now()
    window.addEventListener(`mousedown`, function(e1) {
      if (e1.button === 0 && Date.now() - t < 300) {
        location.reload()
      }
      else {
        return true
      }
    })
    return setTimeout(() => {
      return true
    }, 200)
  }
})





/*

  キー操作

*/
window.onkeydown = e => {
  if (e.code === `Enter`) {
    let bodyHeight = document.querySelector(`body`).getBoundingClientRect().height
    let scrollHeight = Math.ceil(bodyHeight - window.innerHeight)
    let scrollPos = document.scrollingElement.scrollTop
    let scrollTrg = 0
    scrollTrg =
    scrollPos === 0 ? scrollHeight + 100 :
    scrollPos < scrollHeight / 2 ? 0 :
    scrollPos >= scrollHeight / 2 && scrollPos !== scrollHeight ? scrollHeight + 1 :
    0
    document.scrollingElement.scroll({
      top: scrollTrg,
      left: 0,
      behavior: `smooth`
    })
  }
}
