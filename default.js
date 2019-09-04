$(function () {
/*

  Execute

*/
  $(document).ready(function() {
    const dfd_load_content = $.Deferred()
    if ($('html').attr('class').match(/load-content/g)) {
      loadContent()
      $(document).ajaxComplete(function() {
        setStructure()
      })
    } else {
      setStructure()
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

  $(window).on('resize', function() {
    setStructure()
  })

/*

  Function

*/
  function setStructure() {
    const width_window = $('body').innerWidth()
    const width_content = (121 - 0.0656 * width_window) * width_window / 100
    const width_content_max = 500
    if (width_window >= 500) {
      $('.page-header, main, .page-footer, .up').css('width', width_content_max + 'px')
      $('.up').css('margin-left', - width_content_max / 2 + 'px')
    } else if (width_window < 500 && width_window > 340) {
      $('.page-header, main, .page-footer, .up').css('width', width_content + 'px')
      $('.up').css('margin-left', - width_content / 2 + 'px')
    } else {
      $('.page-header, main, .page-footer, .up').css('width', width_window - 10 + 'px')
      $('.up').css('margin-left', - width_window / 2 + 'px')
    }
  }
  function loadContent() {
    const dfd_set_url = $.Deferred()
    const user_name = 'yayoi-thyme'
    const site_repository = 'yayoi-thyme.github.io'
    const back_host = '//raw.githubusercontent.com/'
    var entity_loading
    var search
    var last_period
    var first_slash
    var last_slash
    var file_name_extentionless
    var extention
    var opus
    var text
    var url
    var prev
    var next
    const now = $.now()
    setUrl()
    .then(
      $.ajax({
        url: url + '?' + now,
        cache: false,
      })
      .then(function(data) {
        writeContent(data)
        return dfd_load_content.promise()
      })
    )
    function setUrl() {
      if ($(location).attr("search").length == 0) {
        extention = 'md'
        url = '/novel.md'
        dfd_set_url.resolve(url)
      } else {
        search = $(location).attr('search').slice(1)
        last_period = search.lastIndexOf('.')
        first_slash = search.indexOf('/')
        last_slash = search.lastIndexOf('/')
        if (first_slash < 0) {
          file_name_extentionless = search.slice(0, last_period)
        } else {
          opus = search.slice(first_slash + 1, last_slash - first_slash)
          file_name_extentionless = search.slice(last_slash + 1, last_period)
        }
        extention = search.slice(last_period + 1)
        if (first_slash < 0) {
          url = back_host + user_name + '/' + site_repository + '/master/' + file_name_extentionless + '.' + extention
          dfd_set_url.resolve(url)
        } else {
          url = back_host + user_name + '/' + opus + '/master/' + file_name_extentionless + '.' + extention
          dfd_set_url.resolve(url)
        }
      }
      return dfd_set_url.promise()
    }
    function writeContent(data) {
      // Text
      if (extention == 'txt') {
        const word = rubyParser(data)
        const char_len = data.replace(/([\s\t]*#.*?\r?\n|[\s\t]*\*.*|\r?\n|　)/g, '').replace(/｜(.*?)《.*?》/g, '$1').length
        const insert_text = ''
        const element_array = []
        const story_len = Number(search.slice(last_slash + 1, last_period))
        $('html').addClass('narou')
        $('div#novel_no').append(story_len + '/???')
        $('div#novel_honbun').append(word)
        if (data.indexOf('#') > -1) {
          var subtitle = data.match(/#.*/)[0].replace(/#/, '')
          $('p.novel_subtitle').append(subtitle)
        }
        $('#info').append('<p class="number">文字数：' + char_len + '文字</p>')
        prevNextLink(story_len)
      // HTML
      } else if (extention == 'html') {
        $('html').addClass('html')
        $('.html.contents-container').append(word)
        $('title').empty().append(decodeURI(text))
        $('.title').append(decodeURI(text))
      // Markdown
      } else if (extention == 'md') {
        $('html').addClass('markdown')
        $('.markdown.contents-container').append(rubyParser(marked(keywordReplace(data))))
      // Another
      } else {
        $('.another.contents-container').append(word)
      }
      dfd_load_content.resolve()
      function prevNextLink(story_len) {
        const prev_entity = ('000' + (story_len - 1)).slice(-3) + '.' + extention
        const next_entity = ('000' + (story_len + 1)).slice(-3) + '.' + extention
        if (!isNaN(story_len)) {
          prev = '?/' + opus + '/' + prev_entity
          next = '?/' + opus + '/' + next_entity
        }
        $.get(back_host + user_name + '/' + opus + '/master/' + prev_entity).then(function() {
          $('a.prev').attr('href', prev)
        }).fail(function() {
          $('a.prev').css('display', 'none')
        })
        $.get(back_host + user_name + '/' + opus + '/master/' + next_entity).then(function() {
          $('a.next').attr('href', next)
        }).fail(function() {
          $('a.next').css('display', 'none')
        })
      }
    }
    function rubyParser(data) {
                     /* | ------------ルビとは無関係------------| */
      const word = data.replace(/([\s\t]*#.*|[\s\t]*\*.*)/g, '').replace(/\r?\n/g, '</p><p>').replace(/<p><\/p>/g, '<p><br></p>').replace(/(^<\/p>|<p>$)/g, '').replace(/｜([^（]+?)《(.+?)》/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/([\u4E00-\u9FFF]+?)（(.*?)）/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/｜(（.*?）)/g, '$1')
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
      var work_kr1 = data
      for (var i in word_list_replace) {
        word_list_replace_length++
      }
      for (var i = word_list_replace_length - 1; i >= 0; i--) {
        const regexp = new RegExp(word_list_replace[i][0], 'g')
        work_kr1 = work_kr1.replace(regexp, word_list_replace[i][1])
      }
      for (var i = word_list_hide.length - 1; i >= 0; i--) {
        work_kr1 = work_kr1.replace(new RegExp(word_list_hide[i], 'g'), '<span class="hide">' + word_list_hide[i] + '</span>')
      }
      return work_kr1
    }
  }
  function setLink() {
    const search = $(location).attr('search').slice(1)
    const last_period = search.lastIndexOf('.')
    const first_slash = search.indexOf('/')
    const last_slash = search.lastIndexOf('/')
    if (first_slash < 0) {
      const file_name_extentionless = search.slice(0, last_period)
    } else {
      const opus = search.slice(first_slash + 1, last_slash - first_slash)
      const file_name_extentionless = search.slice(last_slash + 1, last_period)
    }
    extention = search.slice(last_period + 1)
  }
})
