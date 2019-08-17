$(function () {
  const dfd_load_content = $.Deferred()
  $(document).ready(function($) {
    if ($('html').attr('class').match(/load-content/g)) {
      loadContent().done(function() {
        setStructure()
      })
    } else {
      setStructure()
    }
  })
  $('.up-to-top button').on('click',function (e) {
    $('html, body').animate({scrollTop: 0}, 'fast')
    e.preventDefault()
  })
  $(window).on('resize', function() {
    setStructure()
  })
  function setStructure() {
    const dfd_set_mode = $.Deferred()
    const width_window = window.innerWidth
    const width_content = (121 - 0.0656 * width_window) * width_window / 100
    const width_content_max = 500
    const height_window = window.innerHeight
    const height_footer = $('footer').outerHeight(true)
    var height_content
    // 全体の幅設定
    if (width_window > 625) {
      $('header, main, footer, .up-to-top').css('width', width_content_max + 'px')
      $('.up-to-top').css('margin-left', - width_content_max / 2 + 'px')
    } else if (width_window <= 625 && width_window > 320) {
      $('header, main, footer, .up-to-top').css('width', width_content + 'px')
      $('.up-to-top').css('margin-left', - width_content / 2 + 'px')
    } else {
      $('header, main, footer, .up-to-top').css('width', width_window + 'px')
      $('.up-to-top').css('margin-left', - width_window / 2 + 'px')
    }
    function wrapMode() {
      if (width_content > 300) {
        replaceModalClass('html', 'list-item-mode-', 0) // no wrap
      } else {
        replaceModalClass('html', 'list-item-mode-', 1) // wrap
      }
      // nav のところ
      if (width_content > 460) {
        replaceModalClass('html', 'footer-bottom-mode-', 0) // no wrap
      } else {
        replaceModalClass('html', 'footer-bottom-mode-', 1) // wrap
      }
      // コピーライトのところ
      if (width_content > 520) {
        replaceModalClass('html', 'footer-top-mode-', 0) // wrap 4, 3
      } else if (width_content <= 520 && width_content > 360) {
        replaceModalClass('html', 'footer-top-mode-', 1) // wrap 3, 2, 2
      } else {
        replaceModalClass('html', 'footer-top-mode-', 2) // wrap 2, 2, 3
      }
      dfd_set_mode.resolve()
    }
    wrapMode()
    dfd_set_mode.done(function() {
      const dfd_footer_position = $.Deferred()
      setTimeout(function() {
        height_content = $('header').outerHeight(true) + $('main').outerHeight(true) + height_footer
        dfd_footer_position.resolve()
      }, 30)
      // footer のポジショニング
      dfd_footer_position.done(function() {
        if (height_window < height_content) {
          $('footer').css('padding-top', '30px');
        } else {
          $('footer').css('padding-top', height_window - height_content + 'px');
        }
      })
    })
  }
  function replaceModalClass(target, mode_phrase, mode_number) {
    const search_key = new RegExp(mode_phrase + '\\S+')
    const mode = mode_phrase + mode_number
    const dfd_set_mode = $.Deferred()
    f()
    dfd_set_mode.done(function() {
      $(target).addClass(mode)
    })
    function f() {
      $(target).removeClass(function(index, class_name) {
        return (class_name.match(search_key) || []).join(' ')
      })
      dfd_set_mode.resolve()
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
    if ($(location).attr("search").length == 0) {
      entity_loading = ''
      extention = 'md'
      url = '/novel.md'
      dfd_set_url.resolve(url)
    } else {
      entity_loading = $(location).attr('pathname')
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
    dfd_set_url.done(
      $.ajax({
        url: url + '?' + now,
        cache: false,
      })
      .done(function(data) {
        // Text
        if (extention == 'txt') {
          const word = narouParser(data)
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
          prevNextLink()
        // HTML
        } else if (extention == 'html') {
          $('html').addClass('html')
          $('main').append(word)
          $('title').empty().append(decodeURI(text))
          $('.title').append(decodeURI(text))
        // Markdown
        } else if (extention == 'md') {
          $('html').addClass('markdown')
          $('main').append(narouParser(marked(keywordReplace(data))))
        // Another
        } else {
          $('main').append(word)
        }
        function prevNextLink() {
          const prev_entity = ('000' + (story_len - 1)).slice(-3) + '.' + extention
          const next_entity = ('000' + (story_len + 1)).slice(-3) + '.' + extention
          if (!isNaN(story_len)) {
            prev = entity_loading + '?/' + opus + '/' + prev_entity
            next = entity_loading + '?/' + opus + '/' + next_entity
          }
          $.get(back_host + user_name + '/' + opus + '/master/' + prev_entity).done(function() {
            $('a.prev').attr('href', prev)
          }).fail(function() {
            $('a.prev').css('display', 'none')
          })
          $.get(back_host + user_name + '/' + opus + '/master/' + next_entity).done(function() {
            $('a.next').attr('href', next)
          }).fail(function() {
            $('a.next').css('display', 'none')
          })
        }
      })
    )
    function narouParser(data) {
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
                                ["# resolution", "# 解決パート"]
                              ]
      const word_list_hide = ["_summary_", "_gist_"]
      var word_list_replace_length = 0
      var work1 = data
      work1 = work1.replace(/\{(.*?)\}/g, '<span class="tag-bracket">{</span><span class="tag-content">$1</span><span class="tag-bracket">}</span>')
      for (var i in word_list_replace) {
        word_list_replace_length++
      }
      for (var i = word_list_replace_length - 1; i >= 0; i--) {
        const regexp = new RegExp(word_list_replace[i][0], 'g')
        work1 = work1.replace(regexp, word_list_replace[i][1])
      }
      for (var i = word_list_hide.length - 1; i >= 0; i--) {
        work1 = work1.replace(new RegExp(word_list_hide[i], 'g'), '<span class="hide">' + word_list_hide[i] + '</span>')
      }
      return work1
    }
    dfd_load_content.resolve()
    return dfd_load_content.promise()
  }
})
