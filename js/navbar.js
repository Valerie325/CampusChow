/**
 * Navigation/Header management script
 * Updates navbar based on authentication status
 */

document.addEventListener('DOMContentLoaded', function() {
  updateNavigation();
});

function updateNavigation() {
  const isLoggedIn = isAuthenticated();
  const navLinks = document.querySelector('.nav-links');
  const mobileNavLinks = document.querySelector('.mobile-sidebar');
  
  if (!navLinks) return;

  // Find and update Sign In/Sign Up links to Sign Out if authenticated
  if (isLoggedIn) {
    const user = getLoggedInUser();
    const userName = user ? (user.fullName || user.name || 'User') : 'User';
    
    // Update desktop navigation
    const signinLink = navLinks.querySelector('a[href="signin.html"]');
    const signupLink = navLinks.querySelector('a[href="sign.html"]');
    
    if (signinLink && signupLink) {
      // Replace Sign In and Sign Up with user info and Sign Out
      signinLink.textContent = `Welcome, ${userName.split(' ')[0]}`;
      signinLink.href = '#';
      signinLink.style.pointerEvents = 'none';
      signinLink.style.cursor = 'default';
      
      signupLink.textContent = 'Sign Out';
      signupLink.href = '#';
      signupLink.onclick = function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to sign out?')) {
          logout();
        }
      };
    }
    
    // Update mobile navigation
    if (mobileNavLinks) {
      const mobileSigninLink = mobileNavLinks.querySelector('a[href="signin.html"]');
      const mobileSignupLink = mobileNavLinks.querySelector('a[href="sign.html"]');
      
      if (mobileSigninLink && mobileSignupLink) {
        mobileSigninLink.textContent = `Welcome, ${userName.split(' ')[0]}`;
        mobileSigninLink.href = '#';
        mobileSigninLink.style.pointerEvents = 'none';
        
        mobileSignupLink.textContent = 'Sign Out';
        mobileSignupLink.href = '#';
        mobileSignupLink.onclick = function(e) {
          e.preventDefault();
          if (confirm('Are you sure you want to sign out?')) {
            logout();
          }
        };
      }
    }
  }
}
