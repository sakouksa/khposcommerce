<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Multi-Model AI Engine (OpenAI, Google Gemini, Groq, DeepSeek, OpenRouter)
    |--------------------------------------------------------------------------
    */
    'ai' => [
        'provider' => env('AI_PROVIDER', 'auto'), // 'auto', 'gemini', 'groq', 'openai', 'deepseek', 'openrouter', 'heuristic'

        // Google Gemini (Free Tier: 15 RPM / 1M TPM via Google AI Studio)
        'gemini' => [
            'api_key'  => env('GEMINI_API_KEY'),
            'model'    => env('GEMINI_MODEL', 'gemini-2.0-flash'),
            'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta/openai/'),
        ],

        // Groq (Free Tier: Ultra-Fast Llama-3.3-70b, DeepSeek-R1-Distill)
        'groq' => [
            'api_key'  => env('GROQ_API_KEY'),
            'model'    => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
            'base_url' => env('GROQ_BASE_URL', 'https://api.groq.com/openai/v1/'),
        ],

        // DeepSeek (V3 / R1)
        'deepseek' => [
            'api_key'  => env('DEEPSEEK_API_KEY'),
            'model'    => env('DEEPSEEK_MODEL', 'deepseek-chat'),
            'base_url' => env('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1/'),
        ],

        // OpenRouter (Multi-model free/open hub)
        'openrouter' => [
            'api_key'  => env('OPENROUTER_API_KEY'),
            'model'    => env('OPENROUTER_MODEL', 'google/gemini-2.0-flash-exp:free'),
            'base_url' => env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1/'),
        ],

        // OpenAI (Standard GPT-4o-mini, GPT-4o)
        'openai' => [
            'api_key'  => env('OPENAI_API_KEY'),
            'model'    => env('OPENAI_MODEL', 'gpt-4o-mini'),
            'base_url' => env('OPENAI_BASE_URL', 'https://api.openai.com/v1/'),
        ],
    ],

    // Legacy alias
    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model'   => env('OPENAI_MODEL', 'gpt-4o-mini'),
    ],

    'telegram' => [
        'bot_token'      => env('TELEGRAM_BOT_TOKEN'),
        'bot_username'   => env('TELEGRAM_BOT_USERNAME', 'EnterpriseShopBot'),
        'admin_chat_id'  => env('TELEGRAM_ADMIN_CHAT_ID'),
        'channel_id'     => env('TELEGRAM_CHANNEL_ID', '@nextech_cambodia'),
        'channel_url'    => env('TELEGRAM_CHANNEL_URL', 'https://t.me/nextech_cambodia'),
        'webhook_secret' => env('TELEGRAM_WEBHOOK_SECRET'),
    ],

    'bakong' => [
        'url'                 => env('BAKONG_API_URL', 'https://api-bakong.nbc.gov.kh/v1'),
        'token'               => env('BAKONG_API_TOKEN'),
        'account_id'          => env('BAKONG_ACCOUNT_ID', 'khqr@aclb'),
        'account_information' => env('BAKONG_ACCOUNT_INFORMATION', '85520019493'),
        'acquiring_bank'      => env('BAKONG_ACQUIRING_BANK', 'ACLEDA'),
        'mobile_number'       => env('BAKONG_MOBILE_NUMBER', '0762825595'),
        'merchant_name'       => env('BAKONG_MERCHANT_NAME', 'SAK OUSA'),
        'merchant_city'       => env('BAKONG_MERCHANT_CITY', 'Phnom Penh'),
        'bank_name'           => env('BAKONG_BANK_NAME', 'ACLEDA Bank'),
    ],

];
