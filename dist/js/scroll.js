const pageScrollPos = window.pageYOffset;
const navbarHeight = 70;

const navLinks = document.querySelectorAll('.navbar-item a');

function scrollToPos(e) {
    e.preventDefault();

    if (document.querySelector('.hamburger').classList.contains('active')) {
        document.querySelector('.hamburger').classList.remove('active');
    }

    const elementPos = document.querySelector(`.${this.id}`).getBoundingClientRect().top - (pageScrollPos + navbarHeight);

    window.scrollBy({
       top: elementPos,
       left: 0,
       behavior: 'smooth' 
    });
}

navLinks.forEach(link => {    
    link.addEventListener('click', scrollToPos.bind(link.parentElement));
});

console.log('hello world');