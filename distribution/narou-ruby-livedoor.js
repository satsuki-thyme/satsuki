<script>
$(document).ready(function() {
  $(document).find('.article-body-inner').each(function() {
    var word = $(this).html().replace(/｜([^（]+?)《(.+?)》/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/([\u4E00-\u9FFF]+?)（(.*?)）/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/｜(（.*?）)/g, '$1')
    $(this).html(word)
  })
})
</script>