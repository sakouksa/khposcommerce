<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employee\Holiday;

class HolidaySeeder extends Seeder
{
    public function run(): void
    {
        $holidays = [
            [
                'title_en'     => "New Year's Day",
                'title_km'     => 'ទិវាចូលឆ្នាំសកល',
                'date'         => '2026-01-01',
                'description'  => 'First day of the new year / ទិវាចូលឆ្នាំសកល',
                'status'       => 'active',
                'is_recurring' => true,
            ],
            [
                'title_en'     => 'Victory over Genocide Day',
                'title_km'     => 'ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍',
                'date'         => '2026-01-07',
                'description'  => 'Commemorates the end of the Khmer Rouge regime / រំលឹកខួបជ័យជម្នះ ៧ មករា',
                'status'       => 'active',
                'is_recurring' => true,
            ],
            [
                'title_en'     => "International Women's Day",
                'title_km'     => 'ទិវាអន្តរជាតិនារី',
                'date'         => '2026-03-08',
                'description'  => "Celebration of women's rights and contributions / ទិវាអន្តរជាតិនារី ៨ មីនា",
                'status'       => 'active',
                'is_recurring' => true,
            ],
            [
                'title_en'     => 'Khmer New Year (Day 1)',
                'title_km'     => 'ពិធីបុណ្យចូលឆ្នាំខ្មែរ ប្រពៃណីជាតិ (ថ្ងៃទី១ - មហាសង្ក្រាន្ត)',
                'date'         => '2026-04-14',
                'description'  => 'First day of traditional Cambodian New Year celebration / ថ្ងៃមហាសង្ក្រាន្ត',
                'status'       => 'active',
                'is_recurring' => false,
            ],
            [
                'title_en'     => 'Khmer New Year (Day 2)',
                'title_km'     => 'ពិធីបុណ្យចូលឆ្នាំខ្មែរ ប្រពៃណីជាតិ (ថ្ងៃទី២ - វារៈវនបត)',
                'date'         => '2026-04-15',
                'description'  => 'Second day of traditional Cambodian New Year celebration / ថ្ងៃវារៈវនបត',
                'status'       => 'active',
                'is_recurring' => false,
            ],
            [
                'title_en'     => 'Khmer New Year (Day 3)',
                'title_km'     => 'ពិធីបុណ្យចូលឆ្នាំខ្មែរ ប្រពៃណីជាតិ (ថ្ងៃទី៣ - វារៈឡើងស័ក)',
                'date'         => '2026-04-16',
                'description'  => 'Third day of traditional Cambodian New Year celebration / ថ្ងៃវារៈឡើងស័ក',
                'status'       => 'active',
                'is_recurring' => false,
            ],
            [
                'title_en'     => 'International Labour Day',
                'title_km'     => 'ទិវាពលកម្មអន្តរជាតិ',
                'date'         => '2026-05-01',
                'description'  => 'Honors working people across the world / ទិវាពលកម្មអន្តរជាតិ ១ ឧសភា',
                'status'       => 'active',
                'is_recurring' => true,
            ],
            [
                'title_en'     => 'Visak Bochea Day',
                'title_km'     => 'ពិធីបុណ្យវិសាខបូជា',
                'date'         => '2026-05-01',
                'description'  => 'Birth, enlightenment and passing of Buddha / ពិធីបុណ្យពុទ្ធសាសនា',
                'status'       => 'active',
                'is_recurring' => false,
            ],
            [
                'title_en'     => 'Royal Ploughing Ceremony',
                'title_km'     => 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល',
                'date'         => '2026-05-05',
                'description'  => 'Traditional agricultural forecasting ceremony / ពិធីបុណ្យព្រះរាជប្រពៃណី',
                'status'       => 'active',
                'is_recurring' => false,
            ],
            [
                'title_en'     => "King Norodom Sihamoni's Birthday",
                'title_km'     => 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះករុណា ព្រះបាទសម្តេច ព្រះបរមនាថ នរោត្តម សីហមុនី',
                'date'         => '2026-05-14',
                'description'  => 'Official royal birthday holiday / ថ្ងៃចម្រើនព្រះជន្មព្រះមហាក្សត្រ',
                'status'       => 'active',
                'is_recurring' => true,
            ],
            [
                'title_en'     => 'National Day of Remembrance',
                'title_km'     => 'ទិវាជាតិនៃការចងចាំ',
                'date'         => '2026-05-20',
                'description'  => 'Memorial day for victims of the Khmer Rouge regime / ទិវាជាតិនៃការចងចាំ ២០ ឧសភា',
                'status'       => 'active',
                'is_recurring' => true,
            ],
            [
                'title_en'     => "Queen Mother's Birthday",
                'title_km'     => 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ',
                'date'         => '2026-06-18',
                'description'  => "Celebration of Queen Mother Norodom Monineath Sihanouk's birthday / ថ្ងៃចម្រើនព្រះជន្មសម្តេចម៉ែ",
                'status'       => 'active',
                'is_recurring' => true,
            ],
            [
                'title_en'     => 'Constitutional Day',
                'title_km'     => 'ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ',
                'date'         => '2026-09-24',
                'description'  => 'Commemoration of the adoption of the Constitution / ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ',
                'status'       => 'active',
                'is_recurring' => true,
            ],
            [
                'title_en'     => 'Pchum Ben Festival (Day 1)',
                'title_km'     => 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី១)',
                'date'         => '2026-10-10',
                'description'  => "Ancestors' Day religious celebration / ពិធីបុណ្យភ្ជុំបិណ្ឌ",
                'status'       => 'active',
                'is_recurring' => false,
            ],
            [
                'title_en'     => 'Pchum Ben Festival (Day 2)',
                'title_km'     => 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី២)',
                'date'         => '2026-10-11',
                'description'  => "Ancestors' Day main celebration / ពិធីបុណ្យភ្ជុំបិណ្ឌ",
                'status'       => 'active',
                'is_recurring' => false,
            ],
            [
                'title_en'     => 'Pchum Ben Festival (Day 3)',
                'title_km'     => 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី៣)',
                'date'         => '2026-10-12',
                'description'  => "Ancestors' Day final celebration / ពិធីបុណ្យភ្ជុំបិណ្ឌ",
                'status'       => 'active',
                'is_recurring' => false,
            ],
            [
                'title_en'     => 'Commemoration Day of King Father',
                'title_km'     => 'ទិវារំលឹកខួបនៃការយាងសោយព្រះទិវង្គត ព្រះបរមរតនកោដ្ឋ',
                'date'         => '2026-10-15',
                'description'  => 'Memorial day for His Majesty Preah Bat Samdech Preah Norodom Sihanouk / ព្រះបរមរតនកោដ្ឋ',
                'status'       => 'active',
                'is_recurring' => true,
            ],
            [
                'title_en'     => "King's Coronation Day",
                'title_km'     => 'ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ ព្រះករុណា ព្រះបាទសម្តេច ព្រះបរមនាថ នរោត្តម សីហមុនី',
                'date'         => '2026-10-29',
                'description'  => 'Coronation of His Majesty King Norodom Sihamoni / ថ្ងៃគ្រងរាជសម្បត្តិ',
                'status'       => 'active',
                'is_recurring' => true,
            ],
            [
                'title_en'     => 'National Independence Day',
                'title_km'     => 'ពិធីបុណ្យឯករាជ្យជាតិ',
                'date'         => '2026-11-09',
                'description'  => "Commemorates Cambodia's independence from France in 1953 / បុណ្យឯករាជ្យជាតិ ៩ វិច្ឆិកា",
                'status'       => 'active',
                'is_recurring' => true,
            ],
            [
                'title_en'     => 'Water Festival (Day 1)',
                'title_km'     => 'ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី១)',
                'date'         => '2026-11-24',
                'description'  => 'Boat racing and illumination ceremony / ពិធីបុណ្យអុំទូក',
                'status'       => 'active',
                'is_recurring' => false,
            ],
            [
                'title_en'     => 'Water Festival (Day 2)',
                'title_km'     => 'ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី២)',
                'date'         => '2026-11-25',
                'description'  => 'Boat racing, illuminated floats & moon worship / ពិធីបុណ្យអុំទូក',
                'status'       => 'active',
                'is_recurring' => false,
            ],
            [
                'title_en'     => 'Water Festival (Day 3)',
                'title_km'     => 'ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី៣)',
                'date'         => '2026-11-26',
                'description'  => 'Final day of Water Festival / ពិធីបុណ្យអុំទូក',
                'status'       => 'active',
                'is_recurring' => false,
            ],
        ];

        foreach ($holidays as $data) {
            Holiday::withTrashed()->updateOrCreate(
                [
                    'date'     => $data['date'],
                    'title_en' => $data['title_en'],
                ],
                [
                    'title_km'     => $data['title_km'],
                    'description'  => $data['description'],
                    'status'       => $data['status'],
                    'is_recurring' => $data['is_recurring'],
                    'deleted_at'   => null,
                ]
            );
        }

        $this->command?->info('Cambodian Public Holidays for 2026 seeded successfully (' . count($holidays) . ' holidays).');
    }
}
