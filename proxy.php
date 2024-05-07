<?php

$anthropicEndpoint = 'https://api.anthropic.com/v1/complete';
$anthropicMessagesEndpoint = 'https://api.anthropic.com/v1/messages';

$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestBody = json_decode(file_get_contents('php://input'), true);
$requestHeaders = getallheaders();

$selectedModel = $requestBody['model'];

if (in_array($selectedModel, ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'])) {
    $anthropicEndpoint = $anthropicMessagesEndpoint;
    $requestBody = [
        'model' => $selectedModel,
        'max_tokens' => $requestBody['max_tokens_to_sample'],
        'messages' => [
            ['role' => 'user', 'content' => $requestBody['prompt']]
        ]
    ];
} else {
    $requestBody = json_encode($requestBody);
}

$curlOptions = [
    CURLOPT_URL => $anthropicEndpoint,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => $requestMethod,
    CURLOPT_POSTFIELDS => is_array($requestBody) ? json_encode($requestBody) : $requestBody,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ' . $requestHeaders['x-api-key'],
        'anthropic-version: 2023-06-01',
    ],
];

$curl = curl_init();
curl_setopt_array($curl, $curlOptions);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
    http_response_code(500);
    echo "cURL Error #:" . $err;
} else {
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');
    echo $response;
}

?>