document.addEventListener('DOMContentLoaded', async () => {

    // 1. Theme Observer configuration for chart redraws
    Chart.defaults.font.family = "'DM Sans', sans-serif";
    
    const applyChartTheme = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        Chart.defaults.color = isDark ? "#A0A0B0" : "#666666";
        if (window.trendsChart) window.trendsChart.update();
    }
    const observer = new MutationObserver(applyChartTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    applyChartTheme();

    // Fetch API Data
    let expenses = [];
    try {
        expenses = await api.getExpenses();
    } catch(e) {
        console.error("Failed to fetch expenses", e);
    }

    const baselineCats = ['Groceries', 'Rent', 'Transport', 'Entertainment', 'Health'];
    const thisMonthData = baselineCats.map(cat => {
        return expenses.filter(e => e.cat === cat).reduce((sum, e) => sum + e.amount, 0);
    });

    // Mock last month for visual reference
    const lastMonthData = [320, 1200, 150, 140, 50];

    // 2. Main Spending Bar Chart Config
    const trendsCtx = document.getElementById('trendsBarChart');
    if (trendsCtx) {
        window.trendsChart = new Chart(trendsCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: baselineCats,
                datasets: [
                    {
                        label: 'Last Month',
                        data: lastMonthData,
                        backgroundColor: '#1A1A2E',
                        borderRadius: 4, barPercentage: 0.6, categoryPercentage: 0.8
                    },
                    {
                        label: 'This Month',
                        data: thisMonthData,
                        backgroundColor: '#C9A84C',
                        borderRadius: 4, barPercentage: 0.6, categoryPercentage: 0.8
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, padding: 20 } },
                    tooltip: { backgroundColor: '#1A1A2E', padding: 12, cornerRadius: 8 }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: () => document.documentElement.getAttribute('data-theme')==='dark'?'rgba(255,255,255,0.05)':'#F3F3F3', drawBorder: false },
                        ticks: { callback: v => '€' + v }
                    },
                    x: { grid: { display: false, drawBorder: false } }
                }
            }
        });
    }

    // 3. SVG Data Ring Boot Interpolations
    setTimeout(() => {
        document.querySelectorAll('.ring-wrap').forEach(wrap => {
            const pct = parseFloat(wrap.getAttribute('data-pct'));
            const circle = wrap.querySelector('.ring-fill');
            if (circle && !isNaN(pct)) {
                // Derived circle dasharray length from properties via CSS (283 = radius 45 * 2 * PI)
                const offset = 283 - ((pct / 100) * 283);
                circle.style.strokeDashoffset = offset;
            }
        });
    }, 400); // Trigger offset slightly after page load for smooth aesthetic flow

    // 4. Interactive Budget Simulator Submodule
    const slider = document.getElementById('takeaway-slider');
    const valText = document.getElementById('slider-val');
    const yearText = document.getElementById('sim-year');
    const grocText = document.getElementById('sim-groceries');

    if (slider) {
        slider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            // Re-render strings gracefully
            valText.textContent = `€${val}`;
            
            const yearly = val * 12;
            yearText.textContent = `€${yearly.toLocaleString()}`;
            
            // Assume 1 month groceries baseline estimate equates to €350 per module spec
            const grocMonths = (yearly / 350).toFixed(1);
            grocText.textContent = grocMonths;
        });
    }

    // 5. Button Status Change Trackers
    document.querySelectorAll('.btn-acknowledge').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.add('acknowledged');
            this.innerHTML = '<i class="ph-fill ph-check-circle"></i> Acknowledged';
        });
    });
});
