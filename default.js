scrlHeit = 0
scrlAmnt = 0
$(document).ready(function() {
  setUpLink()
  setHeit()
  setReldBtn()
  $('.down button').on('click',function (e) {
    $('html, body').animate({scrollTop: scrlHeit + 100}, 'fast')
  })
  $('.up button').on('click',function (e) {
    $('html, body').animate({scrollTop: 0}, 'fast')
  })
  $('.reload button').on('click', function(e) {
    location.reload()
  })
})
$(window).scroll(function() {
  scrlAmnt = $(window).scrollTop()
  if (scrlAmnt < scrlHeit) {
    $('.down').fadeIn()
  } else if (scrlAmnt >= scrlHeit) {
    $('.down').fadeOut()
  }
})
$(window).scroll(function() {
  scrlAmnt = $(window).scrollTop()
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
  $('.down button, .up button, .reload button').css('right', ($(window).width() - $('.up').width()) / 2 + 5)
}
function setHeit() {
  scrlHeit = $('header').outerHeight(true) + $('main').outerHeight(true) + $('footer').outerHeight(true) - window.outerHeight - 2
}
function setReldBtn() {
  if (location.search.indexOf('preview=1') >= 0) {
    $('.reload').css('display', 'block')
  }
}
