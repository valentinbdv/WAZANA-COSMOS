soundStep(way: 'next' | 'previous') {
    if (way == 'next') soundManager.setOn();
    else soundManager.setOff();
}

soundManager.play('enter');

soundManager.fade('gameStart', 3000);


