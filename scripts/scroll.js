const scrollTop = document.body.scrollTop;

const navLinks = document.querySelectorAll('.navbar-item a');

function scrollToPos(e) {
    e.preventDefault();

    if (document.querySelector('.hamburger').classList.contains('active')) {
        document.querySelector('.hamburger').classList.remove('active');
    }

    const elementPos = document.querySelector(`.${this.id}`).getBoundingClientRect().top + scrollTop;
    
    window.scrollTo(0, elementPos);
}

navLinks.forEach(link => {    
    link.addEventListener('click', scrollToPos.bind(link.parentElement));
});