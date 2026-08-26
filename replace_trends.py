import sys

with open('/Users/panaoonchuayboonsong/Desktop/lablink-hackathon/index.html', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if '<section class="view-section" id="view-trends"' in line:
        start_idx = i
    if start_idx != -1 and 'id="view-ai"' in line:
        # find previous </section>
        for j in range(i-1, start_idx, -1):
            if '</section>' in lines[j]:
                end_idx = j
                break
        break

if start_idx != -1 and end_idx != -1:
    new_content = """            <!-- View: Trends (Historical Data) -->
            <section class="view-section" id="view-trends" style="display: none;">
                <div class="card glass-card full-width">
                    <div class="card-header-flex">
                        <h2 data-i18n="trends_title">📈 กราฟเปรียบเทียบผลเลือดย้อนหลัง</h2>
                        <select id="trend-selector" style="padding: 6px; border-radius: 6px; border: 1px solid var(--border);" onchange="updateTrendsChart()">
                            <option value="ldl">ไขมันเลว (LDL)</option>
                            <option value="fbs">น้ำตาล (FBS)</option>
                        </select>
                    </div>
                    <p style="color: var(--text-light); margin-bottom: 24px;" data-i18n="trends_desc">เปรียบเทียบผลตรวจสุขภาพของปีนี้กับข้อมูลประวัติย้อนหลัง (2024-2025)</p>
                    
                    <div style="width: 100%; height: 400px; position: relative;">
                        <canvas id="historicalChart"></canvas>
                    </div>
                </div>
            </section>\n"""
    
    # replace start_idx to end_idx
    lines[start_idx:end_idx+1] = [new_content]
    
    with open('/Users/panaoonchuayboonsong/Desktop/lablink-hackathon/index.html', 'w') as f:
        f.writelines(lines)
    print("Replaced view-trends")
else:
    print("Could not find bounds")

