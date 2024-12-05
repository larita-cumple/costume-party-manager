// Replace this with your Google Apps Script deployment ID
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw--m9fvDpdoVxCPT0E-kyeHRplMcNtnXAecKiA-xVaoPNY_hT465KP4J3HAWtThPlD/exec";

class CostumeManager {
    constructor() {
        this.form = document.getElementById('costumeForm');
        this.resultDiv = document.getElementById('result');
        this.reservedList = document.getElementById('reservedList');
        this.initialize();
    }

    initialize() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.loadReservedCostumes();
    }

    async handleSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const costume = document.getElementById('costume').value.trim();

        try {
            const response = await this.checkAndReserveCostume(name, costume);
            if (response.success) {
                this.showResult('Costume successfully reserved! 🎉', 'success');
                this.loadReservedCostumes();
                this.form.reset();
            } else {
                this.showResult(`Sorry, ${response.message} 😔`, 'error');
            }
        } catch (error) {
            this.showResult('An error occurred. Please try again later. 😔', 'error');
        }
    }

    async checkAndReserveCostume(name, costume) {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'checkAndReserve',
                name: name,
                costume: costume
            })
        });

        return await response.json();
    }

    async loadReservedCostumes() {
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'getReserved'
                })
            });

            const data = await response.json();
            this.updateReservedList(data.reservations);
        } catch (error) {
            console.error('Error loading reserved costumes:', error);
        }
    }

    updateReservedList(reservations) {
        this.reservedList.innerHTML = '';
        reservations.forEach(({name, costume}) => {
            const item = document.createElement('div');
            item.className = 'list-group-item';
            item.textContent = `${name} → ${costume}`;
            this.reservedList.appendChild(item);
        });
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