<?php

namespace Tests\Unit\Format;

use App\Enums\CurrencyCode;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\QuantityUnit;
use App\Format\Formatters\DateFormatter;
use App\Format\Formatters\EmailFormatter;
use App\Format\Formatters\GeoFormatter;
use App\Format\Formatters\IdentifierFormatter;
use App\Format\Formatters\MoneyFormatter;
use App\Format\Formatters\NumberFormatter;
use App\Format\Formatters\PhoneFormatter;
use App\Format\Formatters\SecurityFormatter;
use App\Format\Formatters\StateFormatter;
use App\Format\Formatters\StorageFormatter;
use App\Format\GlobalFormat;
use App\Format\ValueObjects\Dimension;
use App\Format\ValueObjects\GeoLocation;
use App\Format\ValueObjects\Money;
use App\Format\ValueObjects\PhoneNumber;
use App\Services\Support\ReferenceNumberService;
use Carbon\Carbon;
use Tests\TestCase;

class GlobalFormatTest extends TestCase
{
    public function test_money_formatter_and_value_object(): void
    {
        // USD formatting
        $this->assertEquals('$1,250.00', MoneyFormatter::format(1250, 'USD'));
        $this->assertEquals('1,250.00', MoneyFormatter::format(1250, 'USD', false));
        $this->assertEquals(1250.55, MoneyFormatter::round(1250.554, 'USD'));

        // KHR formatting (zero decimals)
        $this->assertEquals('៛50,000', MoneyFormatter::format(50000, 'KHR'));
        $this->assertEquals(50000.0, MoneyFormatter::round(50000.4, 'KHR'));

        // Money Value Object
        $usd1 = Money::usd(100.50);
        $usd2 = Money::usd(49.50);
        $total = $usd1->add($usd2);

        $this->assertEquals(150.00, $total->amount());
        $this->assertEquals('$150.00', $total->formatted());
        $this->assertEquals('USD', $total->currencyCode());
        $this->assertTrue($total->greaterThan($usd1));

        // Subtraction
        $sub = $usd1->subtract($usd2);
        $this->assertEquals(51.00, $sub->amount());
    }

    public function test_phone_formatter_and_value_object(): void
    {
        // Normalization to E.164
        $this->assertEquals('+85512345678', PhoneFormatter::normalize('012 345 678'));
        $this->assertEquals('+85512345678', PhoneFormatter::normalize('012-345-678'));
        $this->assertEquals('+85512345678', PhoneFormatter::normalize('+855 12 345 678'));
        $this->assertEquals('+85512345678', PhoneFormatter::normalize('85512345678'));

        // Local formatting
        $this->assertEquals('012 345 678', PhoneFormatter::toLocal('+85512345678'));

        // Masking
        $this->assertEquals('+85512***678', PhoneFormatter::mask('+85512345678'));

        // Validation
        $this->assertTrue(PhoneFormatter::isValid('012 345 678'));
        $this->assertTrue(PhoneFormatter::isValid('+85598765432'));
        $this->assertFalse(PhoneFormatter::isValid('invalid-phone'));

        // PhoneNumber Value Object
        $phoneVo = PhoneNumber::from('012 345 678');
        $this->assertEquals('+85512345678', $phoneVo->e164());
        $this->assertEquals('012 345 678', $phoneVo->local());
        $this->assertTrue($phoneVo->isValid());
        $this->assertEquals('+85512345678', (string) $phoneVo);
    }

    public function test_email_formatter(): void
    {
        $this->assertEquals('user@example.com', EmailFormatter::normalize('  USER@Example.COM  '));
        $this->assertEquals('u***r@example.com', EmailFormatter::mask('user@example.com'));
        $this->assertTrue(EmailFormatter::isValid('user@example.com'));
        $this->assertFalse(EmailFormatter::isValid('not-an-email'));
    }

    public function test_date_and_timezone_formatter(): void
    {
        $date = Carbon::create(2026, 9, 13, 7, 30, 0, 'UTC'); // 07:30 UTC = 14:30 in Asia/Phnom_Penh

        $this->assertEquals('2026-09-13T14:30:00+07:00', DateFormatter::toApi($date));
        $this->assertEquals('2026-09-13', DateFormatter::toDate($date));
        $this->assertEquals('2026-09-13 14:30:00', DateFormatter::toDateTime($date));
        $this->assertEquals('13 Sep 2026, 02:30 PM', DateFormatter::toHuman($date));
        $this->assertEquals('Asia/Phnom_Penh', DateFormatter::timezone());
    }

