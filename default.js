$(function() {
  setUpLink()
  $('.up button').on('click',function (e) {
    $('html, body').animate({scrollTop: 0}, 'fast')
  })
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
function setUpLink() {
  $('.up button').css('right', ($(window).width() - $('.up').width()) / 2 + 5)
}
