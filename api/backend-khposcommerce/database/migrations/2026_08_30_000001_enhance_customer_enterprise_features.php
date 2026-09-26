<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── 1. ENHANCE CUSTOMERS TABLE ───────────────────────────────────────
        Schema::table('customers', function (Blueprint $table) {
            $table->string('payment_terms', 50)->default('prepaid')->after('loyalty_points'); // prepaid, net_15, net_30, net_60, eom
            $table->decimal('credit_limit', 15, 2)->default(0)->after('payment_terms');
            $table->decimal('outstanding_balance', 15, 2)->default(0)->after('credit_limit');
            $table->boolean('is_credit_hold')->default(false)->after('outstanding_balance');
            $table->decimal('wallet_balance', 15, 2)->default(0)->after('is_credit_hold');
            $table->string('tax_branch_code', 50)->nullable()->after('tax_number');
            $table->string('rfm_segment', 50)->default('new')->after('tax_branch_code'); // champions, loyal, potential, at_risk, hibernating, new
            $table->decimal('churn_risk_score', 5, 2)->default(10.00)->after('rfm_segment'); // percentage (0.00 - 100.00)
            $table->json('tags')->nullable()->after('churn_risk_score');
        });

        // ─── 2. CUSTOMER CONTACTS (B2B Multi-contacts) ───────────────────────
        Schema::create('customer_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('job_title')->nullable(); // Purchasing Manager, Accountant, Director, etc.
            $table->string('department')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'is_primary']);
        });

        // ─── 3. CUSTOMER KYC & COMPLIANCE DOCUMENTS ──────────────────────────
        Schema::create('customer_kyc_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('document_type', 50); // patent_tax, vat_certificate, business_license, id_card, contract_agreement, other
            $table->string('title');
            $table->string('document_number')->nullable();
            $table->string('file_url');
            $table->string('file_size')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('status', 30)->default('verified'); // pending, verified, rejected, expired
            $table->string('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'document_type', 'status']);
        });

        // ─── 4. CUSTOMER STORE WALLET TRANSACTIONS ───────────────────────────
        Schema::create('customer_wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('type', 40); // top_up, pos_payment, refund_credit, manual_adjustment
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->string('reference_no')->nullable();
            $table->string('payment_method')->nullable();
            $table->text('notes')->nullable();
            $table->string('created_by')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'type']);
        });

        // ─── 5. CUSTOMER LOYALTY POINTS LEDGER ───────────────────────────────
        Schema::create('customer_points_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('type', 40); // earned, redeemed, expired, adjustment
            $table->decimal('points', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->string('reference_no')->nullable();
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('created_by')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'type']);
        });

        // ─── 6. CUSTOMER 360° INTERACTIONS & TIMELINE ─────────────────────────
        Schema::create('customer_interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('type', 40); // phone_call, meeting, email, telegram, ticket_support, site_visit, note
            $table->string('subject');
            $table->text('description')->nullable();
            $table->string('outcome')->nullable(); // completed, follow_up_needed, closed
            $table->timestamp('interacted_at')->useCurrent();
            $table->timestamp('next_follow_up_at')->nullable();
            $table->string('created_by')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'type', 'interacted_at']);
        });

        // ─── 7. CUSTOMER PRICING CONTRACTS & AGREEMENTS ──────────────────────
        Schema::create('customer_pricing_contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('contract_number')->unique();
            $table->string('title');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('discount_type', 30)->default('percentage'); // percentage, fixed_price, tier_volume
            $table->decimal('discount_value', 10, 2)->default(0);
            $table->string('status', 30)->default('active'); // draft, active, expired, terminated
            $table->json('items')->nullable(); // specific SKU rules or tiered pricing
            $table->text('terms_and_conditions')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
        });

        // ─── 8. CUSTOMER SUPPORT TICKETS & RMA CLAIMS ────────────────────────
        Schema::create('customer_support_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('ticket_number')->unique();
            $table->string('subject');
            $table->string('type', 40)->default('inquiry'); // inquiry, complaint, rma_return, warranty_claim, billing_issue
            $table->string('priority', 30)->default('medium'); // low, medium, high, urgent
            $table->string('status', 30)->default('open'); // open, in_progress, resolved, closed
            $table->text('description')->nullable();
            $table->text('resolution')->nullable();
            $table->string('assigned_to')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'status', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_support_tickets');
        Schema::dropIfExists('customer_pricing_contracts');
        Schema::dropIfExists('customer_interactions');
        Schema::dropIfExists('customer_points_ledger');
        Schema::dropIfExists('customer_wallet_transactions');
        Schema::dropIfExists('customer_kyc_documents');
        Schema::dropIfExists('customer_contacts');

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'payment_terms',
                'credit_limit',
                'outstanding_balance',
                'is_credit_hold',
                'wallet_balance',
                'tax_branch_code',
                'rfm_segment',
                'churn_risk_score',
                'tags',
            ]);
        });
    }
};
