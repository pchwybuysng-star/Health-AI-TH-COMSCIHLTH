import re

with open('Script.js', 'r') as f:
    js = f.read()

replacement = r"""
        // 4. WBC (Doughnut)
        const ctxBlood = document.getElementById('chartBlood');
        if (ctxBlood) {
            instances.push(new Chart(ctxBlood, {
                type: 'doughnut',
                data: {
                    labels: ['Neutrophil', 'Lymphocyte', 'Monocyte', 'Eosinophil'],
                    datasets: [{
                        data: dataWbc,
                        backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right', labels: { color: isDarkMode ? '#e2e8f0' : '#64748b', font: { family: 'Prompt' }, usePointStyle: true, boxWidth: 6 } }
                    },
                    cutout: '70%'
                }
            }));
        }

        // 5. Hormones (Radar)
        const ctxHormone = document.getElementById('chartHormone');
        if (ctxHormone) {
            instances.push(new Chart(ctxHormone, {
                type: 'radar',
                data: {
                    labels: ['Cortisol', 'Thyroid', 'DHEA', 'Testosterone', 'Insulin'],
                    datasets: [{
                        label: 'สมดุลฮอร์โมน (Score)',
                        data: dataHor,
                        backgroundColor: 'rgba(14, 165, 233, 0.2)',
                        borderColor: '#0ea5e9',
                        pointBackgroundColor: '#0ea5e9',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#0ea5e9'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { color: gridColor },
                            grid: { color: gridColor },
                            pointLabels: { color: textColor, font: { family: 'Prompt' } },
                            ticks: { display: false, min: 0, max: 100 }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            }));
        }
"""

pattern = re.compile(r'// 4\. WBC \(Doughnut\).*?// 5\. Hormones \(Radar\).*?\}\)\);\s*\}', re.DOTALL)
new_js = pattern.sub(replacement.replace('\\', '\\\\'), js)

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("Updated chart logic part 2.")
