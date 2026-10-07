import type { Customer } from '../types/customer.types'

export function printCustomerStatement(customer: Customer, companyName: string = 'Enterprise POS System') {
  const printWindow = window.open('', '_blank', 'width=850,height=900')
  if (!printWindow) return

  const dateStr = new Date().toLocaleDateString('km-KH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const sales = customer.sales || []
  const outstanding = Number(customer.outstanding_balance || 0)
  const creditLimit = Number(customer.credit_limit || 0)
  const wallet = Number(customer.wallet_balance || 0)
  const points = Number(customer.loyalty_points || 0)

  const rowsHtml = sales.length > 0
    ? sales.map((s: any, idx: number) => `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${idx + 1}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold;">${s.invoice_no || s.reference_no || ('INV-' + s.id)}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase;">${s.payment_status || 'paid'}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold;">$${Number(s.total_amount || s.grand_total || 0).toFixed(2)}</td>
        </tr>
      `).join('')
    : `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #64748b;">គ្មានប្រវត្តិវិក្កយបត្រថ្មីៗឡើយ (No recent sales records)</td></tr>`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Customer Statement - ${customer.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700&display=swap');
          body {
            font-family: 'Kantumruy Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 30px;
            background: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .company-name {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
          }
          .statement-title {
            font-size: 18px;
            font-weight: 700;
            color: #2563eb;
            text-align: right;
            text-transform: uppercase;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px 16px;
          }
          .info-card h4 {
            margin: 0 0 8px 0;
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
          }
          .info-card p {
            margin: 3px 0;
            font-size: 13px;
          }
          .summary-boxes {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 25px;
          }
          .summary-box {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px;
            text-align: center;
          }
          .summary-box .label {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
          }
          .summary-box .val {
            font-size: 16px;
            font-weight: 700;
            font-family: monospace;
            margin-top: 4px;
          }
          .danger { color: #e11d48; }
          .success { color: #16a34a; }
          .primary { color: #2563eb; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 12px;
          }
          th {
            background: #f1f5f9;
            padding: 10px;
            text-align: left;
            font-weight: 700;
            border-bottom: 2px solid #cbd5e1;
          }
          .footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #64748b;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company-name">${companyName}</div>
            <p style="margin: 4px 0; font-size: 12px; color: #64748b;">Enterprise POS & E-Commerce Platform</p>
          </div>
          <div>
            <div class="statement-title">របាយការណ៍គណនីអតិថិជន</div>
            <p style="margin: 4px 0; font-size: 11px; color: #64748b; text-align: right;">Statement of Account</p>
            <p style="margin: 2px 0; font-size: 11px; color: #64748b; text-align: right;">កាលបរិច្ឆេទ: ${dateStr}</p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <h4>ព័ត៌មានអតិថិជន (Customer Information)</h4>
            <p><strong>ឈ្មោះ:</strong> ${customer.name}</p>
            <p><strong>លេខទូរស័ព្ទ:</strong> ${customer.phone || 'N/A'}</p>
            <p><strong>អ៊ីមែល:</strong> ${customer.email || 'N/A'}</p>
            <p><strong>លេខសារពើពន្ធ (TIN):</strong> ${customer.tax_number || 'N/A'}</p>
          </div>
          <div class="info-card">
            <h4>លក្ខខណ្ឌឥណទាន (Credit & Billing Terms)</h4>
            <p><strong>លក្ខខណ្ឌទូទាត់:</strong> ${customer.payment_terms ? customer.payment_terms.toUpperCase() : 'PREPAID'}</p>
            <p><strong>ក្រុមអតិថិជន:</strong> ${customer.group?.name || 'General'}</p>
            <p><strong>ស្ថានភាពឥណទាន:</strong> ${customer.is_credit_hold ? '<span class="danger">ជាប់សោ (Credit Hold)</span>' : '<span class="success">ធម្មតា (Active)</span>'}</p>
            <p><strong>ផ្នែក RFM:</strong> ${customer.rfm_segment ? customer.rfm_segment.toUpperCase() : 'REGULAR'}</p>
          </div>
        </div>

        <div class="summary-boxes">
          <div class="summary-box">
            <div class="label">ដែនកំណត់ឥណទាន</div>
            <div class="val primary">$${creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-box">
            <div class="label">បំណុលត្រូវទូទាត់</div>
            <div class="val danger">$${outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-box">
            <div class="label">កាបូបប្រាក់ហាង</div>
            <div class="val success">$${wallet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-box">
            <div class="label">ពិន្ទុរង្វាន់សរុប</div>
            <div class="val">${points.toLocaleString()} pts</div>
          </div>
        </div>

        <h4 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase;">ប្រវត្តិវិក្កយបត្រ & ការបញ្ជាទិញ (Order & Invoicing History)</h4>
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>លេខវិក្កយបត្រ (Invoice No)</th>
              <th>កាលបរិច្ឆេទ</th>
              <th>ស្ថានភាពទូទាត់</th>
              <th style="text-align: right;">ចំនួនទឹកប្រាក់ ($)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div>ឯកសារនេះត្រូវបានបង្កើតចេញពីប្រព័ន្ធ Enterprise POS & CRM System</div>
          <div>ហត្ថលេខាអ្នករៀបចំ / Prepared by: _______________________</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}

export default printCustomerStatement
