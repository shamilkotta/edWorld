const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Teacher = require("../models/teacher");
const Student = require("../models/student");
const Payment = require("../models/payment");
const { createPassword, getAllPaymentsData } = require("../helpers/office");
const {
  compileHTMLEmailTemplate,
  savePaymentStatus,
  verifyRazorpaySignature,
  generatePdf,
} = require("../helpers");
const sendMail = require("../config/nodemailer");

module.exports = {
  getLogin: (req, res) => {
    const error = req.session.loginError;
    res.render("login", { error });
    req.session.loginError = "";
  },

  postLogin: async (req, res) => {
    let { registerId } = req.body;
    const { password, role } = req.body;
    registerId = registerId.toUpperCase();
    let model;
    if (role === "student") model = Student;
    else if (role === "teacher") model = Teacher;
    else {
      req.session.loginError = "Please choose a account type";
      res.redirect("/login");
    }
    try {
      // find user
      const user = await model.findOne({ registerId });
      if (user) {
        if (user?.account_status === false) {
          // blocked account
          req.session.loginError = "You're blocked, contact office";
          res.redirect("/login");
        } else {
          // compare passwords
          bcrypt.compare(password, user.password).then((result) => {
            if (result) {
              req.session.loggedIn = true;
              req.session.user = {
                registerId,
                role,
                isPasswordStrong: user.password_strong,
              };
              if (role === "student") res.redirect("/student");
              else res.redirect("/teacher");
            } else {
              req.session.loginError = "Invalid register Id or password";
              res.redirect("/login");
            }
          });
        }
      } else {
        req.session.loginError = "Invalid register Id or password";
        res.redirect("/login");
      }
    } catch (err) {
      req.session.loginError = "Somthing went wrong, try again";
      res.redirect("/login");
    }
    model.findOne({ registerId });
  },

  getOfficeLogin: (req, res) => {
    const error = req.session.officeLoginError;
    res.render("office-login", { error });
    req.session.officeLoginError = "";
  },

  postOfficeLogin: (req, res) => {
    const { username, password } = req.body;
    const name = process.env.OFFICE || "admin";
    const pass = process.env.OFFICE_PASS || "admin123";
    if (username === name && password === pass) {
      req.session.loggedIn = true;
      req.session.user = { username: name, role: "office" };
      res.redirect("/office");
    } else {
      req.session.officeLoginError = "Invalid user name or password";
      res.redirect("/office-login");
    }
  },

  postUpdatePassword: async (req, res) => {
    const { password, confirmPassword } = req.body;
    if (
      /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W])(?!.*\s).{8,16})/.test(password)
    ) {
      if (password === confirmPassword) {
        try {
          const newPass = await createPassword(password);
          const { registerId, role } = req.session.user;
          let model;
          if (role === "teacher") model = Teacher;
          else model = Student;
          const result = await model.updateOne(
            { registerId },
            { password: newPass, password_strong: true }
          );
          if (result.acknowledged && result.modifiedCount) {
            req.session.loggedIn = true;
            req.session.user = {
              registerId,
              role,
              isPasswordStrong: true,
            };
            res.redirect(`/${role}`);
          } else throw new Error("Something went wrong! try again");
        } catch (err) {
          req.session.updatePassError = "Something went wrong! try again";
          res.redirect("/update-password");
        }
      } else {
        req.session.updatePassError = "Passwords Must be Matching";
        res.redirect("/update-password");
      }
    } else {
      req.session.updatePassError = "Please enter a strong password";
      res.redirect("/update-password");
    }
  },

  postForgotPass: async (req, res) => {
    const { role } = req.body;
    let { email } = req.body;
    if (!email.trim() || !role) {
      req.session.forgotPassErr = "Enter your email and account type";
      res.redirect(303, "/forgot-password");
    } else {
      email = email.trim();

      let model;
      if (role === "teacher") model = Teacher;
      else model = Student;

      let token;
      let emailContent;
      const emailTemplatePath = `./utils/reset-password-email.html`;

      try {
        // find user and sign a jwt with 10 min exp
        const user = await model.findOne({ email });
        if (user) {
          const key = process.env.JWT_KEY || "jwt-key";
          token = jwt.sign(
            { email: user.email, registerId: user.registerId, role },
            key,
            { expiresIn: 60 * 10 }
          );

          // reading email template and sending email
          const resetUrl = `http://localhost:5000/reset-password/${token}`;
          emailContent = await compileHTMLEmailTemplate(emailTemplatePath, {
            resetUrl,
          });
          // send mail
          sendMail(email, "edWorld password reset link", emailContent)
            .then(() => {
              req.session.forgotPassSucc =
                "We've sent a password reset link to your email (only valid for 10 min)";
              res.redirect(303, "/forgot-password");
            })
            .catch(() => {
              req.session.forgotPassErr =
                "Somthing went wrong, can't send reset password link";
              res.redirect(303, "/forgot-password");
            });
        } else {
          req.session.forgotPassErr = "Can't send send reset password link";
          res.redirect(303, "/forgot-password");
        }
      } catch (error) {
        req.session.forgotPassErr =
          "Somthing went wrong, can't send reset password link";
        res.redirect(303, "/forgot-password");
      }
    }
  },

  getResetPass: (req, res) => {
    const { id } = req.params;
    const key = process.env.JWT_KEY || "jwt-key";
    jwt.verify(id, key, (err) => {
      if (err) {
        if (err.message === "jwt expired") {
          res.render("reset-password", {
            error: "",
            linkError: "Reset link expired,",
          });
        } else {
          res.render("reset-password", {
            error: "",
            linkError: "Invalid password reset link,",
          });
        }
      } else {
        res.render("reset-password", {
          error: req.session.resetPassErr,
          linkError: "",
          token: id,
        });
        req.session.resetPassErr = "";
      }
    });
  },

  postResetPass: (req, res) => {
    const { id } = req.params;
    const { password, confirmPassword } = req.body;
    const key = process.env.JWT_KEY || "jwt-key";
    jwt.verify(id, key, async (err, data) => {
      if (err) res.redirect(303, `/reset-password/${id}`);
      else if (
        !/((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W])(?!.*\s).{8,16})/.test(
          password
        )
      ) {
        req.session.resetPassErr = "Please enter a strong password";
        res.redirect(303, `/reset-password/${id}`);
      } else if (password !== confirmPassword) {
        req.session.resetPassErr = "Passwords Must be Matching";
        res.redirect(303, `/reset-password/${id}`);
      } else {
        try {
          const newPass = await createPassword(password);
          const { registerId, role } = data;
          let model;
          if (role === "teacher") model = Teacher;
          else model = Student;
          const result = await model.updateOne(
            { registerId },
            { password: newPass, password_strong: true }
          );
          if (result.acknowledged && result.modifiedCount) {
            req.session.loggedIn = true;
            req.session.user = {
              registerId,
              role,
              isPasswordStrong: true,
            };
            res.redirect(`/${role}`);
          } else throw new Error("Something went wrong! try again");
        } catch (error) {
          req.session.resetPassErr = "Something went wrong, Please try again";
          res.redirect(303, `/reset-password/${id}`);
        }
      }
    });
  },

  logout: (req, res) => {
    let role;
    if (req.session.loggedIn) role = req.session.user.role;
    req.session.destroy();
    if (role === "office") res.redirect("/office-login");
    else res.redirect("/login");
  },

  getForgotPass: (req, res) => {
    res.render("forgot-pass", {
      error: req.session.forgotPassErr,
      success: req.session.forgotPassSucc,
    });
    req.session.forgotPassErr = "";
    req.session.forgotPassSucc = "";
  },

  getUpdatePass: (req, res) => {
    if (["teacher", "student"].includes(req.session?.user?.role)) {
      res.render("update-password", { error: req.session.updatePassError });
      req.session.updatePassError = "";
    } else res.redirect("/login");
  },

  getChangePassword: async (req, res) => {
    const { currentPassword, password, confirmPassword } = req.body;
    const { registerId, role } = req.session.user;
    // selecting user based on role
    let model;
    if (role === "teacher") model = Teacher;
    else model = Student;

    try {
      // finding user based on reigster id
      const user = await model.findOne({ registerId });
      if (!user)
        return res.status(400).json({
          success: false,
          message: "Can't find the user, please login again",
        });

      // if user exists > comparing current passswords
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match)
        return res.status(400).json({
          success: false,
          message: "Current password not matching",
        });

      // validating new passwords
      if (
        /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W])(?!.*\s).{8,16})/.test(
          password
        )
      ) {
        if (password === confirmPassword) {
          // if so creating new pass hash
          const newPass = await createPassword(password);
          // updating databse with new pass
          const result = await model.updateOne(
            { registerId },
            { password: newPass, password_strong: true }
          );

          if (result.acknowledged && result.modifiedCount) {
            return res.status(200).json({
              success: true,
              message: "Password changed succesfully",
            });
          }
          return res.status(500).json({
            success: false,
            message: "Something went wrong! try again",
          });
        }
        return res.status(400).json({
          success: false,
          message: "Password must be matching",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Enter a strong password",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong! try again",
      });
    }
  },

  putEditDetails: async (req, res) => {
    try {
      if (req.validationErr) {
        res.status(400).json({
          success: false,
          message: req.validationErr,
        });
      } else {
        const data = req.validData;
        const { registerId, role } = req.session.user;

        let model;
        if (role === "teacher") model = Teacher;
        else model = Student;

        const result = await model.updateOne({ registerId }, data, {
          runValidators: true,
        });
        if (result.acknowledged && result.modifiedCount)
          res.status(200).json({
            success: true,
            message: "Updated successfully",
          });
        else throw new Error("Something went wrong! try again");
      }
    } catch (error) {
      if (error.code === 11000)
        res.status(400).json({
          success: false,
          message: "Email or phone number already in use",
        });
      else
        res.status(500).json({
          success: false,
          message: "Something went wrong! try again",
        });
    }
  },

  postFeePayment: async (req, res) => {
    if (req.session.user) req.body.registerId = req.session.user.registerId;
    const {
      registerId,
      invoice,
      razorpay_payment_id: paymentId,
      razorpay_order_id: inOrderId,
      razorpay_signature: signature,
      option,
    } = req.body;
    let orderId;
    // failure message
    const failure =
      "Payment is successfull, but something went wrong in our side. Please contact office with the reference id";

    try {
      // retreiving seaved invoice
      const savedInvoice = await Payment.findOne({ order_id: inOrderId });
      if (!savedInvoice || !savedInvoice.order_id)
        return res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
      orderId = savedInvoice.order_id;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    try {
      // verifying payment details
      const verification = await verifyRazorpaySignature(
        paymentId,
        orderId,
        signature
      );
      // if Fails
      if (!verification)
        return res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const receipt = registerId + Date.now();
    try {
      // saving/updating payment data
      const updateRes = await Payment.updateOne(
        { registerId, invoice },
        { payment_id: paymentId, signature, receipt, status: true }
      );
      if (updateRes.acknowledged && updateRes.modifiedCount) {
        // changing payment status in student profile
        const response = await savePaymentStatus({ registerId, option });
        if (!response.acknowledged || !response.modifiedCount) {
          return res.status(500).json({
            success: false,
            message: failure,
          });
        }
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: failure,
      });
    }

    const receiptTemplatePath = `./utils/receipt.html`;
    const emailTemplatePath = `./utils/receipt-email.html`;

    try {
      // getting payment data
      const { allPayments } = await getAllPaymentsData({ search: receipt });
      if (!allPayments[0])
        return res.status(200).json({
          success: true,
          message: "Payment successfull, but can't send receipt to email",
          receipt,
        });
      // eslint-disable-next-line prefer-destructuring
      const replacements = allPayments[0];

      // reading html data with replacements
      const { amount, date, name, address, email } = replacements;
      const pdfContent = await compileHTMLEmailTemplate(receiptTemplatePath, {
        receipt,
        amount,
        date,
        name,
        address,
        email,
      });

      // creating pdf from html
      const receiptPdf = await generatePdf(pdfContent);

      // creating email template
      const emailContent = await compileHTMLEmailTemplate(emailTemplatePath, {
        name,
        downloadUrl: `http://localhost:5000/get-receipt/${receipt}`,
      });

      // sending mail
      const response = await sendMail(
        email,
        "Receipt of your fee payment",
        emailContent,
        receiptPdf,
        "receipt.pdf"
      );
      if (response.success)
        return res.status(200).json({
          success: true,
          message: "Payment successfull",
          receipt,
        });

      return res.status(200).json({
        success: true,
        message: "Payment successfull, but can't send receipt to email",
        receipt,
      });
    } catch (error) {
      console.log(error);
      return res.status(200).json({
        success: true,
        message: "Payment successfull, but can't send receipt to email",
        receipt,
      });
    }
  },

  getReceipt: async (req, res) => {
    const { receipt } = req.params;
    let pdfContent;
    let replacements = {};
    const receiptTemplatePath = `./utils/receipt.html`;

    try {
      // fetching payment data
      const { allPayments } = await getAllPaymentsData({ search: receipt });
      if (!allPayments[0])
        return res.status(404).json({
          success: false,
          message: "Can't find payment data, please check your receipt id",
        });

      // eslint-disable-next-line prefer-destructuring
      replacements = allPayments[0];
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong, try again",
      });
    }

    try {
      // reading html data with replacements
      const { amount, date, name, address, email } = replacements;
      pdfContent = await compileHTMLEmailTemplate(receiptTemplatePath, {
        receipt,
        amount,
        date,
        name,
        address,
        email,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong, try again",
      });
    }

    try {
      // creating pdf from html
      const receiptPdf = await generatePdf(pdfContent);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${receipt}.pdf`
      );
      return res.end(receiptPdf);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong, try again",
      });
    }
  },
};
