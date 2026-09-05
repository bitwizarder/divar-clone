<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>کد تایید</title>
    <style>
        body { font-family: sans-serif; direction: rtl; text-align: right; }
        .container { max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
        .code { font-size: 28px; font-weight: bold; color: #b91c1c; background: #fef2f2; padding: 10px; border-radius: 8px; display: inline-block; }
        .footer { margin-top: 20px; font-size: 14px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <h2>کد تایید شما</h2>
        <p>برای ورود به حساب کاربری خود، از کد زیر استفاده کنید:</p>
        <div style="text-align: center;">
            <span class="code">{{ $otpCode }}</span>
        </div>
        <p>این کد تا ۵ دقیقه اعتبار دارد.</p>
        <div class="footer">
            اگر درخواست ورود نداده‌اید، این پیام را نادیده بگیرید.
        </div>
    </div>
</body>
</html>