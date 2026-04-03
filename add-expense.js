document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Default to today's date
    const dateField = document.getElementById('date');
    if (dateField) {
        const today = new Date().toISOString().split('T')[0];
        dateField.value = today;
    }

    // 2. Global Keyboard Shortcut 'N'
    document.addEventListener('keydown', (e) => {
        // Only trigger 'n'/'N' if the user isn't modifying an input/textarea
        const tag = document.activeElement.tagName.toLowerCase();
        if ((e.key === 'n' || e.key === 'N') && tag !== 'input' && tag !== 'textarea') {
            e.preventDefault();
            const amtBox = document.getElementById('amount');
            if (amtBox) {
                // Smooth scroll to top then focus
                window.scrollTo({ top: 0, behavior: 'smooth' });
                amtBox.focus();
            }
        }
    });

    // 3. Smart Category Recommendations
    const descInput = document.getElementById('description');
    const catSelect = document.getElementById('category');

    if (descInput && catSelect) {
        descInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            
            // Map keywords to standard categories dynamically
            if (val.includes('tesco') || val.includes('lidl') || val.includes('aldi') || val.includes('dunnes')) {
                catSelect.value = 'groceries';
            } else if (val.includes('bus') || val.includes('luas') || val.includes('train') || val.includes('uber')) {
                catSelect.value = 'transport';
            } else if (val.includes('netflix') || val.includes('spotify') || val.includes('cinema') || val.includes('disney')) {
                catSelect.value = 'entertainment';
            } else if (val.includes('pharmacy') || val.includes('doctor') || val.includes('dentist')) {
                catSelect.value = 'health';
            }
        });
    }

    // 4. Submission Success Animation Wrap
    const form = document.getElementById('expense-form');
    const successBanner = document.getElementById('success-banner');
    
    // Wire main form
    if (form && successBanner) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const origText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            const newExpense = {
                date: document.getElementById('date').value,
                amount: parseFloat(document.getElementById('amount').value),
                cat: document.getElementById('category').options[document.getElementById('category').selectedIndex].text,
                desc: document.getElementById('description').value,
                payment: document.getElementById('payment-method') ? document.getElementById('payment-method').options[document.getElementById('payment-method').selectedIndex].text : 'Card'
            };

            // Map categories to icons
            const iconMap = {
                'Groceries': 'ph-shopping-cart',
                'Transport': 'ph-train',
                'Entertainment': 'ph-film-strip',
                'Rent': 'ph-house',
                'Health': 'ph-heartbeat',
                'Other': 'ph-receipt'
            };
            newExpense.icon = iconMap[newExpense.cat] || 'ph-receipt';

            try {
                await api.addExpense(newExpense);
                
                successBanner.style.display = 'flex';
                successBanner.classList.add('fade-in');
                
                setTimeout(() => {
                    successBanner.classList.remove('fade-in');
                    successBanner.style.opacity = '0';
                    setTimeout(() => {
                        successBanner.style.display = 'none';
                        successBanner.style.opacity = '1';
                        form.reset();
                        if (dateField) dateField.value = new Date().toISOString().split('T')[0];
                    }, 300);
                }, 2000);

            } catch(err) {
                console.error("Save failed", err);
                alert("Failed to save expense");
            } finally {
                submitBtn.textContent = origText;
                submitBtn.disabled = false;
            }
        });
    }

    // Quick Add Submission (Mimic main form success for consistency)
    const quickAddBtn = document.getElementById('btn-quick-add');
    if (quickAddBtn) {
        quickAddBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const qAmt = document.getElementById('quick-amount');
            if (qAmt.value) {
                quickAddBtn.disabled = true;
                quickAddBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';

                try {
                    await api.addExpense({
                        date: new Date().toISOString().split('T')[0],
                        amount: parseFloat(qAmt.value),
                        cat: 'Other',
                        desc: 'Quick Add',
                        icon: 'ph-lightning',
                        payment: 'Card'
                    });

                    successBanner.style.display = 'flex';
                    successBanner.classList.add('fade-in');
                    setTimeout(() => {
                        successBanner.style.display = 'none';
                        qAmt.value = '';
                    }, 2000);
                } catch(err) {
                    console.error("Save failed", err);
                } finally {
                    quickAddBtn.disabled = false;
                    quickAddBtn.innerHTML = '<i class="ph ph-plus"></i>';
                }
            }
        });
    }

});
