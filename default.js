let windHeit = 0
$(document).ready(function() {
  setUpLink()
  setHeit()
  $('.down button').on('click',function (e) {
    $('html, body').animate({scrollTop: windHeit}, 'fast')
  })
  $('.up button').on('click',function (e) {
    $('html, body').animate({scrollTop: 0}, 'fast')
  })
})
$(window).scroll(function() {
  let scrlAmnt = $(window).scrollTop()
  if (scrlAmnt < windHeit) {
    $('.down').fadeIn()
  } else if (scrlAmnt <= windHeit) {
    $('.down').fadeOut()
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
  setHeit()
})
function setUpLink() {
  $('.down button, .up button').css('right', ($(window).width() - $('.up').width()) / 2 + 5)
}
function setHeit() {
  windHeit = $('body').outerHeight()
}
