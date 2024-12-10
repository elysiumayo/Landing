document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const profileContainer = document.querySelector('.profile-container');
    const taglineContainer = document.querySelector('.tagline-container');

    const observerOptions = {
        root: document.querySelector('.transparent-box'),
        rootMargin: '0px',
        threshold: 0.5
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Special handling for first section
                if (entry.target.id === 'section1') {
                    profileContainer.classList.add('active');
                    taglineContainer.classList.add('active');
                }
            } else {
                entry.target.classList.remove('active');
                
                if (entry.target.id === 'section1') {
                    profileContainer.classList.remove('active');
                    taglineContainer.classList.remove('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
});