    public function test_number_formatter(): void
    {
        $this->assertEquals(12.50, NumberFormatter::decimal(12.499));
        $this->assertEquals(1250, NumberFormatter::integer(1250.4));
        $this->assertEquals(1.234, NumberFormatter::quantity(1.2344));
        $this->assertEquals(5.678, NumberFormatter::weight(5.6784));
        $this->assertEquals(10.50, NumberFormatter::percentage(10.5));
        $this->assertEquals(4100.2555, NumberFormatter::exchangeRate(4100.25554));
    }

    public function test_dimension_value_object(): void
    {
        $dim = Dimension::from(20, 30, 10, 'cm');
        $this->assertEquals('20 × 30 × 10 cm', $dim->formatted());
        $this->assertEquals(6000.0, $dim->volume());
    }

    public function test_reference_number_service(): void
    {
        $this->assertStringStartsWith('INV-', ReferenceNumberService::invoice());
        $this->assertStringStartsWith('ORD-', ReferenceNumberService::order());
        $this->assertStringStartsWith('PO-', ReferenceNumberService::purchaseOrder());
        $this->assertStringStartsWith('PAY-', ReferenceNumberService::payment());
        $this->assertStringStartsWith('CUS-', ReferenceNumberService::customer());
        $this->assertStringStartsWith('SUP-', ReferenceNumberService::supplier());
        $this->assertStringStartsWith('EMP-', ReferenceNumberService::employee());
        $this->assertStringStartsWith('CMP-', ReferenceNumberService::company());
        $this->assertStringStartsWith('BR-', ReferenceNumberService::branch());
        $this->assertStringStartsWith('WH-', ReferenceNumberService::warehouse());
        $this->assertStringStartsWith('SKU-', ReferenceNumberService::sku());
        $this->assertStringStartsWith('KH', ReferenceNumberService::trackingNumber());
    }

    public function test_identifier_formatter(): void
    {
        // SKU
        $this->assertEquals('IPH15-BLK', IdentifierFormatter::sku(' iph15-blk '));
        $this->assertEquals('SKU-IPH15-BLK', IdentifierFormatter::sku(' iph15-blk ', 'SKU'));
        $this->assertEquals('SKU-IPH15-BLK', IdentifierFormatter::sku('SKU-IPH15-BLK'));

        // Barcode
        $this->assertEquals('8851234567890', IdentifierFormatter::barcode(' 885-1234-567890 '));
        $this->assertTrue(IdentifierFormatter::isValidBarcode('8851234567890'));

        // IMEI
        $validImei = '356789012345678';
        $this->assertEquals('356789012345678', IdentifierFormatter::imei($validImei));
        $this->assertEquals('356789******678', IdentifierFormatter::maskImei($validImei));

        // UUID
        $uuid = IdentifierFormatter::uuid();
        $this->assertTrue(IdentifierFormatter::isValidUuid($uuid));
        $this->assertFalse(IdentifierFormatter::isValidUuid('invalid-uuid'));

        // Tax ID
        $this->assertEquals('KHM-TIN-123456789', IdentifierFormatter::taxId(' khm-tin-123456789 '));
        $this->assertEquals('123456789', IdentifierFormatter::taxId('123456789'));
        $this->assertEquals('KHM-TIN-123456789', IdentifierFormatter::taxId('123456789', 'KHM-TIN'));

        // Quantity Unit
        $this->assertEquals('pcs', IdentifierFormatter::unit(' PCS '));
        $this->assertEquals('kg', IdentifierFormatter::unit('KG'));
    }

    public function test_security_formatter(): void
    {
        // Bank Account Masking
        $this->assertEquals('•••• •••• •••• 1234', SecurityFormatter::maskBankAccount('12345678901234'));
        $this->assertEquals('12345678901234', SecurityFormatter::cleanBankAccount('1234-5678-9012-34'));

        // IP Address
        $this->assertEquals('192.168.1.10', SecurityFormatter::normalizeIp(' 192.168.1.10 '));
        $this->assertEquals('192.168.1.0', SecurityFormatter::anonymizeIp('192.168.1.10'));
        $this->assertTrue(SecurityFormatter::isValidIp('192.168.1.10'));
        $this->assertFalse(SecurityFormatter::isValidIp('invalid.ip'));

        // User Agent
        $ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
        $this->assertEquals('Chrome on macOS', SecurityFormatter::summarizeUserAgent($ua));
    }

