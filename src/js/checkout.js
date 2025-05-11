import { loadStripe } from '@stripe/stripe-js';

// Initialisation de Stripe
const stripe = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const checkoutButton = document.getElementById('checkout-button');
  
  checkoutButton.addEventListener('click', async () => {
    try {
      // Désactiver le bouton pendant la requête
      checkoutButton.disabled = true;
      checkoutButton.textContent = 'Chargement...';
      
      // Créer la session Checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur réseau');
      }
      
      const { sessionId } = await response.json();
      
      // Rediriger vers Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
      
      // Réactiver le bouton
      checkoutButton.disabled = false;
      checkoutButton.textContent = 'Payer avec Stripe';
    }
  });
});
