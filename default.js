var srch = location.search.slice(1)
var host = location.hostname
var stngObj = {
  "loadCnt": {
    "yayoi-thyme.com": {
      "backHost": "raw.githubusercontent.com",
      "userName": "yayoi-thyme",
      "repoSite": "yayoi-thyme.github.io",
      "brch": "master",
      "dfltDoc": "README.md",
      "urlHome": "/novel.html",
      "urlBase": "/view-opus.html"
    },
    "yayoi-thyme.c": {
      "backHost": "novel.c",
      "userName": "",
      "repoSite": "",
      "brch": "",
      "dfltDoc": "README.md",
      "urlHome": "/novel.html",
      "urlBase": "/view-opus.html"
    },
    "novel.c": {
      "backHost": "novel.c",
      "userName": "",
      "repoSite": "",
      "brch": "",
      "dfltDoc": "README.md",
      "urlHome": "?README.md",
      "urlBase": "/view-opus.html"
    }
  }
}
var backHost = stngObj['loadCnt'][host]['backHost']
var userName = stngObj['loadCnt'][host]['userName']
var repoSite = stngObj['loadCnt'][host]['repoSite']
var brch = stngObj['loadCnt'][host]['brch']
var dfltDoc = stngObj['loadCnt'][host]['dfltDoc']
var urlHome = stngObj['loadCnt'][host]['urlHome']
var urlBase = stngObj['loadCnt'][host]['urlBase']
if (backHost != '') {
  backHost = '//' + backHost.replace(/\//g, '')
}
if (userName != '') {
  userName = '/' + userName.replace(/\//g, '')
}
if (repoSite != '') {
  repoSite = '/' + repoSite.replace(/\//g, '')
}
if (brch != '') {
  brch = '/' + brch.replace(/\//g, '')
}
var srchArr = []
var srchObj = {}
var url = ''
var q = ''
var dir = ''
var ext = ''
var file = ''
var type = ''
$(function() {
  setUpLink()
  if ($('html').attr('class').indexOf('load-contents') >= 0) {
    setPrm()
    setRtnLink()
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
/*
  1st run
*/
function setPrm() {
  // ex. srch = ?q=http://novel.c/op.18/001.txt&type=novel
  if (srch === '') {
    url = backHost + userName + repoSite + brch + dfltDoc
    ext = dfltDoc.replace(/.*([^\.]+)$/, '$1')
  } else {
    srchArr = srch.split('&')
    for (var i = 0; srchArr.length - 1 >= i; i++) {
      let workArr = srchArr[i].split('=')
      srchObj[workArr[0]] = workArr[1]
    }
    q = srchObj['q']
    type = srchObj['type']
    if (!q.match(/^.*?[^\/]+$/)) {
      dir = '/' + q.replace(/^\/?([^\/].*)\/$/, '$1')
      file = '/' + dfltDoc
    } else {
      dir  = '/' + q.replace(/^\/?([^\/].*)\/([^\/]+)$/, '$1')
      file = '/' + q.replace(/^\/?([^\/].*)\/([^\/]+)$/, '$2')
    }
    ext = file.replace(/[^\.]*\.+([^\.])+$/, '')
    url = backHost + userName + dir + brch + file
  }
  loadCnt(url)
}
/*
  2nd run
*/
function loadCnt(url) {
  let now = new Date()
  $.ajax({
    url: url + '?' + now,
    cache: false,
  })
  .done(function(data) {
    wrtCnt(data)
  })
  .fail(function() {
  })
}
/*
  3rd run
*/
function wrtCnt(data) {
  if (type === 'novel' || type === 'nvl') {
    wrtCnt_nvl(data, 'novel')
  } else if (type === 'plot' || type === 'plt') {
    wrtCnt_nvl(data, 'plot')
  } else if (type === 'both') {
    wrtCnt_nvl(data, 'both')
  } else if (file === '/README.md') {
    wrtCnt_indx(data)
  } else {
    if (ext === 'txt') {
      wrtCnt_txt(data)
    } else if (ext === 'html') {
      wrtCnt_html(data)
    } else if (ext === 'md') {
      wrtCnt_md(data)
    } else {
      wrtCnt_indx(data)
    }
  }
}
function wrtCnt_nvl(data, type) {
  let word = ''
  if (type === 'novel') {
    word = mdParse(rubyParse(keywdRpl(procNvl(data))))
  } else if (type === 'plot') {
    word = mdParse(rubyParse(keywdRpl(procPlot(data))))
  } else if (type === 'both') {
    word = mdParse(rubyParse(keywdRpl(procBoth(data))))
  }
  let wordLen = data.replace(/\/\*[\s\S]*?(\*\/|$)/g, '')
                    .replace(/^# .*?\n/m, '')
                    .replace(/｜(.*?)《.*?》/g, '$1')
                    .replace(/([\u4E00-\u9FFF]+?)（.*?）/g, '$1')
                    .replace(/｜(（.*?）)/g, '$1')
                    .replace(/( |　|\n)/g, '')
                    .length
  $('html').addClass('novel')
  $('div#novel_honbun').append(word)
  if (!data.match(/^# /) === false) {
    let subtitle = data.match(/^#\s.*/)[0].replace(/#\s*/, '')
    $('p.novel_subtitle').append(subtitle)
  }
  $('#info').append('<p class="number">文字数：' + wordLen + '文字</p>')
  function procNvl(data) {
    return data.replace(/\/\*[\s\S]*?(\*\/|$)/g, '')
               .replace(/^# .*?$/m, '')
               .replace(/\n/gm, '  \n')
  }
  function procPlot(data) {
    return data.replace(/\/\*.*$([\s\S]*?)(\*\/|$)/gm, '$2')
               .replace(/^# .*?$/m, '')
  }
  function procBoth(data) {
    return data.replace(/(^\/\*.*$|^.*\*\/$)/gm, '')
               .replace(/^# .*?$/m, '')
  }
  epsNmb()
}
function wrtCnt_indx(data) {
  let word = keywdRpl(rubyParse(mdParse(data).replace(/href="(.*?)"/g, 'href="?q=' + dir + '/$1&type=novel"')))
  $('html').addClass('markdown')
  $('.markdown.contents-container').append(word)
}
function wrtCnt_txt(data) {
  let word = data
  $('body').append(word)
}
function wrtCnt_html(data) {
  let word = keywdRpl(data)
  let title = file.slice(1)
  $('html').addClass('html')
  $('.html.contents-container').append(word)
  $('title').empty().append(decodeURI(title))
  $('.title').append(decodeURI(title))
}
function wrtCnt_md(data) {
  let word = keywdRpl(rubyParse(mdParse(data)))
  $('html').addClass('markdown')
  $('.markdown.contents-container').append(word)
}
function wrtCnt_another(data) {
  $('.another.contents-container').append(data)
}
function rubyParse(data) {
  let word = data.replace(/｜(.*?)《(.*?)》/g, '<ruby>$1<rt>$2</rt></ruby>')
                 .replace(/([\u4E00-\u9FFF]+?)（(.*?)）/g, '<ruby>$1<rt>$2</rt></ruby>')
                 .replace(/｜(（.*?）)/g, '$1')
  return word
}
function keywdRpl(data) {
  let wordListRpl = [
    ["\{setup\}", "{セットアップ}"],
    ["\{inciting incident\}", "{インサイティング・インシデント}"],
    ["\{central question\}", "{セントラル・クエスチョン}"],
    ["\{plot point 1\}", "{プロット・ポイント 1}"],
    ["\{conflict\}", "{葛藤・対立}"],
    ["\{plot point 2\}", "{プロット・ポイント 2}"],
    ["\{resolution\}", "{解決}"],
    ["\{ending\}", "{エンディング}"],
    ["\{", '<span class="bracket">{</span><span class="bracket-contents">'],
    ["\}", '</span><span class="bracket">}</span>']
  ]
  let wordListHide = ["_summary_", "_gist_"]
  let work = data
  for (var i = 0; wordListRpl.length - 1 >= i; i++) {
    work = work.replace(new RegExp(wordListRpl[i][0], 'g'), wordListRpl[i][1])
  }
  for (var i = 0; wordListHide.length - 1 >= i; i++) {
    work = work.replace(new RegExp(wordListHide[i], 'g'), '<span class="hide">' + wordListHide[i] + '</span>')
  }
  return work
}
function setUpLink() {
  $('.up button').css('right', ($(window).width() - $('.up').width()) / 2 + 5)
}
function setRtnLink() {
  if (file === '/README.md') {
    ppndAnch(urlHome, '小説関連に戻る')
  } else {
    ppndAnch('?q=' + dir + '/README.md&type=index', '目次ページに戻る')
  }
}
function ppndAnch(target, label) {
  $('.page-footer').prepend('<a class="return-link" href="' + target + '">' + label + '</a>')
}
function epsNmb(epsNmb) {
  let epsArrLen = 0
  $.ajax({
    url: backHost + userName + dir + brch + '/README.md',
    dataType: 'text',
  })
  .done(function(data) {
    let epsArr = data.replace(/^[\s\S]*?# 本文[\s\S]*?((\*|\+|-|\d+\.) [\s\S]*?)(\n\n|\n$|$)/g, '$1')
                     .replace(/^[ \t]*(\*|\+|-|\d+\.) .*?\[.*?\]\([ \t]*?(.*?)[ \t]*\).*$/gm, '$2')
                     .split('\n')
    let epsObj = {}
    epsArrLen = epsArr.length 
    for (var i = epsArrLen - 1; i >= 0; i--) {
      epsObj[Number(epsArr[i].replace(/^.*?(\d{3}).*?$/m, '$1'))] = [epsArr[i].replace(/^(.*?)\d{3}.*?$/m, '$1'), epsArr[i].replace(/^.*?\d{3}(.*?)$/m, '$1')]
    }
    let epsCrr = Number(file.replace(/^.*?(\d{3}).*?$/m, '$1'))
    if (epsObj[epsCrr - 1]) {
      $('a.prev').attr('href', '?q=' + dir + '/' + epsObj[epsCrr - 1][0] + ('000' + (epsCrr - 1)).slice(-3) + epsObj[epsCrr - 1][1] + '&type=' + type)
      $('a.prev').css('display', 'initial')
    }
    if (epsObj[epsCrr + 1]) {
      $('a.next').attr('href', '?q=' + dir + '/' + epsObj[epsCrr + 1][0] + ('000' + (epsCrr + 1)).slice(-3) + epsObj[epsCrr + 1][1] + '&type=' + type)
      $('a.next').css('display', 'initial')
    }
    $('div#novel_no').append(epsCrr + '/' + epsArrLen)
  })
  .fail(function() {
    console.log("error")
  })
  .always(function() {
  })
}
