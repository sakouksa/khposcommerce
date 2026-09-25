<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class LocalizationMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('Accept-Language');

        // Supported locales in our system
        $supportedLocales = ['en', 'km', 'th', 'vi', 'zh'];

        if ($locale) {
            // Extract the first locale in case of comma-separated values (e.g. "km-KH,km;q=0.9")
            $parts = explode(',', $locale);
            $primaryLocale = trim(explode(';', $parts[0])[0]);
            // If regional (e.g. "en-US"), extract the primary language code ("en")
            $baseLocale = strtolower(explode('-', $primaryLocale)[0]);

            if (in_array($primaryLocale, $supportedLocales)) {
                App::setLocale($primaryLocale);
            } elseif (in_array($baseLocale, $supportedLocales)) {
                App::setLocale($baseLocale);
            }
        }

        return $next($request);
    }
}
