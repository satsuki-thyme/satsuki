const search = $(location).attr('search').slice(1)
const host = $(location).attr('host')
const setting_array ={
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
let back_host = setting_array['loadContents'][host]['back_host']
let user_name = setting_array['loadContents'][host]['user_name']
let site_repository = setting_array['loadContents'][host]['site_repository']
let branch = setting_array['loadContents'][host]['branch']
let default_document = setting_array['loadContents'][host]['default_document']
let url_home = setting_array['loadContents'][host]['url_home']
let url_base = setting_array['loadContents'][host]['url_base']
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
  setUpLink()
  if ($('html').attr('class').match(/load-contents/g)) {
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
$(window).resize(function() {
  setUpLink()
})
$('.up button').on('click',function (e) {
  $('html, body').animate({scrollTop: 0}, 'fast')
})
function loadContents(search, back_host, user_name, site_repository, branch, default_document, url_home, url_base) {
  let dfd_load_contents = $.Deferred()
  let last_period = 0
  let first_slash = 0
  let last_slash = 0
  let opus = ''
  let url = ''
  let extention = ''
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
    let dfd_set_url = $.Deferred()
    last_period = search.lastIndexOf('.')
    first_slash = search.indexOf('/')
    last_slash = search.lastIndexOf('/')
    opus = '/' + search.slice(first_slash + 1, last_slash - first_slash)
    const file_name = '/' + search.slice(last_slash + 1)
    if (search.length === 0) {
      extention = 'md'
      url = back_host + user_name + site_repository + branch + default_document
      dfd_set_url.resolve(url)
    } else {
      extention = search.slice(last_period + 1)
      url = back_host + user_name + opus + branch + file_name
      dfd_set_url.resolve(url)
    }
    return dfd_set_url.promise()
  }
  function writeContents(data) {
    // Text
    if (extention === 'txt') {
      const word = keywordReplace(mdparse(rubyParser(data)))
      const char_len = data.replace(/([\s\t]*#.*?\r?\n|[\s\t]*\*.*|\r?\n|　)/g, '').replace(/｜(.*?)《.*?》/g, '$1').length
      const insert_text = ''
      const element_array = []
      const story_len = Number(search.slice(last_slash + 1, last_period))
      $('html').addClass('narou')
      $('div#novel_no').append(story_len + '/???')
      $('div#novel_honbun').append(word)
      if (data.indexOf('# ') > -1) {
        let subtitle = data.match(/^#\s.*/)[0].replace(/#\s*/, '')
        $('p.novel_subtitle').append(subtitle)
      }
      $('#info').append('<p class="number">文字数：' + char_len + '文字</p>')
      prevNextLink(story_len)
    // HTML
    } else if (extention === 'html') {
      const word = keywordReplace(data)
      $('html').addClass('html')
      $('.html.contents-container').append(word)
      $('title').empty().append(decodeURI(text))
      $('.title').append(decodeURI(text))
    // Markdown
    } else if (extention === 'md') {
      const word = keywordReplace(rubyParser(marked(data)))
      $('html').addClass('markdown')
      $('.markdown.contents-container').append(marked(word))
    // Another
    } else {
      const word = data
      $('.another.contents-container').append(word)
    }
    dfd_load_contents.resolve()
    function prevNextLink(story_len) {
      const prev_entity = ('000' + (story_len - 1)).slice(-3) + '.' + extention
      const next_entity = ('000' + (story_len + 1)).slice(-3) + '.' + extention
      let prev = ''
      let next = ''
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
    const word = data.replace(/(^[\s\t]*#.*|[\s\t]*\*.*)/g, '').replace(/｜([^（]+?)《(.+?)》/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/([\u4E00-\u9FFF]+?)（(.*?)）/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/｜(（.*?）)/g, '$1')
    return word
  }
  function keywordReplace(data) {
    const word_list_replace = [
                              ["\\{", '<span style="font-size: 50%; color: #999;">{</span><span>'],
                              ["\\}", '</span><span style="font-size: 50%; color: #999;">}</span>'],
                              ["(?<=\{)g(?=\})", '<span style="font-size: 50%; color: #00d;">いいところ</span>'],
                              ["(?<=\{)b(?=\})", '<span style="font-size: 50%; color: #d00;">わるいところ</span>'],
                              ["ｘ", '<span style="font-weight: bold; color: #cc0;">やめ</span>']
                            ]
    const word_list_hide = ["_summary_", "_gist_"]
    let word_list_replace_length = 0
    let work1 = data
    for (let i in word_list_replace) {
      word_list_replace_length++
    }
    for (let i = word_list_replace_length - 1; i >= 0; i--) {
      const regexp1 = new RegExp(word_list_replace[i][0], 'g')
      work1 = work1.replace(regexp1, word_list_replace[i][1])
    }
    for (let i = word_list_hide.length - 1; i >= 0; i--) {
      work1 = work1.replace(new RegExp(word_list_hide[i], 'g'), '<span class="hide">' + word_list_hide[i] + '</span>')
    }
    return work1
  }
}
function setUpLink() {
  $('.up button').css('right', ($(window).width() - $('.up').width()) / 2 + 5)
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
