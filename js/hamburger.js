const hamburger = document.querySelector('.hamburger');

hamburger.addEventListener('click', e=>{
    if (hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
    }
    else {
        hamburger.classList.add('active');
    }
});