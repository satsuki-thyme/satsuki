let scrlHeit = 0
let scrlAmnt = 0
$(document).ready(function() {
  setCtrlBtn()
  setReldBtn()
  $('.down button').on('click',function (e) {
    setHeit()
    $('html, body').animate({scrollTop: scrlHeit + 100}, 'fast')
  })
  $('.up button').on('click',function (e) {
    $('html, body').animate({scrollTop: 0}, 'fast')
  })
  $('.reload button').on('click', function(e) {
    window.location.reload(true)
  })
})
$(window).resize(function() {
  setCtrlBtn()
  setHeit()
})
function setCtrlBtn() {
  $('.down button, .up button, .reload button').css('right', ($(window).width() - $('.up').width()) / 2)
}
function setHeit() {
  scrlHeit = $('header').outerHeight(true) + $('main').outerHeight(true) + $('footer').outerHeight(true) - window.outerHeight - 2
}
function setReldBtn() {
  if (location.search.indexOf('preview=1') >= 0) {
    $('.reload').css('display', 'block')
  }
}
