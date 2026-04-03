document.addEventListener('DOMContentLoaded', async function() {
    
    // --- Card Number Count-Up Animation ---
    function countUp(el, target, duration = 1200) {
        const isCurrency = el.textContent.includes('€') || el.dataset.currency === 'true';
        const isPercentage = el.textContent.includes('%') || el.dataset.percentage === 'true';
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOutCubic * target);
            
            let displayStr = current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (isCurrency) displayStr = '€' + displayStr;
            if (isPercentage) displayStr = displayStr + '%';
            
            el.textContent = displayStr;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                let finalStr = target.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                if (isCurrency) finalStr = '€' + finalStr;
                if (isPercentage) finalStr = finalStr + '%';
                el.textContent = finalStr;
            }
        };
        window.requestAnimationFrame(step);
    }

    // --- Chart defaults & Palletes ---
    Chart.defaults.font.family = "'DM Sans', sans-serif";
    
    const applyChartTheme = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        Chart.defaults.color = isDark ? "#A0A0B0" : "#666666";
        if (window.myCategoryChart) window.myCategoryChart.update();
        if (window.myTrendChart) window.myTrendChart.update();
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

    // Calculate Dynamic Summaries
    let totalSpent = 0;
    const catTotals = {
        'Groceries': 0, 'Rent': 0, 'Transport': 0, 'Entertainment': 0, 'Health': 0, 'Other': 0
    };

    expenses.forEach(ex => {
        totalSpent += ex.amount;
        if (catTotals[ex.cat] !== undefined) {
            catTotals[ex.cat] += ex.amount;
        } else {
            catTotals[ex.cat] = (catTotals[ex.cat] || 0) + ex.amount;
        }
    });

    // Animate Counters
    const counters = document.querySelectorAll('.count-up');
    // Assume 1st is Total Balance (let's say 4200 - totalSpent for a mock dynamic feel),
    // 2nd is Monthly Spend, 3rd is Savings Target (Static for now)
    
    if (counters.length >= 3) {
        // Balance
        counters[0].dataset.currency = 'true';
        countUp(counters[0], Math.max(0, 4200 - totalSpent));
        
        // Spend
        counters[1].dataset.currency = 'true';
        countUp(counters[1], totalSpent);

        // Savings Goal
        let goalAmount = 500;
        let percentage = Math.min(100, Math.floor(((4200 - totalSpent) / goalAmount) * 100));
        counters[2].dataset.percentage = 'true';
        countUp(counters[2], percentage);
    }

    // --- Spending by Category (Donut Chart) ---
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    const palette = ['#C9A84C', '#1A1A2E', '#889C92', '#BA9F81', '#5B6C78', '#EAEAEA'];
    
    const catLabels = Object.keys(catTotals);
    const catData = Object.values(catTotals);

    window.myCategoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: catLabels,
            datasets: [{
                data: catData,
                backgroundColor: palette,
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, padding: 20, font: { size: 13 } } },
                tooltip: {
                    backgroundColor: '#1A1A2E',
                    titleFont: { family: "'DM Sans', sans-serif", size: 14 },
                    bodyFont: { family: "'DM Sans', sans-serif", size: 13 },
                    padding: 12, cornerRadius: 8, displayColors: false,
                    callbacks: { label: function(context) { return ' ' + context.label + ': €' + context.raw; } }
                }
            }
        }
    });

    // --- Spending Trend (Line Chart) ---
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    let gradient = trendCtx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(201, 168, 76, 0.2)');
    gradient.addColorStop(1, 'rgba(201, 168, 76, 0.0)');

    // Mocking past month trends, swapping March for our dynamically calculated total
    let trendData = [2100, 1950, 2400, 1800, 1750, totalSpent || 1840];

    window.myTrendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
            datasets: [{
                label: 'Spending',
                data: trendData,
                borderColor: '#C9A84C',
                backgroundColor: gradient,
                borderWidth: 3, pointBackgroundColor: '#FFFFFF', pointBorderColor: '#C9A84C', 
                pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6, fill: true, tension: 0.4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: '#1A1A2E', padding: 12, cornerRadius: 8, displayColors: false,
                    callbacks: { label: function(context) { return 'Spending: €' + context.raw; } }
                }
            },
            scales: {
                y: {
                    beginAtZero: true, suggestedMax: 3000,
                    grid: { color: (context) => document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.05)' : '#F3F3F3', drawBorder: false },
                    ticks: { stepSize: 500, font: { size: 12 }, callback: function(value) { return '€' + value; } }
                },
                x: { grid: { display: false, drawBorder: false }, ticks: { font: { size: 13 } } }
            }
        }
    });
});
