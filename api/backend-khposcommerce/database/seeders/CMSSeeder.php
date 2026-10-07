<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use App\Models\Company\Company;
use App\Models\Company\Store;

class CMSSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = Company::value('id') ?? 1;
        $storeId = Store::value('id') ?? 1;

        // Truncate existing CMS tables cleanly to allow safe repeatable execution
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('TRUNCATE TABLE blog_blog_tag, blogs, blog_tags, blog_categories, pages, faqs, banners, media, announcements RESTART IDENTITY CASCADE');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            DB::table('blog_blog_tag')->truncate();
            DB::table('blogs')->truncate();
            DB::table('blog_tags')->truncate();
            DB::table('blog_categories')->truncate();
            DB::table('pages')->truncate();
            DB::table('faqs')->truncate();
            DB::table('banners')->truncate();
            DB::table('media')->truncate();
            DB::table('announcements')->truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }

        // Verify blog storage directory in backend
        $blogStorageDir = storage_path('app/public/blog');
        if (!File::exists($blogStorageDir)) {
            File::makeDirectory($blogStorageDir, 0755, true);
        }

        // 1. Blog Categories (10 records in Standard English)
        $blogCategories = [];
        $catNames = ['Retail Trends', 'POS Technology', 'E-Commerce Tips', 'Inventory Best Practices', 'Marketing Strategies', 'Customer Loyalty', 'Hardware Reviews', 'Software Updates', 'Business Growth', 'Security Alerts'];
        foreach ($catNames as $i => $name) {
            $blogCategories[] = [
                'id' => $i + 1,
                'company_id' => $companyId,
                'name' => $name,
                'slug' => strtolower(str_replace(' ', '-', $name)),
                'description' => "Articles and guides about $name.",
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('blog_categories')->insert($blogCategories);

        // 2. Blog Tags (10 records in Standard English)
        $blogTags = [];
        $tagNames = ['Retail', 'POS', 'Tech', 'Marketing', 'Inventory', 'Loyalty', 'Hardware', 'Software', 'Business', 'Security'];
        foreach ($tagNames as $i => $name) {
            $blogTags[] = [
                'id' => $i + 1,
                'company_id' => $companyId,
                'name' => $name,
                'slug' => strtolower($name),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('blog_tags')->insert($blogTags);

        // 3. Blog Posts / Blogs (10 Authentic Articles with Distinct Dedicated Images)

        $articles = [
    [
        'title' => 'Omnichannel Retailing in Cambodia: Bridging Physical Stores and E-Commerce',
        'cat_id' => 1,
        'image' => 'blog/omnichannel-pos-storefront.jpg',
        'excerpt' => 'How unified cloud POS architecture, automated stock synchronization across branch stores, and instant click-and-collect fulfillment are redefining customer shopping expectations in Phnom Penh and Siem Reap.',
        'content' => '<div class="p-4 my-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">📌 Executive Brief</strong>
  <p>Modern retail customers in Cambodia expect seamless transitions between online discovery and physical store fulfillment. By integrating cloud POS systems with automated inventory synchronization across all branch locations, retailers eliminate overselling and provide frictionless checkout experiences.</p>

  </div>

<h2>1. The Unified Inventory Engine</h2>
<p>In traditional retail setups, physical storefronts and e-commerce websites operate on disconnected databases. When a customer purchases the last flagship smartphone online, a walking customer in Phnom Penh might buy it simultaneously, leading to disappointing order cancellations.</p>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 not-prose">
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-primary">+42%</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Checkout Speed</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-emerald-600">99.8%</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Sync Accuracy</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-blue-600">-65%</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Overselling Risk</div>
  </div>
</div>

<h2>2. Click-and-Collect & In-Store Pickups (BOPIS)</h2>
<p>Buy-Online-Pickup-In-Store (BOPIS) is rapidly becoming the favored shopping method for tech enthusiasts in urban centers:</p>
<ul class="space-y-1.5 my-3">
  <li><strong>Instant Stock Reservation:</strong> Online orders immediately decrement POS shelf availability.</li>
  <li><strong>Automated SMS & Telegram Alerts:</strong> Customers receive secure QR pickup codes via automated bot webhooks.</li>
  <li><strong>Express Counter Verification:</strong> Cashiers scan the customer QR code in under 3 seconds to complete handoff.</li>
</ul>

<div class="p-4 my-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">💡 Pro Strategy</strong>
  <p>Train your retail floor staff to suggest high-margin accessories (such as tempered glass or premium cables) during customer pickup visits to increase average ticket size by 18%.</p>
</div>

<table class="w-full my-4 border-collapse border border-border rounded-xl overflow-hidden text-sm">
  <thead>
    <tr class="bg-muted/60">
      <th class="border border-border p-2.5 text-left font-bold">Feature Metric</th>
      <th class="border border-border p-2.5 text-left font-bold">Legacy POS</th>
      <th class="border border-border p-2.5 text-left font-bold">OptaPOS Omnichannel</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border border-border p-2.5 font-semibold">Inventory Sync</td>
      <td class="border border-border p-2.5 text-rose-500">Manual batch (24h delay)</td>
      <td class="border border-border p-2.5 text-emerald-600 font-bold">Real-time WebSocket (< 500ms)</td>
    </tr>
    <tr>
      <td class="border border-border p-2.5 font-semibold">Order Fulfillment</td>
      <td class="border border-border p-2.5">Separate web warehouse</td>
      <td class="border border-border p-2.5 font-bold">Unified multi-branch routing</td>
    </tr>
    <tr>
      <td class="border border-border p-2.5 font-semibold">Customer Loyalty</td>
      <td class="border border-border p-2.5">Physical card only</td>
      <td class="border border-border p-2.5 font-bold">Phone number & Digital KHQR pass</td>
    </tr>
  </tbody>
</table>

<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground my-5">
  "Omnichannel is no longer a luxury feature for Cambodian retail—it is the baseline requirement for staying competitive in 2026."
</blockquote>',
    ],
    [
        'title' => 'Why Real-Time KHQR Payments are Transforming Phnom Penh Retail',
        'cat_id' => 2,
        'image' => 'blog/smart-retail-ai-pos.jpg',
        'excerpt' => 'The Bakong national payment standard has accelerated digital adoption, eliminated physical change shortages, and slashed cash-handling overhead by 35% for Cambodian supermarkets and retail chains.',
        'content' => '<div class="p-4 my-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">📌 National Payment Breakthrough</strong>
  <p>The widespread adoption of Bakong KHQR across Phnom Penh has revolutionized consumer transactions. By integrating dynamic KHQR directly into dual-display checkout registers, merchants enjoy instant fund settlement with zero credit card swipe fees.</p>
</div>

<h2>1. Elimination of Cash Drawer Discrepancies</h2>
<p>Cash transactions inherently involve risks: physical counting errors, counterfeit banknotes, and shortages of small denomination Riel bills during peak traffic hours.</p>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 not-prose">
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-emerald-600">0%</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Cash Shortage Error</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-primary">< 1.5s</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">QR Scan & Confirm</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-amber-600">0.0%</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Payment Merchant Fee</div>
  </div>
</div>

<h2>2. Dynamic vs Static KHQR Codes</h2>
<p>Static paper QR stands placed on cash counters require cashiers to manually inspect the customer phone screen to verify amounts. OptaPOS integrates <strong>Dynamic KHQR</strong> with customer-facing secondary LCD displays:</p>
<ul class="space-y-1.5 my-3">
  <li><strong>Exact Total Embedded:</strong> The QR contains the exact invoice sum in KHR or USD.</li>
  <li><strong>Webhook Confirmation:</strong> The cashier screen automatically closes the bill upon bank gateway callback.</li>
  <li><strong>Automatic Receipt Print:</strong> Thermal invoice prints without any keyboard confirmation required.</li>
</ul>

<div class="p-4 my-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">💡 Best Practice</strong>
  <p>Configure dual-currency auto-conversion using the official NBC daily exchange rate to allow customers to pay in either Khmer Riel or US Dollars effortlessly.</p>
</div>

<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground my-5">
  "Dynamic KHQR integration cut our average checkout queue time from 45 seconds down to just 12 seconds per customer."
</blockquote>',
    ],
    [
        'title' => 'Complete Guide to Managing Multi-Warehouse Tech Inventories in 2026',
        'cat_id' => 4,
        'image' => 'blog/stock-auditing-shrinkage.jpg',
        'excerpt' => 'Optimizing regional bin locations, automated reorder triggers, inter-branch transfer notes, and serial number tracking across central distribution centers and retail outlets.',
        'content' => '<div class="p-4 my-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">⚠️ High-Value Asset Management</strong>
  <p>Consumer electronics, laptops, and smartphones carry substantial inventory carrying costs. Without strict serial/IMEI tracking and automated bin routing, inventory shrinkage and misplaced stock can severely erode profit margins.</p>
</div>

<h2>1. Bin-Location Optimization & FIFO Dispatch</h2>
<p>Modern warehouse distribution relies on precise coordinate indexing (Aisle-Rack-Shelf-Bin). High-velocity SKUs are allocated near packing bays, while slow-moving bulky hardware rests in higher storage tiers.</p>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 not-prose">
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-primary">-35%</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Picking Travel Time</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-emerald-600">100%</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">IMEI Traceability</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-blue-600">24/7</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Audit Trail Logging</div>
  </div>
</div>

<h2>2. Automated Transfer Orders & Discrepancy Audits</h2>
<p>Moving inventory between central depots (e.g., Sen Sok DC) and outlet storefronts (e.g., Toul Kork Branch) requires strict custody handoffs:</p>
<ul class="space-y-1.5 my-3">
  <li><strong>Digital Dispatch Manifest:</strong> Generates transfer slips with barcode verification.</li>
  <li><strong>In-Transit Status:</strong> Stock in transit remains allocated, preventing artificial inventory spikes.</li>
  <li><strong>Receiving Discrepancy Gate:</strong> Discrepancy reports flag missing units before inventory acceptance.</li>
</ul>

<div class="p-4 my-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">📌 Implementation Roadmap</strong>
  <p>Perform monthly rolling cycle counts on high-value categories rather than freezing store operations for an annual count.</p>
</div>',
    ],
    [
        'title' => 'How to Choose the Best Thermal Barcode Scanner for High-Volume Checkouts',
        'cat_id' => 7,
        'image' => 'blog/thermal-printers-scanners.jpg',
        'excerpt' => 'A comparative hands-on review of 1D linear imagers vs 2D omnidirectional hands-free barcode scanners in busy supermarkets, tech retail outlets, and fast-paced pharmacies.',
        'content' => '<div class="p-4 my-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">📌 Hardware Procurement Guide</strong>
  <p>Barcode scanners are the frontline workhorses of any retail point-of-sale. Selecting the wrong scanner creates cashier wrist fatigue, slow scanning angles, and frequent failures on reflective smartphone screens.</p>
</div>

<h2>1. 1D Laser vs 2D Area Imager Comparison</h2>
<p>While 1D laser scanners were industry standards for decades, modern retail environments necessitate reading 2D QR codes from electronic gift cards, member app screens, and compact QR product labels.</p>

<table class="w-full my-4 border-collapse border border-border rounded-xl overflow-hidden text-sm">
  <thead>
    <tr class="bg-muted/60">
      <th class="border border-border p-2.5 text-left font-bold">Criteria</th>
      <th class="border border-border p-2.5 text-left font-bold">1D Laser Scanner</th>
      <th class="border border-border p-2.5 text-left font-bold">2D Omnidirectional Imager</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border border-border p-2.5 font-semibold">Screen Barcode Read</td>
      <td class="border border-border p-2.5 text-rose-500">Poor / Unreliable</td>
      <td class="border border-border p-2.5 text-emerald-600 font-bold">Instant (0.05s)</td>
    </tr>
    <tr>
      <td class="border border-border p-2.5 font-semibold">Damaged Label Tolerance</td>
      <td class="border border-border p-2.5">Requires flat, clean angle</td>
      <td class="border border-border p-2.5 font-bold">Decodes torn/wrinkled codes</td>
    </tr>
    <tr>
      <td class="border border-border p-2.5 font-semibold">Hands-Free Presentation</td>
      <td class="border border-border p-2.5">Requires trigger squeeze</td>
      <td class="border border-border p-2.5 font-bold">Automatic infrared motion sensor</td>
    </tr>
  </tbody>
</table>

<h2>2. Key Features to Look For in 2026</h2>
<ul class="space-y-1.5 my-3">
  <li><strong>IP54 Ingress Protection:</strong> Guards internal sensors against accidental coffee and water spills.</li>
  <li><strong>1.8-Meter Drop Resistance:</strong> Rubberized bumpers survive repeated falls onto concrete tile floors.</li>
  <li><strong>Plug-and-Play USB-HID:</strong> Driver-free configuration compatible with OptaPOS web client.</li>
</ul>

<div class="p-4 my-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">💡 Pro Strategy</strong>
  <p>For high-throughput checkout counters, equip cashiers with hands-free desktop presentation scanners to allow two-handed item scanning.</p>
</div>',
    ],
    [
        'title' => 'Apple M3 Max vs Intel Core Ultra: Workstation Benchmark for Creatives',
        'cat_id' => 7,
        'image' => 'blog/optapos-v25-analytics.jpg',
        'excerpt' => 'In-depth lab testing on 4K ProRes rendering, thermal throttling, Blender cycles, and battery endurance for developers and video creators working across Southeast Asia.',
        'content' => '<div class="p-4 my-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">📌 Lab Benchmark Report</strong>
  <p>Choosing between Apple Silicon unified memory architecture and Intel latest x86 Core Ultra architecture depends on specific production workloads, local ambient thermals, and software GPU acceleration.</p>
</div>

<h2>1. Sustained 4K Rendering & Export Times</h2>
<p>We tested a 15-minute multi-stream 4K 10-bit ProRes 422 timeline in DaVinci Resolve Studio with temporal noise reduction applied:</p>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 not-prose">
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-primary">4m 12s</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">M3 Max Export Time</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-emerald-600">18.5 hrs</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Battery Video Playback</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-blue-600">400 GB/s</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Unified Memory Bandwidth</div>
  </div>
</div>

<h2>2. Thermal Performance in Tropical Climates</h2>
<p>Working in Cambodia climate (ambient room temperature ~28°C to 32°C without heavy AC) exposes severe thermal throttling in thin x86 chassis after 10 minutes of peak CPU utilization.</p>

<div class="p-4 my-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">💡 Pro Recommendation</strong>
  <p>For mobile video editors and full-stack developers who travel frequently between client offices, the Apple MacBook Pro 16-inch M3 Max offers unmatched unthrottled battery performance.</p>
</div>',
    ],
    [
        'title' => 'Top 5 Strategies to Reduce Churn and Boost Customer Lifetime Value',
        'cat_id' => 6,
        'image' => 'blog/customer-retention-loyalty.jpg',
        'excerpt' => 'Leveraging RFM (Recency, Frequency, Monetary) customer segmentation, automated tiered loyalty points, and personalized WhatsApp/Telegram re-engagement campaigns.',
        'content' => '<div class="p-4 my-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">📌 Customer Retention Blueprint</strong>
  <p>Acquiring a new retail customer costs 5 to 7 times more than retaining an existing buyer. Implementing automated RFM segmentation turns one-time shoppers into lifelong brand advocates.</p>
</div>

<h2>1. The 5 Core Pillars of Modern Retention</h2>
<ul class="space-y-2 my-4">
  <li><strong>1. Instant Loyalty Onboarding:</strong> Register customers using only their phone number during checkout in under 5 seconds.</li>
  <li><strong>2. Transparent Cashback Dollars:</strong> Replace confusing points ratios with clear cash discounts (e.g., $1 reward for every $50 spent).</li>
  <li><strong>3. VIP Tier Privileges:</strong> Offer priority warranty repairs, free home deliveries, and invitation-only gadget launch previews for top-tier spenders.</li>
  <li><strong>4. Automated 45-Day Re-engagement:</strong> Automatically trigger SMS/Telegram discount vouchers when a customer passes their average repurchase cycle.</li>
  <li><strong>5. Post-Purchase Satisfaction Follow-ups:</strong> Prompt for quick CSAT ratings 24 hours after store departure.</li>
</ul>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 not-prose">
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-emerald-600">+3.4x</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Repeat Purchase Rate</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-primary">+22%</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Average Order Value</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-rose-500">-28%</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">90-Day Churn Rate</div>
  </div>
</div>

<div class="p-4 my-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">💡 Pro Strategy</strong>
  <p>Set automated loyalty expiration reminders 14 days before points expire to create a natural incentive for immediate return store visits.</p>
</div>',
    ],
    [
        'title' => 'Setting Up Multi-Tier Wholesale Pricing for Enterprise B2B Clients',
        'cat_id' => 9,
        'image' => 'blog/vip-tier-rewards.jpg',
        'excerpt' => 'How to configure volume discounts, minimum order quantities (MOQ), tiered distributor pricing, and pre-approved Net 30 credit limits in OptaPOS Enterprise.',
        'content' => '<div class="p-4 my-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">📌 B2B Distribution Architecture</strong>
  <p>Managing both retail walk-in shoppers and high-volume wholesale commercial distributors within a single POS system requires robust multi-tier price lists and customer credit governance.</p>
</div>

<h2>1. Tiered Volume Discount Pricing Matrix</h2>
<p>Automated quantity break rules ensure sales representatives never have to manually calculate custom discounts or make unauthorized price overrides:</p>

<table class="w-full my-4 border-collapse border border-border rounded-xl overflow-hidden text-sm">
  <thead>
    <tr class="bg-muted/60">
      <th class="border border-border p-2.5 text-left font-bold">Pricing Tier</th>
      <th class="border border-border p-2.5 text-left font-bold">Min Order Qty (MOQ)</th>
      <th class="border border-border p-2.5 text-left font-bold">Discount from MSRP</th>
      <th class="border border-border p-2.5 text-left font-bold">Payment Terms</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border border-border p-2.5 font-semibold">Standard Retail</td>
      <td class="border border-border p-2.5">1 unit</td>
      <td class="border border-border p-2.5">0% (Full Price)</td>
      <td class="border border-border p-2.5">Immediate (KHQR / Cash)</td>
    </tr>
    <tr>
      <td class="border border-border p-2.5 font-semibold">Wholesale Tier 1</td>
      <td class="border border-border p-2.5">10 units</td>
      <td class="border border-border p-2.5 text-blue-600 font-bold">12% OFF</td>
      <td class="border border-border p-2.5">50% Deposit, Net 15</td>
    </tr>
    <tr>
      <td class="border border-border p-2.5 font-semibold">Enterprise Partner</td>
      <td class="border border-border p-2.5">50+ units</td>
      <td class="border border-border p-2.5 text-emerald-600 font-bold">24% OFF</td>
      <td class="border border-border p-2.5 font-bold">Approved Net 30 Terms</td>
    </tr>
  </tbody>
</table>

<h2>2. Managing Credit Ceilings & Aging Invoices</h2>
<p>OptaPOS Enterprise enforces automatic credit stops: when a wholesale client surpasses their pre-approved debt ceiling or carries invoices overdue past 30 days, the register requires administrative override before releasing new dispatch shipments.</p>

<div class="p-4 my-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">⚠️ Policy Guideline</strong>
  <p>Always mandate digital signature captures and tax registration certificates (TIN) before activating Net 30 commercial accounts.</p>
</div>',
    ],
    [
        'title' => 'Best Noise-Canceling Headphones for Remote Work and Productivity',
        'cat_id' => 7,
        'image' => 'blog/cloud-pos-multi-branch.jpg',
        'excerpt' => 'Comparing the Sony WH-1000XM5, Apple AirPods Max, and Bose QuietComfort Ultra in noisy open-office environments, coffee shops, and international business travel.',
        'content' => '<div class="p-4 my-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">📌 Hybrid Productivity Gear</strong>
  <p>Active Noise Cancellation (ANC) has transformed from a travel luxury into an essential productivity tool for professionals working across open-plan collaborative offices and urban coffee houses.</p>
</div>

<h2>1. Lab Comparison: Attenuation & Voice Isolation</h2>
<p>We evaluated three flagship over-ear ANC headphones under identical cafe background noise playback (78 dB chatter and espresso machine grinder):</p>

<table class="w-full my-4 border-collapse border border-border rounded-xl overflow-hidden text-sm">
  <thead>
    <tr class="bg-muted/60">
      <th class="border border-border p-2.5 text-left font-bold">Model</th>
      <th class="border border-border p-2.5 text-left font-bold">Low Frequency ANC</th>
      <th class="border border-border p-2.5 text-left font-bold">Mic Voice Clarity</th>
      <th class="border border-border p-2.5 text-left font-bold">Battery Life</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border border-border p-2.5 font-semibold">Sony WH-1000XM5</td>
      <td class="border border-border p-2.5 text-emerald-600 font-bold">Exceptional (-32 dB)</td>
      <td class="border border-border p-2.5">Excellent AI Beamforming</td>
      <td class="border border-border p-2.5 font-bold">30 Hours</td>
    </tr>
    <tr>
      <td class="border border-border p-2.5 font-semibold">Apple AirPods Max</td>
      <td class="border border-border p-2.5 text-emerald-600 font-bold">Outstanding (-34 dB)</td>
      <td class="border border-border p-2.5 font-bold">Industry Benchmark</td>
      <td class="border border-border p-2.5">20 Hours</td>
    </tr>
    <tr>
      <td class="border border-border p-2.5 font-semibold">Bose QC Ultra</td>
      <td class="border border-border p-2.5">Superb (-30 dB)</td>
      <td class="border border-border p-2.5">Very Good</td>
      <td class="border border-border p-2.5">24 Hours</td>
    </tr>
  </tbody>
</table>

<h2>2. Multipoint Bluetooth & All-Day Comfort</h2>
<p>For hybrid workers who frequently switch between video conferencing on a MacBook and phone calls on a smartphone, instant multipoint connectivity is indispensable.</p>

<div class="p-4 my-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">💡 Pro Strategy</strong>
  <p>Replace foam ear cushions every 12 to 18 months. Compressed or hardened cushions leak acoustic seals, degrading low-frequency ANC efficiency by up to 40%.</p>
</div>',
    ],
    [
        'title' => 'Camera Gear Guide: Mirrorless vs Cinema Bodies for Commercial Content',
        'cat_id' => 7,
        'image' => 'blog/scaling-multi-branch-kpis.jpg',
        'excerpt' => 'Evaluating 10-bit 4:2:2 dynamic range, internal active cooling fans, dual native ISO, XLR professional audio inputs, and autofocus tracking on commercial production sets.',
        'content' => '<div class="p-4 my-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">📌 Commercial Production Guide</strong>
  <p>Commercial product videography demands rock-solid continuous recording reliability, wide latitude for color grading in S-Log3, and streamlined audio routing without bulky external adapters.</p>
</div>

<h2>1. The Technical Divide: Hybrid vs Dedicated Cinema</h2>
<p>While hybrid mirrorless bodies (such as the Sony Alpha 7 IV) capture breathtaking stills, dedicated cinema bodies (such as the Sony FX3 or FX30) excel during long commercial video shoots:</p>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 not-prose">
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-primary">15+ Stops</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Dynamic Range</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-emerald-600">0 Overheat</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Active Cooling Fan</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-blue-600">XLR Audio</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Top Handle Included</div>
  </div>
</div>

<h2>2. 10-Bit Color Depth & LOG Workflow</h2>
<p>8-bit video files break apart into noticeable color banding when colorists adjust highlights and skin tones. Shooting in 10-bit 4:2:2 preserves over 1 billion color gradations for pristine commercial broadcasts.</p>

<div class="p-4 my-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">💡 Lens Investment Advice</strong>
  <p>Camera bodies depreciate quickly as sensor technology advances. Prioritize investing in fast prime cinema lenses (T1.5 to T2.0), which retain resale value and visual character for decades.</p>
</div>',
    ],
    [
        'title' => 'Security Best Practices: Protecting POS Terminals from Data Breaches',
        'cat_id' => 10,
        'image' => 'blog/securing-pos-terminals.jpg',
        'excerpt' => 'Network segmentation, hardware tamper-evident seals, encrypted PIN pads, and strict role-based access control (RBAC) guidelines to ensure full PCI-DSS compliance in 2026.',
        'content' => '<div class="p-4 my-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">⚠️ Urgent Security Advisory</strong>
  <p>Point-of-Sale terminals handle sensitive payment data daily. Running POS software on unprotected consumer Wi-Fi networks exposes businesses to packet sniffers, credential theft, and severe regulatory fines.</p>
</div>

<h2>1. Essential Hardening Checklist for Retail POS</h2>
<ul class="space-y-2 my-4">
  <li><strong>VLAN Network Isolation:</strong> Place POS registers on a dedicated, isolated Virtual LAN separated completely from guest customer Wi-Fi.</li>
  <li><strong>End-to-End Encryption (E2EE):</strong> Credit card data and QR tokens must be encrypted directly at the PIN pad before transmission.</li>
  <li><strong>USB Port Lockdown:</strong> Block unauthorized thumb drives and keyboard loggers via operating system group policies.</li>
  <li><strong>Strict Role-Based Access (RBAC):</strong> Cashier accounts must never have permissions to execute ticket voids, price edits, or cash drawer pops without manager PIN verification.</li>
</ul>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 not-prose">
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-emerald-600">256-bit</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">AES Encryption</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-primary">0 Permissive</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Default Passwords</div>
  </div>
  <div class="p-4 rounded-xl bg-card border border-border/80 text-center shadow-xs">
    <div class="text-2xl font-black text-blue-600">100%</div>
    <div class="text-xs text-muted-foreground mt-1 font-medium">Tamper Audit Logging</div>
  </div>
</div>

<div class="p-4 my-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-sm">
  <strong class="font-bold flex items-center gap-1.5 mb-1">💡 Daily Physical Inspection Routine</strong>
  <p>Institute a mandatory morning opening checklist where shift supervisors physically inspect card reader slots for 3D-printed skimmer overlays and verify serial security stickers.</p>
</div>

<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground my-5">
  "A single compromised POS terminal can cost an enterprise retailer hundreds of thousands of dollars in reputation damage and forensic remediation."
</blockquote>',
    ],
];

        $blogs = [];
        for ($i = 1; $i <= 10; $i++) {
            $art = $articles[$i - 1];
            $imagePath = $art['image'] ?? sprintf('blog/blog-%02d.jpg', $i);
            $blogs[] = [
                'id' => $i,
                'company_id' => $companyId,
                'blog_category_id' => $art['cat_id'],
                'user_id' => 1,
                'title' => $art['title'],
                'slug' => \Illuminate\Support\Str::slug($art['title']),
                'excerpt' => $art['excerpt'],
                'content' => $art['content'],
                'featured_image' => $imagePath,
                'status' => 'published',
                'published_at' => now()->subDays(15 - $i),
                'view_count' => rand(150, 2400),
                'meta_title' => $art['title'] . " | Official Blog",
                'meta_description' => $art['excerpt'],
                'created_at' => now()->subDays(15 - $i),
                'updated_at' => now()->subDays(15 - $i),
            ];
        }
        DB::table('blogs')->insert($blogs);

        // 4. Blog Post Tags Pivot
        $postTags = [];
        for ($i = 1; $i <= 10; $i++) {
            $postTags[] = [
                'blog_id' => $i,
                'blog_tag_id' => (($i - 1) % 10) + 1,
            ];
            $postTags[] = [
                'blog_id' => $i,
                'blog_tag_id' => (($i + 2) % 10) + 1,
            ];
        }
        DB::table('blog_blog_tag')->insert($postTags);

        // 5. Pages (10 Authentic Legal & Company Pages)
        $pages = [];
        $pageTemplates = [
            ['title' => 'About Us',           'content' => '<h1>About Our Company</h1><p>We are Cambodia premier enterprise retail and consumer electronics technology provider, delivering authentic hardware, certified warranties, and omnichannel POS solutions nationwide.</p>'],
            ['title' => 'Contact Us',         'content' => '<h1>Contact Our Support Team</h1><p>Reach our Phnom Penh customer support center at support@centralpos.com or hotline +855 23 888 100. Open Monday to Saturday 8:00 AM – 6:00 PM.</p>'],
            ['title' => 'Privacy Policy',      'content' => '<h1>Privacy Policy</h1><p>We are dedicated to safeguarding your personal and transactional information with industry-standard encryption and strict data protection protocols.</p>'],
            ['title' => 'Terms of Service',   'content' => '<h1>Terms of Service</h1><p>All sales, warranty claims, and account operations are governed by our official commercial enterprise terms and Cambodian e-commerce regulations.</p>'],
            ['title' => 'Refund & Exchange',  'content' => '<h1>Refund & 7-Day Exchange Policy</h1><p>Items returned unopened in pristine condition within 7 days are eligible for exchange or store credit upon technical inspection.</p>'],
            ['title' => 'Customer FAQ',       'content' => '<h1>Frequently Asked Questions</h1><p>Browse our knowledge base for answers regarding payments, delivery timelines, warranty coverage, and B2B orders.</p>'],
            ['title' => 'Careers',            'content' => '<h1>Join Our Growing Team</h1><p>Explore exciting career opportunities in tech logistics, cloud software engineering, retail sales, and enterprise account management.</p>'],
            ['title' => 'Developer API Docs', 'content' => '<h1>Enterprise Developer API</h1><p>Integrate your external ERP or storefront with our REST API endpoints for real-time inventory, sales synchronization, and webhook events.</p>'],
            ['title' => 'Affiliate Program',  'content' => '<h1>Partner & Affiliate Program</h1><p>Earn competitive commissions by referring tech creators, business clients, and retail partners to our authorized hardware platform.</p>'],
            ['title' => 'Warranty Coverage',  'content' => '<h1>Official Manufacturer Warranty</h1><p>Every smartphone, laptop, and electronic device comes with certified official warranty service backed by local authorized repair centers.</p>'],
        ];

        foreach ($pageTemplates as $i => $pt) {
            $pages[] = [
                'id' => $i + 1,
                'company_id' => $companyId,
                'title' => $pt['title'],
                'slug' => \Illuminate\Support\Str::slug($pt['title']),
                'content' => $pt['content'],
                'status' => 'published',
                'meta_title' => $pt['title'] . " | Official Central Store",
                'meta_description' => "Official documentation and policy regarding " . $pt['title'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('pages')->insert($pages);

        // 6. FAQs (10 Authentic E-Commerce & POS FAQs)
        $faqsData = [
            ['q' => 'What payment methods do you accept online and in-store?', 'a' => 'We accept ABA KHQR, ACLEDA Mobile, Wing Bank, Bakong KHQR, Cash on Delivery (COD), and Visa/Mastercard credit cards with secure processing.', 'cat' => 'Payments'],
            ['q' => 'How long does nationwide delivery take in Cambodia?',       'a' => 'Phnom Penh orders are delivered same-day or within 24 hours. Provincial orders via Virak Buntham or J&T Express take 1 to 2 business days.', 'cat' => 'Shipping'],
            ['q' => 'Are all tech products and smartphones 100% genuine?',     'a' => 'Yes, 100% of our products are brand new, original, and sourced directly from official brand distributors with valid manufacturer warranties.', 'cat' => 'Products'],
            ['q' => 'What is your return and exchange policy for defective items?','a' => 'We offer a 7-day direct exchange policy for items with manufacturer hardware defects, plus full local warranty repair service.', 'cat' => 'Warranty'],
            ['q' => 'Can I place a wholesale B2B order with Net 30 terms?',     'a' => 'Yes, verified corporate and institutional accounts can apply for credit terms and custom volume pricing by contacting our enterprise sales division.', 'cat' => 'B2B Sales'],
            ['q' => 'How does in-store pickup at Central SuperStore work?',     'a' => 'Select "Store Pickup" during checkout. You will receive an instant SMS/email notification once your package is packed and ready for collection.', 'cat' => 'Orders'],
            ['q' => 'How do I earn and redeem loyalty points on purchases?',    'a' => 'Registered customers earn 1 loyalty point for every $1 USD spent. Points can be redeemed at checkout for instant cash discounts.', 'cat' => 'Loyalty'],
            ['q' => 'Does your POS system support offline transactions and sync?','a' => 'Yes, our POS client terminal caches sales locally during internet drops and automatically syncs all data to the cloud once reconnected.', 'cat' => 'Technical'],
            ['q' => 'Can I get an official VAT Tax Invoice for my purchase?',   'a' => 'Yes, enter your registered business Tax Number (TIN) at checkout to receive an official Cambodian General Department of Taxation compliant VAT invoice.', 'cat' => 'Billing'],
            ['q' => 'What shipping carriers do you partner with for deliveries?','a' => 'We partner with Virak Buntham Logistics (VET), J&T Express Cambodia, and GrabExpress for safe, traceable parcel shipments.', 'cat' => 'Shipping'],
        ];

        $faqs = [];
        foreach ($faqsData as $i => $f) {
            $faqs[] = [
                'company_id' => $companyId,
                'question' => $f['q'],
                'answer' => $f['a'],
                'category' => $f['cat'],
                'sort_order' => $i + 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('faqs')->insert($faqs);

        // 7. Banners (10 records with 100% PRESERVED high-res sample imagery)
        $bannersData = [
            [
                'id' => 1,
                'title' => 'Next-Gen Ultra Performance Laptops',
                'subtitle' => 'Experience M3 & Intel Core Ultra performance with 4K OLED displays & all-day battery.',
                'image' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80',
                'mobile_image' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
                'link' => '/products?category=computers-laptops',
                'position' => 'hero',
                'sort_order' => 1,
            ],
            [
                'id' => 2,
                'title' => 'Immersive Spatial Studio Audio',
                'subtitle' => 'Audiophile-grade studio clarity with active noise cancellation and lossless wireless audio.',
                'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
                'mobile_image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
                'link' => '/products?category=audio-sound',
                'position' => 'hero',
                'sort_order' => 2,
            ],
            [
                'id' => 3,
                'title' => 'Ultimate Pro Gaming Battlestation Setup',
                'subtitle' => 'High-refresh RGB displays, mechanical optical switches, and ultra-fast wireless precision.',
                'image' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
                'mobile_image' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
                'link' => '/products?category=gaming-esports',
                'position' => 'hero',
                'sort_order' => 3,
            ],
            [
                'id' => 4,
                'title' => 'Precision Smart Fitness & Health Trackers',
                'subtitle' => 'Titanium sapphire chassis with biometric health sensors, ECG, and multi-day GPS tracking.',
                'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80',
                'mobile_image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
                'link' => '/products?category=wearables-smartwatches',
                'position' => 'hero',
                'sort_order' => 4,
            ],
            [
                'id' => 5,
                'title' => 'Flagship 5G Smartphones & Triple Cameras',
                'subtitle' => 'Up to 25% discount on titanium flagships with cinematic 4K ProRes video recording.',
                'image' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=1200&q=80',
                'mobile_image' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=800&q=80',
                'link' => '/products?category=smartphones-tablets',
                'position' => 'sidebar',
                'sort_order' => 5,
            ],
            [
                'id' => 6,
                'title' => 'Custom Mechanical Keyboards & Peripherals',
                'subtitle' => 'Hot-swappable tactile switches, CNC aluminum cases, and wireless ergonomic precision mice.',
                'image' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
                'mobile_image' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
                'link' => '/products?category=accessories-peripherals',
                'position' => 'sidebar',
                'sort_order' => 6,
            ],
            [
                'id' => 7,
                'title' => 'Pro Mirrorless 4K Creator Cameras',
                'subtitle' => 'Full-frame sensors with dual stabilization and interchangeable cinema prime lenses.',
                'image' => 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
                'mobile_image' => 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
                'link' => '/products?category=camera-photography',
                'position' => 'sidebar',
                'sort_order' => 7,
            ],
            [
                'id' => 8,
                'title' => 'Weekend Super Flash Sale — Up to 50% OFF',
                'subtitle' => 'Exclusive discounts on top tech brands. Free express nationwide delivery on orders over $50.',
                'image' => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80',
                'mobile_image' => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
                'link' => '/products?sort=deals',
                'position' => 'footer',
                'sort_order' => 8,
            ],
            [
                'id' => 9,
                'title' => 'Get $20 OFF Your First Order',
                'subtitle' => 'Claim code WELCOME20 at checkout on your first genuine device purchase.',
                'image' => 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1200&q=80',
                'mobile_image' => 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=800&q=80',
                'link' => '/products',
                'position' => 'popup',
                'sort_order' => 9,
            ],
            [
                'id' => 10,
                'title' => 'Enterprise POS Systems & Smart Barcode Scanners',
                'subtitle' => 'Dual-screen touch POS terminals with high-speed thermal printers & real-time inventory sync.',
                'image' => 'https://images.unsplash.com/photo-1556742049-0a67e5577ff0?auto=format&fit=crop&w=1600&q=80',
                'mobile_image' => 'https://images.unsplash.com/photo-1556742049-0a67e5577ff0?auto=format&fit=crop&w=800&q=80',
                'link' => '/products?category=electronics',
                'position' => 'hero',
                'sort_order' => 10,
            ],
        ];

        $banners = [];
        foreach ($bannersData as $item) {
            $banners[] = array_merge($item, [
                'company_id' => $companyId,
                'store_id' => $storeId,
                'starts_at' => now()->subDays(1),
                'ends_at' => now()->addDays(60),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        DB::table('banners')->insert($banners);

        // 8. Media (10 records)
        $media = [];
        for ($i = 1; $i <= 10; $i++) {
            $media[] = [
                'company_id' => $companyId,
                'user_id' => 1,
                'name' => "media-file-$i",
                'file_name' => "file-$i.jpg",
                'mime_type' => 'image/jpeg',
                'path' => "media/file-$i.jpg",
                'disk' => 'public',
                'size' => rand(10000, 500000),
                'type' => 'image',
                'conversions' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        // 9. Announcements (Authentic Cambodian E-Commerce Campaigns)
        $announcements = [
            [
                'company_id'   => $companyId,
                'title'        => 'Free Nationwide Delivery across Cambodia',
                'message_km'   => '🚚 ដឹកជញ្ជូនឥតគិតថ្លៃទូទាំង ២៥ រាជធានី-ខេត្ត សម្រាប់ការកុម្ម៉ង់ចាប់ពី $50 ឡើងទៅ!',
                'message_en'   => '🚚 Free Nationwide Delivery across Cambodia on all orders over $50!',
                'badge_text'   => 'FREE DELIVERY',
                'coupon_code'  => 'FREESHIP50',
                'link_url'     => '/products',
                'bg_gradient'  => 'from-blue-600 to-indigo-700',
                'is_active'    => true,
                'sort_order'   => 10,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'company_id'   => $companyId,
                'title'        => 'Khmer New Year Mega Celebration Sale',
                'message_km'   => '🎉 រីករាយពិធីបុណ្យចូលឆ្នាំខ្មែរ! បញ្ចុះតម្លៃពិសេសរហូតដល់ 35% លើគ្រប់សម្ភារៈបច្ចេកវិទ្យា',
                'message_en'   => '🎉 Happy Khmer New Year! Get up to 35% OFF on flagship laptops and smartphones',
                'badge_text'   => 'KHMER NEW YEAR',
                'coupon_code'  => 'KNY2026',
                'link_url'     => '/promotions',
                'bg_gradient'  => 'from-amber-600 to-rose-600',
                'is_active'    => false,
                'sort_order'   => 8,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'company_id'   => $companyId,
                'title'        => 'Mid-Month Super Value Deals',
                'message_km'   => '⚡ មហាសន្សំថ្ងៃពាក់កណ្តាលខែ! បញ្ចុះបន្ថែម $10 ភ្លាមៗដោយប្រើកូដ MIDMONTH',
                'message_en'   => '⚡ Super Mid-Month Deals! Extra $10 OFF with voucher code MIDMONTH',
                'badge_text'   => 'FLASH DEAL',
                'coupon_code'  => 'MIDMONTH',
                'link_url'     => '/promotions',
                'bg_gradient'  => 'from-purple-600 to-pink-600',
                'is_active'    => false,
                'sort_order'   => 6,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'company_id'   => $companyId,
                'title'        => 'Bon Om Touk Water Festival Special Promo',
                'message_km'   => '🚣‍♂️ រីករាយព្រះរាជពិធីបុណ្យអុំទូក! បញ្ចុះតម្លៃពិសេស និងកាដូថែមជូនជាច្រើន',
                'message_en'   => '🚣‍♂️ Happy Water Festival! Special discounts and exclusive free gifts on all tech gear',
                'badge_text'   => 'BON OM TOUK',
                'coupon_code'  => 'WATERFESTIVAL',
                'link_url'     => '/promotions',
                'bg_gradient'  => 'from-emerald-600 to-teal-700',
                'is_active'    => false,
                'sort_order'   => 4,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
        ];
        DB::table('announcements')->insert($announcements);

        if (DB::getDriverName() === 'pgsql') {
            $tables = ['blog_categories', 'blog_tags', 'blogs', 'blog_blog_tag', 'pages', 'faqs', 'banners', 'media', 'announcements'];
            foreach ($tables as $table) {
                try {
                    DB::statement("SELECT setval('{$table}_id_seq', COALESCE((SELECT MAX(id) FROM {$table}), 0) + 1, false);");
                } catch (\Throwable $e) {}
            }
        }
    }
}



