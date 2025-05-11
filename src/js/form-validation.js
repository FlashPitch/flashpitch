document.addEventListener('alpine:init', () => {
  Alpine.data('formValidation', () => ({
    currentStep: 1,
    maxSteps: 12,
    formData: {
      company_name: '',
      industry: '',
      target_market: '',
      unique_value: '',
      problem_solved: '',
      solution: '',
      business_model: '',
      competition: '',
      team: '',
      traction: '',
      financials: '',
      investment_ask: ''
    },
    loading: false,
    sessionId: null,
    
    init() {
      // Récupérer le session_id de l'URL
      const urlParams = new URLSearchParams(window.location.search);
      this.sessionId = urlParams.get('session_id');
      
      if (!this.sessionId) {
        window.location.href = '/checkout';
        return;
      }
      
      this.verifySession();
    },
    
    async verifySession() {
      try {
        const response = await fetch(`/api/verify-session?session_id=${this.sessionId}`);
        const data = await response.json();
        
        if (!data.paid) {
          window.location.href = '/checkout';
        }
      } catch (error) {
        console.error('Error:', error);
        window.location.href = '/checkout';
      }
    },
    
    nextStep() {
      if (this.validateCurrentStep()) {
        this.currentStep = Math.min(this.currentStep + 1, this.maxSteps);
      }
    },
    
    previousStep() {
      this.currentStep = Math.max(this.currentStep - 1, 1);
    },
    
    validateCurrentStep() {
      const currentField = Object.keys(this.formData)[this.currentStep - 1];
      const value = this.formData[currentField].trim();
      
      // Validation minimale : au moins 3 caractères
      return value.length >= 3;
    },
    
    getProgressPercentage() {
      return Math.round((this.currentStep / this.maxSteps) * 100);
    },
    
    async submitForm() {
      if (!this.validateCurrentStep()) return;
      
      this.loading = true;
      
      try {
        const response = await fetch(process.env.ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: this.sessionId,
            ...this.formData
          }),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la soumission');
        }
        
        // Redirection vers la page de remerciement
        window.location.href = `/thank-you?session_id=${this.sessionId}`;
      } catch (error) {
        console.error('Error:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
        this.loading = false;
      }
    }
  }));
});
