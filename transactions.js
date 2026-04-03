document.addEventListener('DOMContentLoaded', async () => {

    let mockData = [];
    try {
        mockData = await api.getExpenses();
    } catch(e) {
        console.error("Failed to fetch expenses", e);
    }

    const tbody = document.getElementById('tx-body');
    const totalEl = document.getElementById('total-shown');
    const personalBtn = document.getElementById('btn-personal');
    const householdBtn = document.getElementById('btn-household');
    const userColHeaders = document.querySelectorAll('.user-col');

    let isHousehold = false;

    function renderTable() {
        tbody.innerHTML = '';
        let total = 0;

        // Apply view logic toggle correctly
        const filtered = mockData.filter(item => {
            // For mock logic: 'MK' is the primary user
            if (!isHousehold && item.user !== 'MK') return false; 
            return true;
        });

        if (filtered.length === 0) {
            document.getElementById('table-container').style.display = 'none';
            document.getElementById('empty-state').style.display = 'flex';
        } else {
            document.getElementById('table-container').style.display = 'block';
            document.getElementById('empty-state').style.display = 'none';
            
            filtered.forEach(tx => {
                total += tx.amount;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${tx.date}</td>
                    <td><i class="ph ${tx.icon}"></i> ${tx.cat}</td>
                    <td>${tx.desc}</td>
                    <td class="user-col" style="${isHousehold ? '' : 'display:none;'}">
                        <span class="user-badge">${tx.user}</span>
                    </td>
                    <td class="amount-col">€${tx.amount.toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Toggle user column visibility gracefully
        userColHeaders.forEach(th => th.style.display = isHousehold ? 'table-cell' : 'none');
        
        // Sum projection
        totalEl.textContent = '€' + total.toLocaleString('en-IE', { minimumFractionDigits: 2 });
    }

    renderTable(); // Init runtime

    // Interaction Subscriptions
    personalBtn.addEventListener('click', () => {
        isHousehold = false;
        personalBtn.classList.add('active');
        householdBtn.classList.remove('active');
        renderTable();
    });

    householdBtn.addEventListener('click', () => {
        isHousehold = true;
        householdBtn.classList.add('active');
        personalBtn.classList.remove('active');
        renderTable();
    });

    // CSV Data Object Exporter Native Function
    document.getElementById('btn-export').addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8,Date,Category,Description,Amount,Payment Method\n";
        
        mockData.forEach(row => {
            csvContent += `"${row.date}","${row.cat}","${row.desc}","${row.amount}","${row.payment}"\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "ledger_transactions.csv");
        document.body.appendChild(link); // Reqd for engine compliance
        link.click();
        document.body.removeChild(link);
    });
});
