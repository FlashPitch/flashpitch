document.addEventListener('alpine:init', () => {
  Alpine.data('thankYou', () => ({
    loading: true,
    error: null,
    slides_url: null,
    pdf_url: null,
    sessionId: null,
    
    init() {
      const urlParams = new URLSearchParams(window.location.search);
      this.sessionId = urlParams.get('session_id');
      
      if (!this.sessionId) {
        window.location.href = '/checkout';
        return;
      }
      
      this.pollStatus();
    },
    
    async pollStatus() {
      const maxAttempts = 60; // 5 minutes maximum (5s * 60)
      let attempts = 0;
      
      const poll = async () => {
        try {
          const response = await fetch(`/api/notify?session_id=${this.sessionId}`);
          const data = await response.json();
          
          if (data.status === 'complete') {
            this.slides_url = data.slides_url;
            this.pdf_url = data.pdf_url;
            this.loading = false;
            return;
          }
          
          if (data.status === 'expired') {
            this.error = 'Le délai d\\'attente a expiré. Veuillez réessayer.';
            this.loading = false;
            return;
          }
          
          attempts++;
          if (attempts >= maxAttempts) {
            this.error = 'Le délai d\\'attente a expiré. Veuillez réessayer.';
            this.loading = false;
            return;
          }
          
          // Réessayer dans 5 secondes
          setTimeout(poll, 5000);
        } catch (error) {
          console.error('Error:', error);
          this.error = 'Une erreur est survenue. Veuillez réessayer.';
          this.loading = false;
        }
      };
      
      poll();
    },
    
    retry() {
      this.loading = true;
      this.error = null;
      this.slides_url = null;
      this.pdf_url = null;
      this.pollStatus();
    }
  }));
});
