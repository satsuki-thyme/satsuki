$(document).ready(function() {
  $(document).find('.article-body-inner').each(function() {
    const word = $(this).html().replace(/\r?\n/g, '</p><p>').replace(/<p><\/p>/g, '<p><br></p>').replace(/(^<\/p>|<p>$)/g, '').replace(/｜([^（]+?)《(.+?)》/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/([\u4E00-\u9FFF]+?)（(.*?)）/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/｜(（.*?）)/g, '$1')
    $(this).html(word)
  })
})
