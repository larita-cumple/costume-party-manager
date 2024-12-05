// Initialize Supabase client
const SUPABASE_URL = 'https://vyytxykdkbhhtmvfzurz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eXR4eWtka2JoaHRtdmZ6dXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNTgyMDQsImV4cCI6MjA0ODkzNDIwNH0.bogfxHml4YjSM4Iqqu8u6KKE6SAxummMDwbXhIVPcg4'
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

class CostumeManager {
    constructor() {
        this.form = document.getElementById('costumeForm');
        this.resultDiv = document.getElementById('result');
        this.initialize();
        this.SIMILARITY_THRESHOLD = 0.8; // 80% similarity threshold
    }

    initialize() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Normalize text by removing special characters, extra spaces, and converting to lowercase
    normalizeText(text) {
        return text
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();
    }

    // Calculate Levenshtein distance between two strings
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
        
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j - 1][i] + 1, // deletion
                    matrix[j][i - 1] + 1, // insertion
                    matrix[j - 1][i - 1] + cost // substitution
                );
            }
        }
        return matrix[str2.length][str1.length];
    }

    // Calculate similarity ratio between two strings
    calculateSimilarity(str1, str2) {
        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0) return 1.0; // Both strings are empty
        const distance = this.levenshteinDistance(str1, str2);
        return 1 - distance / maxLength;
    }

    // Check if two costumes are too similar
    areCostumesSimilar(costume1, costume2) {
        const normalized1 = this.normalizeText(costume1);
        const normalized2 = this.normalizeText(costume2);

        // Check for exact match after normalization
        if (normalized1 === normalized2) return true;

        // Split into words and check for significant word overlap
        const words1 = normalized1.split(' ');
        const words2 = normalized2.split(' ');

        // Check each word combination for similarity
        for (const word1 of words1) {
            for (const word2 of words2) {
                if (word1.length > 3 && word2.length > 3) { // Only compare words longer than 3 characters
                    const similarity = this.calculateSimilarity(word1, word2);
                    if (similarity >= this.SIMILARITY_THRESHOLD) {
                        return true;
                    }
                }
            }
        }

        // Check overall costume name similarity
        const overallSimilarity = this.calculateSimilarity(normalized1, normalized2);
        return overallSimilarity >= this.SIMILARITY_THRESHOLD;
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
            // Get all costumes to check for similarity
            const { data: existingCostumes, error: checkError } = await supabase
                .from('costumes')
                .select('costume');

            if (checkError) {
                console.error('Check error:', checkError);
                return { success: false, message: 'ocurrió un error al verificar el disfraz.' };
            }

            // Check for similar costumes
            for (const existingCostume of existingCostumes || []) {
                if (this.areCostumesSimilar(costume, existingCostume.costume)) {
                    return { 
                        success: false, 
                        message: 'ya existe un disfraz muy parecido. ¡Probá con otra idea!' 
                    };
                }
            }

            // If no similar costume exists, create new reservation
            const { data, error: insertError } = await supabase
                .from('costumes')
                .insert([{ 
                    name: name,
                    costume: this.normalizeText(costume)
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