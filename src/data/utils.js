const jwt = require("jsonwebtoken");
const jwt_simple = require("jwt-simple");
const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user, duration = "15m") => {
  return jwt.sign(
    { id: user.id, username: user.username, tokenVersion: user.tokenVersion },
    JWT_SECRET,
    {
      expiresIn: duration,
    }
  );
};

const generateTokenSimple = (payLoad) => {
  const expiration = Math.floor(Date.now() / 1000) + 60 * 15;
  return jwt_simple.encode({ ...payLoad, expiration }, JWT_SECRET);
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === 465 ? true : false,
  auth: {
    user: process.env.SMTP_EMAIL_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendVerificationEmail = async (email, user) => {
  const token = generateTokenSimple({ id: user._id });

  const mailOptions = {
    from: { name: "HushHive", address: process.env.MAILTRAP_USERNAME },
    to: email,
    subject: "HushHive Email Verification",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title></title>

        <!--[if !mso]><!-->
        <style type="text/css">
            @import url('https://fonts.mailersend.com/css?family=Inter:400,600');
        </style>
        <!--<![endif]-->

        <style type="text/css" rel="stylesheet" media="all">
            @media only screen and (max-width: 640px) {
                .ms-header {
                    display: none !important;
                }
                .ms-content {
                    width: 100% !important;
                    border-radius: 0;
                }
                .ms-content-body {
                    padding: 30px !important;
                }
                .ms-footer {
                    width: 100% !important;
                }
                .mobile-wide {
                    width: 100% !important;
                }
                .info-lg {
                    padding: 30px;
                }
            }
        </style>
        <!--[if mso]>
        <style type="text/css">
        body { font-family: Arial, Helvetica, sans-serif!important  !important; }
        td { font-family: Arial, Helvetica, sans-serif!important  !important; }
        td * { font-family: Arial, Helvetica, sans-serif!important  !important; }
        td p { font-family: Arial, Helvetica, sans-serif!important  !important; }
        td a { font-family: Arial, Helvetica, sans-serif!important  !important; }
        td span { font-family: Arial, Helvetica, sans-serif!important  !important; }
        td div { font-family: Arial, Helvetica, sans-serif!important  !important; }
        td ul li { font-family: Arial, Helvetica, sans-serif!important  !important; }
        td ol li { font-family: Arial, Helvetica, sans-serif!important  !important; }
        td blockquote { font-family: Arial, Helvetica, sans-serif!important  !important; }
        th * { font-family: Arial, Helvetica, sans-serif!important  !important; }
        </style>
        <![endif]-->
    </head>
    <body style="font-family:'Inter', Helvetica, Arial, sans-serif; width: 100% !important; height: 100%; margin: 0; padding: 0; -webkit-text-size-adjust: none; background-color: #f4f7fa; color: #4a5566;" >

    <div class="preheader" style="display:none !important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;" ></div>

    <table class="ms-body" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;background-color:#f4f7fa;width:100%;margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" >
        <tr>
            <td align="center" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;" >

                <table class="ms-container" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" >
                    <tr>
                        <td align="center" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;" >

                            <table class="ms-header" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;" >
                                <tr>
                                    <td height="40" style="font-size:0px;line-height:0px;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;" >
                                        &nbsp;
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;" >

                            <table class="ms-content" width="640" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;width:640px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;background-color:#FFFFFF;border-radius:6px;box-shadow:0 3px 6px 0 rgba(0,0,0,.05);" >
                                <tr>
                                    <td class="ms-content-body" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;padding-top:40px;padding-bottom:40px;padding-right:50px;padding-left:50px;" >

                                        <p class="logo" style="margin-right:0;margin-left:0;line-height:28px;font-weight:600;font-size:21px;color:#111111;text-align:center;margin-top:0;margin-bottom:40px;" >
                                            <img src="https://i.ibb.co/qyxFp9H/logo-text.png" width="300px" alt="logo-text" border="0">
                                            </p>

                                        <h1 style="margin-top:0;color:#111111;font-size:24px;line-height:36px;font-weight:600;margin-bottom:24px;" >Hi ${
                                          user.username
                                        },</h1>
                                        <p style="color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:16px;line-height:28px;" >
                                            Welcome to HushHive! We're excited to have you get started. Before you can start using your account, you need to confirm your email address.
                                            </p>
                                        <p style="color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:16px;line-height:28px;" >Click the button below to confirm your email address. <strong style="font-weight:600;" >This confirmation link is only valid for the next 24 hours</strong>.</p>

                                        <table width="100%" align="center" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;" >
                                            <tr>
                                                <td align="center" style="padding-top:20px;padding-bottom:20px;padding-right:0;padding-left:0;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;" >

                                                    <table class="mobile-wide" border="0" cellspacing="0" cellpadding="0" role="presentation" style="border-collapse:collapse;" >
                                                        <tr>
                                                            <td align="center" class="btn" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;background-color:#696cff;box-shadow:0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06);border-radius:3px;" >
                                                                <a href="https://hushhive.yemscript.com/auth/verify-email?token=${token}" target="_blank" style="background-color:#696cff;padding-top:14px;padding-bottom:14px;padding-right:30px;padding-left:30px;display:inline-block;color:#FFF;text-decoration:none;border-radius:3px;-webkit-text-size-adjust:none;box-sizing:border-box;border-width:0px;border-style:solid;border-color:#696cff;font-weight:600;font-size:15px;line-height:21px;letter-spacing:0.25px;" >Verify Email</a>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                            </tr>
                                        </table>

                                        

                                        <p style="color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:16px;line-height:28px;" >Cheers,
                                            <br>HushHive.</p>

                                        <table width="100%" style="border-collapse:collapse;" >
                                            <tr>
                                                <td height="20" style="font-size:0px;line-height:0px;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;" >
                                                    &nbsp;
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height="20" style="font-size:0px;line-height:0px;border-top-width:1px;border-top-style:solid;border-top-color:#e2e8f0;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;" >
                                                    &nbsp;
                                                </td>
                                            </tr>
                                        </table>

                                        <p class="small" style="color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:14px;line-height:21px;" >If you’re having trouble with the button above, copy and paste the URL below into your web browser.</p>
                                        <p class="small" style="color:#4a5566;margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;font-size:14px;line-height:21px;" >https://hushhive.yemscript.com/auth/verify-email?token=${token}</p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;" >

                            <table class="ms-footer" width="640" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;width:640px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;" >
                                <tr>
                                    <td class="ms-content-body" align="center" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;padding-top:40px;padding-bottom:40px;padding-right:50px;padding-left:50px;" >
                                        <p class="small" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;color:#96a2b3;font-size:14px;line-height:21px;" >&copy; ${new Date().getFullYear()} HushHive. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>

    </body>
    </html>`,
  };

  // <a href="http://localhost:3000/api/auth/verify_email?token=${token}">
  //   Verify Email
  // </a>;
  try {
    const sendEmail = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", sendEmail.messageId);
    if (sendEmail.messageId) {
      return { success: true, message: "Email sent" };
    } else {
      return { success: false, message: "Email not sent" };
    }
  } catch (error) {
    console.log(error.message);
    return { success: false, message: error.message };
  }
};

module.exports = {
  generateToken,
  generateTokenSimple,
  sendVerificationEmail,
};
