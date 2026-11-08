<?php

namespace App\Services\Support;

use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CsvService
{
    /**
     * Generate a StreamedResponse for CSV download with UTF-8 BOM and headers.
     *
     * @param string $filename Base filename without extension or with extension
     * @param array $headers Column header labels
     * @param iterable $rows Collection or array of records
     * @param callable $rowMapper Function that maps each record to an array of CSV cells
     */
    public function streamExport(
        string $filename,
        array $headers,
        iterable $rows,
        callable $rowMapper
    ): StreamedResponse {
        $cleanFilename = str_ends_with(strtolower($filename), '.csv') ? $filename : ($filename . '.csv');

        $responseHeaders = [
            'Content-type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename=' . $cleanFilename,
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0',
        ];

        $callback = function () use ($headers, $rows, $rowMapper) {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($handle, $headers);

            foreach ($rows as $item) {
                $mappedRow = $rowMapper($item);
                if (is_array($mappedRow)) {
                    fputcsv($handle, $mappedRow);
                }
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $responseHeaders);
    }

    /**
     * Parse an uploaded CSV file into an array of associative row arrays with error tracking.
     *
     * @param UploadedFile|string $file Uploaded file or filepath
     * @param array $requiredColumns Optional list of column names that must be present
     * @return array{success: bool, headers: array, rows: array, errors: array, message: string}
     */
    public function parseCsv(UploadedFile|string $file, array $requiredColumns = []): array
    {
        $filePath = $file instanceof UploadedFile ? $file->getRealPath() : $file;
        $handle = fopen($filePath, 'r');

        if ($handle === false) {
            return [
                'success' => false,
                'headers' => [],
                'rows'    => [],
                'errors'  => ['Cannot open uploaded file.'],
                'message' => 'Cannot open uploaded file.',
            ];
        }

        // Check and strip UTF-8 BOM
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        $rawHeaders = fgetcsv($handle);
        if (!$rawHeaders) {
            fclose($handle);
            return [
                'success' => false,
                'headers' => [],
                'rows'    => [],
                'errors'  => ['The CSV file is empty.'],
                'message' => 'The CSV file is empty.',
            ];
        }

        // Normalize headers: lowercase, trim, replace spaces/dashes with underscores
        $normalizedHeaders = array_map(function ($h) {
            $cleaned = strtolower(trim((string) $h));
            return str_replace([' ', '-'], '_', $cleaned);
        }, $rawHeaders);

        // Check required columns
        foreach ($requiredColumns as $col) {
            $normalizedCol = str_replace([' ', '-'], '_', strtolower(trim($col)));
            if (!in_array($normalizedCol, $normalizedHeaders, true)) {
                fclose($handle);
                return [
                    'success' => false,
                    'headers' => $normalizedHeaders,
                    'rows'    => [],
                    'errors'  => ["Missing required column header: '{$col}'."],
                    'message' => "Missing required column header: '{$col}'.",
                ];
            }
        }

        $rows = [];
        $errors = [];
        $line = 1;
        $headerCount = count($normalizedHeaders);

        while (($row = fgetcsv($handle)) !== false) {
            $line++;

            // Skip empty rows
            if (empty(array_filter($row, fn($cell) => trim((string) $cell) !== ''))) {
                continue;
            }

            if (count($row) < $headerCount) {
                $row = array_pad($row, $headerCount, '');
            } else {
                $row = array_slice($row, 0, $headerCount);
            }

            $rowData = array_combine($normalizedHeaders, $row);
            $rows[] = [
                '_line' => $line,
                'data'  => $rowData,
            ];
        }

        fclose($handle);

        return [
            'success' => true,
            'headers' => $normalizedHeaders,
            'rows'    => $rows,
            'errors'  => $errors,
            'message' => 'CSV parsed successfully.',
        ];
    }
}
