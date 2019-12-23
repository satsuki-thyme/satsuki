$(function () {
  const search = $(location).attr('search').slice(1)
  const host = $(location).attr('host')
  const setting_array =
{
  "loadContents": {
    "yayoi-thyme.com": {
      "back_host": "raw.githubusercontent.com",
      "user_name": "yayoi-thyme",
      "site_repository": "yayoi-thyme.github.io",
      "branch": "master",
      "default_document": "novel.md",
      "url_home": "/novel.html",
      "url_base": "/view-opus.html"
    },
    "yayoi-thyme.c": {
      "back_host": "novel.c",
      "user_name": "",
      "site_repository": "",
      "branch": "",
      "default_document": "novel.md",
      "url_home": "/novel.html",
      "url_base": "/view-opus.html"
    },
    "novel.c": {
      "back_host": "novel.c",
      "user_name": "",
      "site_repository": "",
      "branch": "",
      "default_document": "novel.md",
      "url_home": "?index.md",
      "url_base": "/view-opus.html"
    }
  }
}
    var back_host = setting_array['loadContents'][host]['back_host']
    var user_name = setting_array['loadContents'][host]['user_name']
    var site_repository = setting_array['loadContents'][host]['site_repository']
    var branch = setting_array['loadContents'][host]['branch']
    var default_document = setting_array['loadContents'][host]['default_document']
    var url_home = setting_array['loadContents'][host]['url_home']
    var url_base = setting_array['loadContents'][host]['url_base']
    if (back_host != '') {
      back_host = '//' + back_host
    }
    if (user_name != '') {
      user_name = '/' + user_name
    }
    if (site_repository != '') {
      site_repository = '/' + site_repository
    }
    if (branch != '') {
      branch = '/' + branch
    }
    if (default_document != '') {
      default_document = '/' + default_document
    }
    $(document).ready(function() {
      if ($('html').attr('class').match(/load-content/g)) {
        loadContents(search, back_host, user_name, site_repository, branch, default_document, url_home, url_base)
        setReturnLink(search, url_home)
      }
  })
  $(window).scroll(function() {
    const scroll_amount = $(window).scrollTop()
    if (scroll_amount > 0) {
      $('.up').fadeIn()
    } else if (scroll_amount <= 0) {
      $('.up').fadeOut()
    }
  })
  $('.up button').on('click',function (e) {
    $('html, body').animate({scrollTop: 0}, 'fast')
  })
})
function loadContents(search, back_host, user_name, site_repository, branch, default_document, url_home, url_base) {
  var dfr_load_contents = $.Deferred()
  var last_period = 0
  var first_slash = 0
  var last_slash = 0
  var opus = ''
  var url = ''
  var extention = ''
  const now = $.now()
  setUrl(search)
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
  function setUrl(search) {
    var dfr_set_url = $.Deferred()
    last_period = search.lastIndexOf('.')
    first_slash = search.indexOf('/')
    last_slash = search.lastIndexOf('/')
    opus = '/' + search.slice(first_slash + 1, last_slash - first_slash)
    const file_name = '/' + search.slice(last_slash + 1)
    if (search.length === 0) {
      extention = 'md'
      url = back_host + user_name + site_repository + branch + default_document
      dfr_set_url.resolve(url)
    } else {
      extention = search.slice(last_period + 1)
      url = back_host + user_name + opus + branch + file_name
      dfr_set_url.resolve(url)
    }
    return dfr_set_url.promise()
  }
  function writeContents(data) {
    // Text
    if (extention === 'txt') {
      const word = rubyParser(data)
      const char_len = data.replace(/([\s\t]*#.*?\r?\n|[\s\t]*\*.*|\r?\n|　)/g, '').replace(/｜(.*?)《.*?》/g, '$1').length
      const insert_text = ''
      const element_array = []
      const story_len = Number(search.slice(last_slash + 1, last_period))
      $('html').addClass('narou')
      $('div#novel_no').append(story_len + '/???')
      $('div#novel_honbun').append(word)
      if (data.indexOf('# ') > -1) {
        var subtitle = data.match(/^#\s.*/)[0].replace(/#\s*/, '')
        $('p.novel_subtitle').append(subtitle)
      }
      $('#info').append('<p class="number">文字数：' + char_len + '文字</p>')
      prevNextLink(story_len)
    // HTML
    } else if (extention === 'html') {
      $('html').addClass('html')
      $('.html.contents-container').append(word)
      $('title').empty().append(decodeURI(text))
      $('.title').append(decodeURI(text))
    // Markdown
    } else if (extention === 'md') {
      $('html').addClass('markdown')
      $('.markdown.contents-container').append(rubyParser(marked(keywordReplace(data))))
    // Another
    } else {
      $('.another.contents-container').append(word)
    }
    dfr_load_contents.resolve()
    function prevNextLink(story_len) {
      const prev_entity = ('000' + (story_len - 1)).slice(-3) + '.' + extention
      const next_entity = ('000' + (story_len + 1)).slice(-3) + '.' + extention
      var prev = ''
      var next = ''
      if (!isNaN(story_len)) {
        prev = '?' + opus + '/' + prev_entity
        next = '?' + opus + '/' + next_entity
      }
      $.get(back_host + user_name + opus + branch + '/' + prev_entity).then(function() {
        $('a.prev').attr('href', prev)
      }).fail(function() {
        $('a.prev').css('display', 'none')
      })
      $.get(back_host + user_name + opus + branch + '/' + next_entity).then(function() {
        $('a.next').attr('href', next)
      }).fail(function() {
        $('a.next').css('display', 'none')
      })
    }
  }
  function rubyParser(data) {
                   /* | ------------ルビとは無関係------------| */
    const word = data.replace(/([\s\t]*#.*|[\s\t]*\*.*)/g, '').replace(/(\r\n|\n|\r|$)/gm, '</p><p>').replace(/<p><\/p>/g, '<p><br></p>').replace(/(^<\/p>|<p>$)/g, '').replace(/｜([^（]+?)《(.+?)》/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/([\u4E00-\u9FFF]+?)（(.*?)）/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/｜(（.*?）)/g, '$1')
    return word
  }
  function keywordReplace(data) {
    const word_list_replace = [
                              ["# setting - part 1", "# 設定 - 第 1 編"],
                              ["# object", "# 目的"],
                              ["# character", "# 登場人物"],
                              ["# advanced setting", "# 詳細設定"],
                              ["# simple setting", "# 端的設定"],
                              ["# synopsis", "# あらすじ"],
                              ["# memo", "# メモ"],
                              ["# scene", "# シーン"],
                              ["# person", "# 人物"],
                              ["# episode set (\\d+)", "# 第 $1 セット（投稿２話分）"],
                              ["# overview", "# 概要"],
                              ["# meta data", "# メタデータ"],
                              ["# element", "# 話の要素"],
                              ["\\* love", "* 恋愛"],
                              ["\\* battle", "* バトル"],
                              ["# foreshadowing", "# 伏線"],
                              ["# story", "# ストーリー"],
                              ["# setup", "# セットアップ"],
                              ["# passive", "# 状況に振り回されるパート"],
                              ["# active", "# 状況解決に動き出すパート"],
                              ["# resolution", "# 解決パート"],
                              ["\\{", '<span style="color: #d00;">{</span><span>'],
                              ["\\}", '</span><span style="color: #d00;">}</span>']
                            ]
    const word_list_hide = ["_summary_", "_gist_"]
    var word_list_replace_length = 0
    var work1 = data
    for (var i in word_list_replace) {
      word_list_replace_length++
    }
    for (var i = word_list_replace_length - 1; i >= 0; i--) {
      const regexp1 = new RegExp(word_list_replace[i][0], 'g')
      work1 = work1.replace(regexp1, word_list_replace[i][1])
    }
    for (var i = word_list_hide.length - 1; i >= 0; i--) {
      work1 = work1.replace(new RegExp(word_list_hide[i], 'g'), '<span class="hide">' + word_list_hide[i] + '</span>')
    }
    return work1
  }
}
function setReturnLink(search, url_home) {
  const last_period_search = search.lastIndexOf('.')
  const first_slash_search = search.indexOf('/')
  const last_slash_search = search.lastIndexOf('/')
  const search_path_filenameless = search.slice(1, last_slash_search)
  const search_path_filename_extentionless = search.slice(last_slash_search + 1, last_period_search)
  const search_path_extention = search.slice(last_period_search + 1, last_period_search - last_slash_search)
  if (search_path_filename_extentionless === 'index') {
    prependAnchor(url_home, '小説関連に戻る')
  } else {
    prependAnchor('?/' + search_path_filenameless + '/index.md', search_path_filenameless + 'に戻る')
  }
}
function prependAnchor(target, label) {
  $('.page-footer').prepend('<a class="return-link" href="' + target + '">' + label + '</a>')
}