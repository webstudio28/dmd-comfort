<?php
/**
 * Inquiry form handler for ДМД Комфорт.
 * Posts to info@dmdkomfort.bg via the hosting mail() transport.
 */
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');

function wants_json(): bool {
  $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
  return strpos($accept, 'application/json') !== false
    || (($_POST['ajax'] ?? '') === '1');
}

function respond_ok(): void {
  if (wants_json()) {
    header('Content-Type: application/json; charset=UTF-8');
    echo '{"ok":true,"redirect":"/blagodarim/"}';
    exit;
  }
  header('Location: /blagodarim/', true, 303);
  exit;
}

function respond_error(string $redirect = '/kontakti/?error=1'): void {
  if (wants_json()) {
    header('Content-Type: application/json; charset=UTF-8');
    http_response_code(400);
    echo '{"ok":false}';
    exit;
  }
  header('Location: ' . $redirect, true, 303);
  exit;
}

function inquiry_log(string $line): void {
  $dir = __DIR__ . '/private';
  if (!is_dir($dir)) {
    @mkdir($dir, 0750, true);
  }
  $file = $dir . '/inquiry-log.txt';
  $stamp = date('Y-m-d H:i:s');
  @file_put_contents($file, '[' . $stamp . '] ' . $line . "\n", FILE_APPEND | LOCK_EX);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond_error('/kontakti/');
}

function field(string $key): string {
  $value = $_POST[$key] ?? '';
  if (!is_string($value)) {
    return '';
  }
  return trim(str_replace(["\r", "\n"], ' ', $value));
}

function multiline(string $key): string {
  $value = $_POST[$key] ?? '';
  if (!is_string($value)) {
    return '';
  }
  return trim(str_replace("\r\n", "\n", $value));
}

// Honeypot — bots fill this; humans never see it.
// Avoid names like "company" / "email" — browsers autofill them.
if (field('website_url_hp') !== '') {
  inquiry_log('honeypot blocked ip=' . ($_SERVER['REMOTE_ADDR'] ?? '-'));
  respond_ok();
}

$name = field('name');
$phone = field('phone');
$interest = field('interest');
$message = multiline('message');
$source = field('source');
$page = field('page');

if ($name === '' || $phone === '' || mb_strlen($name) > 120 || mb_strlen($phone) > 40) {
  inquiry_log('validation failed name/phone ip=' . ($_SERVER['REMOTE_ADDR'] ?? '-'));
  respond_error();
}

if (mb_strlen($interest) > 160) {
  $interest = mb_substr($interest, 0, 160);
}
if (mb_strlen($message) > 4000) {
  $message = mb_substr($message, 0, 4000);
}
if (mb_strlen($source) > 80) {
  $source = mb_substr($source, 0, 80);
}
if (mb_strlen($page) > 300) {
  $page = mb_substr($page, 0, 300);
}

$to = 'info@dmdkomfort.bg';
$from = 'info@dmdkomfort.bg';
$subject = 'Запитване от сайта — ' . $name;

$lines = [
  'Ново запитване от dmdkomfort.bg',
  '',
  'Име: ' . $name,
  'Телефон: ' . $phone,
  'Интерес: ' . ($interest !== '' ? $interest : '—'),
  'Съобщение:',
  $message !== '' ? $message : '—',
  '',
  'Източник: ' . ($source !== '' ? $source : 'форма'),
  'Страница: ' . ($page !== '' ? $page : '—'),
  'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '—'),
  'Дата: ' . date('Y-m-d H:i:s'),
];

$body = implode("\n", $lines);
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$headers = [
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: 8bit',
  'From: DMD Komfort <' . $from . '>',
  'Reply-To: ' . $from,
  'X-Mailer: DMD-Comfort-Site',
];

$sent = @mail(
  $to,
  $encodedSubject,
  $body,
  implode("\r\n", $headers),
  '-f' . $from
);

inquiry_log(
  ($sent ? 'mail() OK' : 'mail() FAIL')
  . ' to=' . $to
  . ' name=' . $name
  . ' phone=' . $phone
  . ' source=' . ($source !== '' ? $source : '-')
  . ' page=' . ($page !== '' ? $page : '-')
  . ' ip=' . ($_SERVER['REMOTE_ADDR'] ?? '-')
);

if (!$sent) {
  respond_error();
}

respond_ok();
