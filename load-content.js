$(function() {
  function loadContent() {
    var dfd = $.Deferred()
    var user_name = 'yayoi-thyme'
    var site_repository = 'yayoi-thyme.github.io'
    var back_host = '//raw.githubusercontent.com/'
    var entity_that_loading
    var search
    var last_period
    var first_slash
    var last_slash
    var file_name_extentionless
    var extention
    var opus
    var text
    var story_len
    var url
    var prev
    var next
    var now = $.now()
    if ($(location).attr("search").length == 0) {
      entity_that_loading = ''
      extention = 'md'
      url = '/novel.md'
      dfd.resolve(url, extention)
    } else {
      entity_that_loading = $(location).attr('pathname')
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
        dfd.resolve(url)
      } else {
        url = back_host + user_name + '/' + opus + '/master/' + file_name_extentionless + '.' + extention
        dfd.resolve(url)
      }
    }
    dfd.done(
      $.ajax({
        url: url + '?' + now,
        cache: false,
      })
      .done(function(data) {
        // Text
        if (extention == 'txt') {
          var word = narouParser(data),
          char_len = data.replace(/([\s\t]*#.*?\r?\n|[\s\t]*\*.*|\r?\n|　)/g, '').replace(/｜(.*?)《.*?》/g, '$1').length,
          insert_text = '',
          element_array = []
          story_len = Number(search.slice(last_slash + 1, last_period))
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
          var prev_entity = ('000' + (story_len - 1)).slice(-3) + '.' + extention,
          next_entity = ('000' + (story_len + 1)).slice(-3) + '.' + extention
          if (!isNaN(story_len)) {
            prev = entity_that_loading + '?/' + opus + '/' + prev_entity
            next = entity_that_loading + '?/' + opus + '/' + next_entity
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
      var word = data.replace(/([\s\t]*#.*|[\s\t]*\*.*)/g, '').replace(/\r?\n/g, '</p><p>').replace(/<p><\/p>/g, '<p><br></p>').replace(/(^<\/p>|<p>$)/g, '').replace(/｜([^（]+?)《(.+?)》/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/([\u4E00-\u9FFF]+?)（(.*?)）/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/｜(（.*?）)/g, '$1')
      return word
    }
    function keywordReplace(data) {
      var word_list_replace = [["# setting - part 1", "# 設定 - 第 1 編"],
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
                              ],
      word_list_replace_length = 0,
      word_list_hide = ["_summary_", "_gist_"],
      work1 = data
      work1 = work1.replace(/\{(.*?)\}/g, '<span class="tag-bracket">{</span><span class="tag-content">$1</span><span class="tag-bracket">}</span>')
      for (var i in word_list_replace) {
        word_list_replace_length++
      }
      for (var i = word_list_replace_length - 1; i >= 0; i--) {
        var regexp = new RegExp(word_list_replace[i][0], 'g')
        work1 = work1.replace(regexp, word_list_replace[i][1])
      }
      for (var i = word_list_hide.length - 1; i >= 0; i--) {
        work1 = work1.replace(new RegExp(word_list_hide[i], 'g'), '<span class="hide">' + word_list_hide[i] + '</span>')
      }
      return work1
    }
    dfd_loadContent.resolve()
  }
  // 選択範囲の文字列の文字数を数える
  $(function() {
    var switch1 = 0,
    switch2 = 0
    $('#novel_honbun').on('mousedown', function() {
      switch1 = 1
      $('rt').addClass('rt-none')
      $('.selected-len').empty()
      $('.selected-len').removeClass('appear')
      if (switch1 == 1) {
        $(document).on('mouseup', function() {
          var selected_len = document.getSelection().toString(0).replace(/　/g, '').length
          switch1 = 0
          $('.selected-len').html('選択範囲 : ' + selected_len + '文字')
          $('.selected-len').addClass('appear')
          $('rt').removeClass('rt-none')
        })
      }
    })
  })
})
  