document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');
    const dropdowns = document.querySelectorAll('.dropdown');

    hamburger.addEventListener('click', function () {
        this.classList.toggle('active');
        menu.classList.toggle('active');
    });
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.slider-track');
    const slides = Array.from(document.querySelectorAll('.slide'));
    const nextBtn = document.querySelector('.next-arrow');
    const prevBtn = document.querySelector('.prev-arrow');
    const dotsContainer = document.querySelector('.slider-dots');
    
    const slideWidth = slides[0].getBoundingClientRect().width;
    let currentIndex = 0;
    
    // Set up dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if(index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    // Center the active slide
    const centerActiveSlide = () => {
        const slider = document.querySelector('.partners-slider');
        const activeSlide = slides[currentIndex];
        const sliderRect = slider.getBoundingClientRect();
        const slideRect = activeSlide.getBoundingClientRect();
        
        const scrollPosition = slideRect.left - sliderRect.left - (sliderRect.width / 2) + (slideRect.width / 2);
        track.style.transform = `translateX(-${scrollPosition}px)`;
        updateDots();
    };
    
    const updateDots = () => {
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    };
    
    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % slides.length;
        centerActiveSlide();
    };
    
    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        centerActiveSlide();
    };
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    slides.forEach((slide, index) => {
        slide.style.left = `${slideWidth * index}px`;
    });
    centerActiveSlide();
    window.addEventListener('resize', centerActiveSlide);
});