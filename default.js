let srch= location.search.slice(1)
let host = location.hostname
let stgObj ={
  "loadCnt": {
    "yayoi-thyme.com": {
      "backHost": "raw.githubusercontent.com",
      "usrName": "yayoi-thyme",
      "siteRepo": "yayoi-thyme.github.io",
      "brch": "master",
      "defDoc": "novel.md",
      "urlHome": "/novel.html",
      "urlBase": "/view-opus.html"
    },
    "yayoi-thyme.c": {
      "backHost": "novel.c",
      "usrName": "",
      "siteRepo": "",
      "brch": "",
      "defDoc": "novel.md",
      "urlHome": "/novel.html",
      "urlBase": "/view-opus.html"
    },
    "novel.c": {
      "backHost": "novel.c",
      "usrName": "",
      "siteRepo": "",
      "brch": "",
      "defDoc": "novel.md",
      "urlHome": "?index.md",
      "urlBase": "/view-opus.html"
    }
  }
}
let backHost = stgObj['loadCnt'][host]['backHost']
let usrName = stgObj['loadCnt'][host]['usrName']
let siteRepo = stgObj['loadCnt'][host]['siteRepo']
let brch = stgObj['loadCnt'][host]['brch']
let defDoc = stgObj['loadCnt'][host]['defDoc']
let urlHome = stgObj['loadCnt'][host]['urlHome']
let urlBase = stgObj['loadCnt'][host]['urlBase']
if (backHost != '') {
  backHost = '//' + backHost
}
if (usrName != '') {
  usrName = '/' + usrName
}
if (siteRepo != '') {
  siteRepo = '/' + siteRepo
}
if (brch != '') {
  brch = '/' + brch
}
if (defDoc != '') {
  defDoc = '/' + defDoc
}
$(document).ready(function() {
  setUpLink()
  if ($('html').attr('class').match(/load-contents/g)) {
    loadCnt()
    setReturnLink()
  }
})
$(window).scroll(function() {
  let scrlAmnt = $(window).scrollTop()
  if (scrlAmnt > 0) {
    $('.up').fadeIn()
  } else if (scrlAmnt <= 0) {
    $('.up').fadeOut()
  }
})
$(window).resize(function() {
  setUpLink()
})
$(function() {
  $('.up button').on('click',function (e) {
    $('html, body').animate({scrollTop: 0}, 'fast')
  })
})
function loadCnt() {
  let dfr = $.Deferred()
  let lastProd = 0
  let fistSlsh = 0
  let lastSlsh = 0
  let ops = ''
  let url = ''
  let extn = ''
  let fileName = ''
  let now = $.now()
  setUrl(srch)
  .then(
    $.ajax({
      url: url + '?' + now,
      cache: false,
    })
    .done(function(data) {
      writeContents(data)
    })
    .fail(function() {
      
    })
  )
  function setUrl() {
    let dfr = $.Deferred()
    lastProd = srch.lastIndexOf('.')
    fistSlsh = srch.indexOf('/')
    lastSlsh = srch.lastIndexOf('/')
    ops = '/' + srch.slice(fistSlsh + 1, lastSlsh - fistSlsh)
    fileName = '/' + srch.slice(lastSlsh + 1)
    if (srch.length === 0) {
      extn = 'md'
      url = backHost + usrName + siteRepo + brch + defDoc
      dfr.resolve(url)
    } else {
      extn = srch.slice(lastProd + 1)
      url = backHost + usrName + ops + brch + fileName
      dfr.resolve(url)
    }
    return dfr.promise()
  }
  function writeContents(data) {
    if (extn === 'txt') {
    // Text
      let word = keyWrdRpl(mdparse(rubyParser(data)))
      let wrdLen = data.replace(/([\s\t]*#.*?\r?\n|[\s\t]*\*.*|\r?\n|　)/g, '').replace(/｜(.*?)《.*?》/g, '$1').length
      let insTxt = ''
      let elmArr = []
      let stoNmb = Number(srch.slice(lastSlsh + 1, lastProd))
      $('html').addClass('narou')
      $('div#novel_no').append(stoNmb + '/???')
      $('div#novel_honbun').append(word)
      if (data.indexOf('# ') > -1) {
        let subtitle = data.match(/^#\s.*/)[0].replace(/#\s*/, '')
        $('p.novel_subtitle').append(subtitle)
      }
      $('#info').append('<p class="number">文字数：' + wrdLen + '文字</p>')
      prvNextLink(stoNmb)
    } else if (extn === 'html') {
    // HTML
      let word = keyWrdRpl(data)
      $('html').addClass('html')
      $('.html.contents-container').append(word)
      $('title').empty().append(decodeURI(text))
      $('.title').append(decodeURI(text))
    } else if (fileName === '/README.md') {
    // README.md
    console.log('aa')
      let word = keyWrdRpl(rubyParser(marked(data).replace(/href="(.*?)"/g, 'href="?' + ops + '/$1"')))
      $('html').addClass('markdown')
      $('.markdown.contents-container').append(marked(word))
    } else if (extn === 'md') {
    // Markdown
      let word = keyWrdRpl(rubyParser(marked(data)))
      $('html').addClass('markdown')
      $('.markdown.contents-container').append(marked(word))
    } else {
    // Another
      let word = data
      $('.another.contents-container').append(word)
    }
    dfr.resolve()
    function prvNextLink(stoNmb) {
      $.ajax({
        url: backHost + usrName + ops + brch + '/README.md',
        dataType: 'text',
      })
      .done(function(data) {
        let epsArr = data.replace(/#{1,6}[\s\S]*?#{1,6} 本文\n([\s\S]*?)(\n\n|#|$)/g, '$1')
                          .replace(/^[\s]*[*+-] .*?\(\s*?([^\s].*?)\)$/gm, '$1')
                          .replace(/\n$/g, '')
                          .split('\n')
        let epsObj = {}
        for (var i = epsArr.length - 1; i >= 0; i--) {
          epsObj[Number(epsArr[i].match(/\d+/)[0])] = [ epsArr[i].match(/^[^\d]*/)[0], epsArr[i].match(/[^\d]*$/)[0]]
        }
        let crrEps = Number(fileName.match(/\d+/)[0])
        let prvLnk = ''
        let nxtLnk = ''
        if (epsObj[crrEps - 1]) {
          $('a.prev').attr('href', '?' + ops + '/' + epsObj[crrEps - 1][0] + ('000' + (crrEps - 1)).slice(-3) + epsObj[crrEps - 1][1])
          $('a.prev').css('display', 'initial')
        }
        if (epsObj[crrEps + 1]) {
          $('a.next').attr('href', '?' + ops + '/' + epsObj[crrEps + 1][0] + ('000' + (crrEps + 1)).slice(-3) + epsObj[crrEps + 1][1])
          $('a.next').css('display', 'initial')
        }
      })
      .fail(function() {
        console.log("error")
      })
      .always(function() {
      })
    }
  }
  function rubyParser(data) {
                   /* | ------------ルビとは無関係------------| */
    let word = data.replace(/(^[\s\t]*#.*|[\s\t]*\*.*)/g, '').replace(/｜([^（]+?)《(.+?)》/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/([\u4E00-\u9FFF]+?)（(.*?)）/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/｜(（.*?）)/g, '$1')
    return word
  }
  function keyWrdRpl(data) {
    let wrdLstRpl = [
                              ["\\{", '<span style="font-size: 50%; color: #999;">{</span><span>'],
                              ["\\}", '</span><span style="font-size: 50%; color: #999;">}</span>'],
                              ["(?<=\{)g(?=\})", '<span style="font-size: 50%; color: #00d;">いいところ</span>'],
                              ["(?<=\{)b(?=\})", '<span style="font-size: 50%; color: #d00;">わるいところ</span>'],
                              ["ｘ", '<span style="font-weight: bold; color: #cc0;">やめ</span>']
                            ]
    let wrdLst_hide = ["_summary_", "_gist_"]
    let wrdLstRpl_len = 0
    let wrk1 = data
    for (let i in wrdLstRpl) {
      wrdLstRpl_len++
    }
    for (let i = wrdLstRpl_len - 1; i >= 0; i--) {
      let rgxp = new RegExp('wrdLstRpl[i][0]', 'g')
      wrk1 = wrk1.replace(rgxp, wrdLstRpl[i][1])
    }
    for (let i = wrdLst_hide.length - 1; i >= 0; i--) {
      wrk1 = wrk1.replace(new RegExp(wrdLst_hide[i], 'g'), '<span class="hide">' + wrdLst_hide[i] + '</span>')
    }
    return wrk1
  }
}
function setUpLink() {
  $('.up button').css('right', ($(window).width() - $('.up').width()) / 2 + 5)
}
function setReturnLink() {
  let lastProd_srch= srch.lastIndexOf('.')
  let fistSlsh_srch= srch.indexOf('/')
  let lastSlsh_srch= srch.lastIndexOf('/')
  let srch_path_filenameless = srch.slice(1, lastSlsh_srch)
  let srch_path_filename_extnless = srch.slice(lastSlsh_srch+ 1, lastProd_srch)
  let srch_path_extn = srch.slice(lastProd_srch+ 1, lastProd_srch- lastSlsh_srch)
  if (srch_path_filename_extnless === 'index') {
    prependAnchor(urlHome, '小説関連に戻る')
  } else {
    prependAnchor('?/' + srch_path_filenameless + '/index.md', srch_path_filenameless + 'に戻る')
  }
}
function prependAnchor(target, label) {
  $('.page-footer').prepend('<a class="return-link" href="' + target + '">' + label + '</a>')
}