    public function test_geo_formatter_and_value_object(): void
    {
        $geo = GeoLocation::from(11.5564, 104.9282);
        $this->assertEquals(11.5564, $geo->latitude);
        $this->assertEquals(104.9282, $geo->longitude);
        $this->assertEquals('11.5564,104.9282', (string) $geo);

        $parsed = GeoFormatter::format('11.5564, 104.9282');
        $this->assertEquals('11.5564,104.9282', $parsed);

        // Distance between Phnom Penh (11.5564, 104.9282) and Siem Reap (13.3671, 103.8448) ~ 230-250 km
        $siemReap = GeoLocation::from(13.3671, 103.8448);
        $distance = $geo->distanceTo($siemReap);
        $this->assertGreaterThan(220, $distance);
        $this->assertLessThan(260, $distance);
    }

    public function test_storage_formatter(): void
    {
        // File Path
        $this->assertEquals('products/2026/item.webp', StorageFormatter::normalizePath('/products//2026/item.webp/'));
        $dated = StorageFormatter::datedPath('products', 'item.webp', false);
        $this->assertStringStartsWith('products/' . now()->format('Y/m') . '/item.webp', $dated);

        // File Size
        $this->assertEquals('2.38 MB', StorageFormatter::humanSize(2500000));
        $this->assertEquals('1.5 KB', StorageFormatter::humanSize(1536));
        $this->assertEquals(2621440, StorageFormatter::parseToBytes('2.5 MB'));
    }

    public function test_state_formatter(): void
    {
        // Boolean
        $this->assertTrue(StateFormatter::boolean('true'));
        $this->assertTrue(StateFormatter::boolean('1'));
        $this->assertTrue(StateFormatter::boolean(1));
        $this->assertTrue(StateFormatter::boolean('yes'));
        $this->assertTrue(StateFormatter::boolean('active'));
        $this->assertFalse(StateFormatter::boolean('false'));
        $this->assertFalse(StateFormatter::boolean('0'));
        $this->assertFalse(StateFormatter::boolean(null));

        // Pagination Meta
        $meta = StateFormatter::paginationMeta(null, page: 2, perPage: 10, total: 25);
        $this->assertEquals(2, $meta['current_page']);
        $this->assertEquals(10, $meta['per_page']);
        $this->assertEquals(25, $meta['total']);
        $this->assertEquals(3, $meta['last_page']);
        $this->assertTrue($meta['has_more']);

        // Status Badge
        $badge = StateFormatter::statusBadge(OrderStatus::PROCESSING);
        $this->assertEquals('processing', $badge['value']);
        $this->assertEquals('Processing', $badge['label']);
        $this->assertEquals('កំពុងរៀបចំ', $badge['label_khmer']);

        // JSON Metadata
        $json = StateFormatter::cleanJson('{"theme":"dark","notifications":true}');
        $this->assertEquals('dark', $json['theme']);
        $this->assertTrue($json['notifications']);
    }

