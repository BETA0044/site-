// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";

// Firebase configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyBh8uM5AAnhq0v5sYRmxhmojR6U2AGQ6xM",
  authDomain: "m3marketin.firebaseapp.com",
  projectId: "m3marketin",
  storageBucket: "m3marketin.firebasestorage.app",
  messagingSenderId: "676882325113",
  appId: "1:676882325113:web:9ca484ef0f052a106cfea8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Export Firebase services for use in other modules
window.firebaseApp = app;
window.firestoreDB = db;
window.firebaseAnalytics = analytics;

// Firebase utility functions
class FirebaseManager {
    constructor() {
        this.db = db;
        this.analytics = analytics;
    }

    // Add contact form submission to Firestore
    async addContactSubmission(formData) {
        try {
            const docRef = await addDoc(collection(this.db, 'contact_submissions'), {
                ...formData,
                timestamp: serverTimestamp(),
                status: 'new',
                source: 'website_contact_form'
            });
            
            console.log('Contact submission added with ID: ', docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error adding contact submission: ', error);
            return { success: false, error: error.message };
        }
    }

    // Add newsletter subscription
    async addNewsletterSubscription(email, name = '') {
        try {
            const docRef = await addDoc(collection(this.db, 'newsletter_subscriptions'), {
                email: email,
                name: name,
                timestamp: serverTimestamp(),
                status: 'subscribed',
                source: 'website'
            });
            
            console.log('Newsletter subscription added with ID: ', docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error adding newsletter subscription: ', error);
            return { success: false, error: error.message };
        }
    }

    // Track custom analytics events
    trackEvent(eventName, parameters = {}) {
        try {
            if (this.analytics) {
                import("https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js")
                    .then(({ logEvent }) => {
                        logEvent(this.analytics, eventName, parameters);
                    });
            }
        } catch (error) {
            console.error('Error tracking event: ', error);
        }
    }

    // Track page views
    trackPageView(pageName) {
        this.trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_name: pageName
        });
    }

    // Track contact form interactions
    trackContactFormInteraction(action, formData = {}) {
        this.trackEvent('contact_form_interaction', {
            action: action,
            service_interest: formData.service || 'not_specified',
            timestamp: new Date().toISOString()
        });
    }

    // Track button clicks
    trackButtonClick(buttonName, location = '') {
        this.trackEvent('button_click', {
            button_name: buttonName,
            button_location: location,
            timestamp: new Date().toISOString()
        });
    }

    // Track service interest
    trackServiceInterest(serviceName) {
        this.trackEvent('service_interest', {
            service_name: serviceName,
            timestamp: new Date().toISOString()
        });
    }
}

// Initialize Firebase Manager
const firebaseManager = new FirebaseManager();
window.firebaseManager = firebaseManager;

// Track initial page load
document.addEventListener('DOMContentLoaded', () => {
    firebaseManager.trackPageView('home');
    console.log('Firebase initialized successfully for M3 Agência');
});

export { firebaseManager, db, analytics };