const nodemailer = require("nodemailer");
const config = require("./config");
const { db } = require("./models");
const CryptoJS = require("crypto-js");

module.exports = {
  sendOtp: (email, key, otp) => {
    return new Promise((resolve, reject) => {
      try {
        db.customer.findOne({ where: { email: email } }).then((user) => {
          if (user) {
            var smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              secure: false,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
              tls: { rejectUnauthorized: false },
            });
            smtpTransport.sendMail(
              {
                from: process.env.MAIL_FROM,
                to: email,
                subject: "Tilitso: OTP for Verify Email",
                html:
                  "Dear user,<br><br> Thank you for registering with Tilitso.<br> <br> <b> <strong>One Time OTP:</strong> " +
                  otp +
                  " </b><br> <br> This link will expire in 2 minute. <br> This is a system generated mail. Please do not reply to this email ID.<br>Warm Regards,<br> Customer Care<br> Tilitso",
              },
              function (error, info) {
                if (error) {
                  return reject({
                    name: "TilitsoException",
                    message: "Email Sending Failed",
                    error: error,
                  });
                }
                return resolve(true);
              }
            );
          } else
            throw {
              name: "TilitsoException",
              msg: "Email Body not available",
            };
        });
      } catch (err) {
        reject(err);
      }
    });
  },
  sendEmployeePassword: (email, key) => {
    return new Promise((resolve, reject) => {
      try {
        db.customer.findOne({ where: { email: email } }).then((user) => {
          if (user) {
            var smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              secure: false,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
              tls: { rejectUnauthorized: false },
            });
            smtpTransport.sendMail(
              {
                from: process.env.MAIL_FROM,
                to: email,
                subject: "souqarena: Online Shopping Center",
                html:
                  "Dear user,<br><br> Thank you for registering with Janakpur.<br> <br> <b> <strong>Click Here:</strong> " +
                  process.env.SALON_URL +
                  "/verify/" +
                  email +
                  "/" +
                  key +
                  " </b><br> <br> This link will expire in 30sec. <br> This is a system generated mail. Please do not reply to this email ID.<br>Warm Regards,<br> Customer Care<br> souqarena",
                // html: "Hi <br>" + "Your One Time Password(OTP) for completing your registeration on KDMARC is  " + password + " .Please do not share OTP with anyone .<br> Best Regards, <br> Team KDMARC",
              },
              function (error, info) {
                if (error) {
                  return reject({
                    name: "souqarenaException",
                    msg: "Email Sending Failed",
                  });
                }
                return resolve(true);
              }
            );
          } else
            throw {
              name: "GrocerrryException",
              msg: "Email Body not available",
            };
        });
      } catch (err) {
        reject(err);
      }
    });
  },
  sendEmailToVendor: (email, productName) => {
    var smtpTransport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      ignoreTLS: false,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });
    smtpTransport.sendMail(
      {
        from: process.env.MAIL_FROM,
        to: email,
        subject: "New Order",
        text: `You Just received an order for ${productName}`,
      },
      function (error, info) {
        if (error || (info && info.rejected.length)) {
          return reject({
            name: "Exception",
            msg: "Email Sending Failed",
            error: error,
          });
        }
        return resolve(true);
      }
    );
  },

  //**************************************// 
  sendResetPassword: (email) => {
    return new Promise((resolve, reject) => {
      try {
        db.customer.findOne({ where: { email: email } }).then((user) => {
          if (user) {
            var smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              secure: false,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
              tls: { rejectUnauthorized: false },
            });

            var encryptEmail = CryptoJS.AES.encrypt(email, 'TEDbuddyIndsFia').toString();
            const link = `https://tilitso.in/page-create-password?email=${encodeURIComponent(encryptEmail)}`

            const emailContent = `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f2f2f2;
                padding: 20px;
            }
            .email-container {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
            }
            .link {
                color: #007bff;
                text-decoration: none;
            }
            .footer {
                font-size: 12px;
                color: #777;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <h2>Tilitso: Reset Password</h2>
            <p>Dear user,</p>
            <p>Thank you for resetting your password with Tilitso.</p>
            
            <p>Click on the following link to create a new password:</p>
            <p><a class="link" href="${link}">Create New Password</a></p>
            
            <p>This link will expire in 2 minute.</p>
            <p class="footer">This is a system-generated email. Please do not reply to this email ID.</p>
            
            <p class="footer">Warm Regards,<br>Customer Care<br>Tilitso</p>
        </div>
    </body>
    </html>
`;
            smtpTransport.sendMail(
              {
                from: process.env.MAIL_FROM,
                to: email,
                subject: "Tilitso: Reset Password",
                html: emailContent,
              },
              function (error, info) {
                if (error) {
                  return reject({
                    name: "TilitsoException",
                    message: "Email Sending Failed",
                    error: error,
                  });
                }
                return resolve(true);
              }
            );
          } else
            throw {
              name: "TilitsoException",
              msg: "Email Body not available",
            };
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  sendInvoiceForCustomer: (body, list, address, name, orderNo, user) => {
    const htmlHeader = `<html>
        <body
          style="background-color:#fbfbfb;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
          <table
            style="min-width:650px;margin:50px auto 10px;background-color:#fff;padding:50px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);-moz-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24); border-top: solid 10px #88b433;">
            <thead>
              <tr>
                <th style="text-align:left;"><img style="max-width: 80px;height:70px"
                    src="https://grociproduct.s3.ap-south-1.amazonaws.com/favicon.png" width='80' alt="souqarena"></th>
                <th style="text-align:right;font-weight:bold;font-size: 14px;">${new Date()
        .toISOString()
        .slice(0, 10)}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="height:35px;"></td>
              </tr>
              <tr>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px">Name</span> ${name}</p>
                </td>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px;">Email</span> ${user.email}</p>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="border: solid 1px #ddd; padding:10px 20px;">
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:150px">Order status</span><b
                      style="color:green;font-weight:normal;margin:0">Success</b></p>
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order ID</span> ${orderNo}</p>
                  <p style="font-size:14px;margin:0 0 0 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order amount</span> Rs. ${body.grandTotal
      }</p>
                <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Phone No</span> ${address ? address.phone : body.deliveryAddress.phone
      }</p>
                      <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Shipping Address</span>${address
        ? address.shipping
        : body.deliveryAddress.ShippingAddress
      }  </p>
                </td>
              </tr>
              <tr>
                <td style="height:20px;"></td>
              </tr>
        
              <tr>
                <td colspan="2" style="font-size:14px;padding:2px;font-weight: bold;">Items</td>
              </tr>
              ${list
        .map(function (item) {
          return `
              <tr style="border:solid 1px #ddd;">
                <td style="padding:2px;width:50%;">
                  <p style="font-size:14px;margin:0;">${item.productName}</p>
                </td>
                <td style="padding:2px;width:50%;text-align: right;">
                  <p style="font-size:14px;margin:0;"> Rs.${item.qty + "*" + item.netPrice
            }</p>
                </td>
              </tr>
              `;
        })
        .join("")}`;

    const htmlFooter = ` </tbody>
            <tfooter>
              <tr>
              <tr>
                <td style="height:50px;"></td>
              </tr>
              <td colspan="2" style="font-size:14px;padding:2px;">
                <strong style="display:block;margin:0 0 10px 0;">Regards,</strong>Team Tilitso<br><br>
                For any queries please contact us at: <b>support@Tilitso.com</b>
              </td>
              </tr>
            </tfooter>
            
          </table>
        </body>
        </html>`;
    const totalHtml = htmlHeader + htmlFooter;
    return new Promise((resolve, reject) => {
      try {
        db.customer.findOne({ where: { email: user.email } }).then((user) => {
          if (user && user.verify == 1) {
            var key = Math.random().toString(36).slice(2);
            db.customer
              .update({ verf_key: key }, { where: { id: user.id } })
              .then((r) => {
                var smtpTransport = nodemailer.createTransport({
                  host: process.env.MAIL_HOST,
                  port: process.env.MAIL_PORT,
                  ignoreTLS: false,
                  secure: false,
                  auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                  },
                  tls: { rejectUnauthorized: false },
                });
                smtpTransport.sendMail(
                  {
                    from: process.env.MAIL_FROM,
                    to: user.email,
                    subject:
                      "Your Tilitso Order Confirmation. Please share your feedback",
                    html: totalHtml,
                  },
                  function (error, info) {
                    if (error || (info && info.rejected.length)) {
                      return reject({
                        name: "Exception",
                        msg: "Email Sending Failed",
                        error: error,
                      });
                    }
                    return resolve(true);
                  }
                );
              });
          } else {
            reject(new Error("user not valid"));
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  sendInvoiceForCustomerNew: (body, address, order_id, shipment_id, customer, deliveryAddress) => {
    const htmlHeader = `<html>
    <body style="background-color:#fbfbfb;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
      <table style="min-width:650px;margin:50px auto 10px;background-color:#fff;padding:50px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);-moz-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24); border-top: solid 10px #88b433;">
        <thead>
          <tr>
            <th style="text-align:left;"><img style="max-width: 80px;height:70px" src="https://tilitso.in/" width='80' alt="codenox"></th>
            <th style="text-align:right;font-weight:bold;font-size: 14px;">${new Date().toISOString().slice(0, 10)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="height:35px;"></td>
          </tr>
          <tr>
            <td style="width:50%;padding:2px;vertical-align:top">
              <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:14px">Name</span> ${address.fullname}</p>
            </td>
            <td style="width:50%;padding:2px;vertical-align:top">
              <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:14px;">Email</span> ${customer ? customer.email : deliveryAddress.email}</p>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="border: solid 1px #ddd; padding:10px 20px;">
              <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:150px">Order status</span><b style="color:green;font-weight:normal;margin:0">Success</b></p>
              <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Order ID</span> ${order_id}</p>
              <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Shipment ID</span> ${shipment_id}</p>
              <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display-inline-block;min-width:146px">Order amount</span> Rs. ${body.grandTotal}</p>
              <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Phone No</span> ${address ? address.phone : body.deliveryAddress.phone}</p>
              <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Shipping Address</span>${address.shipping + ", " + address.city + ", " + address.states}</p>
            </td>
          </tr>
          <tr>
            <td style="height:20px;"></td>
          </tr>
          <tr>
            <td colspan="2" style="font-size:14px;padding:2px;font-weight: bold;">Items</td>
          </tr>
          ${body.product.map(function (item) {
      return `
              <tr style="border:solid 1px #ddd;">
                <td style="padding:2px;width:50%;">
                  <p style="font-size:14px;margin:0;"><img src=${item.thumbnail} alt=${item.Name} height="50px"/></p>
                </td>
                <td style="padding:2px;width:50%;">
                  <p style="font-size:14px;margin:0;">${item.Name}</p>
                </td>
                <td style="padding:2px;width:50%;text-align: right;">
                  <p style="font-size:14px;margin:0;"> Rs.${item.quantity + "*" + item.netPrice + "=" + item.quantity * item.netPrice}</p>
                </td>
                
              </tr>
            `;
    }).join("")}
              <td style="padding:2px;width:50%;text-align: right;">
                <p style="font-size:14px;margin:0;">Discount ${" "}= Rs.${body.total_discount}</p>
              </td>
        </tbody>
      </table>
    </body>
  </html>`;


    const htmlFooter = `<tfooter>
    <tr>
      <td style="height:50px;"></td>
    </tr>
    <tr>
    <p style="font-size:14px;margin:0 0 6px 0;">If you use a mobile device, you can receive notifications about the delivery of your package and track it from our free <a href="#">Tilitso app</a>.</p>
      <td colspan="2" style="font-size:14px;padding:2px;">
        <strong style="display:block;margin:0 0 10px 0;">Regards,</strong>Team Tilitso<br><br>
        For any queries please contact us at: <b>tilitso.in@gmail.com</b>
      </td>
    </tr>
  </tfooter>
  </table>
  </body>
  </html>`;
    const totalHtml = htmlHeader + htmlFooter;
    return new Promise((resolve, reject) => {
      try {
        // db.customer.findOne({ where: { email: customer.email } }).then((user) => {
        //   if (user && user.verify == 1) {
        //     var key = Math.random().toString(36).slice(2);
        //     db.customer
        //       .update({ verf_key: key }, { where: { id: user.id } })
        //       .then((r) => {
        var smtpTransport = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT,
          ignoreTLS: false,
          secure: false,
          auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
          },
          tls: { rejectUnauthorized: false },
        });
        smtpTransport.sendMail(
          {
            from: process.env.MAIL_FROM,
            to: customer ? customer.email : deliveryAddress.email,
            subject:
              "Your Tilitso Order Confirmation. Please share your feedback",
            html: totalHtml,
          },
          function (error, info) {
            if (error || (info && info.rejected.length)) {
              return reject({
                name: "Exception",
                msg: "Email Sending Failed",
                error: error,
              });
            }
            return resolve(true);
          }
        );
        //       });
        //   } else {
        //     reject(new Error("user not valid"));
        //   }
        // });
      } catch (err) {
        reject(err);
      }
    });
  },

  sendInvoiceForSeller: (body, address, orderNo, customer, email) => {
    const htmlHeader = `<html>
        <body
          style="background-color:#fbfbfb;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
          <table
            style="min-width:650px;margin:50px auto 10px;background-color:#fff;padding:50px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);-moz-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24); border-top: solid 10px #88b433;">
            <thead>
              <tr>
                <th style="text-align:left;"><img style="max-width: 80px;height:70px"
                    src="https://grociproduct.s3.ap-south-1.amazonaws.com/favicon.png" width='80' alt="souqarena"></th>
                <th style="text-align:right;font-weight:bold;font-size: 14px;">${new Date()
        .toISOString()
        .slice(0, 10)}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="height:35px;"></td>
              </tr>
        
              <tr>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px">Name</span> ${address.fullname
      }</p>
        
                </td>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px;">Email</span> ${email
      }</p>
        
                </td>
              </tr>
    
              <tr>
                <td colspan="2" style="border: solid 1px #ddd; padding:10px 20px;">
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:150px">Order status</span><b
                      style="color:green;font-weight:normal;margin:0">Success</b></p>
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order ID</span> ${orderNo}</p>
                  <p style="font-size:14px;margin:0 0 0 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order amount</span> Rs. ${body.netPrice
      }</p>
                <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Phone No</span> ${address ? address.phone : body.deliveryAddress.phone
      }</p>
                <p style="font-size:14px;margin:0 0 6px 0;"><span
                style="font-weight:bold;display:inline-block;min-width:146px">CustName</span> ${customer.name
      }</p>
                      <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Shipping Address</span>${address.shipping +
      ", " +
      address.city +
      ", " +
      address.states
      }  </p>
                </td>
              </tr>
              <tr>
                <td style="height:20px;"></td>
              </tr>
        
              <tr>
                <td colspan="2" style="font-size:14px;padding:2px;font-weight: bold;">Items</td>
              </tr>
              
              <tr style="border:solid 1px #ddd;">
                <td style="padding:2px;width:50%;">
                  <p style="font-size:14px;margin:0;"><img src=${body.thumbnail
      } alt=${body.productName} height="50px"/></p>
                </td>
                <td style="padding:2px;width:50%;">
                  <p style="font-size:14px;margin:0;">${body.productName}</p>
                </td>
                
                <td style="padding:2px;width:50%;text-align: right;">
                  <p style="font-size:14px;margin:0;"> Rs.${body.qty +
      "*" +
      body.netPrice +
      "=" +
      body.qty * body.netPrice
      }</p>
                </td>
              </tr>
              `;

    const htmlFooter = `</tbody> <tfooter> <tr> <tr> <td style="height:50px;"></td> </tr> <td colspan="2" style="font-size:14px;padding:2px;"> <strong style="display:block;margin:0 0 10px 0;">Regards,</strong>Team souqarena<br><br> For any queries please contact us at: <b>support@souqarena.com</b> </td> </tr> </tfooter> </table> </body> </html>`;
    const totalHtml = htmlHeader + htmlFooter;
    return new Promise((resolve, reject) => {
      try {
        const query = {};
        query.where = {};

        query.where.email = email;
        query.where.role = "seller";
        query.where.verify = 1;

        db.user.findOne(query).then((user) => {
          if (user && user.id) {
            const smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              ignoreTLS: false,
              secure: false,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
              tls: { rejectUnauthorized: false },
            });
            smtpTransport.sendMail(
              {
                from: process.env.MAIL_FROM,
                to: user.email,
                subject:
                  "You have order. please check your dashboard for more details",
                html: totalHtml,
              },
              function (error, info) {
                if (error || (info && info.rejected.length)) {
                  return reject({
                    name: "Exception",
                    msg: "Email Sending Failed",
                    error: error,
                  });
                }
                return resolve(true);
              }
            );
          } else {
            reject(new Error("user not valid"));
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  sendAbandonedCartEmail: (email, products) => {
    const productDetails = Object.values(products).map(product => ({
      thumbnail: product.Thumbnail ? product.Thumbnail : 'Default Thumbnail URL', // Replace with the actual default thumbnail URL
      name: product.Name,
      netPrice: product.netPrice,
    }));

    const productsList = productDetails
      .map(
        product =>
          `<div style="display: flex; align-items: center;">
            <img src="${product.thumbnail}" alt="Product Thumbnail" style="width: 100px; height: 100px; object-fit: cover;">
            <div style="margin-left: 20px;">
              <p><strong>${product.name}</strong></p>
              <p>Net Price: $${product.netPrice}</p>
            </div>
          </div>`
      )
      .join('<hr>');

    const emailContent = `
      <html>
        <head>
          <style>
            /* Add your CSS styles here */
          </style>
        </head>
        <body>
          <h2>Hello!</h2>
          <p>You have left the following items in your cart:</p>
          ${productsList}
          <p>Come back and complete your purchase today!</p>
        </body>
      </html>
    `;

    const smtpTransport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      ignoreTLS: false,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });
    return new Promise((resolve, reject) => {
      smtpTransport.sendMail(
        {
          from: process.env.MAIL_FROM,
          to: email,
          subject: 'You have abandoned your cart',
          html: emailContent,
        },
        function (error, info) {
          if (error || (info && info.rejected.length)) {
            reject({
              name: 'Exception',
              msg: 'Email Sending Failed',
              error: error,
            });
          } else {
            resolve(true);
          }
        }
      );
    });
  },


};