    public function test_global_format_facade_covers_all_standards(): void
    {
        // 1. Date
        $this->assertEquals('2026-09-13', GlobalFormat::dateOnly('2026-09-13 14:30:00'));
        // 2. DateTime
        $this->assertEquals('2026-09-13 14:30:00', GlobalFormat::dateTime('2026-09-13 14:30:00'));
        // 3. Timezone
        $this->assertEquals('Asia/Phnom_Penh', GlobalFormat::timezone());
        // 4. Phone
        $this->assertEquals('+85512345678', GlobalFormat::phone('012 345 678'));
        // 5. Email
        $this->assertEquals('user@example.com', GlobalFormat::email(' USER@EXAMPLE.COM '));
        // 6. Money
        $this->assertEquals('$1,250.00', GlobalFormat::money(1250, 'USD'));
        // 7. Currency
        $this->assertEquals('$', GlobalFormat::currencySymbol('USD'));
        $this->assertEquals('៛', GlobalFormat::currencySymbol('KHR'));
        // 8. Decimal
        $this->assertEquals(12.50, GlobalFormat::decimal(12.499));
        // 9. Percentage
        $this->assertEquals(10.00, GlobalFormat::percentage(10));
        // 10. Integer
        $this->assertEquals(1250, GlobalFormat::integer(1250.49));
        // 11. Invoice
        $this->assertStringStartsWith('INV-', GlobalFormat::invoice());
        // 12. Order
        $this->assertStringStartsWith('ORD-', GlobalFormat::order());
        // 13. PO
        $this->assertStringStartsWith('PO-', GlobalFormat::purchaseOrder());
        // 14. Payment
        $this->assertStringStartsWith('PAY-', GlobalFormat::payment());
        // 15. SKU
        $this->assertEquals('IPH15-BLK', GlobalFormat::sku('iph15-blk'));
        $this->assertEquals('SKU-IPH15-BLK', GlobalFormat::sku('iph15-blk', 'SKU'));
        // 16. Barcode
        $this->assertEquals('8851234567890', GlobalFormat::barcode('885-1234-567890'));
        // 17. IMEI
        $this->assertEquals('356789******678', GlobalFormat::imeiMask('356789012345678'));
        // 18. UUID
        $this->assertTrue(GlobalFormat::isUuid(GlobalFormat::uuid()));
        // 19. Unit
        $this->assertEquals('pcs', GlobalFormat::unit('PCS'));
        // 20. Weight
        $this->assertEquals(2.500, GlobalFormat::weight(2.5));
        // 21. Dimension
        $this->assertEquals('20 × 30 × 10 cm', GlobalFormat::dimension(20, 30, 10)->formatted());
        // 22. Tax ID
        $this->assertEquals('123456789', GlobalFormat::taxId('123456789'));
        $this->assertEquals('KHM-TIN-123456789', GlobalFormat::taxId('123456789', 'KHM-TIN'));
        // 23. Company Code
        $this->assertStringStartsWith('CMP-', GlobalFormat::companyCode());
        // 24. Branch Code
        $this->assertStringStartsWith('BR-', GlobalFormat::branchCode());
        // 25. Warehouse Code
        $this->assertStringStartsWith('WH-', GlobalFormat::warehouseCode());
        // 26. Customer Code
        $this->assertStringStartsWith('CUS-', GlobalFormat::customerCode());
        // 27. Employee Code
        $this->assertStringStartsWith('EMP-', GlobalFormat::employeeCode());
        // 28. Tracking Number
        $this->assertStringStartsWith('KH', GlobalFormat::trackingNumber());
        // 29. Bank Account
        $this->assertEquals('•••• •••• •••• 1234', GlobalFormat::bankAccountMask('12345678901234'));
        // 30. IP Address
        $this->assertEquals('192.168.1.10', GlobalFormat::ip(' 192.168.1.10 '));
        // 31. User Agent
        $this->assertStringContainsString('macOS', GlobalFormat::userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'));
        // 32. Coordinates
        $this->assertEquals('11.5564,104.9282', GlobalFormat::coordinates(11.5564, 104.9282));
        // 33. File Path
        $this->assertEquals('products/2026/img.jpg', GlobalFormat::filePath('/products/2026/img.jpg'));
        // 34. File Size
        $this->assertEquals('2.38 MB', GlobalFormat::fileSizeHuman(2500000));
        // 35. Pagination
        $this->assertEquals(2, GlobalFormat::pagination(null, page: 2)['current_page']);
        // 36. Boolean
        $this->assertTrue(GlobalFormat::boolean('true'));
        // 37. Enum/Status
        $this->assertEquals('success', GlobalFormat::statusBadge(PaymentStatus::PAID)['color']);
        // 38. JSON
        $this->assertEquals(['a' => 1], GlobalFormat::json('{"a":1}'));
    }

    public function test_enums_with_khmer_labels(): void
    {
        $this->assertEquals('កំពុងរៀបចំ', OrderStatus::PROCESSING->labelKhmer());
        $this->assertEquals('បានទូទាត់រួច', PaymentStatus::PAID->labelKhmer());
        $this->assertEquals('៛', CurrencyCode::KHR->symbol());
        $this->assertEquals('$', CurrencyCode::USD->symbol());
        $this->assertEquals('ដុំ/គ្រាប់', QuantityUnit::PCS->labelKhmer());
    }

    public function test_global_helpers(): void
    {
        $this->assertEquals('$250.00', format_money(250));
        $this->assertEquals('+85512345678', canonical_phone('012 345 678'));
        $this->assertEquals('012 345 678', format_phone('+85512345678'));
        $this->assertEquals('$100.00', money(100)->formatted());
        $this->assertEquals('2.38 MB', format_bytes(2500000));
        $this->assertEquals('Processing', format_status_badge(OrderStatus::PROCESSING)['label']);
    }
}
