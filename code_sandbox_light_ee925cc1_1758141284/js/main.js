// M3 Agência - Main JavaScript File
// Author: M3 Agência Development Team
// Description: Main functionality for the M3 Agência landing page

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== LOADING SCREEN =====
    const loadingScreen = document.getElementById('loading-screen');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 1500);
    });

    // ===== NAVIGATION =====
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Track mobile menu interaction
            if (window.firebaseManager) {
                window.firebaseManager.trackButtonClick('mobile_menu_toggle', 'navigation');
            }
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navToggle) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
            
            // Track navigation clicks
            if (window.firebaseManager) {
                window.firebaseManager.trackButtonClick(`nav_${link.getAttribute('href')}`, 'navigation');
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== PORTFOLIO FILTERS =====
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter portfolio items
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
            
            // Track portfolio filter usage
            if (window.firebaseManager) {
                window.firebaseManager.trackButtonClick(`portfolio_filter_${filter}`, 'portfolio');
            }
        });
    });

    // ===== BACK TO TOP BUTTON =====
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Track back to top usage
            if (window.firebaseManager) {
                window.firebaseManager.trackButtonClick('back_to_top', 'utility');
            }
        });
    }

    // ===== CONTACT FORM =====
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('form-success');
    const formError = document.getElementById('form-error');

    if (contactForm) {
        // Form validation
        const validateForm = (formData) => {
            const errors = [];
            
            if (!formData.name.trim()) {
                errors.push('Nome é obrigatório');
            }
            
            if (!formData.email.trim()) {
                errors.push('E-mail é obrigatório');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                errors.push('E-mail inválido');
            }
            
            if (!formData.phone.trim()) {
                errors.push('Telefone é obrigatório');
            }
            
            if (!formData.company.trim()) {
                errors.push('Empresa é obrigatória');
            }
            
            if (!formData.service) {
                errors.push('Selecione um serviço');
            }
            
            if (!formData.message.trim()) {
                errors.push('Mensagem é obrigatória');
            }
            
            return errors;
        };

        // Form submission
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                company: document.getElementById('company').value,
                service: document.getElementById('service').value,
                message: document.getElementById('message').value
            };
            
            // Validate form
            const errors = validateForm(formData);
            if (errors.length > 0) {
                alert('Por favor, corrija os seguintes erros:\n' + errors.join('\n'));
                return;
            }
            
            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitButton.disabled = true;
            
            // Hide previous messages
            formSuccess.style.display = 'none';
            formError.style.display = 'none';
            
            try {
                // Track form submission attempt
                if (window.firebaseManager) {
                    window.firebaseManager.trackContactFormInteraction('submit_attempt', formData);
                }
                
                // Submit to Firebase
                if (window.firebaseManager) {
                    const result = await window.firebaseManager.addContactSubmission(formData);
                    
                    if (result.success) {
                        // Show success message
                        formSuccess.style.display = 'block';
                        contactForm.reset();
                        
                        // Track successful submission
                        window.firebaseManager.trackContactFormInteraction('submit_success', formData);
                        
                        // Scroll to success message
                        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Optional: Redirect to WhatsApp after 3 seconds
                        setTimeout(() => {
                            const whatsappMessage = `Olá! Acabei de enviar uma mensagem através do site da M3 Agência.\n\nNome: ${formData.name}\nEmpresa: ${formData.company}\nServiço de interesse: ${formData.service}\n\nGostaria de agendar uma conversa!`;
                            const whatsappURL = `https://wa.me/5511999999999?text=${encodeURIComponent(whatsappMessage)}`;
                            
                            if (confirm('Mensagem enviada com sucesso! Gostaria de continuar a conversa no WhatsApp?')) {
                                window.open(whatsappURL, '_blank');
                            }
                        }, 2000);
                        
                    } else {
                        throw new Error(result.error || 'Erro ao enviar mensagem');
                    }
                } else {
                    throw new Error('Sistema de mensagens não disponível');
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                
                // Show error message
                formError.style.display = 'block';
                
                // Track failed submission
                if (window.firebaseManager) {
                    window.firebaseManager.trackContactFormInteraction('submit_error', { error: error.message });
                }
                
                // Scroll to error message
                formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } finally {
                // Restore button state
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        });
        
        // Track form field interactions
        const formFields = contactForm.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            field.addEventListener('focus', () => {
                if (window.firebaseManager) {
                    window.firebaseManager.trackContactFormInteraction('field_focus', { field: field.id });
                }
            });
        });
    }

    // ===== SERVICE CARD INTERACTIONS =====
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const serviceName = card.querySelector('h3').textContent;
            
            // Track service interest
            if (window.firebaseManager) {
                window.firebaseManager.trackServiceInterest(serviceName);
            }
            
            // Scroll to contact form
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                
                // Pre-select the service in the form
                setTimeout(() => {
                    const serviceSelect = document.getElementById('service');
                    if (serviceSelect) {
                        const serviceMap = {
                            'Google Ads': 'google-ads',
                            'Facebook & Instagram Ads': 'facebook-ads',
                            'Analytics & Relatórios': 'analytics',
                            'Estratégia Digital': 'estrategia',
                            'Landing Pages': 'landing-pages',
                            'Consultoria Especializada': 'consultoria'
                        };
                        
                        const serviceValue = serviceMap[serviceName];
                        if (serviceValue) {
                            serviceSelect.value = serviceValue;
                        }
                    }
                }, 500);
            }
        });
    });

    // ===== CTA BUTTON TRACKING =====
    const ctaButtons = document.querySelectorAll('.btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent.trim();
            const buttonHref = button.getAttribute('href');
            
            if (window.firebaseManager) {
                window.firebaseManager.trackButtonClick(buttonText, buttonHref || 'unknown');
            }
        });
    });

    // ===== WHATSAPP INTEGRATION =====
    const whatsappButtons = document.querySelectorAll('a[href*="wa.me"], .btn-whatsapp');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (window.firebaseManager) {
                window.firebaseManager.trackButtonClick('whatsapp_contact', 'contact');
            }
        });
    });

    // ===== SOCIAL MEDIA TRACKING =====
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.addEventListener('click', () => {
            const platform = link.innerHTML.includes('instagram') ? 'instagram' : 
                           link.innerHTML.includes('facebook') ? 'facebook' :
                           link.innerHTML.includes('linkedin') ? 'linkedin' : 'unknown';
            
            if (window.firebaseManager) {
                window.firebaseManager.trackButtonClick(`social_${platform}`, 'footer');
            }
        });
    });

    // ===== SCROLL ANIMATIONS =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .portfolio-item, .feature, .stat');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // ===== PERFORMANCE TRACKING =====
    // Track page performance
    window.addEventListener('load', () => {
        if (window.firebaseManager && 'performance' in window) {
            setTimeout(() => {
                const perfData = performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                window.firebaseManager.trackEvent('page_performance', {
                    load_time: loadTime,
                    dom_ready: perfData.domContentLoadedEventEnd - perfData.navigationStart,
                    page_url: window.location.href
                });
            }, 1000);
        }
    });

    // ===== AOS INITIALIZATION =====
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 100
        });
    }

    // ===== CONSOLE BRANDING =====
    console.log('%cM3 Agência ADS', 'color: #0066FF; font-size: 24px; font-weight: bold;');
    console.log('%cMarketing Digital que Gera Resultados', 'color: #666; font-size: 14px;');
    console.log('%cSite desenvolvido com ❤️ pela equipe M3', 'color: #333; font-size: 12px;');
    
});

// ===== UTILITY FUNCTIONS =====
function formatPhoneNumber(phone) {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XX) XXXXX-XXXX
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// ===== EXPORT FOR EXTERNAL USE =====
window.M3Agency = {
    formatPhoneNumber,
    validateEmail,
    sanitizeInput
};