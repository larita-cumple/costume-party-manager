// Initialize Supabase client
const SUPABASE_URL = 'https://vyytxykdkbhhtmvfzurz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eXR4eWtka2JoaHRtdmZ6dXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNTgyMDQsImV4cCI6MjA0ODkzNDIwNH0.bogfxHml4YjSM4Iqqu8u6KKE6SAxummMDwbXhIVPcg4'
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

class CostumeManager {
    constructor() {
        this.form = document.getElementById('costumeForm');
        this.resultDiv = document.getElementById('result');
        this.initialize();
    }

    initialize() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const costume = document.getElementById('costume').value.trim();

        try {
            const response = await this.checkAndReserveCostume(name, costume);
            if (response.success) {
                this.showResult('¡Disfraz reservado con éxito! 🎉', 'success');
                this.form.reset();
            } else {
                this.showResult(`Disculpá, ${response.message} 😔`, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showResult('Ocurrió un error. Por favor, intentá de nuevo más tarde. 😔', 'error');
        }
    }

    async checkAndReserveCostume(name, costume) {
        try {
            // First check if costume exists
            const { data: existingCostumes, error: checkError } = await supabase
                .from('costumes')
                .select('costume')
                .eq('costume', costume.toLowerCase());

            if (checkError) {
                console.error('Check error:', checkError);
                return { success: false, message: 'ocurrió un error al verificar el disfraz.' };
            }

            if (existingCostumes && existingCostumes.length > 0) {
                return { success: false, message: 'este disfraz ya fue reservado. ¡Elegí otro!' };
            }

            // If costume doesn't exist, create new reservation
            const { data, error: insertError } = await supabase
                .from('costumes')
                .insert([{ 
                    name: name,
                    costume: costume.toLowerCase()
                }]);

            if (insertError) {
                console.error('Insert error:', insertError);
                return { success: false, message: 'no se pudo reservar el disfraz.' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error in checkAndReserveCostume:', error);
            return { success: false, message: 'ocurrió un error inesperado.' };
        }
    }

    showResult(message, type) {
        this.resultDiv.innerHTML = `<div class="result-${type}">${message}</div>`;
        setTimeout(() => {
            this.resultDiv.innerHTML = '';
        }, 5000);
    }
}

// Initialize the app
new CostumeManager(); 